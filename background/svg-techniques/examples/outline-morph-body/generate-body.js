#!/usr/bin/env node
// generate-body.js -- standalone CLI for the outline-morph-body experiment.

import { writeFileSync } from 'node:fs';
import { buildBodySvg, bodyParams } from './panels/body-generator.js';

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

function help() {
  const lines = [
    'Usage: node generate-body.js [options]',
    '',
    'Options:',
    '  --sex M|F|male|female          (default male)',
    '  --age <years>                  (default 35)',
    '  --bodyMassIndex <kg/m2>        (default 24)',
    '  --guideOverlay off|skeleton|points|both',
    '  --theme light|dark             (default light)',
    '  --no-background                omit backing rect',
    '  --out <file>                   write to file (default stdout)',
    '  --help                         show this help',
    '',
    'Parameters:',
  ];
  for (const p of bodyParams) {
    if (p.type === 'choice') lines.push(`  ${p.key}: ${p.choices.map(c => c.value).join('|')} (default ${p.default})`);
    else lines.push(`  ${p.key}: ${p.min}..${p.max} ${p.unit ?? ''} (default ${p.default})`);
  }
  return `${lines.join('\n')}\n`;
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
  age: Number(args.age ?? 35),
  bodyMassIndex: Number(args.bodyMassIndex ?? args.bmi ?? 24),
  guideOverlay: String(args.guideOverlay ?? 'off'),
};
const theme = args.theme === 'dark' ? 'dark' : 'light';
const background = !(args['no-background'] === true);
const svg = buildBodySvg(params, { theme, background });

if (args.out && typeof args.out === 'string') writeFileSync(args.out, svg);
else {
  process.stdout.write(svg);
  if (process.stdout.isTTY) process.stdout.write('\n');
}
