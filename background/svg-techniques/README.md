# SVG Techniques

Exploratory series of programmatic SVG illustration experiments for the simulator's anatomy. Sibling of `background/visualization-ideas/` — visualization-ideas is mood-board research (generated images, mockups), this folder is *code* research (parametric SVG written by hand, driven by sliders, opening in a browser).

Nothing here is a commitment. Each experiment is a single self-contained HTML page that answers one question — *Can a parametric vessel cross-section read at the §14 Compact tier? What's the simplest body silhouette that responds usefully to age, sex, and body-fat fraction? How small can a fractal lung get before the bronchial tree turns to mush?* The simulator's actual SVG anatomy in `app/` will draw on what works here.

For visual mood research and printed-style references see `background/visualization-ideas/` and the static reference SVGs collected in `background/svg-illustrations/`. A parallel research note covering hand-drawn / pre-built SVG sources is expected to land at `background/svg-illustrations.md` and the present folder will reference it once it exists.

## Folder layout

```
svg-techniques/
  README.md            — this file
  AGENTS.md            — guidelines for agents adding experiments
  package.json         — `{"type":"module"}` so .js files run as ESM under Node
  lib/                 — canonical library: framework + reusable generators
    framework.js          browser-only: panel registry, sliders, theme, export
    framework.css         base styles, light/dark vars, full-screen layout
    panels/
      body-generator.js   pure SVG-string generator (browser + Node)
      body.js             thin browser adapter — registers the panel
    generate-body.js      Node CLI wrapper around body-generator.js
  examples/
    test/              — first example: parametric whole-body, full-screen
```

## The lib/example workflow (Option A: forked copies)

We use **copies, not shared imports**. Each example folder is a standalone bundle: the example's `index.html` imports `./framework.js`, `./framework.css`, and `./panels/<name>.js` from inside its own directory. Nothing reaches up into `../../lib/`.

This is deliberate. Experiments need to diverge fearlessly — tearing out the framework, hardcoding a one-off shader, replacing the panel registry with something experimental — without breaking other examples. The forked copy makes that safe.

Improvements flow back to `lib/` by hand, with a diff in front of you so the change is intentional. The lib is the canonical home; examples are tributaries that occasionally feed back upstream.

### Creating a new experiment

```sh
cp -r lib examples/<name> && cp examples/test/index.html examples/<name>/index.html
```

Then edit `examples/<name>/index.html` and the panels inside `examples/<name>/panels/`. Add a short `README.md` to the new example folder describing the question it explores and what it tries differently.

### Promoting an improvement back to the lib

When an example's panel or framework change is worth keeping for everyone, diff it against `lib/` and apply the parts that generalise. Note the source experiment in a top-of-file comment.

## Running an example locally

ES modules don't load from `file://` in most browsers — you'll see a CORS-style error. Run a trivial static server from the example folder:

```sh
cd examples/test
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static server works (`npx serve`, `php -S`, etc.). There is **no build step**, no package.json, no npm. That's by design — this is research scaffold, not a deployable app.

## What the framework does

`framework.js` exposes a minimal API the panels build on:

- `registerPanel({ id, title, params, render })` — `params` is `[{ key, label, type: 'range'|'choice', min, max, step, choices, default, unit }, ...]`. `render(svgEl, state)` clears and redraws on every parameter change.
- `mountPanels(container)` — builds a card per registered panel: title, controls, an SVG canvas, and Reset / Copy SVG / Export SVG buttons.
- `mountThemeToggle(button)` — flips `data-theme` on `<html>` and persists the choice to `localStorage`. CSS variables in `framework.css` flip everything that needs to flip.
- A small `svg` helper for creating namespaced elements and clearing nodes.
- A full-screen single-panel layout: add `class="st-full"` to `<body>` and `class="st-page st-page--full"` to the page wrapper, and the panel fills the viewport (controls and actions in a 260-px sidebar, SVG canvas in the rest).

The framework is intentionally under ~200 lines. Readability beats features. If an experiment outgrows it, fork it.

## Pure generators + CLI wrappers

Each parametric subject (currently just the body) is split into two files:

- **`panels/<subject>-generator.js`** — a pure function that takes a parameter dict and returns a full SVG document string. **No DOM, no framework imports.** Runs in Node and in the browser. This is the canonical place to iterate on the geometry.
- **`panels/<subject>.js`** — a tiny browser adapter that imports the generator, registers a panel with the framework, and pipes the generator's output into the live SVG node.

Plus a CLI wrapper at the lib root (`generate-<subject>.js`) so the same generator can run standalone:

```sh
node lib/generate-body.js --sex F --age 35 --bodyFat 28 --out /tmp/body.svg
node lib/generate-body.js --help
```

This pairing exists to support tight self-improvement loops: generate an SVG, rasterize/diff/critique it, edit the generator file, regenerate. The CLI wrapper has no browser dependency, so the loop runs at shell speed. The browser view is just a second consumer of the same generator — no risk of the two paths drifting.

When you add a new subject, follow the same split: pure generator, browser panel adapter, CLI wrapper.

## Naming and units

Match the project. Code, panel ids, and parameter keys use camelCase scientific-derived names (`bodyFat`, `plaqueThickness`, `tidalVolumeFraction`, `boneDensity`). UI labels visible to the user use plain functional names where the project's glossary (`design/glossary.md`) provides one, and plain English elsewhere. Metric units. No acronyms in UI labels.

## Where to look for inspiration

- `background/svg-illustrations/` — collected static reference SVGs (anatomogram, bioicons, Servier, Wikimedia, Reactome).
- `background/svg-illustrations.md` — *forthcoming* research note on SVG sources, drawing techniques, and licensing.
- `background/visualization-ideas/` — mood-board series. The `controls/` series in particular sketches the "programmable 2D body" direction this folder operationalises.
- `design/design.md` §4 (What Is Visible), §14 (Look and Feel) — what the app's anatomical schematic eventually has to land.
