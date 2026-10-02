import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, lstatSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name));
const json = name => JSON.parse(read(name));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sameAddress = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
const manifest = json('audit/source-manifest.json');
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.files.length, manifest.fileCount);
assert.equal(new Set(manifest.files.map(file => file.path)).size, manifest.fileCount);
for (const file of manifest.files) {
  const absolute = resolve(root, file.path);
  assert(absolute.startsWith(`${root}${sep}`), `Outside snapshot: ${file.path}`);
  assert(lstatSync(absolute).isFile(), `Not a regular file: ${file.path}`);
  const bytes = read(file.path);
  assert.equal(bytes.length, file.size, `Size differs: ${file.path}`);
  assert.equal(sha256(bytes), file.sha256, `Source differs: ${file.path}`);
}
const artifacts = json('deploy/public/deployment-artifacts.json');
let localSoliditySources = 0;
for (const [name, expected] of Object.entries(artifacts.sourceHashes)) {
  if (!name.startsWith('src/') && !name.startsWith('script/')) continue;
  assert.equal(sha256(read(`contracts/${name}`)), expected, `Artifact source differs: ${name}`);
  localSoliditySources++;
}
assert(localSoliditySources > 0);
assert.equal(artifacts.sourceCommit, manifest.contractSourceCommit);
const deployment = json('deploy/ops/v5/mainnet-deployment.json');
const frontend = json('deploy/ops/v5/frontend-manifest.json');
const graph = json('deploy/ops/v5/live-graph-verification.json');
const status = json('deploy/ops/v5/release-status.json');
assert.equal(deployment.chainId, 56);
assert.equal(frontend.chainId, 56);
for (const document of [deployment, frontend, graph, status]) {
  assert.equal(document.artifactDigest, manifest.artifactDigest, 'Artifact identity differs');
}
for (const key of ['factory', 'shareMarket', 'lens', 'beacon', 'timelock', 'portfolioFactory', 'portfolioBeacon']) {
  assert(sameAddress(frontend[key], deployment.addresses[key]), `Frontend address differs: ${key}`);
  assert(sameAddress(graph.addresses[key], deployment.addresses[key]), `Graph address differs: ${key}`);
}
assert(sameAddress(frontend.portfolioMarket, deployment.addresses.portfolioShareMarket));
assert(sameAddress(frontend.authority, deployment.authority));
assert(sameAddress(frontend.gasWallet, deployment.gasWallet));
assert.equal(deployment.deploymentSteps.length, 16);
assert.equal(deployment.activationSteps.length, 7);
assert([...deployment.deploymentSteps, ...deployment.activationSteps].every(step => step.status === 'confirmed'));
assert.equal(status.runtimeSourceHead, manifest.runtimeSourceCommit);
console.log(JSON.stringify({
  result: 'passed', upstreamFilesVerified: manifest.fileCount,
  localSoliditySourcesVerified: localSoliditySources,
  snapshotCommit: manifest.snapshotCommit,
  runtimeSourceCommit: manifest.runtimeSourceCommit,
  contractSourceCommit: manifest.contractSourceCommit,
  artifactDigest: manifest.artifactDigest,
  evidenceBlock: graph.blockNumber,
  websitePublished: status.websitePublished,
  servicesInstalled: status.servicesInstalled,
  note: 'Offline evidence/file consistency only; no live-chain or server requests were made.',
}, null, 2));
