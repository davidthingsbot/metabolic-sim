# Build Plan

The phases below order the work. Each phase ends in something runnable. The design itself lives in `design.md`; this file is the *when* and the *current state*.

This file is living. Update the status markers as work moves forward. Update the dates and notes when phases start, finish, or shift.

---

## Status legend

- ⬜ Not started
- 🟡 In progress
- ✅ Done
- 🔵 Blocked (with note)

---

## Research

Research feeding the design lives in `background/`. The current research index with completion status is in `background/README.md`. Research is dispatched in tiers that align with the phasing below — Tier N's results inform Phase N (roughly).

When a research note returns and contains design-relevant decisions, those are surfaced for review and merged into `design.md` before the affected phase begins.

## Discipline that applies to every code-writing phase

- **Test-driven development.** All engine and view code starts with a failing test (per `design.md §15`). Tests live alongside source. CI runs the suite on every push; red blocks deploy.
- **Mobile-first.** Compact density (≤640 px) is the baseline that every phase ships first; larger tiers add density without reorganising (per `design.md §14`).
- **Layout stability.** Positions on the screen are constant across time, views, density tiers, and multi-individual cells (per `design.md §4`).

---

## Phase 0 — Repository, Pages, and base page

**Status:** ✅ Done — live at https://davidthingsbot.github.io/metabolic-sim/

**Delivered:**
- Vite 7 + TypeScript 5 scaffold under `app/` (no framework — added in Phase 2 only when needed).
- `npm install`, `npm run dev` (localhost:5173) and `npm run build` all working locally.
- Base page renders: project title, lede, "coming soon" placeholder, light/dark mode toggle (preference stored in localStorage; respects system preference on first load).
- `vite.config.ts` flips base path between `/` (local) and `/metabolic-sim/` (Pages) via the `GITHUB_ACTIONS` env var. Verified the prod-build asset URLs prefix correctly.
- `.github/workflows/deploy.yml` configured to build under `app/` and deploy via `actions/deploy-pages` (modern Pages source, no `gh-pages` branch).
- `.gitignore` covers `node_modules/`, `dist/`, `.vite/`, OS junk, and `.claude/settings.local.json`.
- Root `README.md` and `app/README.md` updated with run-locally and deployment instructions.
- `git init` ran; nothing committed yet.

**Pending — user actions:**
1. Create the GitHub repository (`metabolic-sim` is the assumed name; rename here and in `vite.config.ts` if different).
2. First commit + push to `main`.
3. In repo settings → Pages → set source to "GitHub Actions".
4. Watch the first deploy run green; visit `https://<user>.github.io/metabolic-sim/`.

**Done when:**

- A first-time visitor can open `https://<user>.github.io/metabolic-sim/` and see the base page rendered correctly with no broken assets.
- A new contributor can clone, `cd app && npm install && npm run dev`, and see the same base page locally.
- The deployment workflow runs green on the next push.

---

(Original step-by-step plan kept below for reference; "done so far" supersedes it.)

Stand up the website infrastructure before any simulation work begins. Choose the initial technology stack, create the GitHub repository, get an empty page deploying to GitHub Pages from the main branch, and verify the same build runs locally for development.

**Concrete steps:**

1. **Tech stack decisions** — pick and record in this file's change log:
   - Build tool — Vite is the default unless the user has a preference (fast HMR, first-class TypeScript, simple `base` config for subdirectory deployment).
   - Framework — start with no framework. A small reactive layer (Preact, lit, or hand-rolled) gets added in Phase 2 only when the first view actually needs it.
   - Language — TypeScript (strict mode).
   - Package manager — npm (broadest compatibility) unless the user prefers pnpm or bun.
2. **Repository** — create the GitHub repository (default name `metabolic-sim`). Initialize git locally; first commit includes the existing `README.md`, `AGENTS.md`, `design/`, `background/`, and an empty `app/` skeleton. Push.
3. **Base path configuration** — GitHub Pages serves the project at `https://<user>.github.io/metabolic-sim/`, but local dev expects `/`. Configure the build so the same code works in both:
   - Vite: `base: process.env.GITHUB_ACTIONS ? '/metabolic-sim/' : '/'` in `vite.config.ts`.
   - All asset URLs reference `import.meta.env.BASE_URL` — never hardcode `/`.
   - Internal navigation, if any, prefixes `BASE_URL` too.
