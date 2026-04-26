#!/usr/bin/env node
// render-grid.js — generate a grid of body SVGs across the parameter space
// and rasterize the whole grid to a single PNG via headless Chrome.
//
// Usage:
//   node render-grid.js                           # writes /tmp/body-grid.png
//   node render-grid.js --out /tmp/x.png
//   node render-grid.js --theme dark
//
// The grid lays out one column per (sex, age) combo and one row per body-fat
// bucket. The point is for the human (and the LLM driving the loop) to see
// the full deformation envelope at once and judge what's broken.

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
    if (next === undefined || next.startsWith('--')) { args[key] = true; }
    else { args[key] = next; i++; }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const out  = (typeof args.out === 'string') ? args.out : '/tmp/grid.png';
const theme = args.theme === 'dark' ? 'dark' : 'light';

// Each cell is one parameter combination. Columns and rows are deliberate.
const columns = [
  { sex: 'female', age: 8,  label: 'F · 8y'  },
  { sex: 'female', age: 18, label: 'F · 18y' },
  { sex: 'female', age: 35, label: 'F · 35y' },
  { sex: 'female', age: 75, label: 'F · 75y' },
  { sex: 'male',   age: 8,  label: 'M · 8y'  },
  { sex: 'male',   age: 18, label: 'M · 18y' },
  { sex: 'male',   age: 35, label: 'M · 35y' },
  { sex: 'male',   age: 75, label: 'M · 75y' },
];
const rows = [
  { bodyFat: 12, label: '12 %' },
  { bodyFat: 22, label: '22 %' },
  { bodyFat: 35, label: '35 %' },
  { bodyFat: 45, label: '45 %' },
];

const cellW = 200, cellH = 240, labelH = 24;
const gridW = columns.length * cellW;
const gridH = rows.length * cellH + labelH * (rows.length + 1);

const cells = [];
// Top column-labels.
for (let c = 0; c < columns.length; c++) {
  const x = c * cellW;
  cells.push(`<div class="hdr" style="left:${x}px;top:0px;width:${cellW}px;height:${labelH}px">${columns[c].label}</div>`);
}
for (let r = 0; r < rows.length; r++) {
  const yLabel = labelH + r * (cellH + labelH);
  const yCell  = yLabel + labelH;
  cells.push(`<div class="hdr row" style="left:0px;top:${yLabel}px;width:${gridW}px;height:${labelH}px">body-fat ${rows[r].label}</div>`);
  for (let c = 0; c < columns.length; c++) {
    const params = { sex: columns[c].sex, age: columns[c].age, bodyFat: rows[r].bodyFat };
    const svg = buildBodySvg(params, { theme, background: false });
    const x = c * cellW;
    cells.push(`<div class="cell" style="left:${x}px;top:${yCell}px;width:${cellW}px;height:${cellH}px">${svg}</div>`);
  }
}

const bg = theme === 'dark' ? '#15161a' : '#f7f6f2';
const fg = theme === 'dark' ? '#cccccc' : '#333333';
const sep = theme === 'dark' ? '#333' : '#ddd';

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:${bg};color:${fg};font:12px -apple-system,Helvetica,Arial,sans-serif}
  .grid{position:relative;width:${gridW}px;height:${gridH}px}
  .cell{position:absolute;border:1px solid ${sep};box-sizing:border-box;display:flex;align-items:center;justify-content:center}
  .cell svg{width:100%;height:100%;display:block}
  .hdr{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:600;border-bottom:1px solid ${sep}}
  .hdr.row{justify-content:flex-start;padding-left:8px;background:${theme === 'dark' ? '#1e2026' : '#f0ece2'}}
</style></head><body><div class="grid">${cells.join('\n')}</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'body-grid-'));
const htmlPath = join(dir, 'grid.html');
writeFileSync(htmlPath, html);

const cmd = `google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars --screenshot=${out} --window-size=${gridW},${gridH} file://${htmlPath}`;
execSync(cmd, { stdio: 'inherit' });
rmSync(dir, { recursive: true, force: true });
console.log(`grid: ${gridW}×${gridH} → ${out}`);
