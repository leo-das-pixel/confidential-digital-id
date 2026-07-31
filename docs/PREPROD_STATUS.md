# CipherID Preprod status

## Verified path (same as PulseBoard)

1. Local proof server on `:6300` (`npm run proof-server:preprod` or existing `proof-server-local` container)
2. UI: `npm run dev:preprod` → network **`preprod`**
3. Wallet: **1AM** on Preprod, unlocked, **synced**, sponsored DUST
4. Settings → **Deploy on Preprod** (2–5+ min ZK prove) → copy hex address
5. Verify with any secret → `verificationCount` increments
6. Paste address into `README.md`, `.env.preprod`, and **Netlify** `VITE_CONTRACT_ADDRESS`

## Verified Preprod contract

`373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8`

Deployed **2026-07-31** via **1AM** (wallet auto-connected, sponsored DUST).

**Verify success:** tx `0001334e8e879bb892abe4407d16abcebdf9e1eb29d150029c56c9abeac6c28fec` — public `verificationCount` = **1**, credential name `Confidential Digital ID`.

## Live host

**Netlify:** [https://confidential-digital-id.netlify.app/](https://confidential-digital-id.netlify.app/) (`netlify.toml` → `cipherid-ui`)

## Do not use

`18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023` — local / undeployed hash, **not** on-chain Preprod.

## Netlify env (then Trigger deploy)

| Variable | Value |
| --- | --- |
| `VITE_NETWORK_ID` | `preprod` |
| `VITE_CONTRACT_ADDRESS` | `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8` |
| `VITE_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| `VITE_INDEXER_WS_URI` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| `VITE_PROOF_SERVER_URL` | `https://proof-server.preprod.midnight.network` |
