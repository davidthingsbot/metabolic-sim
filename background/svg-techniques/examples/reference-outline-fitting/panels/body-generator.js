// body-generator.js -- single-outline parametric body silhouette.
//
// This experiment treats the visible body as one continuous closed contour.
// Parameters move named landmarks; a Catmull-Rom pass converts those landmarks
// into cubic Bezier segments. Interior cues are separate optional strokes.

const r = (n) => Number(n.toFixed(3));

const LIGHT_THEME = {
  bg: '#f7f6f2',
  outline: '#777a7a',
  detail: '#777a7a',
  skeleton: '#2b7de9',
  control: '#c43a31',
};
const DARK_THEME = {
  bg: '#15161a',
  outline: '#a7aaaa',
  detail: '#a7aaaa',
  skeleton: '#6da6ff',
  control: '#ff786b',
};
const CSSVARS_SENTINEL = 'cssvars';

export const themes = { light: LIGHT_THEME, dark: DARK_THEME };

export const defaultShapeCoefficients = {
  shoulderScale: 1,
  chestScale: 1,
  waistScale: 1,
  bellyScale: 1,
  hipScale: 1,
  hipRoundness: 0,
  thighScale: 1,
  lowerLegScale: 1,
  armScale: 1,
  crotchLift: 0,
};

