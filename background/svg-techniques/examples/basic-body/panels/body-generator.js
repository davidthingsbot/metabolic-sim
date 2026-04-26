// body-generator.js — multi-path parametric body silhouette.
//
// Three closed Bezier paths emit the figure:
//   body  — head, neck, shoulders, torso, legs, crotch (no arms)
//   armR  — right arm: shoulder → outer side → wrist → inner side → armpit
//   armL  — mirror of armR
//
// The body's "shoulder peak → armpit" segment is a straight diagonal that
// each arm path also closes against, so the shared edge renders cleanly as a
// single line. Arms angle outward by `armOutward` units, creating a visible
// gap between the inner arm and the side of the torso.
//
// Reference targets in ./reference/. Iterate freely; the browser panel and
// the standalone CLI both consume `buildBodySvg`.
//
// Parameter mapping:
//   sex      ('male'|'female')   — shoulder/hip ratio (post-puberty only)
//   age      (years, 1-90)       — head:body ratio + stoop above 70
//   bodyFat  (% of mass, 5-50)   — trunk-heavy fat distribution + belly bulge

const r = (n) => Number(n.toFixed(3));

const LIGHT_THEME = { bg: '#f7f6f2', outline: '#808080' };
const DARK_THEME  = { bg: '#15161a', outline: '#808080' };
const CSSVARS_SENTINEL = 'cssvars';

export const themes = { light: LIGHT_THEME, dark: DARK_THEME };

function colourFor(theme, slot) {
  if (theme === CSSVARS_SENTINEL) return `var(--${slot})`;
  return theme[slot];
}

