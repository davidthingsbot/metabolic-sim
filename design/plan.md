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

---

## Phase 0 — Repository, Pages, and base page

**Status:** 🟡 In progress — local scaffold up; GitHub-side steps pending user

**Done so far:**
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

**Status:** 🟡 In progress — first-phase surface sweep complete; deep dives pending

A scan of what already exists in the space, so we know whether we are duplicating something, where to borrow ideas, and what distinguishes our project. Lives in `background/prior-art/`.

**Concrete steps:**

1. **First-phase surface sweep.** ✅ ~36 candidates catalogued across 9 categories (metabolic simulators, anatomical visualisation, health/nutrition apps with modelling, educational physiology software, open-source projects, research-grade engines, game-style body sims, CGM tools, pure-web body visualisations). Index at `background/prior-art/README.md`. *Caveat: WebSearch/WebFetch unavailable when the sweep ran; URLs and pricing should be re-verified before the deep dives.*
2. **Re-verify the surface sweep with live web access.** Confirm URLs, pricing, alive-vs-dead, and last-update signals for each entry. Update the README.
3. **Deep dives on the 🔍 entries.** One file per candidate in `background/prior-art/`:
   - `vmh.md` — Virtual Metabolic Human / Recon3D
   - `hummod.md` — HumMod whole-body physiology engine
   - `biodigital-human.md` — interactive 3D anatomy benchmark
   - `visible-body.md` — education-software distribution model
   - `levels.md` — consumer-facing "see what food does" framing
   - `physioex.md` — closest direct competitor in browser-based physiology teaching
   Plus possibly **PhET** as a cultural / UX benchmark even though it doesn't compete on content.
4. **For each deep dive:** screenshots, what they do well, what they do badly, what to borrow, what to avoid, and how their decisions inform ours. Capture pricing and licensing carefully — these affect whether our project is *complementary* to or *competing with* a candidate.
5. **Synthesis pass.** A short note (`background/prior-art/synthesis.md` or similar) summarising:
   - Validated gaps in the space (the surface sweep flagged five — disease-as-starting-condition, multi-individual side-by-side, single-meal-to-multi-year in one engine, plain-language-over-real-engine, free-browser-with-PhET-polish).
   - Concrete UX/feature ideas worth borrowing.
   - Anything we should consider revising in the design as a result.
6. **Design feedback.** Where the synthesis surfaces a real change to make, propose specific edits to `design.md` and apply on approval.

**Done when:**

- Each 🔍 candidate has its own page with screenshots and a "borrow / avoid" section.
- The synthesis note exists and either confirms the design's distinct angle or proposes specific design changes.
- The user has signed off on the resulting design changes (or confirmed there are none).

---

## Phase 1 — Engine skeleton

**Status:** ⬜ Not started

Substances, locations, one substance flow (blood glucose), one hormone (insulin), eating one meal, time advancing. No UI — Node test harness only.

**Done when:** A Node script can simulate one body eating one meal, with blood glucose rising and falling correctly over the following hours, against the curves described in `background/metabolic-pathways.md`.

---

## Phase 2 — Whole Body view (Anatomical style, all density levels)

**Status:** ⬜ Not started

Static SVG schematic with one quantity (blood glucose) animated. Time controls. Responsive density levels (Compact, Standard, Detailed, Spacious) baked in from the start so the layout is never retrofitted. One scenario (Single Hamburger).

**Done when:** A user can load the page on a phone and on a 4K monitor, see the body schematic at appropriate density on each, hit play, and watch blood glucose respond to a hamburger across the visible organs.

---

## Phase 3 — Full fuel handling and food library

**Status:** ⬜ Not started

All substances and hormones from `background/metabolic-pathways.md`. Eating, fasting, sleeping. The food library (per `background/foods-library.md`) and meal-assembly UI with familiar units, cooked-vs-uncooked variants, composite foods, and cocktails. The Single Hamburger and Healthy Baseline scenarios run convincingly.

**Done when:** A user can build a real meal from the library — picking foods in familiar units — and watch the body process it across all tracked substances.

---

## Phase 4 — Exercise, recovery, and the Fuel Flows view

**Status:** ⬜ Not started

Exercise as a calendar event affecting all the right flows, with the recovery dynamics that follow it (post-exercise refilling, micro-damage repair, multi-week adaptation, recovery debt under chronic overload). Fuel Flows view added. Endurance Athlete scenario.

**Done when:** A user can schedule a week of training, watch fuel selection shift through each session, see refilling and adaptation between sessions, and see overtraining emerge from inadequate recovery.

---

## Phase 5 — Save, load, and history

**Status:** ⬜ Not started

Full state save/load (IndexedDB and JSON file). History buffer with progressive compression. Backward play. Event log. Timeline scrubber.

**Done when:** A user can save mid-run, load later, scrub backwards through any past moment, and see every event in the log.

---

## Phase 6 — Long-term effects, Health, and aging

**Status:** ⬜ Not started

Tissue remodeling, body composition, muscle mass and tone, vessel wall health, per-organ Health scores with feedback into rate constants, visible aging cues. Long-Term State view including the stylized health diagrams (blood vessel cross-section, bone density, body shape silhouette, liver, muscle, lung, skin). Years of Fast Food and Aging Well scenarios.

**Done when:** A user can watch a healthy 20-year-old's body shift visibly over ten simulated years under different lifestyles, with each per-organ Health score affecting the engine's behaviour.

---

## Phase 7 — Foreign substances: alcohol, tobacco, medications, recreational drugs

**Status:** ⬜ Not started

Foreign Substance table added to the engine. Beverage and drug libraries. Acute and chronic effects propagated through hormones, organs, and Health. A Night Out and Twenty Years of Smoking scenarios.

**Done when:** Both scenarios run with effects propagating across systems, and a user can compare twenty years of smoking against the same body that quits at year ten.

---

## Phase 8 — Multiple individuals

**Status:** ⬜ Not started

Multi-worker engine, side-by-side view, shared and per-individual calendars. Comparing Different Individuals and Comparing Lifestyles scenarios.

**Done when:** A user can run two to six bodies side by side on the same clock and see them diverge.

---

## Phase 9 — Life stages and From Birth

**Status:** ⬜ Not started

Age-dependent engine parameters, life-stage transitions and labelling, age-gating in the event editor, the From Birth scenario.

**Done when:** The From Birth scenario runs cleanly through life stages with appropriate parameter shifts at each transition.

---

## Phase 10 — Recordings, Hormones view, charts, alternative visual styles, scenario sharing

**Status:** ⬜ Not started

Recording export (WebM and frame-sequence ZIP). Additional visual styles added alongside the default — exact set decided by design research conducted during this phase. Polish, snapshots, dark mode tuning, unsettled-science flags wired up.

**Done when:** A user can export a video clip of any segment of any scenario, switch between visual styles, share scenarios via URL, and see unsettled-science flags throughout.

---

## Phase 11 — Onboarding and documentation

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

- *(no entries yet)*
