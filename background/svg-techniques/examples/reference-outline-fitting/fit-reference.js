import { buildBodySvg } from './panels/body-generator.js';

const NORMAL_W = 360;
const NORMAL_H = 432;
const BODY_PAD_Y = 18;
const STORAGE_KEY = 'reference-outline-fitting:state';

const AGE_COLUMNS = [
  { age: 3, label: '3 yr', gridIndex: 2 },
  { age: 6, label: '6 yr', gridIndex: 3 },
  { age: 10, label: '10 yr', gridIndex: 4 },
  { age: 15, label: '15 yr', gridIndex: 5 },
  { age: 20, label: '20 yr', gridIndex: 6 },
  { age: 35, label: '35 yr', gridIndex: 7 },
  { age: 55, label: '55 yr', gridIndex: 8 },
  { age: 75, label: '75 yr', gridIndex: 9 },
];

const BODY_ROWS = [
  { key: 'slim', label: 'Slim', rowIndex: 0, representativeBodyMassIndex: 18 },
  { key: 'lean', label: 'Lean', rowIndex: 1, representativeBodyMassIndex: 21 },
  { key: 'average', label: 'Average', rowIndex: 2, representativeBodyMassIndex: 24 },
  { key: 'overweight', label: 'Overweight', rowIndex: 3, representativeBodyMassIndex: 30 },
  { key: 'obese', label: 'Obese', rowIndex: 4, representativeBodyMassIndex: 36 },
];

const BANDS = [
  { key: 'head', label: 'head', y: 0.08, mode: 'envelope' },
  { key: 'neck', label: 'neck', y: 0.18, mode: 'envelope' },
  { key: 'shoulder', label: 'shoulder', y: 0.25, mode: 'envelope' },
  { key: 'chest', label: 'chest', y: 0.36, mode: 'envelope' },
  { key: 'waist', label: 'waist', y: 0.48, mode: 'envelope' },
  { key: 'hip', label: 'hip', y: 0.58, mode: 'envelope' },
  { key: 'upperThigh', label: 'upper thigh', y: 0.69, mode: 'envelope' },
  { key: 'knee', label: 'knee', y: 0.79, mode: 'envelope' },
  { key: 'calf', label: 'calf', y: 0.88, mode: 'envelope' },
  { key: 'ankle', label: 'ankle', y: 0.96, mode: 'envelope' },
];

const COEFFICIENT_CONTROLS = [
  { key: 'shoulderScale', output: 'shoulderOut', unit: '%' },
  { key: 'chestScale', output: 'chestOut', unit: '%' },
  { key: 'waistScale', output: 'waistOut', unit: '%' },
  { key: 'bellyScale', output: 'bellyOut', unit: '%' },
  { key: 'hipScale', output: 'hipOut', unit: '%' },
  { key: 'hipRoundness', output: 'hipRoundnessOut', unit: '' },
  { key: 'thighScale', output: 'thighOut', unit: '%' },
  { key: 'lowerLegScale', output: 'lowerLegOut', unit: '%' },
  { key: 'armScale', output: 'armOut', unit: '%' },
  { key: 'crotchLift', output: 'crotchLiftOut', unit: ' px' },
];

const BODY_MASS_INDEX_FIT_VARIABLE = { key: 'bodyMassIndex', steps: [4, 2, 1, 0.5] };

const COEFFICIENT_FIT_VARIABLES = [
  { key: 'shoulderScale', steps: [12, 6, 3, 1] },
  { key: 'chestScale', steps: [12, 6, 3, 1] },
  { key: 'waistScale', steps: [14, 7, 3, 1] },
  { key: 'bellyScale', steps: [14, 7, 3, 1] },
  { key: 'hipScale', steps: [14, 7, 3, 1] },
  { key: 'hipRoundness', steps: [40, 20, 10, 5] },
  { key: 'thighScale', steps: [20, 10, 5, 2] },
  { key: 'lowerLegScale', steps: [20, 10, 5, 2] },
  { key: 'armScale', steps: [20, 10, 5, 2] },
  { key: 'crotchLift', steps: [8, 4, 2, 1] },
];

