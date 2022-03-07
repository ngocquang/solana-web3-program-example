const solanaJSON = require('./lib/solana_json.js');
const fs = require('fs').promises;

require('dotenv').config({ path: './.env' });

const NETWORK = process.env.NETWORK;

(async () => {
  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  // Load User from private key

  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  await solanaJSON.fundUser(connection,payerAccount.publicKey);

  console.log('Done');
})();