# CipherID — Confidential Digital ID on Midnight

A **Midnight** DApp where users prove they hold a valid digital identity credential **without revealing their identity or private credential secret**. The public ledger shows only the **credential name** and a running **verification count**.

[![CI/CD](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml/badge.svg)](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://confidential-digital-id.netlify.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-FF0000?style=flat-square&logo=youtube)](https://youtu.be/ScmZN5f9Eik)
[![Compact](https://img.shields.io/badge/Compact-0.31.1-06b6d4?style=flat-square)](https://docs.midnight.network)
[![Node.js](https://img.shields.io/badge/Node.js-22+-10b981?style=flat-square)](https://nodejs.org)
[![Level 3](https://img.shields.io/badge/Rise--In-Confidential%20Credentials-0f766e)](PROPOSAL.md)

---

## Live Demo & Deployment

| Resource | Link / value |
| --- | --- |
| **Live Web Application** | [https://confidential-digital-id.netlify.app/](https://confidential-digital-id.netlify.app/) |
| **Local App UI** | [http://localhost:5173/](http://localhost:5173/) |
| **Preprod Compact Contract** | `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8` |
| **Demo Video** | [https://youtu.be/ScmZN5f9Eik](https://youtu.be/ScmZN5f9Eik) |
| **GitHub** | [leo-das-pixel/confidential-digital-id](https://github.com/leo-das-pixel/confidential-digital-id) |
| **Product Proposal** | [PROPOSAL.md](PROPOSAL.md) |

**Verified on Midnight Preprod:** deployed + verified via **1AM** (synced, sponsored DUST). Sample verify tx: `0001334e8e879bb892abe4407d16abcebdf9e1eb29d150029c56c9abeac6c28fec` (`verificationCount` = 1). On the live/local UI, open **Settings** with the address above, then **Verify** any secret.

---

## Screenshots

![Landing Page](cipherid-ui/public/landing.png)

![App Dashboard](cipherid-ui/public/dashboard.png)

![Verify Credential](cipherid-ui/public/verify.png)

![Verification History](cipherid-ui/public/history.png)

![Settings Console](cipherid-ui/public/settings.png)

---

## Product Proposal & Category

- **Category**: `Confidential Credentials` (Rise-In Level 3)
- **Problem**: Verifying identity usually forces users to disclose PII (name, ID number, credential secret) to third parties.
- **Solution**: CipherID submits a Midnight transaction that **witnesses** a private credential secret inside a ZK circuit. The ledger verifies the proof without storing or revealing the secret.

Full write-up: [PROPOSAL.md](PROPOSAL.md)

---

## Privacy Model & On-Chain vs Private State

| An observer CAN see | An observer CANNOT see |
| --- | --- |
| The `credentialName` (set publicly at deploy) | The private credential secret or ID code |
| The total `verificationCount` | Who verified (no address stored on the credential ledger) |
| That a verification transaction occurred | Any link between a verification and a specific person |
| That the ZK proof is valid | The witness data used to build the proof |

Enforced in `contract/src/hello-world.compact`:

- `credentialName` is written with `disclose(name)` — intentionally public
- `secret` is an `Opaque<"string">` circuit input — **never** disclosed, **never** stored
- `verificationCount` only increments an aggregate counter

---

## System Requirements

- **Node.js** 22+
- **Docker** (proof server on port **6300** for local Preprod proving)
- **Compact** compiler (for `npm run compile`)
- **Wallet**: [1AM](https://1am.xyz/) (verified path on Preprod + sponsored DUST) and/or [Lace](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk)

---

## Quick Start

```bash
npm install
npm run compile
```

### Preprod UI (fastest path — use 1AM)

```bash
# 1) Local proof server only (no full local chain)
npm run proof-server:preprod

# 2) UI against public Preprod indexer
npm run dev:preprod
```

Open **[http://localhost:5173/](http://localhost:5173/)**.

1. Unlock **1AM** → network **Preprod** → wait until **synced**.
2. App prefers 1AM when both wallets are installed.
3. **Settings → Connect wallet → Deploy on Preprod** (ZK prove often **2–5+ minutes** — approve the popup).
4. Copy the new contract address into README + Netlify `VITE_CONTRACT_ADDRESS`.
5. **Verify** with any secret string; public `verificationCount` increments.

Faucet (if needed for Lace path): [https://midnight-tmnight-preprod.nethermind.dev/](https://midnight-tmnight-preprod.nethermind.dev/)

### Environment (`cipherid-ui/.env.preprod`)

| Variable | Purpose |
| --- | --- |
| `VITE_NETWORK_ID` | Must be `preprod` (mismatch vs wallet breaks connect) |
| `VITE_CONTRACT_ADDRESS` | Published Preprod hex (empty until first deploy) |
| `VITE_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| `VITE_INDEXER_WS_URI` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| `VITE_PROOF_SERVER_URL` | `https://confidential-digital-id.netlify.app/proof-server` (same-origin proxy — remote Preprod URL is blocked by CORS in the browser) |

### Local undeployed (optional)

```bash
docker compose up -d --wait
npm run setup
npm run cli
npm run dev
```

---

## Preview / Preprod Deployment Status

| Item | Status |
| --- | --- |
| Compact compile | ✅ |
| Local undeployed deploy + CLI | ✅ |
| Tests + CI | ✅ |
| Browser Deploy + Verify (1AM Preprod) | ✅ Deployed `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8` |
| Netlify live demo | ✅ [confidential-digital-id.netlify.app](https://confidential-digital-id.netlify.app/) — set Preprod env below + redeploy |

### Netlify production env (Site settings → Environment variables → Redeploy)

| Variable | Value |
| --- | --- |
| `VITE_NETWORK_ID` | `preprod` |
| `VITE_CONTRACT_ADDRESS` | `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8` |
| `VITE_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| `VITE_INDEXER_WS_URI` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| `VITE_PROOF_SERVER_URL` | `https://confidential-digital-id.netlify.app/proof-server` |

---

## Circuits

| Circuit | Does | Discloses |
| --- | --- | --- |
| constructor `name` | Sets public credential label | `credentialName` |
| `verifyCredential(secret)` | Proves secret knowledge; increments counter | Only that a valid proof ran |

---

## Continuous Integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) — install, compile checks, tests, UI build.

---

## Submission Checklist

### Level 1 — Contract & local deploy
- [x] Compact contract compiles
- [x] Public ledger: `credentialName`, `verificationCount`
- [x] `verifyCredential` takes a private `Opaque` secret
- [x] `disclose()` only for intentional public name
- [x] Local deploy + CLI

### Level 2 — Frontend & wallet
- [x] Web UI with wallet connect (prefers **1AM**)
- [x] Browser **Deploy** + **Verify**
- [x] Network / contract from env + Settings override
- [x] Public state panel + history

### Level 3 — Tests, CI, polish
- [x] Automated tests + GitHub Actions
- [x] Privacy model + product proposal
- [x] Real Preprod address published (`373815d6…5f7b49f8` via 1AM)

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run compile` | Compile Compact |
| `npm test` | Unit tests |
| `npm run setup` | Local stack + deploy |
| `npm run deploy` | CLI deploy |
| `npm run cli` | Verify / read state |
| `npm run proof-server:preprod` | Proof server only (`:6300`) |
| `npm run dev:preprod` | UI with `.env.preprod` |
| `npm run dev` | UI (default / local env) |

## Project structure

```
confidential-digital-id/
├── contract/           # Compact + managed ZK artifacts
├── api/
├── cipherid-cli/
├── cipherid-ui/        # Vite + React (Deploy / Verify / Settings)
├── proof-server-local.yml
├── docker-compose.yml
└── README.md
```
