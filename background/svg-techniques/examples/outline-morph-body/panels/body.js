// body.js — browser adapter for the parametric whole-body figure.
//
// All geometry lives in `body-generator.js`. This file only registers the
// panel with the framework and renders the generator's output into a live
// SVG node so that theme changes (CSS custom properties) flow through.
//
// To iterate on the figure itself, edit body-generator.js.

import { mountControlPointLabels, registerPanel } from '../framework.js';
import { buildBodySvg, bodyParams } from './body-generator.js';

function draw(svgEl, state) {
  const svgString = buildBodySvg(state, { theme: 'cssvars' });
  const parsed = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const src = parsed.documentElement;

  // Mirror viewBox + any other attrs from the freshly built doc.
  for (const a of Array.from(src.attributes)) {
    if (a.name === 'xmlns') continue; // already on the live node
    svgEl.setAttribute(a.name, a.value);
  }

  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  while (src.firstChild)   svgEl.appendChild(src.firstChild);
  mountControlPointLabels(svgEl);
}

registerPanel({
  id: 'body',
  title: 'Whole Body',
  params: bodyParams,
  render: draw,
});