4. **Base page** — `app/index.html` plus a minimal `app/src/main.ts` that renders the project title, a one-sentence description, light/dark mode toggle, and a "coming soon" placeholder for the simulator. Visual style is the v1 default (Anatomical-leaning); empty otherwise.
5. **GitHub Actions workflow** — `.github/workflows/deploy.yml` that:
   - triggers on push to `main`,
   - runs `npm ci` and `npm run build` from the `app/` directory,
   - deploys the `app/dist/` output to GitHub Pages using `actions/deploy-pages`.
6. **Pages settings** — enable Pages on the repo, source = "GitHub Actions".
7. **Verify both surfaces** — `npm run dev` from `app/` shows the base page locally at `http://localhost:5173/` (or whatever Vite picks); the GitHub Pages URL shows the same base page after the workflow completes.
8. **README updates** — root `README.md` gets a "Running locally" and "Deployment" section pointing at the dev server command and the live URL. `app/README.md` gets the build commands.

**Done when:**

- A first-time visitor can open `https://<user>.github.io/metabolic-sim/` and see the base page rendered correctly with no broken assets.
- A new contributor can clone, `cd app && npm install && npm run dev`, and see the same base page locally.
- The deployment workflow runs green on the next push.

**Watch out for:**

- Forgetting `BASE_URL` in even one asset path — it will work locally and 404 on Pages.
- Using `pages-build-deployment` instead of the modern `actions/deploy-pages` — the modern flow is more reliable and supports the official "GitHub Actions" Pages source.
- Setting up Pages from the legacy `gh-pages` branch — the modern Actions-based flow does not need a separate branch.

---

## Phase 0.5 — Prior art assessment

**Status:** 🟡 In progress — surface sweep ✅, web-verification ✅, deep dives running, synthesis pending

A scan of what already exists in the space, so we know whether we are duplicating something, where to borrow ideas, and what distinguishes our project. Lives in `background/prior-art/`.

**Concrete steps:**

1. ✅ **First-phase surface sweep.** ~36 candidates catalogued across 9 categories. Index at `background/prior-art/README.md`.
2. ✅ **Re-verify the surface sweep with live web access.** ~33 entries verified, ~14 materially updated, 2 marked 🔵 (could not verify), 1 reclassified ❌ (Veri — acquired by Oura, app sunset end of 2024), 6 new entries added. Notable changes captured in the README's Verification log. Five of six 🔍 candidates have images saved under `images/`.
3. 🟡 **Deep dives on the 🔍 entries** (sub-agent running). One file per candidate in `background/prior-art/`:
   - `vmh.md` — Virtual Metabolic Human / Recon3D
   - `hummod.md` — HumMod whole-body physiology engine
   - `biodigital-human.md` — interactive 3D anatomy benchmark
   - `visible-body.md` — education-software distribution model
   - `levels.md` — consumer-facing "see what food does" framing
   - `physioex.md` — closest direct competitor in browser-based physiology teaching
4. 🟡 **For each deep dive** (in progress with step 3): what they do well, what they do badly, what to borrow, what to avoid, how their decisions inform ours, screenshots where useful. Bias toward concrete UX/architecture lessons over encyclopaedic summary.
5. ⬜ **Synthesis pass** — `background/prior-art/synthesis.md`. Will consolidate validated gaps, UX patterns worth borrowing, anti-patterns to avoid, and which deferred decisions in `design.md §17` prior art can now inform.
6. ⬜ **Design feedback.** Synthesis will end with 5–10 concrete proposed edits to `design.md`. The user reviews and approves before any change lands. Sub-agents do not modify `design.md` directly.

**Done when:**

- Each 🔍 candidate has its own page with screenshots and a "borrow / avoid" section.
- The synthesis note exists and either confirms the design's distinct angle or proposes specific design changes.
- The user has signed off on the resulting design changes (or confirmed there are none).

---

## Phase 1 — Engine skeleton

**Status:** ✅ Done

Substances, locations, one substance flow (blood glucose), one hormone (insulin), eating one meal, time advancing. No UI — Node test harness only.

