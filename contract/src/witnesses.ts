/**
 * Private state for CipherID / hello-world.
 * The contract has no witnesses — private state is vacant.
 */

export type CipherIdPrivateState = Record<string, never>;

export const createCipherIdPrivateState = (): CipherIdPrivateState => ({});

export const witnesses = {};
