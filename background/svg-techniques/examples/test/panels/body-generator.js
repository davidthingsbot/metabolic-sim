// body-generator.js — pure, environment-agnostic SVG generator for the
// parametric whole-body figure. No DOM, no framework imports — runs in the
// browser AND in Node.
//
// This is the canonical generator. The browser panel (`body.js`) is a thin
// adapter that calls into here. The standalone Node CLI (`generate-body.js`)
// also calls into here. When iterating on the figure, edit *this* file.
//
// Parameter mapping:
//   sex      ('male'|'female')   — shoulder/hip width ratio
//   age      (years, 1-90)       — head:body ratio + slight stoop above 70
//   bodyFat  (% of mass, 5-50)   — torso and limb thickness multiplier
//
// Output is a complete SVG document string, ready to write to a file or hand
// to a parser. Deliberately rough geometry — the shapes are placeholders.
// Iterate freely.

const LIGHT_THEME = {
  bg:           '#f7f6f2',
  skin:         '#f0d2bf',
  'skin-edge':  '#b88a72',
};

const DARK_THEME = {
  bg:           '#15161a',
  skin:         '#d8a98f',
  'skin-edge':  '#6e4a3a',
};

// Sentinel theme that emits CSS custom properties (`var(--skin)`) instead of
// concrete colours. The browser panel uses this so the figure flips with the
// page-level theme toggle. Don't use it for standalone exports.
const CSSVARS_SENTINEL = 'cssvars';

export const themes = { light: LIGHT_THEME, dark: DARK_THEME };

function colourFor(theme, slot) {
  if (theme === CSSVARS_SENTINEL) return `var(--${slot})`;
  return theme[slot];
}

const r = (n) => Number(n.toFixed(3));

function bodyShapes({ sex, age, bodyFat }) {
  const headRatio = age < 18 ? 0.20 - (age / 18) * 0.07 : 0.13;
  const totalH    = 220;
  const headH     = totalH * headRatio;
  const stoop     = age > 70 ? Math.min((age - 70) / 25, 1) * 0.12 : 0;
  const shoulderW = sex === 'male' ? 1.00 : 0.85;
  const hipW      = sex === 'male' ? 0.85 : 1.00;
  const fatMul    = 0.85 + (bodyFat - 5) / 45 * 0.7;

  const cx = 100, top = 10;
  const torsoTop = headH + 4;
  const torsoH   = totalH * 0.42;
  const sw       = 36 * shoulderW * fatMul;
  const hw       = 36 * hipW * fatMul;
  const armW     = 7 * fatMul;
  const armLen   = totalH * 0.42;
  const legW     = 11 * fatMul;
  const legLen   = totalH * 0.45;
  const hipY     = torsoTop + torsoH;

  const shapes = [];

  // Head.
  shapes.push({
    tag: 'ellipse',
    attrs: { cx: 0, cy: r(headH / 2), rx: r(headH * 0.42), ry: r(headH / 2) },
  });

  // Torso (trapezoid via path).
  shapes.push({
    tag: 'path',
    attrs: {
      d: `M ${r(-sw)} ${r(torsoTop)} L ${r(sw)} ${r(torsoTop)} L ${r(hw)} ${r(torsoTop + torsoH)} L ${r(-hw)} ${r(torsoTop + torsoH)} Z`,
    },
  });

  // Arms.
  for (const side of [-1, 1]) {
    shapes.push({
      tag: 'rect',
      attrs: {
        x: r(side * sw - (side > 0 ? 0 : armW)),
        y: r(torsoTop + 2),
        width: r(armW),
        height: r(armLen),
        rx: r(armW / 2),
      },
    });
  }

  // Legs.
  for (const side of [-1, 1]) {
    shapes.push({
      tag: 'rect',
      attrs: {
        x: r(side * (hw - legW - 2) - (side > 0 ? 0 : legW)),
        y: r(hipY),
        width: r(legW),
        height: r(legLen),
        rx: r(legW / 2),
      },
    });
  }

  return {
    shapes,
    transform: stoop === 0
      ? `translate(${cx} ${top})`
      : `translate(${cx} ${top}) skewX(${r(-stoop * 8)})`,
  };
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

/**
 * Build a complete SVG document for the parametric body.
 *
 * @param {object} params         { sex, age, bodyFat }
 * @param {object} [opts]
 * @param {object|string} [opts.theme]  Theme dict, the string 'dark' / 'light',
 *                                      or 'cssvars' to emit `var(--slot)` refs.
 *                                      Default: light theme.
 * @param {boolean} [opts.background]   Include a backing `<rect>` filled with
 *                                      the theme's bg colour. Default true,
 *                                      but skipped automatically when theme is
 *                                      'cssvars' (the host page paints bg).
 * @returns {string} Self-contained SVG document.
 */
export function buildBodySvg(params = {}, opts = {}) {
  const merged = { sex: 'male', age: 30, bodyFat: 22, ...params };

  let theme = opts.theme ?? LIGHT_THEME;
  if (theme === 'light') theme = LIGHT_THEME;
  else if (theme === 'dark') theme = DARK_THEME;
  // 'cssvars' string and concrete dicts pass through.

  const includeBg = opts.background !== false && theme !== CSSVARS_SENTINEL;
  const skin     = colourFor(theme, 'skin');
  const skinEdge = colourFor(theme, 'skin-edge');
  const bg       = colourFor(theme, 'bg');

  const { shapes, transform } = bodyShapes(merged);

  const inner = shapes
    .map(s => `<${s.tag} ${attrsToString(s.attrs)} fill="${skin}" stroke="${skinEdge}" stroke-width="1"/>`)
    .join('');

  const bgRect = includeBg ? `<rect x="0" y="0" width="200" height="240" fill="${bg}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">${bgRect}<g transform="${transform}">${inner}</g></svg>`;
}

// Parameter metadata, exposed for tooling (CLI help, automated sweeps).
export const bodyParams = [
  {
    key: 'sex', label: 'Sex', type: 'choice', default: 'male',
    choices: [
      { value: 'male',   label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  { key: 'age',     label: 'Age',                type: 'range', min: 1, max: 90, step: 1, default: 30, unit: 'years' },
  { key: 'bodyFat', label: 'Body fat fraction',  type: 'range', min: 5, max: 50, step: 1, default: 22, unit: '%'     },
];
