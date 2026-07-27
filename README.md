# Confidential Digital ID

A **Midnight** DApp where users prove they hold a valid digital identity credential **without revealing their identity or private credential secret**. The public ledger shows only the **credential name** and a running **verification count**.

[![CI/CD](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml/badge.svg)](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel)](https://confidential-digital-id.vercel.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-FF0000?style=flat-square&logo=youtube)](https://youtu.be/ScmZN5f9Eik)
[![Compact](https://img.shields.io/badge/Compact-0.31.1-06b6d4?style=flat-square)](https://docs.midnight.network)
[![Node.js](https://img.shields.io/badge/Node.js-22+-10b981?style=flat-square)](https://nodejs.org)

- **Level 1** — Compact contract + local deploy + CLI ✅
- **Level 2** — Web frontend with Lace wallet connect + `verifyCredential` circuit call ✅
- **Level 3** — Tests, CI, privacy model, product proposal, submission checklist ✅

## Links

| Resource | URL |
| --- | --- |
| **Live demo** | [https://confidential-digital-id.vercel.app/](https://confidential-digital-id.vercel.app/) |
| **Demo video** | [https://youtu.be/ScmZN5f9Eik](https://youtu.be/ScmZN5f9Eik) |
| **GitHub** | [leo-das-pixel/confidential-digital-id](https://github.com/leo-das-pixel/confidential-digital-id) |
| **CI/CD** | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| **Proposal** | [PROPOSAL.md](PROPOSAL.md) |
| **Preprod address (local)** | `18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023` |

### 📹 Demo Video

Watch the full video walkthrough: **[CipherID — Confidential Digital Identity Demo on YouTube](https://youtu.be/ScmZN5f9Eik)**

---

### Screenshots

![Landing Page](cipherid-ui/public/landing.png)

![App Dashboard](cipherid-ui/public/dashboard.png)

![Verify Credential](cipherid-ui/public/verify.png)

![Verification History](cipherid-ui/public/history.png)

![Settings Console](cipherid-ui/public/settings.png)

---

## Product Proposal

**Category: Confidential Credentials**

> A user proves they hold a valid digital identity credential code without revealing sensitive personal details (full name, birthdate, ID number, or credential secret) publicly.

Verifying identity or holding specific credentials often requires users to disclose sensitive personally identifiable information (PII). This information is typically collected and stored by third parties, creating massive security risks and data-breach liabilities.

With **Confidential Digital ID**, users submit a Midnight transaction that **witnesses** their private credential secret inside a zero-knowledge circuit. The blockchain ledger verifies the cryptographic proof without storing or revealing the user's private data.

This is a reusable building block for **confidential credential verification**: age verification, membership authorization, privacy-preserving KYC, and gated digital access.

---

## Privacy Model

What an on-chain observer (indexer, explorer, validator) **can** and **cannot** learn:

| An observer CAN see | An observer CANNOT see |
| --- | --- |
| The `credentialName` (set publicly at deploy) | The private credential secret or ID code |
| The total `verificationCount` | Who verified their credential (no address stored) |
| That a verification transaction occurred | Any link between a verification and a specific person |
| The ZK proof is valid | The witness data used to build the proof |

How it is enforced in `contract/src/hello-world.compact`:

- `credentialName` is written with `disclose(name)` — it is **intentionally** public.
- `secret` is an `Opaque<"string">` **circuit input** used only inside the `verifyCredential` proof. It is **never** passed to `disclose()` and is **never** stored in a ledger field.
- `verificationCount` is a `Counter`; `verifyCredential` only increments the counter, revealing an aggregate — not an identity.

> Note on unlinkability: like any transaction, a verification proof is submitted from a wallet that pays fees, so network-level metadata still exists. The **contract** reveals nothing about identity or the secret; the privacy guarantee is enforced at the ledger and state level.

---

## Public state vs private witness

| Layer | What | Visibility |
| --- | --- | --- |
| **Public ledger** | `credentialName`, `verificationCount` | Anyone can read via the indexer |
| **Private witness** | `secret` (`Opaque<"string">` circuit input) | Used only inside the `verifyCredential` proof; never disclosed, never stored |

---

## Requirements

- Node **22+**
- Docker (Compose v2) — for the local devnet + proof server
- Compact compiler

On WSL, work from the native Linux filesystem (e.g. `~/midnight-projects/...`) or map correctly to Windows.

## Install

```bash
npm install            # installs all workspaces (contract, api, cli, ui)
```

## Compile

```bash
npm run compile
```

Runs `compact compile contract/src/hello-world.compact contract/src/managed/hello-world`. Output lands in `contract/src/managed/hello-world/` (JS bindings, ZKIR, keys, circuit metadata).

## Test

```bash
npm test
```

Runs the test suite in `scripts/tests.ts` (network resolution, state round-trip, and compiled-artifact privacy invariants).

## Local deploy

One-shot (starts local node + indexer + proof-server, compiles, deploys):

```bash
npm run setup
```

Or step by step:

```bash
docker compose up -d --wait
npm run compile
npm run deploy
```

Deploy writes the contract address to `.midnight-state.json` under `deployments.undeployed`. Interact via the CLI:

```bash
npm run cli
```

- **Option 1** — submit a private credential verification proof
- **Option 2** — read public `credentialName` and `verificationCount`

Smoke-test the deployment:

```bash
npm run test:e2e
```

### Local devnet ports

| Service | Port | Role |
| --- | --- | --- |
| node | 9944 | Midnight `dev` chain |
| indexer | 8088 | GraphQL public state |
| proof-server | 6300 | ZK proof generation |

Tear down: `docker compose down -v`.

---

## Frontend (Level 2)

A Vite + React + TypeScript full-screen SaaS app in [`cipherid-ui/`](./cipherid-ui) that connects the **Lace (Midnight)** wallet and calls the `verifyCredential` circuit.

Features:
- **Full-bleed SaaS Landing Page (`/`)**: Dark-mode marketing view showcasing zero-knowledge proof mechanics, active network status, and product architecture.
- **Structured App Shell**: Full-screen SaaS console with navigation across **Dashboard**, **Verify**, **History**, and **Settings**.
- **Lace Wallet Integration**: Real-time wallet connection, address display, sync state, and network status widget powered by `wallet-context.tsx`.
- **Zero-Knowledge Verification (`/verify`)**: Circuit execution for confidential credentials with step-by-step state tracking (initiating, proving, submitting, complete).
- **Public Ledger State (`/dashboard`, `/history`)**: Real-time tracking of public `credentialName` and aggregate `verificationCount`.
- **Verification History & Settings (`/history`, `/settings`)**: Interactive audit history log and configurable network settings.

### Run the UI locally

From the project root:

```bash
npm run dev       # Launches CipherID UI at http://localhost:5173
```

Or from `cipherid-ui/`:

```bash
cd cipherid-ui
npm run dev
```

---

## Contract overview

Compact source: `contract/src/hello-world.compact`

- **Constructor** `name` → sets public `credentialName` via `disclose(name)`
- **Circuit** `verifyCredential(secret)` → private opaque secret; increments public `verificationCount`

## Networks

| Network | Use |
| --- | --- |
| `undeployed` | Local docker-compose devnet (default) |
| `preview` | Public preview testnet |
| `preprod` | Public preprod testnet |

---

## Continuous Integration (Level 3)

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on every push and pull request:

1. Install Node 22 + dependencies.
2. Verify contract compilation and pre-compiled managed artifacts.
3. Type-check backend and build UI (`npm run build`).

---

## Preprod Deployment Status

The Compact contract compiles and deploys/executes end-to-end on the **local devnet** (compile → deploy → CLI check-in → read-back). The contract has been deployed locally against the Preprod testnet infrastructure.

> **Local-only Preprod address**: `18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023`

| Item | Status |
| --- | --- |
| Compact compile | ✅ Succeeds (`verifyCredential` circuit) |
| Local (`undeployed`) deploy + CLI | ✅ Verified |
| Tests + CI | ✅ Passing (10/10 unit tests) |
| Frontend (Lace connect + `verifyCredential`) | ✅ Implemented & env-configurable |
| Preprod contract address (local) | ✅ `18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023` |

---

## Submission Checklist

### Level 1 — Contract & local deploy
- [x] Compact contract compiles
- [x] Public ledger: `credentialName`, `verificationCount`
- [x] `verifyCredential` circuit takes a private `Opaque` secret
- [x] `disclose()` used only for the intentionally public credential name
- [x] Local deploy works (`npm run setup`)
- [x] CLI can call `verifyCredential` and read public state (`npm run cli`)
- [x] Product idea documented

### Level 2 — Frontend & wallet
- [x] Web UI (`cipherid-ui/`) rebuilt as full-screen SaaS console with Lace wallet integration
- [x] Full-bleed SaaS Landing Page and structured App Shell (Dashboard, Verify, History, Settings)
- [x] Lace wallet connect / disconnect + status
- [x] Network + contract address from environment variables / configuration
- [x] Credential secret input (witnessed privately via ZK circuit)
- [x] Verify Credential button calls `verifyCredential` with live proof status
- [x] Public state panel (`credentialName`, `verificationCount`) synced with ledger
- [x] Verification history log & network settings views

### Level 3 — Tests, CI, polish
- [x] Automated tests (`npm test`)
- [x] GitHub Actions CI (compile + tests + typecheck + UI build)
- [x] Privacy Model section
- [x] Product Proposal (category: Confidential Credentials)
- [x] This submission checklist
- [x] Preprod blocker documented

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run compile` | Compile Compact → `contract/src/managed/hello-world/` |
| `npm test` | Run test suite in `scripts/tests.ts` |
| `npm run setup` | Start proof stack, compile, and deploy |
| `npm run deploy` | Deploy compiled contract |
| `npm run cli` | Verify credential / read public state |
| `npm run dev` | Run CipherID UI dev server from root |

## Project structure

```
confidential-digital-id/
├── contract/                      # Compact contract + managed ZK artifacts
│   └── src/
│       ├── hello-world.compact
│       ├── witnesses.ts
│       ├── index.ts
│       └── managed/hello-world/
├── api/                           # Shared types/utils for CLI + UI
├── cipherid-cli/                  # Deploy, CLI, wallet, network
│   └── src/
├── cipherid-ui/                   # Vite + React SaaS console (CipherID)
│   └── src/
├── scripts/                       # tests + e2e checks
├── .github/workflows/ci.yml
├── docker-compose.yml
├── package.json                   # npm workspaces root
└── README.md
```
