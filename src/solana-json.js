/*
	Solana JSON module for storing and retrieving data from the Solana blockchain
*/
const web3 = require('@solana/web3.js');
const fs = require('fs').promises;
const BufferLayout = require('buffer-layout');

const solanaJSON = {

	setupConnection: (network) => {
		const connection = new web3.Connection(network);
		return connection;
	},

	createUser: async () => {
		const user = web3.Keypair.generate();
		console.log(`New solana account created: ${user.publicKey}`);
		return user;
	},

	loadUser: async (privateKeyBufferArray) => {
		const user = web3.Keypair.fromSecretKey(Uint8Array.from(privateKeyBufferArray));
		console.log(`Loaded solana account: ${user.publicKey}`);
		return user;
	},

	fundUser: async (connection,account) => {
		console.log(`Requesting airdrop funds... (this will take 30 seconds)`);
		const res = await connection.requestAirdrop(account.publicKey, 1_000_000_000); // 1 SOL = 1,000,000,000 LAMPORTS
		let lamports = 0;
		for (let breakCount = 0; breakCount < 100; breakCount+=10) {
			await new Promise(r => setTimeout(r, 10000));
			lamports = await connection.getBalance(account.publicKey);
			console.log(`Payer account ${account.publicKey.toBase58()} containing ${(lamports / 1000000000).toFixed(2)}SOL`);
			if (lamports > 1) breakCount = 100;
		}
	},

	setDataStructure: (characterLength) => {
		const structure = BufferLayout.struct([BufferLayout.blob(characterLength,'txt')]);
		return structure;
	},

	loadProgram: async (connection,smartContract,payerAccount) => {
		// Load the program
		console.log('Loading program...');
		const data = await fs.readFile(smartContract.pathToProgram);
		const programAccount = web3.Keypair.generate();
		await web3.BpfLoader.load(
			connection,
			payerAccount,
			programAccount,
			data,
			web3.BPF_LOADER_PROGRAM_ID,
		);
		const programId = programAccount.publicKey;
		console.log('Program loaded to account', programId.toBase58());

		// Create the app account
		const appAccount = new web3.Keypair.generate();
		const appPubkey = appAccount.publicKey;
		console.log('Creating app account', appPubkey.toBase58());
		const space = smartContract.dataLayout.span;
		const lamports = 1_000_000_000; // 1 SOL
		console.log(`Transferring ${(lamports/1000000000).toFixed(4)}SOL`);
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
			[payerAccount, appAccount],
			{
				commitment: 'singleGossip',
				preflightCommitment: 'singleGossip',
			},
		);
		return { appAccount, programId };
	},

	pushJSON: async (connection,app,jsonString, payerAccount) => {
		if (jsonString.length > 996) throw new Error({'e':'jsonString length greater than 996 chars'});
		const paddedMsg = jsonString.padEnd(1000);
		const buffer = Buffer.from(paddedMsg, 'utf8');
		const instruction = new web3.TransactionInstruction({
			keys: [{pubkey: app.appAccount.publicKey, isSigner: false, isWritable: true}],
			programId: app.programId,
			data: buffer,
		});
		const confirmation = await web3.sendAndConfirmTransaction(
			connection,
			new web3.Transaction().add(instruction),
			[payerAccount],
			{
				commitment: 'singleGossip',
				preflightCommitment: 'singleGossip',
			},
		);
		return confirmation;
	},

	pullJSON: async (connection,appPubKey) => {
		const accountInfo = await connection.getAccountInfo(appPubKey);
		return Buffer.from(accountInfo.data).toString().substr(4,1000).trim();
	},

	deploy: async (network) => {
		console.log('deploying...');
		const connection = solanaJSON.setupConnection(network);
		const payerAccount = await solanaJSON.createUser();
		await solanaJSON.fundUser(connection,payerAccount);
		const smartContract = {
			pathToProgram: '../contract/solana-json.so',
			dataLayout: solanaJSON.setDataStructure(1000),
		}
		const app = await solanaJSON.loadProgram(connection,smartContract,payerAccount);
		console.log('app',app);
		const confirmationTicket = await solanaJSON.pushJSON(connection,app,'{"abc":123}');
		const testJSON = solanaJSON.pullJSON(connection,app.appAccount.publicKey);
		console.log(`Test: ${JSON.parse(testJSON).abc}`);
	},

}

module.exports = solanaJSON;
