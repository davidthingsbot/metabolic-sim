# AGENTS.md — app/

Guidelines for any agent writing or editing code in `app/`.

## Read first

- `../design/design.md` — what the simulator is and how its parts fit together.
- `../design/plan.md` — the current phase and what its "done when" criteria are. Don't build past the current phase unless the user asks.
- `../background/` — the science the engine simulates. The numbers and mechanisms come from these notes.

## Naming convention applies to source

The plain-language naming rule is not a UI-only thing. Source identifiers — types, variables, functions, file names — use functional names too. `BloodSugar`, not `Glucose`. `StorageHormone`, not `Insulin`. `SugarPolymerStoreLiver`, not `LiverGlycogen`.

The naming dictionary in `src/naming/` carries the mapping from functional name to technical / branded / chemical name for users who toggle the technical view.

## Tech choices that are fixed

- TypeScript.
- Static site, GitHub Pages compatible. No backend, no telemetry, no accounts.
- Web Workers for the simulation engine (one per body in multi-individual mode plus a coordinator).
- SVG for diagrams; Canvas for high-density particle animations.
- IndexedDB for save/load; URL fragments for scenario sharing.
- Light and dark modes both first-class.

## Tech choices that are open

- The reactive layer (Preact, lit, hand-rolled, or other small option). Pick on the first phase that genuinely needs it.
- The build tool (Vite, esbuild, or other). Pick on the first phase that needs a build.
- The exact set of visual styles beyond the default Anatomical style — see `../design/design.md` Section 14.

When you make one of these decisions, add a note to the change log in `../design/plan.md` so future-you remembers why.

## Engine purity

The simulation engine in `src/engine/` is pure functions where possible, mutable state only on the single state object. It must be runnable in Node for testing — no DOM, no browser globals, no Workers internally. The Worker wrapper sits outside the engine.

## Don't build past the plan

If you discover something the design doesn't decide, propose it (don't just decide it). The design has a deliberate "What This Document Does Not Decide" section — many open questions are open on purpose.

## Comments

Default to none. When the *why* is non-obvious — a hidden constraint, a workaround for a specific bug, a surprising invariant — add one short line. Don't write what the code already says.
