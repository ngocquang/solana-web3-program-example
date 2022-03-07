
require('dotenv').config({ path: './.env' })
const solanaJSON = require('./lib/solana_json.js');
const fs = require('fs').promises;

const NETWORK = process.env.NETWORK;

const config = require('./config.js');

(async() => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('../env/my_key.json'));
  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  console.log('Deploying...');
  const connection = solanaJSON.setupConnection(NETWORK);
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);

  const smartContract = {
    pathToProgram: 'contract/solana-json.so',
    pathToKey: 'env/solana_memo_program.json',
    dataLayout: solanaJSON.setDataStructure(1000),
  }

  const app = await solanaJSON.loadProgram(connection,smartContract,payerAccount);
  console.log('app',app);

  // const confirmationTicket = await solanaJSON.pushJSON(connection,app,'{"abc":123}');
  // const testJSON = solanaJSON.pullJSON(connection,app.appAccount.publicKey);
  // console.log(`Test: ${JSON.parse(testJSON).abc}`);
})();