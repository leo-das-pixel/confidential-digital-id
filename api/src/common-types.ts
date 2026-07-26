/** Shared identifiers and ledger-facing types for CipherID. */

export const PRIVATE_STATE_ID = 'helloWorldPrivateState';
export const PRIVATE_STATE_STORE_NAME = 'hello-world-state';
export const CONTRACT_NAME = 'hello-world';

export type PublicState = {
  credentialName: string;
  verificationCount: bigint;
};
