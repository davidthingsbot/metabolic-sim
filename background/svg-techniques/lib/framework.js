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
  const state = defaultsFor(def.params);

  const card = makeEl('section', { class: 'st-panel', 'data-panel': def.id });
  const header = makeEl('header', { class: 'st-panel-header' });
  header.append(makeEl('h2', { class: 'st-panel-title' }, def.title));
  card.append(header);

  const stage = makeEl('div', { class: 'st-stage' });
  const svgEl = document.createElementNS(SVG_NS, 'svg');
  svgEl.setAttribute('viewBox', '0 0 200 240');
  svgEl.setAttribute('class', 'st-canvas');
  stage.append(svgEl);

  const controls = makeEl('div', { class: 'st-controls' });
  const resetters = [];
  const rerender = () => def.render(svgEl, state);

  for (const p of def.params) {
    const ctrl = buildControl(p, state, rerender);
    controls.append(ctrl);
    resetters.push(ctrl._reset);
  }
  card.append(controls);
  card.append(stage);

  const actions = makeEl('div', { class: 'st-actions' });
  const reset = makeEl('button', { type: 'button' }, 'Reset');
  const copy = makeEl('button', { type: 'button' }, 'Copy SVG');
  const exp = makeEl('button', { type: 'button' }, 'Export SVG');
  reset.addEventListener('click', () => {
    for (const r of resetters) r && r();
    rerender();
  });
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
  actions.append(reset, copy, exp);
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
