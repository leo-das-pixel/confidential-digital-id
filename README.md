# CipherID — Confidential Digital ID (Midnight dApp)

**CipherID** is a full-stack zero-knowledge identity dApp built for the Rise-In Midnight Hackathon. It enables users to generate cryptographic proofs of valid digital credentials without revealing private personal data like names, birthdates, or secret passcodes.

---

## 🌟 Product Architecture

- **SaaS Landing Page (`/`)**: A modern white-themed product showcase highlighting zero-knowledge privacy guarantees, feature comparisons, and an interactive selective disclosure simulator.
- **Verification dApp (`/app`)**: The interactive Web3 dApp connecting to the Midnight Lace wallet, executing client-side ZK proof circuits, and displaying on-chain verification counters.

---

## 💡 Product Proposal

- **Official Category:** Confidential Credentials
- **The Problem:** Traditional identity verification forces users to reveal sensitive personally identifiable information (PII). Verifiers store this data, creating massive data-breach liabilities.
- **Target Audience:** Individuals needing private proof of eligibility and compliance-focused organizations requiring cryptographic verification without storing raw PII.
- **The Midnight ZK Advantage:** By using Compact zero-knowledge circuits, users present a mathematical proof of credential validity. The public blockchain ledger records that a valid proof was accepted, completely shielding the private witness data.

---

## 🛡️ Privacy Model

- **What Observers Learn:** Only the public `credentialName` (e.g., "Confidential Digital ID") and the total number of successful verification proofs (`verificationCount`).
- **What Observers CANNOT Learn:** The private `credentialSecret` used as a witness in the transaction. It remains strictly in local memory and is never broadcast or stored on-chain.
- **Deliberate Disclosures:** The contract constructor uses `disclose()` only for the `credentialName`.

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js**: `>= 22.0.0`
- **Docker & Docker Compose** (for local Midnight node, indexer, and proof server)
- **Midnight Lace Wallet** Chrome Extension

### 1. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Start Local Midnight Devnet
Spin up the proof server, node, and standalone indexer:
```bash
npm run proof-server:start
```

### 3. Deploy Contract (Local Network)
```bash
npm run setup -- --network undeployed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Launch Application
You can launch the frontend dev server directly from the root:
```bash
npm run dev
```
Open **`http://localhost:5173`** for the SaaS Landing Page, or **`http://localhost:5173/app`** for the dApp interface.

---

## 🏆 Submission Checklist

- [x] **Level 1 Requirements**
  - Compact contract logic for `verifyCredential`.
  - Public ledger: `credentialName`, `verificationCount`.
  - Private circuit witness: `credentialSecret: Opaque<"string">`.
  - CLI commands for deployment, balance checking, and contract state queries.
- [x] **Level 2 Requirements**
  - Modern React & Vite frontend with Lace Wallet connectivity.
  - Dedicated `/app` dApp interface with network status and address loading.
  - Clear visual privacy model and interactive ZK simulator.
- [x] **Level 3 Requirements**
  - Automated E2E test suite (`scripts/tests.ts`).
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`).
  - Thorough documentation and environment example configuration (`.env.example`).