**Delivered:**
- TDD discipline established with vitest. CI runs `npm test` before `npm run build`; red blocks deploy.
- Engine state types (`State`, `Substance`, `Location`, `Hormone`) — minimal v1 set: glucose across `gut` / `blood` / `cells`, insulin in bloodstream.
- `step(state, dt)` composes three flows: digestion (gut → blood, first-order), insulinResponse (lagged target with 15-min time constant), cellularUptake (blood → cells, gated by insulin × glucose excess).
- Meal event applied via `applyEvent(state, event)`; Phase 5 wires the event queue into `step` itself.
- 26 passing tests across 5 test files. Each numerical constant carries an `@provenance` comment per design.md §11.
- End-to-end acceptance test: 50 g meal, 4-hour simulation, asserts the qualitative shape (rises, peaks mid-run, returns toward fasting, mass conserved).

**Carry-forward to Phase 3:**
- Calibrate constants against reference postprandial curves: `DIGESTION_RATE_PER_MINUTE`, `INSULIN_GAIN_UU_PER_G`, `INSULIN_TIME_CONSTANT_MIN`, `CELLULAR_UPTAKE_K`.
- Replace the linear insulin target with a sigmoidal first-phase + tonic model.
- Tighten the peak-time bound on the end-to-end test to 30–60 minutes once calibration lands.

---

## Phase 2 — Simulation shell, persisted runs, and first state/event view

**Status:** ⬜ Not started

Build the first real app implementation around the existing Phase 1 engine. This phase lands the mobile-first shell: **Sim Bar** (run selector, play/pause, reset, speed, resolution, scrub line), **Viewer Bar** (label mode and time-window controls), an **Events / State** main layout, named runs, browser persistence, and replayable history. The Events side includes the first schedule editor and event log, organised into **daily / alternating-days / weekly** cycle lanes with an event-detail editor below. The State side is instrument-panel style rather than anatomical — key locations with instantaneous quantity bars and small past-value charts. The data model is multi-individual-ready even though the first UI exposes one body. Meal events affect physiology immediately; the event schema and scheduling model for sleep and exercise also land here so later phases can deepen their effects without rewriting the shell.

**Done when:** On a 360 × 640 phone, a user can create a named run, schedule at least a meal into a visible cycle lane, start and stop the simulation, scrub through recorded history in the same viewer, branch a new future from a historical moment, close the browser, and return to the same run where they left off.

---

## Phase 3 — Whole Body view (Anatomical style, mobile first)

**Status:** ⬜ Not started

Add the first anatomical Whole Body view on top of the Phase 2 shell. Static SVG schematic with one quantity (blood glucose) animated, using the already-landed Sim Bar, Viewer Bar, history, and persistence model. **Compact (≤640 px) is built first end-to-end** — the Single Hamburger scenario must run to completion on a 360 × 640 phone before any larger tier is considered. Standard / Detailed / Spacious tiers add density on top of the Compact baseline; they never reorganise it. Layout positions are constant across time and density transitions (Section 4).

**Done when:** A user can load the page on a phone, stay inside the persisted-run shell from Phase 2, and watch blood glucose respond to a hamburger across the visible organs end-to-end without horizontal scroll. Larger viewports add detail without changing position.

---

## Phase 4 — Full fuel handling and food library

**Status:** ⬜ Not started

All substances and hormones from `background/metabolic-pathways.md`. Eating, fasting, sleeping. The food library (per `background/foods-library.md`) and meal-assembly UI with familiar units, cooked-vs-uncooked variants, composite foods, and cocktails. The Single Hamburger and Healthy Baseline scenarios run convincingly inside the shell established in Phase 2.

**Done when:** A user can build a real meal from the library — picking foods in familiar units — and watch the body process it across all tracked substances.

---

## Phase 5 — Exercise, recovery, and the Fuel Flows view

**Status:** ⬜ Not started

Exercise as a calendar event affecting all the right flows, with the recovery dynamics that follow it (post-exercise refilling, micro-damage repair, multi-week adaptation, recovery debt under chronic overload). Fuel Flows view added. Endurance Athlete scenario.

**Done when:** A user can schedule a week of training, watch fuel selection shift through each session, see refilling and adaptation between sessions, and see overtraining emerge from inadequate recovery.

