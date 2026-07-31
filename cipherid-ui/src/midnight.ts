import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

export const LACE_STORE_URL =
  'https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk';

/** Prefer 1AM (non-Lace) when both wallets are installed — Preprod + sponsored DUST. */
export const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (typeof window === 'undefined' || !(window as unknown as { midnight?: unknown }).midnight) {
    return undefined;
  }
  const midnight = (window as unknown as { midnight: Record<string, unknown> }).midnight;
  const entries = Object.entries(midnight).filter(
    ([, w]) => w && typeof w === 'object' && typeof (w as InitialAPI).connect === 'function',
  ) as [string, InitialAPI][];
  if (entries.length === 0) return undefined;
  const nonLace = entries.find(([key]) => key !== 'mnLace');
  return (nonLace ?? entries[0])[1];
};

export function isLaceInstalled(): boolean {
  return Boolean(getFirstCompatibleWallet());
}

export function waitForLace(timeoutMs = 5000, intervalMs = 200): Promise<boolean> {
  if (isLaceInstalled()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (isLaceInstalled()) {
        window.clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, intervalMs);
  });
}

export const connectToWallet = async (networkId: string): Promise<ConnectedAPI> => {
  const start = Date.now();
  let initialAPI: InitialAPI | undefined;

  while (Date.now() - start < 5000) {
    initialAPI = getFirstCompatibleWallet();
    if (initialAPI) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!initialAPI) {
    throw new Error('No Midnight wallet detected. Install 1AM or Lace and enable Midnight.');
  }

  try {
    // 1AM/Lace may show an authorize popup — do not race a short timeout.
    return await initialAPI.connect(networkId);
  } catch (error: unknown) {
    const text = error instanceof Error ? error.message : String(error);
    if (/locked/i.test(text)) {
      throw new Error('Your wallet is locked. Unlock it, then connect again.');
    }
    if (/network/i.test(text)) {
      throw new Error(
        `Network mismatch (app wants ${networkId}). Set 1AM/Lace to the same network and try again. ${text}`,
      );
    }
    throw new Error(`Wallet connection failed: ${text}`);
  }
};

function isLocked(err: unknown) {
  const text =
    err instanceof Error
      ? `${err.message} ${(err as { reason?: string }).reason ?? ''}`
      : String(err);
  return /locked/i.test(text);
}

export async function initializeProviders(networkId: string, zkConfigUrl: string) {
  const connectedAPI = await connectToWallet(networkId);
  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigUrl, fetch.bind(window));

  let indexerUri = import.meta.env.VITE_INDEXER_URI || 'http://127.0.0.1:8088/api/v4/graphql';
  let indexerWsUri =
    import.meta.env.VITE_INDEXER_WS_URI || 'ws://127.0.0.1:8088/api/v4/graphql/ws';
  let proverServerUri =
    import.meta.env.VITE_PROOF_SERVER_URL ||
    import.meta.env.VITE_PROVER_URI ||
    'http://127.0.0.1:6300';

  const hasEnvIndexer = Boolean(import.meta.env.VITE_INDEXER_URI);
  const hasEnvProver = Boolean(
    import.meta.env.VITE_PROOF_SERVER_URL || import.meta.env.VITE_PROVER_URI,
  );

  try {
    if (!hasEnvIndexer || !hasEnvProver) {
      const remoteConfig = await connectedAPI.getConfiguration();
      if (remoteConfig) {
        if (!hasEnvIndexer && remoteConfig.indexerUri) indexerUri = remoteConfig.indexerUri;
        if (!hasEnvIndexer && remoteConfig.indexerWsUri) indexerWsUri = remoteConfig.indexerWsUri;
        if (!hasEnvProver && remoteConfig.proverServerUri) {
          proverServerUri = remoteConfig.proverServerUri;
        }
      }
    }
  } catch (e: unknown) {
    if (isLocked(e)) {
      throw new Error('Your wallet is locked. Unlock it, then connect again.');
    }
  }

  let shieldedAddresses: {
    shieldedAddress?: string;
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey?: string;
  };
  try {
    const addrs = await connectedAPI.getShieldedAddresses();
    if (!addrs?.shieldedCoinPublicKey) {
      throw new Error('Wallet did not return shielded addresses. Unlock and try again.');
    }
    shieldedAddresses = addrs;
  } catch (e: unknown) {
    if (isLocked(e)) {
      throw new Error('Your wallet is locked. Unlock it, then connect again.');
    }
    throw e instanceof Error ? e : new Error(String(e));
  }

  return {
    addressLabel:
      shieldedAddresses.shieldedAddress ??
      shieldedAddresses.shieldedCoinPublicKey,
    indexerUri,
    indexerWsUri,
    proverServerUri,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(proverServerUri, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'cipherid-private-state',
      accountId: shieldedAddresses.shieldedAddress ?? shieldedAddresses.shieldedCoinPublicKey,
      privateStoragePasswordProvider: () => 'Local-Browser-Development-Placeholder-1',
    }),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey ?? '';
      },
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
        const serializedTx = toHex(tx.serialize());
        const received = await connectedAPI.balanceUnsealedTransaction(serializedTx, {
          payFees: true,
        });
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          'signature',
          'proof',
          'binding',
          fromHex(received.tx),
        );
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  };
}

export type MidnightProviders = Awaited<ReturnType<typeof initializeProviders>>;
