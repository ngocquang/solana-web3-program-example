require('dotenv').config({ path: './.env' })
const solanaJSON = require('../src/solana-json.js');
const PRIVATE_KEY = JSON.parse(process.env.PRIVATE_KEY);

const config = require('../src/config.js');

(async() => {
  if (!process.env.PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }

  console.log('deploying...');
  const connection = solanaJSON.setupConnection('https://api.testnet.solana.com');
  // const payerAccount = await solanaJSON.createUser();
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);

  await solanaJSON.fundUser(connection,payerAccount);

  const smartContract = {
    pathToProgram: './contract/solana-json.so',
    dataLayout: solanaJSON.setDataStructure(1000),
  }

  const app = await solanaJSON.loadProgram(connection,smartContract,payerAccount);
  console.log('app',app);

  const confirmationTicket = await solanaJSON.pushJSON(connection,app,'{"abc":123}');
  const testJSON = solanaJSON.pullJSON(connection,app.appAccount.publicKey);
  console.log(`Test: ${JSON.parse(testJSON).abc}`);
})();