// framework.js — tiny scaffold for parametric SVG anatomy experiments.
//
// API:
//   registerPanel(def)       — push a panel definition into the registry
//   mountPanels(container)   — render all registered panels into `container`
//   mountThemeToggle(button) — wire a button to flip data-theme on <html>
//
// A panel definition has the shape:
//   {
//     id:    'body',
//     title: 'Whole Body',
//     params: [
//       { key, label, type: 'range'|'choice', min, max, step, choices, default, unit }
//     ],
//     render(svgEl, state) { ... }   // clears + redraws into svgEl
//   }
//
// Each panel card carries: title, controls, an SVG canvas, Reset / Copy SVG / Export SVG buttons.
// State is per-panel and held inside the closure mountPanels builds for each card.

const SVG_NS = 'http://www.w3.org/2000/svg';
const STORAGE_PREFIX = 'outline-morph-body';
const registry = [];

export function registerPanel(def) {
  registry.push(def);
}

export function getRegisteredPanels() {
  return registry.slice();
}

function makeEl(tag, attrs = {}, text) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  if (text != null) el.textContent = text;
  return el;
}

function defaultsFor(params) {
  const s = {};
  for (const p of params) s[p.key] = p.default;
  return s;
}

function storageKeyForPanel(id) {
  return `${STORAGE_PREFIX}:panel:${id}`;
}

function coerceStoredValue(param, value) {
  if (param.type === 'range') {
    const n = Number(value);
    if (!Number.isFinite(n)) return param.default;
    return clamp(n, param.min, param.max);
  }
  if (param.type === 'choice' && param.choices.some((choice) => choice.value === value)) {
    return value;
  }
  return param.default;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function loadPanelState(def) {
  const state = defaultsFor(def.params);
  try {
    const raw = localStorage.getItem(storageKeyForPanel(def.id));
    if (!raw) return state;
    const stored = JSON.parse(raw);
    if (!stored || typeof stored !== 'object') return state;
    for (const param of def.params) {
      if (Object.prototype.hasOwnProperty.call(stored, param.key)) {
        state[param.key] = coerceStoredValue(param, stored[param.key]);
      }
    }
  } catch (e) {
    return state;
  }
  return state;
}

function savePanelState(def, state) {
  try {
    const saved = {};
    for (const param of def.params) saved[param.key] = state[param.key];
    localStorage.setItem(storageKeyForPanel(def.id), JSON.stringify(saved));
  } catch (e) {
    // Persistence is a convenience; rendering should still work if storage is unavailable.
  }
}

function buildControl(param, state, onChange) {
  const wrap = makeEl('label', { class: 'st-control' });
  const head = makeEl('div', { class: 'st-control-head' });
  const name = makeEl('span', { class: 'st-control-label' }, param.label);
  const val = makeEl('span', { class: 'st-control-value' });
  head.append(name, val);
  wrap.append(head);

  const fmt = (v) => (param.unit ? `${v} ${param.unit}` : `${v}`);

  if (param.type === 'range') {
    const input = makeEl('input', {
      type: 'range',
      min: param.min,
      max: param.max,
      step: param.step ?? 1,
    });
    input.value = state[param.key];
    val.textContent = fmt(input.value);
    input.addEventListener('input', () => {
      const n = Number(input.value);
      state[param.key] = n;
      val.textContent = fmt(n);
      onChange();
    });
    wrap.append(input);
    wrap._reset = () => {
      input.value = param.default;
      state[param.key] = param.default;
      val.textContent = fmt(param.default);
    };
  } else if (param.type === 'choice') {
    const select = makeEl('select');
    for (const c of param.choices) {
      const opt = makeEl('option', { value: c.value }, c.label);
      if (c.value === state[param.key]) opt.selected = true;
      select.append(opt);
    }
    val.textContent = '';
    select.addEventListener('change', () => {
      state[param.key] = select.value;
      onChange();
    });
    wrap.append(select);
    wrap._reset = () => {
      select.value = param.default;
      state[param.key] = param.default;
    };
  }
  return wrap;
}

function inlineStylesFor(svgEl) {
  // Snapshot computed styles into inline attributes so the exported file
  // looks the same standalone. We only carry properties an SVG cares about.
  const props = [
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'opacity', 'fill-opacity', 'stroke-opacity', 'font-family', 'font-size',
  ];
  const clone = svgEl.cloneNode(true);
  const srcNodes = svgEl.querySelectorAll('*');
  const dstNodes = clone.querySelectorAll('*');
  for (let i = 0; i < srcNodes.length; i++) {
    const cs = window.getComputedStyle(srcNodes[i]);
    const style = props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';');
    dstNodes[i].setAttribute('style', style);
  }
  clone.setAttribute('xmlns', SVG_NS);
  return clone;
}

function serializeSVG(svgEl) {
  const clone = inlineStylesFor(svgEl);
  return new XMLSerializer().serializeToString(clone);
}

