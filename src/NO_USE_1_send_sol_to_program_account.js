const web3 = require('@solana/web3.js');
const fs = require('fs').promises;

const solanaJSON = require('./lib/solana_json.js');
require('dotenv').config({
  path: './.env'
});
const config = require('./config.js');

const NETWORK = process.env.NETWORK;

(async () => {

  if (!config.programPubKey) {
    console.log('Missing programPubKey');
    process.exit(1);
  }

  const PRIVATE_KEY = JSON.parse(await fs.readFile('../env/my_key.json'));
  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  // Load User from private key
  const from = await solanaJSON.loadUser(PRIVATE_KEY);

  // Generate a new random public key
  // var to = web3.Keypair.generate();
  const programIdPubKey = new web3.PublicKey(config.programPubKey);

  await solanaJSON.sendFund(connection, from, programIdPubKey, web3.LAMPORTS_PER_SOL);

  console.log('Done');
})();