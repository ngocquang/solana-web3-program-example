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

  // Connect to cluster
  const connection = solanaJSON.setupConnection(NETWORK);

  // Load User from private key
  const payerAccount = await solanaJSON.loadUser(PRIVATE_KEY);
  // const MY_TOKEN_PROGRAM_ID = "Ak5m5rVDXycixgUDy4KUQeTEhiwYfHk9pmgQdfNEzVZM";
  console.log(payerAccount.publicKey.toBase58());
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    // new web3.PublicKey(MY_TOKEN_PROGRAM_ID),
    payerAccount.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  console.log("Token                                         Balance");
  console.log("------------------------------------------------------------");
  tokenAccounts.value.forEach((e) => {
    const accountInfo = AccountLayout.decode(e.account.data);
    console.log(`${new web3.PublicKey(accountInfo.mint)}   ${accountInfo.amount}`);
  })


  // Generate a new random public key
  // var to = web3.Keypair.generate();
  // const programIdPubKey = new web3.PublicKey(config.programPubKey);

  // await solanaJSON.sendFund(connection, payerAccount, programIdPubKey, web3.LAMPORTS_PER_SOL);

  console.log('Done');
})();