const FALLBACK_GRID = {
  vertical: [23, 176, 323, 470, 616, 773, 916, 1065, 1209, 1353, 1501, 1649],
  horizontal: [73, 123, 278, 436, 593, 751, 917],
};

const els = {
  status: document.getElementById('status'),
  sex: document.getElementById('sex'),
  age: document.getElementById('age'),
  referenceSize: document.getElementById('referenceSize'),
  bodyMassIndex: document.getElementById('bodyMassIndex'),
  bmiOut: document.getElementById('bmiOut'),
  threshold: document.getElementById('threshold'),
  thresholdOut: document.getElementById('thresholdOut'),
  ignoreHead: document.getElementById('ignoreHead'),
  reset: document.getElementById('reset'),
  fitBodyMassIndex: document.getElementById('fitBodyMassIndex'),
  autoFit: document.getElementById('autoFit'),
  stopFit: document.getElementById('stopFit'),
  fitProgress: document.getElementById('fitProgress'),
  fitReport: document.getElementById('fitReport'),
  overlay: document.getElementById('overlay'),
  targetCrop: document.getElementById('targetCrop'),
  targetFill: document.getElementById('targetFill'),
  generatedFill: document.getElementById('generatedFill'),
  score: document.getElementById('score'),
  overlapMetric: document.getElementById('overlapMetric'),
  widthMetric: document.getElementById('widthMetric'),
  centerMetric: document.getElementById('centerMetric'),
  corrections: document.getElementById('corrections'),
  bandRows: document.getElementById('bandRows'),
};

for (const control of COEFFICIENT_CONTROLS) {
  els[control.key] = document.getElementById(control.key);
  els[control.output] = document.getElementById(control.output);
}

const imageCache = new Map();
let renderVersion = 0;
let activeFit = null;

function stateFromControls() {
  const state = {
    sex: els.sex.value,
    age: Number(els.age.value),
    referenceSize: els.referenceSize.value,
    bodyMassIndex: Number(els.bodyMassIndex.value),
    threshold: Number(els.threshold.value),
    ignoreHead: els.ignoreHead.checked,
  };
  for (const control of COEFFICIENT_CONTROLS) {
    state[control.key] = Number(els[control.key].value);
  }
  return state;
}

function applyState(state) {
  els.sex.value = state.sex ?? 'female';
  els.age.value = String(state.age ?? 35);
  els.referenceSize.value = state.referenceSize ?? 'average';
  els.bodyMassIndex.value = String(state.bodyMassIndex ?? 24);
  els.threshold.value = String(state.threshold ?? 214);
  els.ignoreHead.checked = state.ignoreHead ?? true;
  for (const control of COEFFICIENT_CONTROLS) {
    els[control.key].value = String(state[control.key] ?? 0);
  }
  refreshOutputs();
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {
    return null;
  }
  return null;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function controlForKey(key) {
  if (key === 'bodyMassIndex') return els.bodyMassIndex;
  return els[key];
}

function clampToControl(key, value) {
  const input = controlForKey(key);
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step || 1);
  const clamped = Math.min(max, Math.max(min, value));
  return Number((Math.round(clamped / step) * step).toFixed(3));
}

function cloneState(state) {
  return { ...state };
}

function refreshOutputs() {
  els.bmiOut.textContent = els.bodyMassIndex.value;
  els.thresholdOut.textContent = els.threshold.value;
  for (const control of COEFFICIENT_CONTROLS) {
    const value = Number(els[control.key].value);
    els[control.output].textContent = `${value > 0 ? '+' : ''}${value}${control.unit}`;
  }
}

function percentScale(percent) {
  return 1 + percent / 100;
}

