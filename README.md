# Aptos Faucet

## Deploy

```bash
aptos move publish --named-addresses Faucet=0xABC...123

# initialize
aptos move run --function-id 0xABC...123::Faucet::init
```
