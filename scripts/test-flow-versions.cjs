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
assert.equal(flowVersionFrom(''), 'v2');
assert.equal(flowVersionFrom('?flow=unknown'), 'v2');
assert.equal(flowVersionFrom('?scenario=S22&flow=v2'), 'v2');
assert.equal(flowVersionFrom('?flow=v1'), 'v1');
const target = new URL(flowVersionHref('/internal/wid', '?scenario=S22&flow=v1', '#example', 'v2'), 'https://prototype.local');
assert.equal(target.pathname, '/internal/wid');
assert.equal(target.searchParams.get('scenario'), 'S22');
assert.equal(target.searchParams.get('flow'), 'v2');
assert.equal(target.hash, '#example');
console.log('Version routing defaults to v2; preserves route, scenario and hash.');

const pathsMod = { exports: {} };
const pathsCode = ts.transpileModule(fs.readFileSync(path.join(root, 'src/shared/utils/internalPaths.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('exports', pathsCode)(pathsMod.exports);
const { isLegacyPrototypePath, toInternalPath, legacyRedirectTarget } = pathsMod.exports;
assert.equal(isLegacyPrototypePath('/mobile'), true);
assert.equal(isLegacyPrototypePath('/web/foo'), true);
assert.equal(isLegacyPrototypePath('/internal/mobile'), false);
assert.equal(toInternalPath('/mobile'), '/internal/mobile');
assert.equal(toInternalPath('/web/a'), '/internal/web/a');
assert.equal(legacyRedirectTarget('/wid', '?flow=v2', '#x'), '/internal/wid?flow=v2#x');
console.log('Legacy paths redirect under /internal.');
for (const args of [['scripts/check-flow-v1.cjs'], ['scripts/test-journey-contracts.cjs']]) {
  const result = spawnSync(process.execPath, args, { cwd: root, env: { ...process.env, FLOW_TEST_VERSION: 'v1' }, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
