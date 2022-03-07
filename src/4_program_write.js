const web3 = require('@solana/web3.js');
require('dotenv').config({
  path: './.env'
})
const solanaJSON = require('./lib/solana_json.js');
const fs = require('fs').promises;

const NETWORK = process.env.NETWORK;

(async () => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  const PRIVATE_KEY_PROGRAM = JSON.parse(await fs.readFile('env/my_app_key.json'));

  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  console.log('Runing...');
  const connection = solanaJSON.setupConnection(NETWORK);
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  const programAccount = await solanaJSON.loadUser(PRIVATE_KEY_PROGRAM);

  const GREETING_SEED = '';
  const appDataAccountPubkey = await web3.PublicKey.createWithSeed(
    payerAccount.publicKey,
    GREETING_SEED,
    programAccount.publicKey,
  );

  const app = {
    programId: programAccount.publicKey,
    appAccount: {
      publicKey: appDataAccountPubkey
    }
  }
  console.log(`Run programId`, programAccount.publicKey.toBase58());
  console.log(`Writing to appAccount`, appDataAccountPubkey.toBase58());

  const stringWrite = '{"message": "Không có gì khó, chỉ sợ lòng không có"}';
  const confirmationTicket = await solanaJSON.pushJSON(connection, app, stringWrite, payerAccount);
  console.log(`Successfully!`);
  const resultJSON = await solanaJSON.pullJSON(connection, appDataAccountPubkey);
  console.log(`Result: ${JSON.parse(resultJSON).message}`);
})();