---

## Phase 6 — Advanced history, branching UX, and timeline polish

**Status:** ⬜ Not started

Take the Phase 2 persistence/history foundation to full v1 depth: progressive history compression, richer branch management for alternative futures, stronger event-log browsing, jump-to-event polish, explicit bookmark workflows, and JSON import/export around named runs. The shell already supports replay and resume; this phase makes the long-run and many-run experience durable and comfortable.

**Done when:** A user can manage several named runs, inspect alternative futures cleanly, keep long simulations without storage pain, and move through history and event logs fluidly.

---

## Phase 7 — Long-term effects, Health, and aging

**Status:** ⬜ Not started

Tissue remodeling, body composition, muscle mass and tone, vessel wall health, per-organ Health scores with feedback into rate constants, visible aging cues. Long-Term State view including the stylized health diagrams (blood vessel cross-section, bone density, body shape silhouette, liver, muscle, lung, skin). Years of Fast Food and Aging Well scenarios.

**Done when:** A user can watch a healthy 20-year-old's body shift visibly over ten simulated years under different lifestyles, with each per-organ Health score affecting the engine's behaviour.

---

## Phase 8 — Foreign substances: alcohol, tobacco, medications, recreational drugs

**Status:** ⬜ Not started

Foreign Substance table added to the engine. Beverage and drug libraries. Acute and chronic effects propagated through hormones, organs, and Health. A Night Out and Twenty Years of Smoking scenarios.

**Done when:** Both scenarios run with effects propagating across systems, and a user can compare twenty years of smoking against the same body that quits at year ten.

---

## Phase 9 — Multiple individuals

**Status:** ⬜ Not started

Expose the multi-worker, multi-individual model the shell has carried from Phase 2. Side-by-side view, shared and per-individual calendars, and overlaid charts. Comparing Different Individuals and Comparing Lifestyles scenarios.

**Done when:** A user can run two to six bodies side by side on the same clock and see them diverge.

---

## Phase 10 — Life stages and From Birth

**Status:** ⬜ Not started

Age-dependent engine parameters, life-stage transitions and labelling, age-gating in the event editor, the From Birth scenario.

**Done when:** The From Birth scenario runs cleanly through life stages with appropriate parameter shifts at each transition.

---

## Phase 11 — Recordings, Hormones view, charts, alternative visual styles, scenario sharing

**Status:** ⬜ Not started

Recording export (WebM and frame-sequence ZIP). Additional visual styles added alongside the default — exact set decided by design research conducted during this phase. Polish, snapshots, dark mode tuning, unsettled-science flags wired up.

**Done when:** A user can export a video clip of any segment of any scenario, switch between visual styles, share scenarios via URL, and see unsettled-science flags throughout.

---

## Phase 12 — Onboarding and documentation

**Status:** ⬜ Not started

First-run walkthrough; README expanded; published to GitHub Pages.

**Done when:** A first-time visitor can land on the GitHub Pages site, follow a walkthrough, and reach the Single Hamburger scenario without external help.

---

## Post-v1 (deferred, tracked for future)

These are described in `design.md` but are not in v1's path:

- **Specialized views** — Fat Metabolism, Blood, Liver, Hormone (high-resolution), Brain, Bones, Lymph. Each replaces the Whole Body view for users drilling into one subsystem.
- **Kids view** — simplified, more abstracted, more cartoon-like presentation layer over the same engine. Even simpler naming, fewer numbers, stronger animations.
- **Pregnancy and menopause** — life-stage extensions that the v1 sex-hormone scaffolding leaves room for.
- **More scenarios, more foods, more drugs** — the libraries grow indefinitely; the structural work is in v1.

---

## Phase changes log

Track substantive changes to the plan here so future-you can see why the order shifted.

- 2026-04-29 — Inserted a new **Phase 2 — Simulation shell, persisted runs, and first state/event view** ahead of the anatomical Whole Body work. Reason: the first app implementation needs a durable mobile-first run shell (Sim Bar, Viewer Bar, history, persistence, event scheduling, and branching replay) before the anatomical rendering layer lands. Renumbered later phases accordingly and narrowed the later history phase to advanced compression / branching / timeline polish rather than first delivery of save-load itself.
