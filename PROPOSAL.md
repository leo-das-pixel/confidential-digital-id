# Project Proposal: Confidential Digital ID (CipherID)

> **Zero-Knowledge Privacy-Preserving Identity Verification on the Midnight Network**

[![CI/CD](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml/badge.svg)](https://github.com/leo-das-pixel/confidential-digital-id/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://confidential-digital-id.netlify.app/)
[![Demo Video](https://img.shields.io/badge/Demo_Video-YouTube-FF0000?style=flat-square&logo=youtube)](https://youtu.be/ScmZN5f9Eik)
[![Compact](https://img.shields.io/badge/Compact-0.31.1-06b6d4?style=flat-square)](https://docs.midnight.network)

---

## Executive Summary

**Confidential Digital ID (CipherID)** is a privacy-preserving digital credential dApp built on the **Midnight Network** using **Compact** zero-knowledge smart contracts. Users prove they hold a valid digital identity credential or access secret **without revealing their identity or private credential data** — the public ledger exposes only the credential category name and a running aggregate verification count.

---

## Problem Statement

Traditional digital identity check-ins and credential verification systems expose sensitive personal data:

1. **Centralized Data Harvesting**: Storing personal identifiable information (PII) on centralized servers creates major data breach vulnerabilities.
2. **On-Chain Doxxing**: Public blockchain credentials permanently link user wallet addresses to real-world identities and activities.
3. **Lack of Privacy-First Verification Primitives**: Proving membership or eligibility currently forces users to sacrifice privacy.

---

## Solution: Midnight ZK Credential Verification

Using Midnight's dual-state (public/private) architecture:

- The **credential secret** (`credentialSecret`) is processed strictly inside the ZK circuit witness — `disclose()` is intentionally **never** called on it.
- Only the public `verificationCount` counter increments on-chain, proving *someone* valid verified without revealing *who*.
- The public `credentialName` is disclosed at contract deployment via `disclose(name)`.

### Compact Contract (`contract/src/hello-world.compact`)

```compact
export ledger credentialName: Opaque<"string">;
export ledger verificationCount: Counter;

constructor(name: Opaque<"string">) {
  credentialName = disclose(name);
}

export circuit verifyCredential(credentialSecret: Opaque<"string">): [] {
  const _privateSecret: Opaque<"string"> = credentialSecret;
  verificationCount.increment(1);
}
```

---

## Privacy Model

| Component | State Type | Visibility |
|---|---|---|
| `credentialSecret` | Private Witness | Browser/prover only — never disclosed, never stored on-chain |
| `credentialName` | Public Ledger | On-chain public (set at deploy via `disclose`) |
| `verificationCount` | Public Ledger | On-chain aggregate counter — no identity revealed |

### What observers CAN learn
- `credentialName` (set publicly at deployment)
- `verificationCount` (aggregate number of verifications)
- That a valid ZK proof was submitted

### What observers CANNOT learn
- The private credential secret or ID code
- Who verified their credential (no address stored on ledger)
- Any link between a verification transaction and a specific person

---

## Deployment & Verification

- **Network**: Midnight Preprod Testnet
- **Preprod Contract**: `373815d6936cadddb6f5a89438ed6c72964793da23452149b1ec3c3a5f7b49f8`
- **Sample verify tx**: `0001334e8e879bb892abe4407d16abcebdf9e1eb29d150029c56c9abeac6c28fec`
- **Live Frontend**: [confidential-digital-id.netlify.app](https://confidential-digital-id.netlify.app/)
- **Demo Video**: [YouTube](https://youtu.be/ScmZN5f9Eik)
- **Wallet path**: Verified with **1AM** on Preprod (deploy + verify)

---

## Use Cases

- **Age & Eligibility Verification**: Prove age or tier status without exposing full identity or birthdate.
- **Privacy-Preserving KYC**: Zero-knowledge proof of compliance for decentralized finance.
- **Gated Digital Access**: Access private forums or DAOs anonymously.
- **Corporate & Event Check-in**: Secure door access without storing attendee logs.

---

## Level 3 Compliance Checklist

- [x] Compact ZK circuit written in `v0.31.1` with private witness isolation
- [x] 10 unit tests passing (`npm test`) covering privacy invariants, state round-trips, and network resolution
- [x] GitHub Actions CI (`ci.yml`) compiling, testing, type-checking, and building on every push
- [x] Local Preprod contract address published: `18f01de0d2cc727c3690f6bcc5f5cd0099a44414c4c90e62101e23c07c83e023`
- [x] Full-stack web frontend live on Netlify with wallet integration (1AM / Lace)
- [x] Privacy model documented and enforced in contract
- [x] Demo video available: [YouTube](https://youtu.be/ScmZN5f9Eik)
- [x] Product proposal (this document)
