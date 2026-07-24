/**
 * Tests for confidential-digital-id.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed } from '../src/network';
import { createWallet } from '../src/wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'helloWorldPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Test failed: ${msg}`);
}

async function main() {
  console.log('--- Starting Tests ---');
  
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'hello-world');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) throw new Error('Compiled contract missing');
  
  const HelloWorld = await import(pathToFileURL(contractPath).href);
  const compiledContract = CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  await walletCtx.wallet.waitForSyncedState();

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  } as any;

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'test-state-' + Date.now(),
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  let deployed: any;

  // Test 1: Deployment
  console.log('Running Test 1: Contract deployment...');
  deployed = await deployContract(providers, {
    compiledContract: compiledContract as any,
    args: ['Test Credential'],
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
  assert(deployed.deployTxData.public.txId, 'Deployment transaction ID should exist');
  console.log('✅ Test 1 Passed');

  // Test 2: Initial State Verification
  console.log('Running Test 2: Initial public state check...');
  const stateData1 = await providers.publicDataProvider.queryContractState(deployed.deployTxData.public.contractAddress);
  const ledger1 = HelloWorld.ledger(stateData1!.data);
  const name1 = Buffer.from(ledger1.credentialName).toString();
  assert(name1 === 'Test Credential', `Expected credentialName to be 'Test Credential', got '${name1}'`);
  assert(Number(ledger1.verificationCount) === 0, 'Expected verificationCount to be 0');
  console.log('✅ Test 2 Passed');

  // Test 3: Method Execution
  console.log('Running Test 3: verifyCredential execution...');
  const tx = await deployed.callTx.verifyCredential('my-secret-witness');
  assert(tx.public.txId, 'Call transaction ID should exist');
  
  const stateData2 = await providers.publicDataProvider.queryContractState(deployed.deployTxData.public.contractAddress);
  const ledger2 = HelloWorld.ledger(stateData2!.data);
  assert(Number(ledger2.verificationCount) === 1, 'Expected verificationCount to be 1');
  console.log('✅ Test 3 Passed');

  await walletCtx.wallet.stop();
  console.log('All tests passed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
