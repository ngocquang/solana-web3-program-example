# Solana Example Program Web3

## Deploy

```shell
# Generate seed phrase
solana-keygen new --no-outfile
# Generate key pair for my wallet, re-enter seed phrase
solana-keygen recover 'prompt://?key=0/0' -o env/my_key.json

# Add fund
yarn fund_me
# or
solana airdrop 1 -k env/my_key.json
# Generate key pair for our Program Account
solana-keygen new -o env/my_app_key.json

# Deploy program with key pair
solana program deploy --program-id env/my_app_key.json contract/solana-json.so -k env/my_key.json

# Get config
# solana-keygen pubkey env/my_app_key.json
# solana program show <PROGRAM_ID>

# add data account to program
yarn 3_program_add_app_account

# Run program
yarn 4_program_write

# Read data
yarn 5_program_read


```

## Helper

```shell
# Generate new wallet
solana-keygen new --no-outfile


# Its key=0/0 means its derive path is m/44'/501'/0'/0'
solana-keygen recover 'prompt://?key=0/0' -o env/my_key.json

solana-keygen pubkey env/my_key.json

# Add fund
yarn fund_me

```
