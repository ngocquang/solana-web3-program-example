const web3 = require('@solana/web3.js');
const fs = require('fs').promises;
const {AccountLayout, TOKEN_PROGRAM_ID} = require("@solana/spl-token");

const solanaJSON = require('../lib/solana_json.js');
require('dotenv').config({
  path: './.env'
});

const NETWORK = process.env.NETWORK;

(async () => {

  const PRIVATE_KEY = JSON.parse(await fs.readFile('env/my_key.json'));
  if (!PRIVATE_KEY) {
    console.log('Missing private key');
    process.exit(1);
  }
  const PRIVATE_KEY_2 = JSON.parse(await fs.readFile('env/my_key_2.json'));

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  // Load User from private key
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  const toAccount = await solanaJSON.loadUser(PRIVATE_KEY_2);
  const tokenMintAddress = "Ak5m5rVDXycixgUDy4KUQeTEhiwYfHk9pmgQdfNEzVZM";

  const amount = 1 * web3.LAMPORTS_PER_SOL;

  console.log('Transfer from ',payerAccount.publicKey.toBase58());
  console.log('To',toAccount.publicKey.toBase58());
  await solanaJSON.transfer(tokenMintAddress, payerAccount, toAccount.publicKey, connection, amount);

  console.log('Done');
})();