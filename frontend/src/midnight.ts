import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';

import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

export const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (typeof window === 'undefined' || !(window as any).midnight) return undefined;
  const midnight = (window as any).midnight;
  
  const walletList = Object.values(midnight);
  if (walletList.length === 0) return undefined;
  
  const wallet = walletList.find((w: any) => w && typeof w === 'object' && typeof w.connect === 'function') as InitialAPI | undefined;
  return wallet || (walletList[0] as InitialAPI);
};

export const connectToWallet = async (networkId: string): Promise<ConnectedAPI> => {
  const start = Date.now();
  let initialAPI: InitialAPI | undefined;
  
  while (Date.now() - start < 3000) {
    initialAPI = getFirstCompatibleWallet();
    if (initialAPI) break;
    await new Promise(r => setTimeout(r, 200));
  }
  
  if (!initialAPI) {
    throw new Error('Midnight Lace wallet extension not detected in browser. Please install/enable Lace.');
  }
  
  console.log('Connecting to Midnight Lace wallet...', initialAPI);
  
  try {
    const connectedAPI = await initialAPI.connect(networkId);
    console.log('Successfully connected to Lace wallet!');
    return connectedAPI;
  } catch (error: any) {
    console.error('Lace wallet connection error:', error);
    if (error?.message?.includes('locked') || error?.reason?.includes('locked')) {
      throw new Error('🔒 Your Midnight Lace wallet is locked. Please unlock the extension in Chrome first.');
    }
    throw new Error(`Wallet connection failed: ${error?.message || 'User or extension rejected connection'}`);
  }
};

export const initializeProviders = async (networkId: string, zkConfigUrl: string) => {
  const connectedAPI = await connectToWallet(networkId);
  console.log('Connected API established, loading providers...');

  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigUrl, fetch.bind(window));
  
  // Exact standalone indexer GraphQL endpoints matching docker-compose
  let indexerUri = 'http://localhost:8088/api/v1/graphql';
  let indexerWsUri = 'ws://localhost:8088/api/v1/graphql/ws';
  let proverServerUri = 'http://localhost:6300';
  
  try {
    const remoteConfig = await connectedAPI.getConfiguration();
    if (remoteConfig) {
      if (remoteConfig.indexerUri) indexerUri = remoteConfig.indexerUri;
      if (remoteConfig.indexerWsUri) indexerWsUri = remoteConfig.indexerWsUri;
      if (remoteConfig.proverServerUri) proverServerUri = remoteConfig.proverServerUri;
    }
  } catch (e: any) {
    console.warn('Using default network config:', e?.message || e);
    if (e?.message?.includes('locked') || e?.reason?.includes('locked')) {
      throw new Error('🔒 Your Midnight Lace wallet is locked. Please unlock the extension in Chrome first.');
    }
  }

  let shieldedAddresses: any = { shieldedCoinPublicKey: '00', shieldedEncryptionPublicKey: '00' };
  try {
    const addrs = await connectedAPI.getShieldedAddresses();
    if (addrs) shieldedAddresses = addrs;
  } catch (e: any) {
    console.warn('Could not fetch shielded addresses:', e?.message || e);
    if (e?.message?.includes('locked') || e?.reason?.includes('locked')) {
      throw new Error('🔒 Your Midnight Lace wallet is locked. Please unlock the extension in Chrome first.');
    }
  }

  return {
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(proverServerUri, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
        const serializedTx = toHex(tx.serialize());
        const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
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
};
