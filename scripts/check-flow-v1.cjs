const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../versions/v1');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const actual = {};
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else actual[path.relative(path.join(root, 'src'), file)] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
}
walk(path.join(root, 'src'));
const changed = [...new Set([...Object.keys(actual), ...Object.keys(manifest.files)])].filter(file => actual[file] !== manifest.files[file]);
if (changed.length) {
  console.error('Frozen Version 1 changed. Restore these files; do not silently regenerate its manifest:\n' + changed.join('\n'));
  process.exitCode = 1;
} else console.log(`Version 1 integrity passed (${Object.keys(actual).length} frozen files).`);
