const web3 = require('@solana/web3.js');
require('dotenv').config({ path: './.env' })
const solanaJSON = require('src/lib/solana_json.js');
const fs = require('fs').promises;

const NETWORK = process.env.NETWORK;

const config = require('./config.js');

(async() => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  const PRIVATE_KEY_APP_DATA = JSON.parse(await fs.readFile('env/my_app_data_key.json'));

  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  const connection = solanaJSON.setupConnection(NETWORK);
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  const appDataAccount = await solanaJSON.loadUser(PRIVATE_KEY_APP_DATA);
  console.log('Re-allocate appDataAccount',appDataAccount.publicKey.toBase58());

  let allocateInstruction = web3.SystemProgram.allocate({
    accountPubkey: appDataAccount.publicKey,
    space: 10000,
  })
  let transaction = new web3.Transaction().add(allocateInstruction);

  await web3.sendAndConfirmTransaction(connection, transaction, [payerAccount, appDataAccount])

  console.log(`Done`);
})();