const web3 = require('@solana/web3.js');
const fs = require('fs').promises;
require('dotenv').config({
  path: './.env'
});
const solanaJSON = require('./lib/solana_json.js');

const NETWORK = process.env.NETWORK;

(async () => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  const PRIVATE_KEY_PROGRAM = JSON.parse(await fs.readFile('env/my_app_key.json'));

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  // Generate a new wallet keypair and airdrop SOL
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  const programAccount = await solanaJSON.loadUser(PRIVATE_KEY_PROGRAM);

  // Derive the address of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = '';
  const GREETING_SIZE = 1000;

  const programIdPubKey = programAccount.publicKey;
  // const appDataAccountPubkey = appDataAccount.publicKey;
  const appDataAccountPubkey = await web3.PublicKey.createWithSeed(
    payerAccount.publicKey,
    GREETING_SEED,
    programIdPubKey,
  );

  // console.log(appDataAccountPubkey.toBase58());
  // await solanaJSON.fundUser(connection,appDataAccountPubkey);

  var appAccount = await connection.getAccountInfo(appDataAccountPubkey);
  console.log(
    'appDataAccount',
    appDataAccountPubkey.toBase58()
  );
  if (appAccount === null) {

    const lamports = await connection.getMinimumBalanceForRentExemption(
      GREETING_SIZE,
    );

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.createAccountWithSeed({
        fromPubkey: payerAccount.publicKey,
        basePubkey: payerAccount.publicKey,
        seed: GREETING_SEED,
        newAccountPubkey: appDataAccountPubkey,
        lamports,
        space: GREETING_SIZE,
        programId: programIdPubKey,
      }),
    );
    var signature = await web3.sendAndConfirmTransaction(connection, transaction, [payerAccount]);
    console.log('Waiting confirming... ',signature);
		await connection.confirmTransaction(signature);
    appAccount = await connection.getAccountInfo(appDataAccountPubkey);
  }
  console.log(
    'Program execute account',
    appAccount.owner.toBase58()
  );

})();