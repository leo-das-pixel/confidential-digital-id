import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// These tests assert the privacy contract of the compiled artifact:
// the public ledger exposes only credentialName + verificationCount,
// the private credential secret is never a ledger field, and no witness leaks user data.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const infoPath = path.resolve(
  __dirname,
  '..',
  'contract',
  'src',
  'managed',
  'hello-world',
  'compiler',
  'contract-info.json',
);

function loadInfo(): any {
  if (!fs.existsSync(infoPath)) {
    throw new Error(
      `Compiled contract-info.json not found at ${infoPath}. Run \`npm run compile\` first.`,
    );
  }
  return JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
}

test('compiled with the expected Compact compiler version', () => {
  const info = loadInfo();
  assert.equal(info['compiler-version'], '0.31.1');
});

test('public ledger exposes only credentialName and verificationCount', () => {
  const info = loadInfo();
  const ledgerNames = (info.ledger as Array<{ name: string; storage: string }>)
    .map((l) => l.name)
    .sort();
  assert.deepEqual(ledgerNames, ['credentialName', 'verificationCount']);

  const byName = Object.fromEntries(
    (info.ledger as Array<{ name: string; storage: string }>).map((l) => [l.name, l]),
  );
  assert.equal(byName.verificationCount.storage, 'Counter');
  // The private credential secret must never appear on the public ledger.
  assert.equal(ledgerNames.includes('credentialSecret'), false);
  assert.equal(ledgerNames.includes('secret'), false);
});

test('verifyCredential circuit takes an opaque secret and produces a proof', () => {
  const info = loadInfo();
  const verifyCircuit = (info.circuits as Array<any>).find((c) => c.name === 'verifyCredential');
  assert.ok(verifyCircuit, 'verifyCredential circuit must exist');
  assert.equal(verifyCircuit.proof, true, 'verifyCredential must be a proving circuit');
  assert.equal(verifyCircuit.arguments.length, 1);
  assert.equal(verifyCircuit.arguments[0].name, 'credentialSecret');
  assert.equal(verifyCircuit.arguments[0].type['type-name'], 'Opaque');
});

test('no witnesses are declared (nothing private is persisted off-secret)', () => {
  const info = loadInfo();
  assert.deepEqual(info.witnesses, []);
});
