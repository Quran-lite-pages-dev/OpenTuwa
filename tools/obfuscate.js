#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const glob = require('glob');

function randHex(len = 8) {
  return [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processJs(file, backupRoot) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    if (!code.trim()) return;
    const result = await minify(code, {
      compress: { passes: 2 },
      mangle: { toplevel: false },
      format: { comments: false }
    });
    if (result.error) {
      console.error('terser error', file, result.error);
      return;
    }
    const header = `/* ${randHex(10)}-obf-${Date.now()} */\u200B`;
    const out = header + (result.code || '').replace(/\n+/g, '');
    const backupPath = path.join(backupRoot, file);
    ensureDirSync(path.dirname(backupPath));
    fs.writeFileSync(backupPath, code, 'utf8');
    fs.writeFileSync(file, out, 'utf8');
    console.log('JS obfuscated:', file);
  } catch (e) {
    console.error('Failed JS', file, e.message);
  }
}

function processCss(file, backupRoot) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    if (!code.trim()) return;
    const outMin = new CleanCSS({ level: 2 }).minify(code).styles;
    const header = `/* ${randHex(10)}-css-${Date.now()} */\u200B`;
    const out = header + outMin.replace(/\n+/g, '');
    const backupPath = path.join(backupRoot, file);
    ensureDirSync(path.dirname(backupPath));
    fs.writeFileSync(backupPath, code, 'utf8');
    fs.writeFileSync(file, out, 'utf8');
    console.log('CSS obfuscated:', file);
  } catch (e) {
    console.error('Failed CSS', file, e.message);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const doBackup = argv.includes('--backup');
  const backupRoot = doBackup ? 'backup_obfuscation' : null;
  if (doBackup) ensureDirSync(backupRoot);

  const ignore = ['**/node_modules/**', '**/_site/**', '**/backup_obfuscation/**', '**/.git/**', 'tools/**'];

  const jsFiles = glob.sync('**/*.js', { ignore });
  const cssFiles = glob.sync('**/*.css', { ignore });

  for (const f of jsFiles) {
    if (f.endsWith('.min.js')) continue;
    await processJs(f, backupRoot);
  }

  for (const f of cssFiles) {
    if (f.endsWith('.min.css')) continue;
    processCss(f, backupRoot);
  }

  console.log('Obfuscation done. Backups:', doBackup ? backupRoot : 'none');
}

main().catch(e => {
  console.error('Fatal', e);
  process.exit(1);
});