function colourFor(theme, slot) {
  if (theme === CSSVARS_SENTINEL) return `var(--${slot})`;
  return theme[slot];
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function sexBlend(sex) {
  return sex === 'female' ? 1 : 0;
}

function bodyMassBlend(bodyMassIndex) {
  return clamp((bodyMassIndex - 18) / 22, 0, 1);
}

function leanBlend(bodyMassIndex) {
  return clamp((20 - bodyMassIndex) / 5, 0, 1);
}

function maturation(age) {
  return smoothstep(3, 18, age);
}

function shapeCoefficientsFor(shapeCoefficients = {}) {
  return {
    shoulderScale: clamp(shapeCoefficients.shoulderScale ?? defaultShapeCoefficients.shoulderScale, 0.65, 1.45),
    chestScale: clamp(shapeCoefficients.chestScale ?? defaultShapeCoefficients.chestScale, 0.65, 1.45),
    waistScale: clamp(shapeCoefficients.waistScale ?? defaultShapeCoefficients.waistScale, 0.65, 1.55),
    bellyScale: clamp(shapeCoefficients.bellyScale ?? defaultShapeCoefficients.bellyScale, 0.65, 1.65),
    hipScale: clamp(shapeCoefficients.hipScale ?? defaultShapeCoefficients.hipScale, 0.65, 1.6),
    hipRoundness: clamp(shapeCoefficients.hipRoundness ?? defaultShapeCoefficients.hipRoundness, -1, 1),
    thighScale: clamp(shapeCoefficients.thighScale ?? defaultShapeCoefficients.thighScale, 0.65, 1.55),
    lowerLegScale: clamp(shapeCoefficients.lowerLegScale ?? defaultShapeCoefficients.lowerLegScale, 0.65, 1.55),
    armScale: clamp(shapeCoefficients.armScale ?? defaultShapeCoefficients.armScale, 0.65, 1.55),
    crotchLift: clamp(shapeCoefficients.crotchLift ?? defaultShapeCoefficients.crotchLift, -18, 18),
  };
}

function proportions({ sex, age, bodyMassIndex, shapeCoefficients }) {
  const shape = shapeCoefficientsFor(shapeCoefficients);
  const female = sexBlend(sex);
  const adult = maturation(age);
  const mass = bodyMassBlend(bodyMassIndex);
  const lean = leanBlend(bodyMassIndex);
  const elder = smoothstep(62, 86, age);
  const sexPuberty = smoothstep(14, 19, age);
  const femalePuberty = female * sexPuberty;
  const malePuberty = (1 - female) * sexPuberty;

  const height = mix(146, 208, adult) - elder * 9;
  const top = 15 + elder * 5;
  const headH = height * mix(0.235, 0.145, adult) * (1 + mass * 0.035);
  const neckY = top + headH * 0.93;
  const shoulderY = top + headH + mix(7, 12, adult);
  const armpitY = shoulderY + mix(11, 16, adult);
  const elbowY = shoulderY + height * mix(0.205, 0.27, adult);
  const wristY = shoulderY + height * mix(0.345, 0.435, adult);
  const waistY = top + height * mix(0.485, 0.435, adult);
  const bellyY = top + height * mix(0.54, 0.51, adult);
  const hipY = top + height * mix(0.585, 0.565, adult);
  const crotchY = top + height * mix(0.63, 0.605, adult) - shape.crotchLift;
  const kneeY = top + height * mix(0.805, 0.785, adult);
  const calfY = top + height * mix(0.905, 0.89, adult);
  const ankleY = top + height * 0.965;
  const footY = top + height;

  const childWide = 1 - adult;
  const shoulderJointHalf = (
    mix(20, 31.5, adult) +
    malePuberty * 3.2 -
    femalePuberty * 1.2
  );
  const hipJointHalf = (
    mix(11, 15.5, adult) +
    femalePuberty * 4.2
  );
  const shoulderHalf = (shoulderJointHalf + mass * mix(1.2, 2.4, adult) - lean * mix(0.3, 0.8, adult)) * shape.shoulderScale;
  const armpitHalf = (shoulderHalf - mix(2.5, 6, adult)) * shape.chestScale;
  const waistBase = (
    mix(17, 20, adult) +
    malePuberty * 2.2 -
    femalePuberty * 2.4 +
    mass * mix(8, 18, adult) +
    malePuberty * mass * mix(1.2, 4.2, adult) -
    lean * mix(0.5, 2.5, adult)
  ) * shape.waistScale;
  const bellyHalf = (waistBase + mass * (mix(5, 13.5, adult) + malePuberty * 4.5 - femalePuberty * 1.2)) * shape.bellyScale;
  const hipHalf = (
    hipJointHalf +
    mix(8, 9, adult) +
    mass * (mix(7, 14, adult) + femalePuberty * 4.4 - malePuberty * 1.1) -
    lean * mix(0.5, 2, adult)
  ) * shape.hipScale;
  const thighHalf = (mix(9.5, 13, adult) + mass * mix(4.5, 9.5, adult) + femalePuberty * 1.4) * shape.thighScale;
  const kneeHalf = (mix(6.8, 8.8, adult) + mass * 2.2) * shape.lowerLegScale;
  const calfHalf = (mix(7.5, 9.8, adult) + mass * 2.7) * shape.lowerLegScale;
  const ankleHalf = (mix(4.5, 5.5, adult) + mass * 0.8) * shape.lowerLegScale;
  const armHalf = (mix(4.8, 5.8, adult) + mass * mix(1.8, 2.7, adult)) * shape.armScale;
  const handHalf = (mix(3.4, 4.1, adult) + mass * 0.35) * shape.armScale;
  const headHalf = headH * mix(0.405, 0.34, adult) * (1 + mass * 0.10 + childWide * 0.06);
  const jawHalf = headHalf * mix(0.88, 0.72, adult) * (1 + mass * 0.10);
  const neckHalf = mix(5.6, 7.0, adult) + mass * 1.45 + malePuberty * 0.95 - femalePuberty * 0.55;
  const elbowJointY = elbowY;
  const wristJointY = wristY + handHalf * 0.7;
  const kneeJointY = kneeY;
  const ankleJointY = ankleY;
  const armOut = mix(4.5, 6.5, adult);
  const upperArmTilt = mix(1.5, 3.5, adult);
  const elbowJointX = shoulderJointHalf + armOut + upperArmTilt * 0.82;
  const wristJointX = shoulderJointHalf + armOut + mix(0.5, 2.2, adult);
  const legGap = mix(3.8, 5.4, adult);
  const kneeJointX = legGap + mix(4.8, 6.8, adult);
  const ankleJointX = legGap + mix(2.8, 3.5, adult);

  return {
    adult,
    female,
    femalePuberty,
    malePuberty,
    mass,
    elder,
    height,
    top,
    headH,
    neckY,
    shoulderY,
    armpitY,
    elbowY,
    wristY,
    waistY,
    bellyY,
    hipY,
    crotchY,
    kneeY,
    calfY,
    ankleY,
    footY,
    headHalf,
    jawHalf,
    neckHalf,
    shoulderJointHalf,
    hipJointHalf,
    elbowJointX,
    elbowJointY,
    wristJointX,
    wristJointY,
    kneeJointX,
    kneeJointY,
    ankleJointX,
    ankleJointY,
    shoulderHalf,
    armpitHalf,
    waistHalf: waistBase,
    bellyHalf,
    hipHalf,
    thighHalf,
    kneeHalf,
    calfHalf,
    ankleHalf,
    armHalf,
    handHalf,
    shape,
  };
}

function pt(x, y) {
  return { x, y };
}

function rightLandmarks(p) {
  const shoulderDrop = p.adult * 2.2 + p.elder * 3;
  const upperArmSoft = (p.armHalf * 0.25 + p.mass * 1.2);
  const lowerArmSoft = p.armHalf * 0.9 + p.mass * 0.7;
  const outerElbowX = p.elbowJointX + upperArmSoft;
  const outerWristX = p.wristJointX + lowerArmSoft;
  const innerWristX = outerWristX - p.armHalf * 1.55;
  const innerElbowX = outerElbowX - p.armHalf * 1.75;
  const legGap = mix(3.8, 5.4, p.adult) + p.mass * 1.6;
  const footLen = mix(6.5, 11, p.adult);
  const neckBaseX = mix(p.neckHalf, p.shoulderHalf * 0.46, 0.55);
  const hipShelfX = mix(p.bellyHalf, p.hipHalf, clamp(0.37 + p.shape.hipRoundness * 0.12, 0.18, 0.62));
  const hipOuterX = p.hipHalf * clamp(0.86 + p.shape.hipRoundness * 0.06, 0.76, 0.98);
  const upperThighX = mix(hipOuterX, p.thighHalf + legGap * 0.95, clamp(0.42 + p.shape.hipRoundness * 0.08, 0.28, 0.58));

  return [
    { name: 'headTop', ...pt(0, p.top) },
    { name: 'temple', ...pt(p.headHalf * 0.9, p.top + p.headH * 0.18) },
    { name: 'cheek', ...pt(p.headHalf, p.top + p.headH * 0.46) },
    { name: 'jaw', ...pt(p.jawHalf, p.top + p.headH * 0.76) },
    { name: 'neck', ...pt(p.neckHalf, p.neckY) },
    { name: 'neckBase', ...pt(neckBaseX, p.neckY + (p.shoulderY - p.neckY) * 0.48) },
    { name: 'trap', ...pt(p.shoulderHalf * 0.62, p.shoulderY - 1) },
    { name: 'shoulder', ...pt(p.shoulderHalf, p.shoulderY + shoulderDrop) },
    { name: 'upperArm', ...pt(p.elbowJointX + upperArmSoft * 0.25, p.armpitY + (p.elbowY - p.armpitY) * 0.28) },
    { name: 'outerElbow', ...pt(outerElbowX, p.elbowY) },
    { name: 'outerWrist', ...pt(outerWristX, p.wristY) },
    { name: 'handOuter', ...pt(outerWristX + p.handHalf * 0.38, p.wristY + p.handHalf * 1.8) },
    { name: 'handInner', ...pt(innerWristX, p.wristY + p.handHalf * 2.3) },
    { name: 'innerElbow', ...pt(innerElbowX, p.elbowY + 1) },
    { name: 'armpit', ...pt(p.armpitHalf, p.armpitY) },
    { name: 'rib', ...pt(mix(p.armpitHalf, p.waistHalf, 0.78), p.armpitY + (p.waistY - p.armpitY) * 0.45) },
    { name: 'waist', ...pt(p.waistHalf, p.waistY) },
    { name: 'belly', ...pt(p.bellyHalf, p.bellyY) },
    { name: 'hipShelf', ...pt(hipShelfX, p.bellyY + (p.hipY - p.bellyY) * 0.68) },
    { name: 'hip', ...pt(hipOuterX, p.hipY + (p.kneeY - p.hipY) * 0.07) },
    { name: 'upperThigh', ...pt(upperThighX, p.hipY + (p.kneeY - p.hipY) * 0.22) },
    { name: 'outerThigh', ...pt(p.thighHalf + legGap, p.hipY + (p.kneeY - p.hipY) * 0.38) },
    { name: 'kneeOuter', ...pt(p.kneeHalf + legGap, p.kneeY) },
    { name: 'calf', ...pt(p.calfHalf + legGap * 0.8, p.calfY) },
    { name: 'ankleOuter', ...pt(p.ankleHalf + legGap * 0.45, p.ankleY) },
    { name: 'footTip', ...pt(p.ankleHalf + footLen, p.footY - 0.8) },
    { name: 'footInner', ...pt(legGap + 1.2, p.footY) },
    { name: 'ankleInner', ...pt(legGap + 0.4, p.ankleY) },
    { name: 'kneeInner', ...pt(legGap + p.kneeHalf * 0.18, p.kneeY) },
    { name: 'innerThigh', ...pt(legGap * 0.36, p.crotchY) },
    { name: 'crotch', ...pt(0, p.crotchY - mix(0, 2.8, p.adult)) },
  ];
}

function fullContour(points) {
  const left = points
    .slice(1, -1)
    .reverse()
    .map((p) => ({ name: `${p.name}L`, ...pt(-p.x, p.y) }));
  return points.concat(left);
}

function catmullClosedPath(points, tension = 0.78) {
  const n = points.length;
  const cmds = [`M ${r(points[0].x)} ${r(points[0].y)}`];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = pt(
      p1.x + ((p2.x - p0.x) / 6) * tension,
      p1.y + ((p2.y - p0.y) / 6) * tension,
    );
    const c2 = pt(
      p2.x - ((p3.x - p1.x) / 6) * tension,
      p2.y - ((p3.y - p1.y) / 6) * tension,
    );
    cmds.push(`C ${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`);
  }
  cmds.push('Z');
  return cmds.join(' ');
}

