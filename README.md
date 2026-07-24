# Confidential Digital ID (Midnight dApp)

This project is a full-stack Midnight dApp for the Rise-In Midnight Hackathon.

## Product Proposal

**Official Category:** Confidential Credentials

**Problem:** 
Verifying identity or holding specific credentials often requires users to disclose sensitive personal information (PII) like their exact name, birthdate, or ID number. This information can be stored by third parties and potentially leaked.

**Users:**
- Individuals who need to prove they hold a credential (e.g. proof of age, proof of citizenship, organizational membership).
- Organizations/Verifiers who need assurance without the liability of storing PII.

**Why Midnight Privacy Matters:**
Midnight enables users to provide a zero-knowledge proof that their credential is valid without revealing the credential itself. The public state only tracks that a verification occurred, completely shielding the user's private data while providing cryptographic certainty to the verifier.

## Privacy Model

- **What observers can learn:** Observers of the Midnight ledger can only see the `credentialName` (e.g., "Confidential Digital ID") and the `verificationCount` (how many successful verifications have occurred).
- **What observers cannot learn:** Observers cannot see the private `credentialSecret` used as a witness in the transaction. It remains completely off-chain and mathematically shielded.
- **What is deliberately disclosed:** The contract constructor uses `disclose()` to make the `credentialName` public, and `verificationCount` is a public state variable that is incremented upon successful proofs.

## Preprod Deployment Status

Preprod deployment was attempted, but wallet sync currently hangs. Per mentor guidance, the full-stack dApp is submitted with local deployment, tests, CI, and documented deployment blocker. Preprod address will be added once sync succeeds.

## Local Setup Instructions

### Prerequisites
- Node.js 22.x
- Docker and Docker Compose (WSL 2 Integration enabled for Ubuntu if on Windows)
- Midnight Compact Compiler (0.31.1)

### 1. Compile the Contract
```bash
npm run compile
```

### 2. Start Local Network & Deploy
This command spins up the Midnight proof server and local node via Docker, compiles the contract, and deploys it to the `undeployed` network.
```bash
npm run setup -- --network undeployed
```
Note the deployed contract address from the output.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run the Frontend UI
```bash
cd frontend
npm install
npm run build # (Optional) To build for production
npm run dev
```
Open `http://localhost:5173` in your browser with the Lace extension installed.

## Submission Checklist

- [x] **Level 1**
  - Add Compact contract for Confidential Digital ID.
  - Contract should compile with Compact 0.31.1.
  - Public ledger: `credentialName`, `verificationCount`.
  - Private circuit input: `credentialSecret: Opaque<"string">`.
  - Main circuit: `verifyCredential(credentialSecret)`.
  - Constructor accepts credential name and uses `disclose()` only for it.
  - Generate managed artifacts.
  - Local deploy must work.
  - CLI must support submit private credential proof, read state, check balance.
  - Minimum 5 meaningful commits.

- [x] **Level 2**
  - Lace wallet connect/disconnect UI.
  - Wallet status and network status display.
  - Contract address loaded from env.
  - Private credential secret input.
  - Verify credential button calling `verifyCredential`.
  - Public state panel showing `credentialName` and `verificationCount`.
  - Loading, success, error, disconnected states.
  - Privacy behavior clearly visible on UI.
  - README documents the privacy claim.
  - Minimum 8 meaningful commits.

- [x] **Level 3**
  - Add at least 3 meaningful tests (Deployment, Initial State, Method Execution).
  - Add GitHub Actions CI (install, compile, run tests, build frontend).
  - README Privacy Model details.
  - README Product Proposal details.
  - Add `.env.example`.
  - Minimum 10 meaningful commits without AI trailers.
  - No secrets committed.
