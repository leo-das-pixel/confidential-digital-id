import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '..', '..', 'contract', 'src', 'managed', 'hello-world');
const publicDest = path.resolve(__dirname, '..', 'public', 'hello-world');
const srcDest = path.resolve(__dirname, '..', 'src', 'managed', 'hello-world');

if (!fs.existsSync(src)) {
  console.warn(`ZK assets missing at ${src} — run npm run compile from repo root.`);
  process.exit(0);
}

fs.cpSync(src, publicDest, { recursive: true });
fs.cpSync(src, srcDest, { recursive: true });
console.log('Copied ZK assets into cipherid-ui public/ and src/managed/');