function lerpPoint(a, b, t) {
  return pt(mix(a.x, b.x, t), mix(a.y, b.y, t));
}

function splitCubic(p0, c1, c2, p3, t) {
  const a = lerpPoint(p0, c1, t);
  const b = lerpPoint(c1, c2, t);
  const c = lerpPoint(c2, p3, t);
  const d = lerpPoint(a, b, t);
  const e = lerpPoint(b, c, t);
  const f = lerpPoint(d, e, t);
  return {
    left: [p0, a, d, f],
    right: [f, e, c, p3],
  };
}

function cubicSegmentPath(p0, c1, c2, p3, t0 = 0.2, t1 = 0.8) {
  const first = splitCubic(p0, c1, c2, p3, t1).left;
  const second = splitCubic(first[0], first[1], first[2], first[3], t0 / t1).right;
  const [start, control1, control2, end] = second;
  return `M ${r(start.x)} ${r(start.y)} C ${r(control1.x)} ${r(control1.y)} ${r(control2.x)} ${r(control2.y)} ${r(end.x)} ${r(end.y)}`;
}

function lineSegmentPath(a, b, inset = 0.24) {
  const start = lerpPoint(a, b, inset);
  const end = lerpPoint(a, b, 1 - inset);
  return `M ${r(start.x)} ${r(start.y)} L ${r(end.x)} ${r(end.y)}`;
}

