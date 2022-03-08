/*
	Solana JSON module for storing and retrieving data from the Solana blockchain
*/
const web3 = require('@solana/web3.js');
const fs = require('fs').promises;
const BufferLayout = require('buffer-layout');
const splToken = require("@solana/spl-token");
const solanaJSON = {

	setupConnection: (network) => {
		console.log('Connecting to', network);
		const connection = new web3.Connection(web3.clusterApiUrl(network), 'confirmed');
		return connection;
	},

	createUser: async () => {
		const user = web3.Keypair.generate();
		console.log(`New solana account created: ${user.publicKey}`);
		return user;
	},

	loadUser: async (privateKeyBufferArray) => {
		const user = web3.Keypair.fromSecretKey(Uint8Array.from(privateKeyBufferArray));
		// console.log(`Loaded account: ${user.publicKey}`);
		return user;
	},

	fundUser: async (connection, publicKey) => {
		console.log(`Requesting airdrop funds... (this will take 30 seconds)`);
		const airdropSignature = await connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL); // 1 SOL = 1,000,000,000 LAMPORTS
		console.log('Waiting confirming... ', airdropSignature);
		await connection.confirmTransaction(airdropSignature);
		const lamports = await connection.getBalance(publicKey);
		console.log(`Payer account ${publicKey.toBase58()} containing ${(lamports / web3.LAMPORTS_PER_SOL).toFixed(2)}SOL`);
	},
	sendFund: async (connection, from, programIdPubKey, lamports) => {
		console.log(`Sending ${(lamports / web3.LAMPORTS_PER_SOL).toFixed(2)}SOL `);

		// Add transfer instruction to transaction
		var transaction = new web3.Transaction().add(
			web3.SystemProgram.transfer({
				fromPubkey: from.publicKey,
				toPubkey: programIdPubKey,
				lamports: lamports,
			}),
		);

		// Sign transaction, broadcast, and confirm
		var signature = await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[from],
		);
		console.log('SIGNATURE', signature);
	},
	setDataStructure: (characterLength) => {
		const structure = BufferLayout.struct([BufferLayout.blob(characterLength, 'txt')]);
		return structure;
	},

	loadProgram: async (connection, smartContract, payerAccount) => {
		// Load the program
		console.log('Loading program...');
		const data = await fs.readFile(smartContract.pathToProgram);
		// const programAccount = web3.Keypair.generate();
		const programKey = JSON.parse(await fs.readFile(smartContract.pathToKey));
		const programAccount = web3.Keypair.fromSecretKey(Uint8Array.from(programKey));
		await web3.BpfLoader.load(
			connection,
			payerAccount,
			programAccount,
			data,
			web3.BPF_LOADER_PROGRAM_ID,
		);
		const programId = programAccount.publicKey;
		console.log('Program Id', programId.toBase58());

		// Create the app account
		const appAccount = new web3.Keypair.generate();
		const appPubkey = appAccount.publicKey;
		console.log('Creating app account', appPubkey.toBase58());
		const space = smartContract.dataLayout.span;
		const lamports = web3.LAMPORTS_PER_SOL; // 1 SOL
		console.log(`Transferring ${(lamports/web3.LAMPORTS_PER_SOL).toFixed(4)}SOL`);
		const transaction = new web3.Transaction().add(
			web3.SystemProgram.createAccount({
				fromPubkey: payerAccount.publicKey,
				newAccountPubkey: appPubkey,
				lamports,
				space,
				programId,
			}),
		);
		await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[payerAccount, appAccount], {
				commitment: 'singleGossip',
				preflightCommitment: 'singleGossip',
			},
		);
		return {
			appAccount,
			programId
		};
	},

	pushJSON: async (connection, app, jsonString, payerAccount) => {
		if (jsonString.length > 996) throw new Error({
			'e': 'jsonString length greater than 996 chars'
		});
		const paddedMsg = jsonString.padEnd(1000);
		const buffer = Buffer.from(paddedMsg, 'utf8');
		const instruction = new web3.TransactionInstruction({
			keys: [{
				pubkey: app.appAccount.publicKey,
				isSigner: false,
				isWritable: true
			}],
			programId: app.programId,
			data: buffer,
		});
		const confirmation = await web3.sendAndConfirmTransaction(
			connection,
			new web3.Transaction().add(instruction),
			[payerAccount], {
				commitment: 'singleGossip',
				preflightCommitment: 'singleGossip',
			},
		);
		return confirmation;
	},

	pullJSON: async (connection, appPubKey) => {
		const accountInfo = await connection.getAccountInfo(appPubKey);
		return Buffer.from(accountInfo.data).toString().slice(4, 1000).trim();
	},

	deploy: async (network) => {
		console.log('deploying...');
		const connection = solanaJSON.setupConnection(network);
		const payerAccount = await solanaJSON.createUser();
		await solanaJSON.fundUser(connection, payerAccount);
		const smartContract = {
			pathToProgram: '../contract/solana-json.so',
			dataLayout: solanaJSON.setDataStructure(1000),
		}
		const app = await solanaJSON.loadProgram(connection, smartContract, payerAccount);
		console.log('app', app);
		const confirmationTicket = await solanaJSON.pushJSON(connection, app, '{"abc":123}');
		const testJSON = solanaJSON.pullJSON(connection, app.appAccount.publicKey);
		console.log(`Test: ${JSON.parse(testJSON).abc}`);
	},
	transfer: async (tokenMintAddress, fromWallet, toAddress, connection, amount) => {
		const mint = new web3.PublicKey(tokenMintAddress);
		const toWalletPublicKey = new web3.PublicKey(toAddress);

		// const mint = await splToken.getMint(connection, mintPublicKey, 'confirmed', splToken.TOKEN_PROGRAM_ID);

		const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
			connection,
			fromWallet,
			mint,
			fromWallet.publicKey
		);

		const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
			connection,
			fromWallet,
			mint,
			toWalletPublicKey
		);

		let signature = await splToken.transfer(
			connection,
			fromWallet,
			fromTokenAccount.address,
			toTokenAccount.address,
			fromWallet.publicKey,
			amount
		);
		return signature;

	}
}

module.exports = solanaJSON;