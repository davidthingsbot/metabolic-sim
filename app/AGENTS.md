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

- The build tool (Vite, esbuild, or other). Pick on the first phase that needs a build.
- The exact set of visual styles beyond the default Anatomical style — see `../design/design.md` Section 14.

When you make one of these decisions, add a note to the change log in `../design/plan.md` so future-you remembers why.

## Tech choices settled after the initial scaffold

- **Preact** is the chosen reactive layer for the app shell and upcoming views.

## Engine purity

The simulation engine in `src/engine/` is pure functions where possible, mutable state only on the single state object. It must be runnable in Node for testing — no DOM, no browser globals, no Workers internally. The Worker wrapper sits outside the engine.

## Test-driven development is required

All code in `src/` is written TDD: failing test first, implementation second. Per `design.md §15`:

- Engine code (substances, flows, hormones, conditions) — pure-function tests with deterministic inputs, asserting against the reference curves cited in `background/`.
- View code — component-level logic tests (state transitions, label-mode switching, bookmark toggle behaviour, time-control dispatch).
- Pixel-level visual regression is **not** part of the suite — the anatomical diagram is hand-tuned and brittleness there outweighs the catch rate.

Tests live alongside source files (`foo.ts` + `foo.test.ts`). The deploy workflow runs the full suite on every push; a red test blocks the deploy.

If you encounter code that is hard to test, refactor it before adding the next behaviour. Don't add to a test-resistant blob.

## Mobile-first

Build for the phone first (Compact density per `design.md §14`). The Single Hamburger scenario must run end-to-end on a 360 × 640 viewport before any code lands that depends on larger viewport size. Larger tiers *add* density on top — they do not reorganise the smaller layout.

## Layout stability across time

Positions on the screen are constant across time advance, view switch, density-tier change, and multi-individual cell layout (per `design.md §4`). Don't write code that reflows the layout when the clock ticks. Animated quantities — particle streams, fill levels, glow intensities — change in place; layout does not.

## Don't build past the plan

If you discover something the design doesn't decide, propose it (don't just decide it). The design has a deliberate "What This Document Does Not Decide" section — many open questions are open on purpose.

## Comments

Default to none. When the *why* is non-obvious — a hidden constraint, a workaround for a specific bug, a surprising invariant — add one short line. Don't write what the code already says.