function catmullClosedSegments(points, tension = 0.78) {
  const n = points.length;
  const segments = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = pt(
      p1.x + ((p2.x - p0.x) / 6) * tension,
      p1.y + ((p2.y - p0.y) / 6) * tension,
    );
    const c2 = pt(
      p2.x - ((p3.x - p1.x) / 6) * tension,
      p2.y - ((p3.y - p1.y) / 6) * tension,
    );
    segments.push({
      label: `${p1.name} -> ${p2.name}`,
      d: `M ${r(p1.x)} ${r(p1.y)} C ${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`,
      hitD: cubicSegmentPath(p1, c1, c2, p2),
      mid: pt((p1.x + p2.x) / 2, (p1.y + p2.y) / 2),
    });
  }
  return segments;
}

function cubicPath(points) {
  return `M ${r(points[0].x)} ${r(points[0].y)} C ${r(points[1].x)} ${r(points[1].y)} ${r(points[2].x)} ${r(points[2].y)} ${r(points[3].x)} ${r(points[3].y)}`;
}

function namedPoint(name, x, y) {
  return { name, ...pt(x, y) };
}

function detailGeometry(p) {
  const paths = [];
  const controls = [];
  const segments = [];
  const chestY = p.armpitY + (p.waistY - p.armpitY) * 0.18;
  if (p.femalePuberty > 0.05) {
    const breastW = (mix(6.8, 13.2, p.femalePuberty) + p.mass * 1.4) * 1.25;
    const breastDrop = mix(1.7, 4.7, p.femalePuberty) + p.mass * 0.8;
    const curve = (mix(1.5, 4.8, p.femalePuberty) + p.mass * 0.35) * 1.5;
    const curve1X = breastW * (0.72 + p.mass * 0.08);
    const curve2X = breastW * (0.28 + p.mass * 0.05);
    const curve1Y = curve * (0.62 + p.mass * 0.12);
    const curve2Y = curve * (1 + p.mass * 0.18);
    const y = chestY + breastDrop;
    const left = [
      namedPoint('breastStartL', -breastW, y),
      namedPoint('breastCurve1L', -curve1X, y + curve1Y),
      namedPoint('breastCurve2L', -curve2X, y + curve2Y),
      namedPoint('breastInnerL', -1.8, y),
    ];
    const right = [
      namedPoint('breastStart', breastW, y),
      namedPoint('breastCurve1', curve1X, y + curve1Y),
      namedPoint('breastCurve2', curve2X, y + curve2Y),
      namedPoint('breastInner', 1.8, y),
    ];
    const leftPath = cubicPath(left);
    const rightPath = cubicPath(right);
    paths.push(leftPath, rightPath);
    controls.push(...left, ...right);
    segments.push(
      { label: 'breastStartL -> breastInnerL', d: leftPath, hitD: cubicSegmentPath(left[0], left[1], left[2], left[3]), mid: pt((-breastW - 1.8) / 2, y + curve2Y * 0.52) },
      { label: 'breastStart -> breastInner', d: rightPath, hitD: cubicSegmentPath(right[0], right[1], right[2], right[3]), mid: pt((breastW + 1.8) / 2, y + curve2Y * 0.52) },
    );
  } else if (p.malePuberty > 0.35) {
    const chestW = (10.5 + p.mass * 1.0) * 1.5;
    const y = chestY + 1.8 + p.mass * 0.45;
    const left = [
      namedPoint('chestStartL', -chestW, y),
      namedPoint('chestCurve1L', -chestW * 0.6, y + 1.55),
      namedPoint('chestCurve2L', -3.5, y + 1.2),
      namedPoint('chestCenterL', 0, y + 0.55),
    ];
    const right = [
      namedPoint('chestStart', chestW, y),
      namedPoint('chestCurve1', chestW * 0.6, y + 1.55),
      namedPoint('chestCurve2', 3.5, y + 1.2),
      namedPoint('chestCenter', 0, y + 0.55),
    ];
    const leftPath = cubicPath(left);
    const rightPath = cubicPath(right);
    paths.push(leftPath, rightPath);
    controls.push(...left, ...right);
    segments.push(
      { label: 'chestStartL -> chestCenterL', d: leftPath, hitD: cubicSegmentPath(left[0], left[1], left[2], left[3]), mid: pt(-chestW / 2, y + 1.05) },
      { label: 'chestStart -> chestCenter', d: rightPath, hitD: cubicSegmentPath(right[0], right[1], right[2], right[3]), mid: pt(chestW / 2, y + 1.05) },
    );
  }
  if (p.mass > 0.22) {
    const y = p.bellyY + mix(6, 12, p.mass);
    const w = p.bellyHalf * mix(0.42, 0.72, p.mass);
    const belly = [
      namedPoint('bellyFoldStartL', -w, y),
      namedPoint('bellyFoldCurveL', -w * 0.35, y + 5),
      namedPoint('bellyFoldCurve', w * 0.35, y + 5),
      namedPoint('bellyFoldStart', w, y),
    ];
    const bellyPath = cubicPath(belly);
    paths.push(bellyPath);
    controls.push(...belly);
    segments.push({ label: 'bellyFoldStartL -> bellyFoldStart', d: bellyPath, hitD: cubicSegmentPath(belly[0], belly[1], belly[2], belly[3]), mid: pt(0, y + 4.4) });
  }
  if (p.adult > 0.35) {
    const notchY = p.crotchY - 4;
    const crotch = [
      namedPoint('crotchNotchL', -5 - p.mass, notchY),
      namedPoint('crotchNotchTip', 0, p.crotchY),
      namedPoint('crotchNotch', 5 + p.mass, notchY),
    ];
    const leftPath = `M ${r(crotch[0].x)} ${r(crotch[0].y)} L ${r(crotch[1].x)} ${r(crotch[1].y)}`;
    const rightPath = `M ${r(crotch[1].x)} ${r(crotch[1].y)} L ${r(crotch[2].x)} ${r(crotch[2].y)}`;
    paths.push(`${leftPath} L ${r(crotch[2].x)} ${r(crotch[2].y)}`);
    controls.push(...crotch);
    segments.push(
      { label: 'crotchNotchL -> crotchNotchTip', d: leftPath, hitD: lineSegmentPath(crotch[0], crotch[1]), mid: pt((crotch[0].x + crotch[1].x) / 2, (crotch[0].y + crotch[1].y) / 2) },
      { label: 'crotchNotchTip -> crotchNotch', d: rightPath, hitD: lineSegmentPath(crotch[1], crotch[2]), mid: pt((crotch[1].x + crotch[2].x) / 2, (crotch[1].y + crotch[2].y) / 2) },
    );
  }
  return { paths, controls, segments };
}