function landmarks({ sex, age, bodyFat }) {
  const headRatio = age < 18 ? 0.20 - (age / 18) * 0.05 : 0.15;
  const totalH    = 220;
  const top       = 10;
  const headH     = totalH * headRatio;
  const headW     = headH * 0.78;
  const bodyTop   = top + headH;
  const bodyH     = totalH - headH;

  const fatExcess   = Math.max(0, bodyFat - 12) / 38;
  const fatThin     = Math.max(0, 12 - bodyFat) / 7;
  const trunkFatMul = 1.0 + fatExcess * 0.65 - fatThin * 0.10;
  const thighFatMul = 1.0 + fatExcess * 0.42 - fatThin * 0.08;
  const limbFatMul  = 1.0 + fatExcess * 0.20 - fatThin * 0.08;
  const faceFatMul  = 1.0 + fatExcess * 0.28 - fatThin * 0.05;
  const bellyBulge  = fatExcess * 14;

  const isMale  = sex === 'male';
  const puberty = Math.min(Math.max((age - 12) / 2, 0), 1);
  const shoulderMul = isMale ? 1.00 : (1.00 - 0.14 * puberty);
  const hipMul      = isMale ? 0.86 : (0.86 + 0.14 * puberty);
  const waistMul    = isMale ? 1.00 : (1.00 - 0.15 * puberty);

  const stoop = age > 70 ? Math.min((age - 70) / 25, 1) * 0.06 : 0;

  // Vertical landmarks.
  const neckBaseY = bodyTop + 4;
  const shoulderY = bodyTop + 8;
  const armpitY   = bodyTop + 14;                  // a touch deeper than shoulder line
  const waistY    = bodyTop + bodyH * 0.28;
  const bellyY    = bodyTop + bodyH * 0.40;
  const hipY      = bodyTop + bodyH * 0.45;
  const elbowY    = shoulderY + bodyH * 0.27;
  const wristY    = shoulderY + bodyH * 0.50;
  const calfY     = bodyTop + bodyH * 0.83;
  const kneeY     = bodyTop + bodyH * 0.72;
  const ankleY    = bodyTop + bodyH * 0.97;
  const footY     = bodyTop + bodyH;

  // Horizontal landmarks (half-widths from centerline).
  const neckHalfW       = 7 * faceFatMul;
  const shoulderHalfW   = 32 * shoulderMul * limbFatMul;
  const armpitHalfW     = 27 * shoulderMul * limbFatMul;

  const waistHalfWRaw   = 19 * waistMul * trunkFatMul;
  const waistFill       = fatExcess * 0.65;
  const waistHalfW      = waistHalfWRaw * (1 - waistFill) + armpitHalfW * 0.98 * waistFill;
  const bellyHalfW      = waistHalfW + bellyBulge;
  const hipHalfW        = 26 * hipMul * trunkFatMul;

  const kneeInnerHalfW  = 4 + fatExcess * 2;
  const kneeOuterHalfW  = kneeInnerHalfW + 12 * thighFatMul;
  const calfOuterHalfW  = kneeInnerHalfW + 11 * thighFatMul;
  const thighY_rel      = 0.55;
  const thighOuterHalfW = Math.min(
    hipHalfW * 0.95,
    kneeOuterHalfW + 4 + fatExcess * 9,
  );
  const ankleInnerHalfW = 3;
  const ankleOuterHalfW = ankleInnerHalfW + 8 * limbFatMul;
  const footInnerHalfW  = 3;
  const footTipHalfW    = ankleOuterHalfW + 8 * limbFatMul;

  // Arms — angled outward so the wrist sits a few units further out than the
  // shoulder peak, leaving a visible armpit gap between inner arm and torso.
  const armOutward      = 3.5 * limbFatMul;
  // Arm's visible top sits just above the armpit. Setting it close to
  // armpitY keeps the deltoid as a side bulge rather than an upward hook.
  const armTopY         = armpitY - 4;
  const armWristW       = 6 * limbFatMul;
  const armElbowW       = 7.5 * limbFatMul;
  const armOuterShoulderX = shoulderHalfW;
  const armDeltoidX     = shoulderHalfW + 1;
  const armOuterWristX  = shoulderHalfW + armOutward;
  const armInnerWristX  = armOuterWristX - armWristW;
  // Smooth taper: outer and inner elbows sit at the midpoint between the
  // shoulder/armpit anchors and the wrist. No visible elbow joint indent.
  const armOuterElbowX  = (armOuterShoulderX + armOuterWristX) / 2;
  const armInnerElbowX  = (armpitHalfW + armInnerWristX) / 2;

  const thighY = hipY + (kneeY - hipY) * thighY_rel;

  return {
    top, headH, headW,
    neckBaseY, neckHalfW,
    shoulderY, shoulderHalfW,
    armpitY, armpitHalfW,
    elbowY, wristY,
    armDeltoidX, armOuterShoulderX, armTopY,
    armOuterElbowX, armOuterWristX,
    armInnerElbowX, armInnerWristX,
    waistY, waistHalfW,
    bellyY, bellyHalfW,
    hipY, hipHalfW,
    thighY, thighOuterHalfW,
    kneeY, kneeOuterHalfW, kneeInnerHalfW,
    calfY, calfOuterHalfW,
    ankleY, ankleOuterHalfW, ankleInnerHalfW,
    footY, footTipHalfW, footInnerHalfW,
    crotchY: hipY,
    stoop,
  };
}

function C(c1x, c1y, c2x, c2y, x, y) {
  return `C ${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(x)} ${r(y)}`;
}
function L(x, y) { return `L ${r(x)} ${r(y)}`; }
function M(x, y) { return `M ${r(x)} ${r(y)}`; }

// ===== Body silhouette (no arms) ============================================

