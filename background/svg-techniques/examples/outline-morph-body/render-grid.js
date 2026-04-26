#!/usr/bin/env node
// render-grid.js -- rasterize a parameter sweep for visual review.

import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { buildBodySvg } from './panels/body-generator.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const out = typeof args.out === 'string' ? args.out : '/tmp/outline-morph-body-grid.png';
const theme = args.theme === 'dark' ? 'dark' : 'light';

const columns = [
  { sex: 'female', age: 6, label: 'F - 6y' },
  { sex: 'female', age: 15, label: 'F - 15y' },
  { sex: 'female', age: 35, label: 'F - 35y' },
  { sex: 'female', age: 75, label: 'F - 75y' },
  { sex: 'male', age: 6, label: 'M - 6y' },
  { sex: 'male', age: 15, label: 'M - 15y' },
  { sex: 'male', age: 35, label: 'M - 35y' },
  { sex: 'male', age: 75, label: 'M - 75y' },
];
const rows = [
  { bodyMassIndex: 18, label: '18' },
  { bodyMassIndex: 24, label: '24' },
  { bodyMassIndex: 31, label: '31' },
  { bodyMassIndex: 39, label: '39' },
];

const cellW = 200, cellH = 240, labelH = 24;
const gridW = columns.length * cellW;
const gridH = rows.length * cellH + labelH * (rows.length + 1) + 16;
const cells = [];

for (let c = 0; c < columns.length; c++) {
  cells.push(`<div class="hdr" style="left:${c * cellW}px;top:0;width:${cellW}px;height:${labelH}px">${columns[c].label}</div>`);
}

for (let row = 0; row < rows.length; row++) {
  const yLabel = labelH + row * (cellH + labelH);
  const yCell = yLabel + labelH;
  cells.push(`<div class="hdr row" style="left:0;top:${yLabel}px;width:${gridW}px;height:${labelH}px">body mass index ${rows[row].label}</div>`);
  for (let col = 0; col < columns.length; col++) {
    const params = { sex: columns[col].sex, age: columns[col].age, bodyMassIndex: rows[row].bodyMassIndex };
    const svg = buildBodySvg(params, { theme, background: false });
    cells.push(`<div class="cell" style="left:${col * cellW}px;top:${yCell}px;width:${cellW}px;height:${cellH}px">${svg}</div>`);
  }
}

const bg = theme === 'dark' ? '#15161a' : '#f7f6f2';
const fg = theme === 'dark' ? '#cccccc' : '#333333';
const sep = theme === 'dark' ? '#333' : '#ddd';
const band = theme === 'dark' ? '#1e2026' : '#f0ece2';
const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:${bg};color:${fg};font:12px -apple-system,Helvetica,Arial,sans-serif}
  .grid{position:relative;width:${gridW}px;height:${gridH}px}
  .cell{position:absolute;border:1px solid ${sep};box-sizing:border-box;display:flex;align-items:center;justify-content:center}
  .cell svg{width:100%;height:100%;display:block}
  .hdr{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:600;border-bottom:1px solid ${sep}}
  .hdr.row{justify-content:flex-start;padding-left:8px;background:${band}}
</style></head><body><div class="grid">${cells.join('\n')}</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'outline-morph-body-grid-'));
const htmlPath = join(dir, 'grid.html');
writeFileSync(htmlPath, html);
execSync(`google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars --screenshot=${out} --window-size=${gridW},${gridH} file://${htmlPath}`, { stdio: 'inherit' });
rmSync(dir, { recursive: true, force: true });
console.log(`grid: ${gridW}x${gridH} -> ${out}`);