function shapeCoefficientsFromState(state) {
  return {
    shoulderScale: percentScale(state.shoulderScale),
    chestScale: percentScale(state.chestScale),
    waistScale: percentScale(state.waistScale),
    bellyScale: percentScale(state.bellyScale),
    hipScale: percentScale(state.hipScale),
    hipRoundness: state.hipRoundness / 100,
    thighScale: percentScale(state.thighScale),
    lowerLegScale: percentScale(state.lowerLegScale),
    armScale: percentScale(state.armScale),
    crotchLift: state.crotchLift,
  };
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isGridRulePixel(r, g, b) {
  const lum = luminance(r, g, b);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return lum > 145 && lum < 242 && chroma < 8;
}

function groupPositions(positions) {
  const groups = [];
  let group = [];
  for (const x of positions) {
    if (!group.length || x <= group[group.length - 1] + 2) {
      group.push(x);
    } else {
      groups.push(group);
      group = [x];
    }
  }
  if (group.length) groups.push(group);
  return groups.map((g) => Math.round(g.reduce((sum, x) => sum + x, 0) / g.length));
}

function detectGridLines(img) {
  const canvas = makeCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const verticalHits = [];
  const y0 = Math.round(canvas.height * 0.075);
  const y1 = Math.round(canvas.height * 0.98);
  const verticalCutoff = (y1 - y0) * 0.42;
  for (let x = 0; x < canvas.width; x += 1) {
    let count = 0;
    for (let y = y0; y < y1; y += 1) {
      const i = (y * canvas.width + x) * 4;
      if (isGridRulePixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > verticalCutoff) verticalHits.push(x);
  }

  const horizontalHits = [];
  const x0 = Math.round(canvas.width * 0.01);
  const x1 = Math.round(canvas.width * 0.99);
  const horizontalCutoff = (x1 - x0) * 0.42;
  for (let y = 0; y < canvas.height; y += 1) {
    let count = 0;
    for (let x = x0; x < x1; x += 1) {
      const i = (y * canvas.width + x) * 4;
      if (isGridRulePixel(data[i], data[i + 1], data[i + 2])) count += 1;
    }
    if (count > horizontalCutoff) horizontalHits.push(y);
  }

  const vertical = groupPositions(verticalHits).filter((x) => x > 10 && x < canvas.width - 10);
  const horizontal = groupPositions(horizontalHits).filter((y) => y > 50 && y < canvas.height - 10);

  if (vertical.length >= 12 && horizontal.length >= 7) {
    return {
      vertical: vertical.slice(0, 12),
      horizontal: horizontal.slice(0, 7),
    };
  }
  return FALLBACK_GRID;
}

function cellRectFor(grid, age, referenceSize) {
  const ageInfo = AGE_COLUMNS.find((item) => item.age === age) ?? AGE_COLUMNS[5];
  const rowInfo = BODY_ROWS.find((item) => item.key === referenceSize) ?? BODY_ROWS[2];
  const x0 = grid.vertical[1 + ageInfo.gridIndex];
  const x1 = grid.vertical[2 + ageInfo.gridIndex];
  const y0 = grid.horizontal[1 + rowInfo.rowIndex];
  const y1 = grid.horizontal[2 + rowInfo.rowIndex];
  const padX = Math.max(7, Math.round((x1 - x0) * 0.055));
  const padY = Math.max(8, Math.round((y1 - y0) * 0.055));
  return {
    x: x0 + padX,
    y: y0 + padY,
    width: x1 - x0 - padX * 2,
    height: y1 - y0 - padY * 2,
    ageLabel: ageInfo.label,
    rowLabel: rowInfo.label,
  };
}

function drawCellCrop(img, rect) {
  const canvas = makeCanvas(rect.width, rect.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return canvas;
}

function previewCanvas(source, dest) {
  const ctx = dest.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, dest.width, dest.height);
  const scale = Math.min(dest.width / source.width, dest.height / source.height);
  const w = source.width * scale;
  const h = source.height * scale;
  ctx.drawImage(source, (dest.width - w) / 2, (dest.height - h) / 2, w, h);
}

function isInkPixel(r, g, b, a, threshold) {
  if (a < 12) return false;
  return luminance(r, g, b) < threshold;
}

function inkMaskFromCanvas(canvas, threshold) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mask = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0, p = 0; i < image.data.length; i += 4, p += 1) {
    if (isInkPixel(image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3], threshold)) {
      mask[p] = 1;
    }
  }
  return { width: canvas.width, height: canvas.height, mask };
}

