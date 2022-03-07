# Solana Example Program Web3

## Deploy

```shell
# Generate key pair for my wallet
solana-keygen new -o env/my_key.json
# Add fund
yarn fund_me
yarn fund_me
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
solana-keygen new -o env/my_key.json

# Add fund
yarn fund_me
```
