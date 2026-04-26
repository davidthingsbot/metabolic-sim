#!/usr/bin/env node
// generate-body.js — standalone CLI that emits a parametric body SVG.
//
// Use this for tight-loop experiments where the SVG is generated, evaluated
// (rasterized + critiqued, diffed against a reference, etc.), and the
// generator code is then improved.
//
// Usage:
//   node lib/generate-body.js [options]
//   node lib/generate-body.js --sex F --age 35 --bodyFat 28
//   node lib/generate-body.js --sex M --age 70 --bodyFat 18 --theme dark --out /tmp/body.svg
//
// Options:
//   --sex M|F|male|female      (default male)
//   --age <years>              (default 30)
//   --bodyFat <percent>        (default 22)
//   --theme light|dark         (default light)
//   --no-background            omit the backing rect
//   --out <file>               write to file (default stdout)
//   --help                     show this help

import { writeFileSync } from 'node:fs';
import { buildBodySvg, bodyParams } from './panels/body-generator.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function help() {
  const lines = [
    'Usage: node generate-body.js [options]',
    '',
    'Options:',
    '  --sex M|F|male|female      (default male)',
    '  --age <years>              (default 30)',
    '  --bodyFat <percent>        (default 22)',
    '  --theme light|dark         (default light)',
    '  --no-background            omit backing rect',
    '  --out <file>               write to file (default stdout)',
    '  --help                     show this help',
    '',
    'Parameters (canonical, from body-generator.js):',
  ];
  for (const p of bodyParams) {
    if (p.type === 'choice') {
      lines.push(`  ${p.key}: ${p.choices.map(c => c.value).join('|')} (default ${p.default})`);
    } else {
      lines.push(`  ${p.key}: ${p.min}..${p.max} ${p.unit ?? ''} (default ${p.default})`);
    }
  }
  return lines.join('\n') + '\n';
}

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  process.stdout.write(help());
  process.exit(0);
}

const sexRaw = String(args.sex ?? 'male').toLowerCase();
const sex = (sexRaw === 'f' || sexRaw === 'female') ? 'female' : 'male';
const params = {
  sex,
  age:     Number(args.age     ?? 30),
  bodyFat: Number(args.bodyFat ?? 22),
};
const theme = args.theme === 'dark' ? 'dark' : 'light';
const background = !(args['no-background'] === true);

const svg = buildBodySvg(params, { theme, background });

if (args.out && typeof args.out === 'string') {
  writeFileSync(args.out, svg);
} else {
  process.stdout.write(svg);
  if (process.stdout.isTTY) process.stdout.write('\n');
}