function boundsFromMask(mask, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function expandedBounds(bounds, canvas, fraction = 0.045) {
  const pad = Math.round(Math.max(bounds.width, bounds.height) * fraction);
  const x = Math.max(0, bounds.x - pad);
  const y = Math.max(0, bounds.y - pad);
  const x2 = Math.min(canvas.width, bounds.x + bounds.width + pad);
  const y2 = Math.min(canvas.height, bounds.y + bounds.height + pad);
  return { x, y, width: x2 - x, height: y2 - y };
}

function dilate(mask, width, height, radius = 1) {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let hit = false;
      for (let dy = -radius; dy <= radius && !hit; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          if (mask[yy * width + xx]) {
            hit = true;
            break;
          }
        }
      }
      if (hit) out[y * width + x] = 1;
    }
  }
  return out;
}

function closedSilhouetteFromInk(ink, width, height) {
  const barrier = dilate(ink, width, height, 2);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    const i = y * width + x;
    if (visited[i] || barrier[i]) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let q = 0; q < queue.length; q += 1) {
    const i = queue[q];
    const x = i % width;
    const y = Math.floor(i / width);
    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }

  const silhouette = new Uint8Array(width * height);
  for (let i = 0; i < silhouette.length; i += 1) {
    if (barrier[i] || !visited[i]) silhouette[i] = 1;
  }
  return silhouette;
}

function envelopeSilhouetteFromInk(ink, width, height) {
  const expandedInk = dilate(ink, width, height, 1);
  const bounds = [];
  for (let y = 0; y < height; y += 1) {
    let left = width;
    let right = -1;
    for (let x = 0; x < width; x += 1) {
      if (!expandedInk[y * width + x]) continue;
      if (x < left) left = x;
      if (x > right) right = x;
    }
    bounds[y] = right >= left ? { left, right } : null;
  }

  const silhouette = new Uint8Array(width * height);
  let last = null;
  for (let y = 0; y < height; y += 1) {
    let row = bounds[y];
    if (!row) {
      let next = null;
      for (let yy = y + 1; yy < Math.min(height, y + 8); yy += 1) {
        if (bounds[yy]) {
          next = bounds[yy];
          break;
        }
      }
      if (last && next) {
        row = {
          left: Math.round((last.left + next.left) / 2),
          right: Math.round((last.right + next.right) / 2),
        };
      }
    }
    if (!row) continue;
    last = row;
    for (let x = row.left; x <= row.right; x += 1) {
      silhouette[y * width + x] = 1;
    }
  }
  return silhouette;
}

