const web3 = require('@solana/web3.js');

let bs58 = require('bs58');
let secretKey=bs58.decode("__PRIVATE_KEY_FROM_PHANTOM");
let x = web3.Keypair.fromSecretKey(secretKey);
console.log("secretKey",secretKey.toString());
console.log(x.publicKey.toBase58());
