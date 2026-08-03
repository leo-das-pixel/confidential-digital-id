# CipherID — Preview status

## Target network

**Preview** via **1AM** (Rise-In July migration — Preprod down).

```bash
npm run proof-server:preview   # optional; Vite/Netlify proxy preferred
npm run dev:preview
```

## Contract address

**`df87f977356c14539ae01182339bd68dbb15171473eaaabe924636f14e93a4ba`**

- Network: Preview  
- Deployed via **1AM** (browser Settings → Deploy on Preview)  
- Indexer: contract action present  
- Explorer: https://preview.midnightexplorer.com/contracts/0xdf87f977356c14539ae01182339bd68dbb15171473eaaabe924636f14e93a4ba

## Quick verify

1. Unlock **1AM** → **Preview** → synced  
2. Connect → paste/save address if needed → **Verification** with any secret  
3. Public ledger `verificationCount` increments  

## Netlify production env

```
VITE_NETWORK_ID=preview
VITE_CONTRACT_ADDRESS=df87f977356c14539ae01182339bd68dbb15171473eaaabe924636f14e93a4ba
VITE_INDEXER_URI=https://indexer.preview.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URI=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=https://confidential-digital-id.netlify.app/proof-server
```

Faucet: https://faucet.preview.midnight.network/
