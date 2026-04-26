# test — svg-techniques example: parametric whole body

A single full-screen panel driving the parametric whole-body figure. This
example exists to support a tight self-improvement loop: the geometry lives in
a pure generator function, the same generator is callable from a Node CLI, and
the browser view shows the live result against parameter sliders.

## Parameters

- **Sex** — `male` | `female`
- **Age** — 1–90 years
- **Body fat fraction** — 5–50%

The geometry rules live in [`panels/body-generator.js`](./panels/body-generator.js).
That file has no DOM dependencies and is the canonical place to iterate on the
figure. `panels/body.js` is a thin browser adapter that calls the generator
and pipes the SVG string into the framework's panel.

## Two ways to run it

**Browser, full-screen, theme-flippable:**

```sh
cd background/svg-techniques/examples/test
python3 -m http.server 8000
# open http://localhost:8000/
```

ES-module imports cannot be loaded from `file://` in most browsers, so a
trivial static server is required.

**Standalone CLI, emits an SVG file:**

```sh
node generate-body.js --sex F --age 35 --bodyFat 28 --out /tmp/body.svg
node generate-body.js --sex M --age 75 --bodyFat 12 --theme dark --out /tmp/old-dark.svg
node generate-body.js --help
```

The CLI is the loop entry-point. Generate, rasterize/critique/diff, edit
`panels/body-generator.js`, generate again. No browser needed.

## What this example proves

- Sliders re-render the SVG live with no flicker.
- The header theme toggle flips light/dark and survives reload.
- Export SVG / Copy SVG / Reset all work.
- The same generator code produces the browser view and the standalone SVG —
  no risk of the two paths diverging.

## What is deliberately rough

The body shapes are primitives — ellipse head, trapezoid torso, rectangle
limbs. The mapping from parameters to geometry is naive. Refining the figure
is the point of the loop.
