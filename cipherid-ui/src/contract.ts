import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as HelloWorld from '@/managed/hello-world/contract/index.js';
import type { AppConfig } from '@/config';
import type { MidnightProviders } from '@/midnight';

const PRIVATE_STATE_ID = 'helloWorldPrivateState';
const DEFAULT_CREDENTIAL_NAME = 'Confidential Digital ID';

export type PublicState = {
  credentialName: string;
  verificationCount: bigint;
};

function zkAssetBase() {
  return `${window.location.origin}/hello-world`;
}

function compiledContract() {
  return CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkAssetBase()),
  );
}

export async function getPublicState(
  config: AppConfig,
  providers: MidnightProviders,
): Promise<PublicState | null> {
  if (!config.contractAddress) {
    throw new Error('No contract address configured.');
  }
  const contractState = await providers.publicDataProvider.queryContractState(
    config.contractAddress,
  );
  if (!contractState) return null;
  const ledgerState = HelloWorld.ledger(contractState.data);
  return {
    credentialName: ledgerState.credentialName as string,
    verificationCount: ledgerState.verificationCount as bigint,
  };
}

export async function deployCredentialContract(
  providers: MidnightProviders,
  credentialName = DEFAULT_CREDENTIAL_NAME,
): Promise<{ contractAddress: string }> {
  const deployed = await deployContract(providers as never, {
    compiledContract: compiledContract() as never,
    args: [credentialName] as never,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
  const contractAddress = String(
    (deployed as { deployTxData: { public: { contractAddress: string } } }).deployTxData.public
      .contractAddress,
  );
  return { contractAddress };
}

export async function submitVerifyCredential(
  config: AppConfig,
  providers: MidnightProviders,
  secret: string,
): Promise<{ txId: string }> {
  if (!config.contractAddress) {
    throw new Error('No contract address configured.');
  }
  const deployed = await findDeployedContract(providers as never, {
    compiledContract: compiledContract() as never,
    contractAddress: config.contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  const tx = await (
    deployed as unknown as {
      callTx: { verifyCredential: (s: string) => Promise<{ public: { txId: string } }> };
    }
  ).callTx.verifyCredential(secret);
  return { txId: tx.public.txId };
}
