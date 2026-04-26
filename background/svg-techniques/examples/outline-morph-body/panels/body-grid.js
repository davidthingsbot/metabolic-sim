// body-grid.js -- browser adapter for the age / sex / body-mass-index grid.

import { mountControlPointLabels, registerPanel } from '../framework.js';
import { buildBodyGridSvg, bodyGridParams } from './body-generator.js';

function drawGrid(svgEl, state) {
  const svgString = buildBodyGridSvg(state, { theme: 'cssvars' });
  const parsed = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const src = parsed.documentElement;

  for (const a of Array.from(src.attributes)) {
    if (a.name === 'xmlns') continue;
    svgEl.setAttribute(a.name, a.value);
  }

  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  while (src.firstChild) svgEl.appendChild(src.firstChild);
  mountControlPointLabels(svgEl);
}

registerPanel({
  id: 'body-grid-male',
  title: 'Male Body Grid',
  params: bodyGridParams,
  render(svgEl, state) {
    drawGrid(svgEl, { ...state, sex: 'male' });
  },
});

registerPanel({
  id: 'body-grid-female',
  title: 'Female Body Grid',
  params: bodyGridParams,
  render(svgEl, state) {
    drawGrid(svgEl, { ...state, sex: 'female' });
  },
});