function detailPaths(p) {
  return detailGeometry(p).paths;
}

function line(x1, y1, x2, y2, stroke, width = 0.9, dash = '') {
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${dashAttr}/>`;
}

function circle(x, y, radius, fill, stroke) {
  return `<circle cx="${r(x)}" cy="${r(y)}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="0.7"/>`;
}

function basePointName(name) {
  return name.endsWith('L') ? name.slice(0, -1) : name;
}

function sideSign(name, point) {
  if (name.endsWith('L')) return -1;
  if (point.x < 0) return -1;
  return 1;
}

function projectToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return a;
  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / len2, 0, 1);
  return pt(a.x + dx * t, a.y + dy * t);
}

function skeletonReferenceFor(point, p) {
  const name = basePointName(point.name);
  const side = sideSign(point.name, point);
  const shoulderY = p.shoulderY + p.adult * 2.2 + p.elder * 3;
  const headCenter = pt(0, p.top + p.headH * 0.5);
  const shoulder = pt(side * p.shoulderJointHalf, shoulderY);
  const elbow = pt(side * p.elbowJointX, p.elbowJointY);
  const wrist = pt(side * p.wristJointX, p.wristJointY);
  const hip = pt(side * p.hipJointHalf, p.hipY);
  const knee = pt(side * p.kneeJointX, p.kneeJointY);
  const ankle = pt(side * p.ankleJointX, p.ankleJointY);

  if (['headTop', 'temple', 'cheek', 'jaw'].includes(name)) return headCenter;
  if (['neck', 'neckBase'].includes(name)) return pt(0, point.y);
  if (['trap', 'shoulder'].includes(name)) return projectToSegment(point, pt(0, shoulderY), shoulder);
  if (['upperArm', 'outerElbow'].includes(name)) return projectToSegment(point, shoulder, elbow);
  if (['outerWrist', 'handOuter', 'handInner', 'innerElbow'].includes(name)) return projectToSegment(point, elbow, wrist);
  if (['armpit', 'rib', 'waist', 'belly'].includes(name)) return pt(0, point.y);
  if (name.startsWith('breast') || name.startsWith('chest')) return projectToSegment(point, pt(0, shoulderY), shoulder);
  if (name.startsWith('bellyFold')) return pt(0, point.y);
  if (name.startsWith('crotchNotch')) return pt(0, p.crotchY);
  if (['hipShelf', 'hip'].includes(name)) return projectToSegment(point, pt(0, p.hipY), hip);
  if (['upperThigh', 'outerThigh', 'kneeOuter', 'kneeInner', 'innerThigh'].includes(name)) return projectToSegment(point, hip, knee);
  if (['calf', 'ankleOuter', 'ankleInner', 'footTip', 'footInner'].includes(name)) return projectToSegment(point, knee, ankle);
  return pt(0, point.y);
}