function normalizeLineArt(source, threshold) {
  const rawInk = inkMaskFromCanvas(source, threshold);
  const bounds = boundsFromMask(rawInk.mask, rawInk.width, rawInk.height);
  if (!bounds) throw new Error('No line art found');
  const expanded = expandedBounds(bounds, source);

  const canvas = makeCanvas(NORMAL_W, NORMAL_H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let scale = (NORMAL_H - BODY_PAD_Y * 2) / expanded.height;
  let drawW = expanded.width * scale;
  let drawH = expanded.height * scale;
  if (drawW > NORMAL_W - 16) {
    scale = (NORMAL_W - 16) / expanded.width;
    drawW = expanded.width * scale;
    drawH = expanded.height * scale;
  }
  const drawX = (NORMAL_W - drawW) / 2;
  const drawY = (NORMAL_H - drawH) / 2;
  ctx.drawImage(source, expanded.x, expanded.y, expanded.width, expanded.height, drawX, drawY, drawW, drawH);

  const normalizedInk = inkMaskFromCanvas(canvas, threshold);
  const silhouette = envelopeSilhouetteFromInk(normalizedInk.mask, NORMAL_W, NORMAL_H);
  const silhouetteBounds = boundsFromMask(silhouette, NORMAL_W, NORMAL_H);
  return {
    canvas,
    ink: normalizedInk.mask,
    mask: silhouette,
    width: NORMAL_W,
    height: NORMAL_H,
    frame: { x: drawX, y: drawY, width: drawW, height: drawH },
    bounds: silhouetteBounds,
  };
}

function drawMaskPreview(maskObj, canvas, color) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const image = ctx.createImageData(maskObj.width, maskObj.height);
  for (let i = 0; i < maskObj.mask.length; i += 1) {
    const p = i * 4;
    if (maskObj.mask[i]) {
      image.data[p] = color[0];
      image.data[p + 1] = color[1];
      image.data[p + 2] = color[2];
      image.data[p + 3] = 210;
    } else {
      image.data[p] = 255;
      image.data[p + 1] = 255;
      image.data[p + 2] = 255;
      image.data[p + 3] = 255;
    }
  }
  const temp = makeCanvas(maskObj.width, maskObj.height);
  temp.getContext('2d').putImageData(image, 0, 0);
  const scale = Math.min(canvas.width / temp.width, canvas.height / temp.height);
  const w = temp.width * scale;
  const h = temp.height * scale;
  ctx.drawImage(temp, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

function modeForFraction(yFraction) {
  return 'envelope';
}

function scanSpans(maskObj, yFraction) {
  const yCenter = Math.round(maskObj.frame.y + maskObj.frame.height * yFraction);
  const y0 = Math.max(0, yCenter - 2);
  const y1 = Math.min(maskObj.height - 1, yCenter + 2);
  const row = new Uint8Array(maskObj.width);
  for (let y = y0; y <= y1; y += 1) {
    for (let x = 0; x < maskObj.width; x += 1) {
      if (maskObj.mask[y * maskObj.width + x]) row[x] = 1;
    }
  }
  const spans = [];
  let start = -1;
  for (let x = 0; x < maskObj.width; x += 1) {
    if (row[x] && start < 0) start = x;
    if ((!row[x] || x === maskObj.width - 1) && start >= 0) {
      const end = row[x] && x === maskObj.width - 1 ? x : x - 1;
      spans.push({ left: start, right: end, width: end - start + 1, center: (start + end) / 2 });
      start = -1;
    }
  }
  return { y: yCenter, spans };
}

function chooseSpan(spans, mode, centerX) {
  if (!spans.length) return null;
  if (mode === 'core') {
    const containing = spans.find((span) => span.left <= centerX && span.right >= centerX);
    if (containing) return containing;
    return spans
      .slice()
      .sort((a, b) => Math.abs(a.center - centerX) - Math.abs(b.center - centerX))[0];
  }
  const left = Math.min(...spans.map((span) => span.left));
  const right = Math.max(...spans.map((span) => span.right));
  return { left, right, width: right - left + 1, center: (left + right) / 2 };
}

function scanWidth(maskObj, yFraction, mode = 'envelope') {
  const scanned = scanSpans(maskObj, yFraction);
  const span = chooseSpan(scanned.spans, mode, maskObj.width / 2);
  if (!span) return null;
  return {
    ...span,
    y: scanned.y,
    spans: scanned.spans,
  };
}

function compareMasks(target, generated, ignoreHead) {
  const startY = ignoreHead
    ? Math.round(target.frame.y + target.frame.height * 0.24)
    : 0;
  let intersection = 0;
  let union = 0;
  for (let y = startY; y < target.height; y += 1) {
    for (let x = 0; x < target.width; x += 1) {
      const i = y * target.width + x;
      const t = target.mask[i] === 1;
      const g = generated.mask[i] === 1;
      if (t && g) intersection += 1;
      if (t || g) union += 1;
    }
  }
  const overlap = union ? intersection / union : 0;

  const bands = BANDS.map((band) => {
    const t = scanWidth(target, band.y, band.mode);
    const g = scanWidth(generated, band.y, band.mode);
    if (!t || !g) return { ...band, missing: true };
    const widthError = g.width - t.width;
    const centerError = g.center - t.center;
    const leftEdgeError = t.left - g.left;
    const rightEdgeError = g.right - t.right;
    return { ...band, target: t, generated: g, widthError, centerError, leftEdgeError, rightEdgeError };
  });

  const sampleStart = ignoreHead ? 0.24 : 0.03;
  const sampleEnd = 0.985;
  let widthErrorSum = 0;
  let centerErrorSum = 0;
  let sampleCount = 0;
  for (let i = 0; i < 90; i += 1) {
    const y = sampleStart + (sampleEnd - sampleStart) * (i / 89);
    const mode = modeForFraction(y);
    const t = scanWidth(target, y, mode);
    const g = scanWidth(generated, y, mode);
    if (!t || !g) continue;
    widthErrorSum += Math.abs(g.width - t.width);
    centerErrorSum += Math.abs(g.center - t.center);
    sampleCount += 1;
  }
  const meanWidthError = sampleCount ? widthErrorSum / sampleCount : 0;
  const meanCenterError = sampleCount ? centerErrorSum / sampleCount : 0;
  const widthQuality = Math.max(0, 1 - meanWidthError / 90);
  const centerQuality = Math.max(0, 1 - meanCenterError / 60);
  const score = 100 * (overlap * 0.55 + widthQuality * 0.35 + centerQuality * 0.10);

  return {
    ignoreHead,
    overlap,
    bands,
    meanWidthError,
    meanCenterError,
    score,
  };
}

function drawOverlay(target, generated, comparison) {
  const canvas = els.overlay;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < target.mask.length; i += 1) {
    const t = target.mask[i] === 1;
    const g = generated.mask[i] === 1;
    const p = i * 4;
    if (t && g) {
      image.data[p] = 36;
      image.data[p + 1] = 36;
      image.data[p + 2] = 36;
      image.data[p + 3] = 190;
    } else if (t) {
      image.data[p] = 43;
      image.data[p + 1] = 125;
      image.data[p + 2] = 233;
      image.data[p + 3] = 120;
    } else if (g) {
      image.data[p] = 196;
      image.data[p + 1] = 58;
      image.data[p + 2] = 49;
      image.data[p + 3] = 120;
    } else {
      image.data[p] = 255;
      image.data[p + 1] = 255;
      image.data[p + 2] = 255;
      image.data[p + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  for (const band of comparison.bands) {
    if (band.missing) continue;
    const y = band.target.y;
    ctx.strokeStyle = Math.abs(band.widthError) > 12 ? 'rgba(196, 58, 49, 0.82)' : 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = Math.abs(band.widthError) > 12 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(band.target.left, y);
    ctx.lineTo(band.generated.left, y);
    ctx.moveTo(band.target.right, y);
    ctx.lineTo(band.generated.right, y);
    ctx.stroke();
  }
  ctx.restore();
}

function fmtPx(n) {
  return `${Math.round(n)} px`;
}

function edgeText(error) {
  const rounded = Math.round(error);
  if (rounded === 0) return '0 px';
  return `${rounded > 0 ? '+' : ''}${rounded} px ${rounded > 0 ? 'out' : 'in'}`;
}

function updateReport(comparison) {
  els.score.textContent = Math.round(comparison.score);
  els.overlapMetric.textContent = `${Math.round(comparison.overlap * 100)}%`;
  els.widthMetric.textContent = fmtPx(comparison.meanWidthError);
  els.centerMetric.textContent = fmtPx(comparison.meanCenterError);

  const ranked = comparison.bands
    .filter((band) => !band.missing && (!comparison.ignoreHead || band.y >= 0.24))
    .flatMap((band) => [
      { label: `${band.label} left edge`, error: band.leftEdgeError },
      { label: `${band.label} right edge`, error: band.rightEdgeError },
    ])
    .sort((a, b) => Math.abs(b.error) - Math.abs(a.error))
    .slice(0, 5);
  els.corrections.innerHTML = '';
  for (const item of ranked) {
    const li = document.createElement('li');
    const direction = item.error > 0 ? 'outward' : 'inward';
    li.textContent = `${item.label}: generated ${direction} by ${fmtPx(Math.abs(item.error))}`;
    els.corrections.append(li);
  }

  els.bandRows.innerHTML = '';
  for (const band of comparison.bands) {
    const tr = document.createElement('tr');
    if (band.missing) {
      tr.innerHTML = `<td>${band.label}</td><td colspan="4">not found</td>`;
    } else {
      const cls = Math.abs(band.widthError) > 12 ? 'bad' : 'good';
      tr.innerHTML = [
        `<td>${band.label}</td>`,
        `<td>${fmtPx(band.target.width)}</td>`,
        `<td>${fmtPx(band.generated.width)}</td>`,
        `<td class="${cls}">${band.widthError > 0 ? '+' : ''}${fmtPx(band.widthError)}</td>`,
        `<td>${edgeText(band.leftEdgeError)}</td>`,
        `<td>${edgeText(band.rightEdgeError)}</td>`,
      ].join('');
    }
    els.bandRows.append(tr);
  }
}

async function targetFromState(state) {
  const gridImage = await loadImage(`./reference/gen_grid_${state.sex}.png`);
  const grid = detectGridLines(gridImage);
  const rect = cellRectFor(grid, state.age, state.referenceSize);
  const crop = drawCellCrop(gridImage, rect);
  const target = normalizeLineArt(crop, state.threshold);
  return { rect, crop, target };
}

async function renderGeneratedCanvas(state) {
  const svg = buildBodySvg({
    sex: state.sex,
    age: state.age,
    bodyMassIndex: state.bodyMassIndex,
    shapeCoefficients: shapeCoefficientsFromState(state),
    guideOverlay: 'off',
  }, {
    theme: 'light',
    background: false,
  });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = makeCanvas(640, 768);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
    imageCache.delete(url);
  }
}

async function measureAgainstTarget(state, target) {
  const generatedCanvas = await renderGeneratedCanvas(state);
  const generated = normalizeLineArt(generatedCanvas, state.threshold);
  const comparison = compareMasks(target, generated, state.ignoreHead);
  return { generated, comparison };
}

function displayMeasurement(pack, generated, comparison) {
  previewCanvas(pack.crop, els.targetCrop);
  drawOverlay(pack.target, generated, comparison);
  drawMaskPreview(pack.target, els.targetFill, [43, 125, 233]);
  drawMaskPreview(generated, els.generatedFill, [196, 58, 49]);
  updateReport(comparison);
  els.status.textContent = `${stateFromControls().sex}, ${pack.rect.ageLabel}, ${pack.rect.rowLabel}`;
}

function setFitRunning(running) {
  els.autoFit.disabled = running;
  els.stopFit.disabled = !running;
}

function setFitReport(text, progress = null) {
  els.fitReport.textContent = text;
  if (progress != null) els.fitProgress.value = progress;
}

function scoreText(score) {
  return score.toFixed(1);
}

async function yieldToBrowser() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function autoFitCurrentTarget() {
  if (activeFit) return;

  const run = { cancel: false };
  activeFit = run;
  setFitRunning(true);
  renderVersion += 1;

  const startState = stateFromControls();
  const fitVariables = els.fitBodyMassIndex.checked
    ? [BODY_MASS_INDEX_FIT_VARIABLE, ...COEFFICIENT_FIT_VARIABLES]
    : COEFFICIENT_FIT_VARIABLES;
  let bestState = cloneState(startState);
  let bestGenerated = null;
  let bestComparison = null;
  let baselineScore = 0;
  let evaluations = 0;
  const maxEvaluations = 1 + fitVariables.length * 2 * 4 * 2;

  try {
    setFitReport('Preparing target', 0);
    const pack = await targetFromState(startState);
    const baseline = await measureAgainstTarget(startState, pack.target);
    evaluations += 1;
    baselineScore = baseline.comparison.score;
    bestGenerated = baseline.generated;
    bestComparison = baseline.comparison;
    displayMeasurement(pack, bestGenerated, bestComparison);

    for (let pass = 0; pass < 4; pass += 1) {
      for (let sweep = 0; sweep < 2; sweep += 1) {
        let improvedInSweep = false;
        for (const variable of fitVariables) {
          if (run.cancel) break;

          const step = variable.steps[pass];
          for (const direction of [1, -1]) {
            if (run.cancel) break;

            const candidate = cloneState(bestState);
            candidate[variable.key] = clampToControl(
              variable.key,
              candidate[variable.key] + direction * step,
            );
            if (candidate[variable.key] === bestState[variable.key]) continue;

            const measured = await measureAgainstTarget(candidate, pack.target);
            evaluations += 1;
            const candidateScore = measured.comparison.score;
            if (candidateScore > bestComparison.score + 0.08) {
              bestState = candidate;
              bestGenerated = measured.generated;
              bestComparison = measured.comparison;
              improvedInSweep = true;
              applyState(bestState);
              saveState(bestState);
              setFitReport(
                `Improved ${scoreText(baselineScore)} -> ${scoreText(bestComparison.score)} (${variable.key} ${bestState[variable.key]})`,
                Math.min(0.98, evaluations / maxEvaluations),
              );
            } else {
              setFitReport(
                `Testing ${variable.key}: best ${scoreText(bestComparison.score)} (${evaluations} tries)`,
                Math.min(0.98, evaluations / maxEvaluations),
              );
            }
            await yieldToBrowser();
          }
        }
        if (run.cancel || !improvedInSweep) break;
      }
    }

    applyState(bestState);
    saveState(bestState);
    displayMeasurement(pack, bestGenerated, bestComparison);
    const delta = bestComparison.score - baselineScore;
    setFitReport(
      `${run.cancel ? 'Stopped' : 'Done'}: ${scoreText(baselineScore)} -> ${scoreText(bestComparison.score)} (${delta >= 0 ? '+' : ''}${scoreText(delta)}, ${evaluations} tries)`,
      1,
    );
  } catch (error) {
    setFitReport(error.message, 0);
    throw error;
  } finally {
    activeFit = null;
    setFitRunning(false);
  }
}

async function render() {
  const version = ++renderVersion;
  const state = stateFromControls();
  refreshOutputs();
  saveState(state);
  els.status.textContent = 'Measuring';

  try {
    const pack = await targetFromState(state);
    if (version !== renderVersion) return;

    const measured = await measureAgainstTarget(state, pack.target);
    if (version !== renderVersion) return;

    displayMeasurement(pack, measured.generated, measured.comparison);
  } catch (error) {
    els.status.textContent = error.message;
    throw error;
  }
}

function queueRender() {
  if (activeFit) return;
  void render();
}

function reset() {
  if (activeFit) activeFit.cancel = true;
  applyState({
    sex: 'female',
    age: 35,
    referenceSize: 'average',
    bodyMassIndex: 24,
    threshold: 214,
    ignoreHead: true,
    shoulderScale: 0,
    chestScale: 0,
    waistScale: 0,
    bellyScale: 0,
    hipScale: 0,
    hipRoundness: 0,
    thighScale: 0,
    lowerLegScale: 0,
    armScale: 0,
    crotchLift: 0,
  });
  setFitReport('Idle', 0);
  queueRender();
}

for (const el of [
  els.sex,
  els.age,
  els.referenceSize,
  els.bodyMassIndex,
  els.threshold,
  els.ignoreHead,
  ...COEFFICIENT_CONTROLS.map((control) => els[control.key]),
]) {
  el.addEventListener('input', queueRender);
  el.addEventListener('change', queueRender);
}
els.reset.addEventListener('click', reset);
els.autoFit.addEventListener('click', () => {
  void autoFitCurrentTarget();
});
els.stopFit.addEventListener('click', () => {
  if (activeFit) activeFit.cancel = true;
});

applyState(loadState() ?? {
  sex: 'female',
  age: 35,
  referenceSize: 'average',
  bodyMassIndex: 24,
  threshold: 214,
  ignoreHead: true,
  shoulderScale: 0,
  chestScale: 0,
  waistScale: 0,
  bellyScale: 0,
  hipScale: 0,
  hipRoundness: 0,
  thighScale: 0,
  lowerLegScale: 0,
  armScale: 0,
  crotchLift: 0,
});
queueRender();
