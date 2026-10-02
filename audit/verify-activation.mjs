import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path));
const json = path => JSON.parse(read(path));
const manifest = json('audit/activation/manifest.json');
for (const entry of manifest.files) {
  assert(resolve(root, entry.path).startsWith(root + sep));
  const bytes = read(entry.path);
  assert.equal(bytes.length, entry.size);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
}
const upstream = json('audit/source-manifest.json');
const receipt = json('audit/activation/publication-receipt.json');
const status = json('audit/activation/release-status.json');
const proof = json('audit/activation/live-activation-proof.json');
const services = json('audit/activation/service-verification.json');
const publicReads = json('audit/activation/public-read-verification.json');
const deployment = json('deploy/ops/v5/mainnet-deployment.json');
assert.equal(manifest.runtimeSourceCommit, upstream.runtimeSourceCommit);
for (const entry of [receipt, status]) {
  assert.equal(entry.runtimeSourceHead, upstream.runtimeSourceCommit);
  assert.equal(entry.artifactDigest, upstream.artifactDigest);
  assert.equal(entry.websitePublished, true);
  assert.equal(entry.servicesInstalled, true);
}
assert.equal(receipt.factory.toLowerCase(), deployment.addresses.factory.toLowerCase());
assert.equal(receipt.authority.toLowerCase(), deployment.authority.toLowerCase());
assert.equal(proof.graph.artifactDigest, receipt.artifactDigest);
assert.equal(proof.graph.factory.toLowerCase(), receipt.factory.toLowerCase());
assert.equal(receipt.operationalReady, true);
assert.equal(receipt.index.complete, true);
assert.equal(receipt.index.indexedThrough, receipt.index.observedSafeHead);
assert.equal(proof.drain.latestNonce, proof.drain.pendingNonce);
assert.equal(proof.drain.journals.length, proof.drain.cutoverNonce);
assert.equal(new Set(proof.drain.journals.map(row => row.nonce)).size, proof.drain.cutoverNonce);
for (const unit of Object.values(services.units)) {
  assert.equal(unit.ActiveState, 'active');
  assert.equal(unit.UnitFileState, 'enabled');
}
for (const readiness of Object.values(services.workerReadiness)) {
  assert.equal(readiness.ready, true);
  assert(readiness.fileAgeSeconds < 90);
}
assert.equal(services.oldSignerEnabled, 'disabled');
for (const check of [...publicReads.checks, ...publicReads.assetChecks]) assert.equal(check.httpStatus, 200);
assert.equal(publicReads.assetCount, publicReads.assetChecks.length);
assert.equal(receipt.httpChecks['bemine.cc.cd/bemine-v4/'], 503);
assert.equal(receipt.httpChecks['tapeout.cc.cd/bemine-full-test/'], 503);
assert.equal(receipt.httpChecks['tapeout.cc.cd/pinkuang-deploy-v5/'], 200);
console.log(JSON.stringify({result:'passed', checkedFiles:manifest.files.length,
  activationSourceCommit:manifest.sourceCommit, publishedAt:receipt.checkedAt,
  websitePublished:true, servicesInstalled:true, publicAssetsVerified:publicReads.assetCount,
  note:'Offline verification of saved activation evidence; not a current live probe or financial flow test.'},null,2));
