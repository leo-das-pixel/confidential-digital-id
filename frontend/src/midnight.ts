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
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      wallet.apiVersion.startsWith('4.')
  );
};

export const connectToWallet = async (networkId: string): Promise<ConnectedAPI> => {
  const start = Date.now();
  let initialAPI: InitialAPI | undefined;
  
  while (Date.now() - start < 1000) {
    initialAPI = getFirstCompatibleWallet();
    if (initialAPI) break;
    await new Promise(r => setTimeout(r, 100));
  }
  
  if (!initialAPI) throw new Error('Could not find Midnight Lace wallet. Extension installed?');
  
  const connectPromise = initialAPI.connect(networkId);
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Midnight Lace wallet has failed to respond. Extension enabled?')), 5000));
  
  try {
    const connectedAPI = await Promise.race([connectPromise, timeoutPromise]) as ConnectedAPI;
    return connectedAPI;
  } catch (error) {
    throw new Error('Application is not authorized');
  }
};

export const initializeProviders = async (networkId: string, zkConfigUrl: string) => {
  const connectedAPI = await connectToWallet(networkId);
  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigUrl, fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  return {
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
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
