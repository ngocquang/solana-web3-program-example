const web3 = require('@solana/web3.js');
require('dotenv').config({
  path: './.env'
})
const solanaJSON = require('src/lib/solana_json.js');
const fs = require('fs').promises;

const NETWORK = process.env.NETWORK;

(async () => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  const PRIVATE_KEY_PROGRAM = JSON.parse(await fs.readFile('env/my_app_key.json'));
  const PRIVATE_KEY_APP_DATA = JSON.parse(await fs.readFile('env/my_app_data_key.json'));

  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  console.log('Running...');
  const connection = solanaJSON.setupConnection(NETWORK);
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  const programAccount = await solanaJSON.loadUser(PRIVATE_KEY_PROGRAM);
  const appDataAccount = await solanaJSON.loadUser(PRIVATE_KEY_APP_DATA);

  const appDataAccountPubkey = appDataAccount.publicKey;
  // const appDataAccountPubkey = new web3.PublicKey("AR1ouiSbkE4Gkgy34QRj2hRq2agJ5Z6Qv84VspZkQbbN");
  /* const GREETING_SEED = '';
  const appDataAccountPubkey = await web3.PublicKey.createWithSeed(
    payerAccount.publicKey,
    GREETING_SEED,
    programAccount.publicKey,
  ); */
  console.log(`My wallet`, payerAccount.publicKey.toBase58());

  console.log(`Run programId`, programAccount.publicKey.toBase58());
  console.log(`Reading from appAccount`, appDataAccountPubkey.toBase58());
  const resultJSON = await solanaJSON.pullJSON(connection, appDataAccountPubkey);
  try {
    console.log(`Result: ${JSON.parse(resultJSON).message}`);
  } catch (e) {
    console.log(`Empty content`);
  }
})();