function mountViewportControls(stage, svgEl) {
  const view = { scale: 1, x: 0, y: 0 };
  let drag = null;

  const apply = () => {
    svgEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  };
  const zoomAt = (factor, cx = stage.clientWidth / 2, cy = stage.clientHeight / 2) => {
    const next = clamp(view.scale * factor, 0.25, 12);
    const ratio = next / view.scale;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.scale = next;
    apply();
  };
  const reset = () => {
    view.scale = 1;
    view.x = 0;
    view.y = 0;
    apply();
  };

  svgEl.style.transformOrigin = '0 0';
  svgEl.style.willChange = 'transform';
  apply();

  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = stage.getBoundingClientRect();
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest?.('.control-point, .control-segment')) return;
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, baseX: view.x, baseY: view.y };
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-panning');
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    view.x = drag.baseX + event.clientX - drag.x;
    view.y = drag.baseY + event.clientY - drag.y;
    apply();
  });
  const endDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null;
    stage.classList.remove('is-panning');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  return {
    zoomIn() { zoomAt(1.18); },
    zoomOut() { zoomAt(1 / 1.18); },
    reset,
  };
}

export function mountControlPointLabels(svgEl) {
  for (const point of svgEl.querySelectorAll('.control-point')) {
    const label = point.querySelector('.control-point-label');
    const guide = point.querySelector('.control-point-guide');
    if (!label && !guide) continue;
    point.addEventListener('mouseenter', () => {
      if (label) label.style.opacity = '1';
      if (guide) guide.style.opacity = '1';
    });
    point.addEventListener('mouseleave', () => {
      if (label) label.style.opacity = '';
      if (guide) guide.style.opacity = '';
    });
  }
  for (const segment of svgEl.querySelectorAll('.control-segment')) {
    const label = segment.querySelector('.control-segment-label');
    const highlight = segment.querySelector('.control-segment-highlight');
    if (!label && !highlight) continue;
    segment.addEventListener('mouseenter', () => {
      if (label) label.style.opacity = '1';
      if (highlight) highlight.style.opacity = '1';
    });
    segment.addEventListener('mouseleave', () => {
      if (label) label.style.opacity = '';
      if (highlight) highlight.style.opacity = '';
    });
  }
}

function downloadText(name, mime, text) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = makeEl('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildPanelCard(def) {
  const state = loadPanelState(def);

  const card = makeEl('section', { class: 'st-panel', 'data-panel': def.id });
  const header = makeEl('header', { class: 'st-panel-header' });
  header.append(makeEl('h2', { class: 'st-panel-title' }, def.title));
  card.append(header);

  const stage = makeEl('div', { class: 'st-stage' });
  const svgEl = document.createElementNS(SVG_NS, 'svg');
  svgEl.setAttribute('viewBox', '0 0 200 240');
  svgEl.setAttribute('class', 'st-canvas');
  stage.append(svgEl);
  const viewport = mountViewportControls(stage, svgEl);

  const controls = makeEl('div', { class: 'st-controls' });
  const resetters = [];
  const rerender = () => {
    def.render(svgEl, state);
    savePanelState(def, state);
  };

  for (const p of def.params) {
    const ctrl = buildControl(p, state, rerender);
    controls.append(ctrl);
    resetters.push(ctrl._reset);
  }
  card.append(controls);
  card.append(stage);

  const actions = makeEl('div', { class: 'st-actions' });
  const reset = makeEl('button', { type: 'button' }, 'Reset');
  const zoomIn = makeEl('button', { type: 'button', title: 'Zoom in' }, '+');
  const zoomOut = makeEl('button', { type: 'button', title: 'Zoom out' }, '-');
  const resetView = makeEl('button', { type: 'button' }, 'Reset view');
  const copy = makeEl('button', { type: 'button' }, 'Copy SVG');
  const exp = makeEl('button', { type: 'button' }, 'Export SVG');
  reset.addEventListener('click', () => {
    for (const r of resetters) r && r();
    rerender();
  });
  zoomIn.addEventListener('click', () => viewport.zoomIn());
  zoomOut.addEventListener('click', () => viewport.zoomOut());
  resetView.addEventListener('click', () => viewport.reset());
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(serializeSVG(svgEl));
      copy.textContent = 'Copied';
      setTimeout(() => (copy.textContent = 'Copy SVG'), 900);
    } catch (e) {
      copy.textContent = 'Copy failed';
      setTimeout(() => (copy.textContent = 'Copy SVG'), 900);
    }
  });
  exp.addEventListener('click', () => {
    downloadText(`${def.id}.svg`, 'image/svg+xml', serializeSVG(svgEl));
  });
  actions.append(reset, zoomIn, zoomOut, resetView, copy, exp);
  card.append(actions);

  // Initial render.
  rerender();
  return card;
}

export function mountPanels(container) {
  container.innerHTML = '';
  for (const def of registry) {
    container.append(buildPanelCard(def));
  }
}

export function mountPanel(container, id) {
  container.innerHTML = '';
  const def = registry.find((panel) => panel.id === id);
  if (def) container.append(buildPanelCard(def));
}

export function mountThemeToggle(button) {
  const stored = localStorage.getItem('st-theme') || 'light';
  document.documentElement.setAttribute('data-theme', stored);
  const refresh = () => {
    const t = document.documentElement.getAttribute('data-theme');
    button.textContent = t === 'dark' ? 'Light theme' : 'Dark theme';
  };
  refresh();
  button.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('st-theme', next);
    refresh();
  });
}

// Small drawing helpers panels can share.
export const svg = {
  ns: SVG_NS,
  el(tag, attrs = {}) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  },
  clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  },
};