function guideLine(a, b, stroke, width) {
  return `<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function pointCircle(point, regularPoint, skeletonPoint, radius, fill, stroke, regularStroke, bmiStroke) {
  const labelX = point.x >= 0 ? point.x + 3.2 : point.x - 3.2;
  const anchor = point.x >= 0 ? 'start' : 'end';
  const hitRadius = Math.max(radius + 3.5, 5);
  const label = `<text class="control-point-label" x="${r(labelX)}" y="${r(point.y - 2.6)}" text-anchor="${anchor}" opacity="0">${point.name}</text>`;
  const guide = [
    guideLine(skeletonPoint, regularPoint, regularStroke, 1.1),
    guideLine(regularPoint, point, bmiStroke, 1.35),
    circle(skeletonPoint.x, skeletonPoint.y, 1.25, regularStroke, regularStroke),
    circle(regularPoint.x, regularPoint.y, 1.1, fill, regularStroke),
  ].join('');
  return `<g class="control-point" pointer-events="all"><circle class="control-point-hit" cx="${r(point.x)}" cy="${r(point.y)}" r="${r(hitRadius)}" fill="transparent" stroke="transparent" pointer-events="all"/><g class="control-point-guide" pointer-events="none" opacity="0">${guide}</g><circle cx="${r(point.x)}" cy="${r(point.y)}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="0.7"/><title>${point.name}</title>${label}</g>`;
}

function segmentHover(segment, stroke) {
  const labelX = segment.mid.x >= 0 ? segment.mid.x + 3.4 : segment.mid.x - 3.4;
  const anchor = segment.mid.x >= 0 ? 'start' : 'end';
  const hitD = segment.hitD ?? segment.d;
  const label = `<text class="control-segment-label" x="${r(labelX)}" y="${r(segment.mid.y - 2.8)}" text-anchor="${anchor}" opacity="0">${segment.label}</text>`;
  return `<g class="control-segment" pointer-events="visibleStroke"><path class="control-segment-hit" d="${hitD}" fill="none" stroke="transparent" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path class="control-segment-highlight" d="${segment.d}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0"/><title>${segment.label}</title>${label}</g>`;
}

function byName(points, name) {
  return points.find((point) => point.name === name);
}

