import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./backend-fixes-2026-10-03/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
for(const [name,row] of Object.entries(manifest.files)) {
  const body=readFileSync(new URL(name,root));
  assert.equal(body.length,row.bytes,name);
  assert.equal(createHash('sha256').update(body).digest('hex'),row.sha256,name);
}
console.log(`Verified ${Object.keys(manifest.files).length} backend supplement files for ${manifest.apiSourceHead}.`);