function buildBodyPath(p) {
  const cmds = [];
  cmds.push(M(0, p.top));

  // Head right side: top → temple → jaw → side of neck.
  cmds.push(C(
    p.headW * 0.55, p.top,
    p.headW / 2,    p.top + p.headH * 0.20,
    p.headW / 2,    p.top + p.headH * 0.5,
  ));
  cmds.push(C(
    p.headW * 0.42,  p.top + p.headH * 0.78,
    p.neckHalfW + 1, p.top + p.headH * 0.95,
    p.neckHalfW,     p.neckBaseY,
  ));
  // Neck smoothly slopes down and out to the armpit — no shoulder peak in
  // the body silhouette. The deltoid lives entirely on the arm path, so the
  // body shoulder reads as a clean trapezius slope.
  cmds.push(C(
    p.neckHalfW + 1.5,    p.neckBaseY + 2,
    p.armpitHalfW * 0.7,  p.shoulderY + 4,
    p.armpitHalfW,        p.armpitY,
  ));
  // Armpit down side of torso to waist.
  cmds.push(C(
    p.armpitHalfW - 3, p.armpitY + 16,
    p.waistHalfW + 3,  p.waistY - 16,
    p.waistHalfW,      p.waistY,
  ));
  // Waist around belly bulge to hip.
  cmds.push(C(
    p.bellyHalfW, p.waistY + 6,
    p.bellyHalfW, p.bellyY + 2,
    p.hipHalfW,   p.hipY,
  ));
  // Hip → mid-thigh → knee outer.
  cmds.push(C(
    p.hipHalfW,            p.hipY + 8,
    p.thighOuterHalfW + 1, p.thighY - 6,
    p.thighOuterHalfW,     p.thighY,
  ));
  cmds.push(C(
    p.thighOuterHalfW,     p.thighY + 12,
    p.kneeOuterHalfW + 2,  p.kneeY - 12,
    p.kneeOuterHalfW,      p.kneeY,
  ));
  // Knee → calf bulge → ankle.
  cmds.push(C(
    p.kneeOuterHalfW,     p.kneeY + 8,
    p.calfOuterHalfW + 2, p.calfY,
    p.calfOuterHalfW,     p.calfY + 4,
  ));
  cmds.push(C(
    p.calfOuterHalfW,      p.calfY + 12,
    p.ankleOuterHalfW + 1, p.ankleY - 6,
    p.ankleOuterHalfW,     p.ankleY,
  ));
  // Ankle to foot tip.
  cmds.push(C(
    p.ankleOuterHalfW, p.ankleY + 3,
    p.footTipHalfW,    p.footY - 2,
    p.footTipHalfW,    p.footY,
  ));
  cmds.push(L(p.footInnerHalfW, p.footY));
  // Inner foot → inner knee → crotch (V-notch).
  cmds.push(C(
    p.footInnerHalfW,     p.footY - 12,
    p.kneeInnerHalfW + 1, p.kneeY + 16,
    p.kneeInnerHalfW,     p.kneeY,
  ));
  cmds.push(C(
    p.kneeInnerHalfW, p.kneeY - 25,
    1.5,              p.crotchY - 0.5,
    0,                p.crotchY,
  ));

  // ===== Mirror back up the left side. =====
  cmds.push(C(
    -1.5,              p.crotchY - 0.5,
    -p.kneeInnerHalfW, p.kneeY - 25,
    -p.kneeInnerHalfW, p.kneeY,
  ));
  cmds.push(C(
    -p.kneeInnerHalfW - 1, p.kneeY + 16,
    -p.footInnerHalfW,     p.footY - 12,
    -p.footInnerHalfW,     p.footY,
  ));
  cmds.push(L(-p.footTipHalfW, p.footY));
  cmds.push(C(
    -p.footTipHalfW,     p.footY - 2,
    -p.ankleOuterHalfW,  p.ankleY + 3,
    -p.ankleOuterHalfW,  p.ankleY,
  ));
  cmds.push(C(
    -p.ankleOuterHalfW - 1, p.ankleY - 6,
    -p.calfOuterHalfW,      p.calfY + 12,
    -p.calfOuterHalfW,      p.calfY + 4,
  ));
  cmds.push(C(
    -p.calfOuterHalfW - 2, p.calfY,
    -p.kneeOuterHalfW,     p.kneeY + 8,
    -p.kneeOuterHalfW,     p.kneeY,
  ));
  cmds.push(C(
    -p.kneeOuterHalfW - 2, p.kneeY - 12,
    -p.thighOuterHalfW,    p.thighY + 12,
    -p.thighOuterHalfW,    p.thighY,
  ));
  cmds.push(C(
    -p.thighOuterHalfW - 1, p.thighY - 6,
    -p.hipHalfW,            p.hipY + 8,
    -p.hipHalfW,            p.hipY,
  ));
  // Hip up around belly to waist (left).
  cmds.push(C(
    -p.bellyHalfW,    p.bellyY + 2,
    -p.bellyHalfW,    p.waistY + 6,
    -p.waistHalfW,    p.waistY,
  ));
  // Waist up to left armpit.
  cmds.push(C(
    -p.waistHalfW - 3,  p.waistY - 16,
    -p.armpitHalfW + 3, p.armpitY + 16,
    -p.armpitHalfW,     p.armpitY,
  ));
  // Left armpit up to the side of the neck (single smooth slope, mirrors
  // the right side).
  cmds.push(C(
    -p.armpitHalfW * 0.7,  p.shoulderY + 4,
    -p.neckHalfW - 1.5,    p.neckBaseY + 2,
    -p.neckHalfW,          p.neckBaseY,
  ));
  // Left neck up the jaw to the temple.
  cmds.push(C(
    -p.neckHalfW - 1, p.top + p.headH * 0.95,
    -p.headW * 0.42,  p.top + p.headH * 0.78,
    -p.headW / 2,     p.top + p.headH * 0.5,
  ));
  // Left temple over the top of the head, back to start.
  cmds.push(C(
    -p.headW / 2,    p.top + p.headH * 0.20,
    -p.headW * 0.55, p.top,
    0,               p.top,
  ));

  cmds.push('Z');
  return cmds.join(' ');
}

