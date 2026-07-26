export * from './managed/hello-world/contract/index.js';
export * from './witnesses.js';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as HelloWorld from './managed/hello-world/contract/index.js';

export const CompiledHelloWorldContract = CompiledContract.make(
  'hello-world',
  HelloWorld.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets('./managed/hello-world'),
);
