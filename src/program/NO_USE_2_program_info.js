const web3 = require('@solana/web3.js');
const solanaJSON = require('src/lib/solana_json.js');
require('dotenv').config({ path: './.env' });
const config = require('./config.js');
const NETWORK = process.env.NETWORK;

(async () => {
  if (!config.programId) {
    console.log('Missing programId');
    process.exit(1);
  }

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  const programIdPubKey = new web3.PublicKey(config.programId);

  let programAccount = await connection.getParsedAccountInfo(
    programIdPubKey,
    'confirmed'
);
/* let nonceAccountFromInfo = web3.NonceAccount.fromAccountData(
  programAccount.data
); */
  console.log("programAccount",programAccount);

})();