// ===== Arm path (one side) =================================================

function buildArmPath(p, side) {
  const s  = side;
  const sx = (x) => s * x;
  const cmds = [];

  // Start at the deltoid peak (just above armpit, side of shoulder).
  cmds.push(M(sx(p.armOuterShoulderX), p.armTopY));
  // Outer side: deltoid down to outer elbow (smooth taper, no upward bulge).
  cmds.push(C(
    sx(p.armOuterShoulderX + 1), p.armTopY + 8,
    sx(p.armOuterElbowX + 1),    p.elbowY - 14,
    sx(p.armOuterElbowX),        p.elbowY,
  ));
  // Outer elbow → outer wrist.
  cmds.push(C(
    sx(p.armOuterElbowX),     p.elbowY + 16,
    sx(p.armOuterWristX + 1), p.wristY - 14,
    sx(p.armOuterWristX),     p.wristY,
  ));
  // Wrist round-off (outer to inner) — small rounded fingertip.
  cmds.push(C(
    sx(p.armOuterWristX),     p.wristY + 4,
    sx(p.armInnerWristX),     p.wristY + 4,
    sx(p.armInnerWristX),     p.wristY,
  ));
  // Inner wrist → inner elbow.
  cmds.push(C(
    sx(p.armInnerWristX - 1), p.wristY - 14,
    sx(p.armInnerElbowX + 1), p.elbowY + 16,
    sx(p.armInnerElbowX),     p.elbowY,
  ));
  // Inner elbow → armpit attachment.
  cmds.push(C(
    sx(p.armInnerElbowX - 1), p.elbowY - 18,
    sx(p.armpitHalfW + 1),    p.armpitY + 8,
    sx(p.armpitHalfW),        p.armpitY,
  ));
  // Short deltoid bottom curve: from armpit out to the deltoid peak. The
  // arm's outline transitions smoothly from the armpit (on the body's
  // shoulder slope) to the side-of-shoulder deltoid bulge.
  cmds.push(C(
    sx(p.armpitHalfW + 2),    p.armpitY - 1,
    sx(p.armOuterShoulderX),  p.armTopY + 2,
    sx(p.armOuterShoulderX),  p.armTopY,
  ));
  cmds.push('Z');

  return cmds.join(' ');
}

/**
 * Build the SVG document.
 */
export function buildBodySvg(params = {}, opts = {}) {
  const merged = { sex: 'male', age: 30, bodyFat: 22, ...params };

  let theme = opts.theme ?? LIGHT_THEME;
  if (theme === 'light') theme = LIGHT_THEME;
  else if (theme === 'dark') theme = DARK_THEME;

  const includeBg = opts.background !== false && theme !== CSSVARS_SENTINEL;
  const outline = colourFor(theme, 'outline');
  const bg      = colourFor(theme, 'bg');

  const p = landmarks(merged);
  const bodyD = buildBodyPath(p);
  const armRD = buildArmPath(p, 1);
  const armLD = buildArmPath(p, -1);

  const transform = p.stoop === 0
    ? `translate(100 0)`
    : `translate(100 0) skewX(${r(-p.stoop * 8)})`;

  const strokeAttrs = `fill="none" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;
  const inner = `<g transform="${transform}">` +
    `<path d="${bodyD}" ${strokeAttrs}/>` +
    `<path d="${armRD}" ${strokeAttrs}/>` +
    `<path d="${armLD}" ${strokeAttrs}/>` +
  `</g>`;

  const bgRect = includeBg ? `<rect x="0" y="0" width="200" height="240" fill="${bg}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">${bgRect}${inner}</svg>`;
}

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