function debugMarkup(p, contour, regularContour, outlineSegments, detailControls, regularDetailControls, detailSegments, mode, colours) {
  if (mode === 'off') return '';

  const showSkeleton = mode === 'skeleton' || mode === 'both';
  const showPoints = mode === 'points' || mode === 'both';
  const parts = [];

  if (showSkeleton) {
    const shoulderY = p.shoulderY + p.adult * 2.2 + p.elder * 3;

    parts.push(`<g opacity="0.75" pointer-events="none">`);
    parts.push(line(0, p.top + p.headH * 0.5, 0, p.crotchY, colours.skeleton, 0.85, '3 3'));
    parts.push(line(-p.shoulderJointHalf, shoulderY, p.shoulderJointHalf, shoulderY, colours.skeleton, 1.1));
    parts.push(line(-p.hipJointHalf, p.hipY, p.hipJointHalf, p.hipY, colours.skeleton, 1.1));
    for (const s of [-1, 1]) {
      parts.push(line(s * p.shoulderJointHalf, shoulderY, s * p.elbowJointX, p.elbowJointY, colours.skeleton, 1.0));
      parts.push(line(s * p.elbowJointX, p.elbowJointY, s * p.wristJointX, p.wristJointY, colours.skeleton, 1.0));
      parts.push(line(s * p.hipJointHalf, p.hipY, s * p.kneeJointX, p.kneeJointY, colours.skeleton, 1.0));
      parts.push(line(s * p.kneeJointX, p.kneeJointY, s * p.ankleJointX, p.ankleJointY, colours.skeleton, 1.0));
    }
    parts.push(circle(0, p.top + p.headH * 0.5, 2.1, colours.skeleton, colours.skeleton));
    parts.push(circle(0, p.crotchY, 2.1, colours.skeleton, colours.skeleton));
    parts.push(`</g>`);
  }

  if (showPoints) {
    parts.push(`<g opacity="0.88" pointer-events="all">`);
    for (const segment of outlineSegments) {
      parts.push(segmentHover(segment, colours.control));
    }
    for (const segment of detailSegments) {
      parts.push(segmentHover(segment, colours.detailControl));
    }
    for (const point of contour) {
      const isCenter = point.x === 0;
      const skeletonPoint = skeletonReferenceFor(point, p);
      const regularPoint = byName(regularContour, point.name) ?? skeletonPoint;
      parts.push(pointCircle(point, regularPoint, skeletonPoint, isCenter ? 1.9 : 1.45, '#fff', colours.control, colours.skeleton, colours.control));
    }
    for (const point of detailControls) {
      const isCenter = point.x === 0;
      const skeletonPoint = skeletonReferenceFor(point, p);
      const regularPoint = byName(regularDetailControls, point.name) ?? skeletonPoint;
      parts.push(pointCircle(point, regularPoint, skeletonPoint, isCenter ? 1.75 : 1.3, colours.detailFill, colours.detailControl, colours.skeleton, colours.detailControl));
    }
    parts.push(`</g>`);
  }

  return `<g class="debug-overlay">${parts.join('')}</g>`;
}

function buildPaths(params) {
  const p = proportions(params);
  const regularP = proportions({ ...params, bodyMassIndex: 18 });
  const contour = fullContour(rightLandmarks(p));
  const regularContour = fullContour(rightLandmarks(regularP));
  const details = detailGeometry(p);
  const regularDetails = detailGeometry(regularP);
  return {
    outline: catmullClosedPath(contour),
    outlineSegments: catmullClosedSegments(contour),
    details: details.paths,
    contour,
    regularContour,
    detailControls: details.controls,
    regularDetailControls: regularDetails.controls,
    detailSegments: details.segments,
    proportions: p,
    stoop: p.elder * 0.08,
  };
}

function resolveTheme(themeArg) {
  let theme = themeArg ?? LIGHT_THEME;
  if (theme === 'light') theme = LIGHT_THEME;
  else if (theme === 'dark') theme = DARK_THEME;
  return theme;
}

function buildBodyInner(merged, theme) {
  const outline = colourFor(theme, 'outline');
  const detail = colourFor(theme, 'detail');
  const skeleton = colourFor(theme, 'skeleton');
  const control = colourFor(theme, 'control');
  const detailControl = colourFor(theme, 'detail');
  const detailFill = colourFor(theme, 'bg');
  const paths = buildPaths(merged);

  const transform = paths.stoop === 0
    ? 'translate(100 0)'
    : `translate(100 0) skewX(${r(-paths.stoop * 9)})`;
  const detailOpacity = merged.guideOverlay && merged.guideOverlay !== 'off' ? 0.48 : 0.62;
  const detailMarkup = paths.details
    .map((d) => `<path d="${d}" fill="none" stroke="${detail}" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" opacity="${detailOpacity}"/>`)
    .join('');
  const debug = debugMarkup(
    paths.proportions,
    paths.contour,
    paths.regularContour,
    paths.outlineSegments,
    paths.detailControls,
    paths.regularDetailControls,
    paths.detailSegments,
    merged.guideOverlay ?? 'off',
    { skeleton, control, detailControl, detailFill },
  );

  return `<g transform="${transform}"><path d="${paths.outline}" fill="none" stroke="${outline}" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>${detailMarkup}${debug}</g>`;
}

