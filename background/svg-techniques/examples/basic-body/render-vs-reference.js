#!/usr/bin/env node
// render-vs-reference.js — show my generated medium adult next to the
// gen_grid_* reference, so I can see specifically what's different.

import { writeFileSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildBodySvg } from './panels/body-generator.js';

const out = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : '/tmp/vs-ref.png';

const refMaleData   = readFileSync('./reference/gen_grid_male.png').toString('base64');
const refFemaleData = readFileSync('./reference/gen_grid_female.png').toString('base64');

const myF = buildBodySvg({ sex: 'female', age: 35, bodyFat: 22 }, { theme: 'light', background: false });
const myM = buildBodySvg({ sex: 'male',   age: 35, bodyFat: 18 }, { theme: 'light', background: false });

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:#f7f6f2;color:#333;font:14px -apple-system,Helvetica,Arial,sans-serif}
  .row{display:flex;align-items:flex-start;gap:0;padding:8px}
  .ref-wrap{flex:1;text-align:center}
  .ref-wrap img{max-width:100%;height:auto;display:block}
  .ref-wrap h2{margin:0 0 4px;font-size:13px}
  .mine{width:500px;flex:none;text-align:center;background:#fff;border:2px solid #b94a3a;padding:8px;box-sizing:border-box}
  .mine h2{margin:0 0 6px;font-size:16px;color:#b94a3a}
  .mine svg{width:400px;height:480px}
</style></head><body>
  <div class="row">
    <div class="ref-wrap"><h2>Reference: female grid</h2><img src="data:image/png;base64,${refFemaleData}"/></div>
    <div class="mine"><h2>Mine F · 35y · 22%</h2>${myF}</div>
  </div>
  <div class="row">
    <div class="ref-wrap"><h2>Reference: male grid</h2><img src="data:image/png;base64,${refMaleData}"/></div>
    <div class="mine"><h2>Mine M · 35y · 18%</h2>${myM}</div>
  </div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'vs-ref-'));
const htmlPath = join(dir, 'vs-ref.html');
writeFileSync(htmlPath, html);
execSync(`google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars --screenshot=${out} --window-size=2000,1200 file://${htmlPath}`, { stdio: 'inherit' });
rmSync(dir, { recursive: true, force: true });
console.log(`vs-ref → ${out}`);
