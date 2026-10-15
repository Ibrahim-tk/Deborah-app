const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/shared/utils/flowVersion.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('exports', code)(mod.exports);
const { flowVersionFrom, flowVersionHref } = mod.exports;
assert.equal(flowVersionFrom(''), 'v1');
assert.equal(flowVersionFrom('?flow=unknown'), 'v1');
assert.equal(flowVersionFrom('?scenario=S22&flow=v2'), 'v2');
const target = new URL(flowVersionHref('/wid', '?scenario=S22&flow=v1', '#example', 'v2'), 'https://prototype.local');
assert.equal(target.pathname, '/wid');
assert.equal(target.searchParams.get('scenario'), 'S22');
assert.equal(target.searchParams.get('flow'), 'v2');
assert.equal(target.hash, '#example');
console.log('Version routing preserves route, scenario and hash.');
for (const args of [['scripts/check-flow-v1.cjs'], ['scripts/test-journey-contracts.cjs']]) {
  const result = spawnSync(process.execPath, args, { cwd: root, env: { ...process.env, FLOW_TEST_VERSION: 'v1' }, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