export function buildBodySvg(params = {}, opts = {}) {
  const merged = { sex: 'male', age: 35, bodyMassIndex: 24, ...params };
  const theme = resolveTheme(opts.theme);

  const includeBg = opts.background !== false && theme !== CSSVARS_SENTINEL;
  const bg = colourFor(theme, 'bg');
  const bgRect = includeBg ? `<rect x="0" y="0" width="200" height="240" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">${bgRect}${buildBodyInner(merged, theme)}</svg>`;
}

export function buildBodyGridSvg(params = {}, opts = {}) {
  const merged = { guideOverlay: 'off', sex: 'female', ...params };
  const theme = resolveTheme(opts.theme);
  const includeBg = opts.background !== false && theme !== CSSVARS_SENTINEL;
  const bg = colourFor(theme, 'bg');
  const fg = theme === CSSVARS_SENTINEL ? 'var(--fg)' : (theme === DARK_THEME ? '#ececec' : '#1c1c1c');
  const border = theme === CSSVARS_SENTINEL ? 'var(--border)' : (theme === DARK_THEME ? '#353841' : '#d8d4ca');

  const ages = [3, 6, 10, 15, 20, 35, 55, 75];
  const sexLabel = merged.sex === 'male' ? 'M' : 'F';
  const bodyMassIndexes = [18, 27, 36];
  const leftW = 78;
  const topH = 30;
  const cellW = 92;
  const cellH = 150;
  const bodyW = 74;
  const bodyH = 118;
  const cols = ages.length;
  const width = leftW + cols * cellW;
  const height = topH + bodyMassIndexes.length * cellH;
  const parts = [];

  if (includeBg) parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>`);
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${border}" stroke-width="1"/>`);

  for (let c = 0; c < cols; c++) {
    const age = ages[c];
    const x = leftW + c * cellW;
    parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${border}" stroke-width="1"/>`);
    parts.push(`<text x="${r(x + cellW / 2)}" y="20" fill="${fg}" font-size="12" font-family="-apple-system, Helvetica, Arial, sans-serif" text-anchor="middle" font-weight="600">${sexLabel} ${age}y</text>`);
  }
  parts.push(`<line x1="${width}" y1="0" x2="${width}" y2="${height}" stroke="${border}" stroke-width="1"/>`);

  for (let row = 0; row < bodyMassIndexes.length; row++) {
    const bmi = bodyMassIndexes[row];
    const y = topH + row * cellH;
    parts.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${border}" stroke-width="1"/>`);
    parts.push(`<text x="10" y="${r(y + cellH / 2 + 4)}" fill="${fg}" font-size="12" font-family="-apple-system, Helvetica, Arial, sans-serif" font-weight="600">BMI ${bmi}</text>`);

    for (let c = 0; c < cols; c++) {
      const age = ages[c];
      const x = leftW + c * cellW + (cellW - bodyW) / 2;
      const bodyY = y + 24;
      const body = buildBodyInner({ sex: merged.sex, age, bodyMassIndex: bmi, guideOverlay: merged.guideOverlay }, theme);
      parts.push(`<svg x="${r(x)}" y="${r(bodyY)}" width="${bodyW}" height="${bodyH}" viewBox="0 0 200 240">${body}</svg>`);
    }
  }
  parts.push(`<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${border}" stroke-width="1"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${parts.join('')}</svg>`;
}

export const bodyParams = [
  {
    key: 'sex', label: 'Sex', type: 'choice', default: 'male',
    choices: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  { key: 'age', label: 'Age', type: 'range', min: 3, max: 90, step: 1, default: 35, unit: 'years' },
  { key: 'bodyMassIndex', label: 'Body mass index', type: 'range', min: 16, max: 42, step: 1, default: 24, unit: 'kg/m2' },
  {
    key: 'guideOverlay', label: 'Guide overlay', type: 'choice', default: 'off',
    choices: [
      { value: 'off', label: 'Off' },
      { value: 'skeleton', label: 'Skeleton' },
      { value: 'points', label: 'Control points' },
      { value: 'both', label: 'Both' },
    ],
  },
];

export const bodyGridParams = [
  {
    key: 'guideOverlay', label: 'Guide overlay', type: 'choice', default: 'off',
    choices: [
      { value: 'off', label: 'Off' },
      { value: 'skeleton', label: 'Skeleton' },
      { value: 'points', label: 'Control points' },
      { value: 'both', label: 'Both' },
    ],
  },
];
