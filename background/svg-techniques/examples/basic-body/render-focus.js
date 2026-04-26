#!/usr/bin/env node
// render-focus.js — render the four "medium adult" cells (F35/M35 × 18%/22%)
// large, with annotations, so iteration on those specific cells is easy.

import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildBodySvg } from './panels/body-generator.js';

const out = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : '/tmp/focus.png';

const cells = [
  { sex: 'female', age: 35, bodyFat: 18, label: 'F · 35y · 18%' },
  { sex: 'female', age: 35, bodyFat: 22, label: 'F · 35y · 22%' },
  { sex: 'female', age: 35, bodyFat: 28, label: 'F · 35y · 28%' },
  { sex: 'male',   age: 35, bodyFat: 14, label: 'M · 35y · 14%' },
  { sex: 'male',   age: 35, bodyFat: 18, label: 'M · 35y · 18%' },
  { sex: 'male',   age: 35, bodyFat: 22, label: 'M · 35y · 22%' },
];

const cellW = 360, cellH = 432, labelH = 32;
const cols = 3, rows = 2;
const gridW = cols * cellW;
const gridH = rows * (cellH + labelH);

const cellHtml = cells.map((c, i) => {
  const col = i % cols, row = Math.floor(i / cols);
  const x = col * cellW;
  const yLabel = row * (cellH + labelH);
  const yCell  = yLabel + labelH;
  const svg = buildBodySvg({ sex: c.sex, age: c.age, bodyFat: c.bodyFat }, { theme: 'light', background: false });
  return `<div class="hdr" style="left:${x}px;top:${yLabel}px;width:${cellW}px;height:${labelH}px">${c.label}</div>` +
         `<div class="cell" style="left:${x}px;top:${yCell}px;width:${cellW}px;height:${cellH}px">${svg}</div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:#f7f6f2;color:#333;font:14px -apple-system,Helvetica,Arial,sans-serif}
  .grid{position:relative;width:${gridW}px;height:${gridH}px}
  .cell{position:absolute;border:1px solid #ddd;box-sizing:border-box;display:flex;align-items:center;justify-content:center}
  .cell svg{width:100%;height:100%;display:block}
  .hdr{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:600;background:#f0ece2;border-bottom:1px solid #ddd}
</style></head><body><div class="grid">${cellHtml}</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'focus-'));
const htmlPath = join(dir, 'focus.html');
writeFileSync(htmlPath, html);
execSync(`google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars --screenshot=${out} --window-size=${gridW},${gridH} file://${htmlPath}`, { stdio: 'inherit' });
rmSync(dir, { recursive: true, force: true });
console.log(`focus: ${gridW}×${gridH} → ${out}`);
