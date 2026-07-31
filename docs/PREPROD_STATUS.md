# CipherID Preprod status

## Live

- **Netlify:** [https://confidential-digital-id.netlify.app/](https://confidential-digital-id.netlify.app/)
- **Contract:** `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8`
- **Verify tx:** `0001334e8e879bb892abe4407d16abcebdf9e1eb29d150029c56c9abeac6c28fec`
- **Proof proxy health:** [https://confidential-digital-id.netlify.app/proof-server/health](https://confidential-digital-id.netlify.app/proof-server/health)

## Verified path

1. Local proof server `:6300` or Netlify `/proof-server` proxy
2. UI Preprod + **1AM** (synced, sponsored DUST)
3. Deploy once → save address → Verify any secret

## Netlify env

```
VITE_NETWORK_ID=preprod
VITE_CONTRACT_ADDRESS=373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8
VITE_INDEXER_URI=https://indexer.preprod.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URI=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=https://confidential-digital-id.netlify.app/proof-server
```

Do not use bare `https://proof-server.preprod.midnight.network` in the browser (CORS). Proxy via `public/_redirects`.

## Do not use

`18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023` — local / undeployed hash, not on-chain Preprod.
