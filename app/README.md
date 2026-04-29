# app/

The simulator itself — the static page that runs in the browser.

Currently a Phase 0 base page (Vite + TypeScript skeleton with light/dark mode toggle). The simulator engine and views begin in Phase 1; see `../design/plan.md`.

## Running locally

```sh
npm install
npm run dev      # http://localhost:5173/
```

## Production build

```sh
npm run build    # output → dist/
npm run preview  # serve dist/ to verify
```

Set `GITHUB_ACTIONS=true` to build with the `/metabolic-sim/` base path the Pages deployment uses; without it, the build assumes a root `/` base.

## Planned layout

```
app/
├── index.html
├── src/
│   ├── engine/      simulation core (pure, framework-free)
│   ├── views/       whole-body, fuel-flows, hormones, long-term, timeline, charts, multi-individual
│   ├── ui/          shared UI components, time control, scenario editor, food picker
│   ├── scenarios/   built-in scenarios as JSON
│   ├── foods/       food library — real foods with modeled composition
│   ├── history/     save/load, history buffer, recording export
│   ├── naming/      functional ↔ technical name dictionary
│   └── main.ts
└── public/          static assets, diagrams, favicon
```

## Tech baseline

TypeScript. Static site (no backend). Deployed via GitHub Pages. SVG for diagrams; Canvas for high-density particle animations. Web Workers for the simulation engine. **Preact** is the chosen reactive UI layer for the app shell and views. State persistence via IndexedDB; scenario sharing via URL fragments.

See `../design/design.md` Section 15 for the detailed technology rationale.

## Where to look first

- `../design/design.md` — the design.
- `../design/plan.md` — what to build now and what's next.
- `../background/` — the underlying science the engine simulates.
