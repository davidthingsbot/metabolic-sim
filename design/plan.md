# Build Plan

`design.md` is the stable **what**. This file is the living **when** and **current state**.

Update this file when a phase starts, finishes, changes order, or when its acceptance criteria change. Keep completed detail brief; the git history and tests carry the exhaustive record.

---

## Status legend

- ⬜ Not started
- 🟡 In progress
- ✅ Done
- 🔵 Blocked

---

## Current checkpoint — 2026-05-01

**App:** live on GitHub Pages at https://davidthingsbot.github.io/metabolic-sim/.

**Repository state:** local `main` is one commit ahead of `origin/main`:

- Latest pushed app commit: `79f0964 feat: add playback speed and sparkline controls`
- Local-only ops commit: `8155d0f ci: update GitHub Pages workflow runtime`

The local-only commit updates the GitHub Pages workflow to Node 24 and newer GitHub Actions majors. It is ready, but pushing it is blocked until the GitHub token used by this environment has `workflow` scope.

**Validation at the latest local checkpoint:**

- `npm test` passed: 20 test files, 111 tests.
- `npm run build` succeeded.
- `git diff --check` was clean.

**Local development access:** the Vite server supports LAN access when run with `npm run dev -- --host 0.0.0.0`. The project also allows the machine-name host `dw-x1pro-linux` in `app/vite.config.ts`.

---

## Discipline that applies to every code-writing phase

- **Test-driven development.** Engine and view code starts with a failing test. Tests live alongside source. CI runs the suite before deploy.
- **Mobile-first.** Compact density, especially 360 × 640, is the baseline. Larger tiers add density without reorganising.
- **Layout stability.** Screen positions stay stable across time advancement, view switching, density tiers, and future multi-individual layouts.
- **Metric units and glossary naming.** Use `design/glossary.md` for stable variable/scientific/plain naming.
- **Static app.** No backend, accounts, telemetry, or live data dependency.

---

## Research track

Research feeding the design lives in `background/`. The prior-art survey and Phase 0.5 deep dives live in `background/prior-art/`.

**Current status:** ✅ prior-art sweep, verification, six deep dives, and synthesis are complete. The synthesis includes proposed `design.md` edits for separate review; design changes should still be applied deliberately, not auto-merged from research.

---

## Phase 0 — Repository, Pages, and base page

**Status:** ✅ Done

Stand up the website infrastructure before simulation work begins.

**Delivered:**

- Vite + TypeScript static app under `app/`.
- GitHub repository and `main` branch workflow.
- GitHub Pages deployment from `.github/workflows/deploy.yml`.
- Local dev, build, and test commands documented.
- Base page replaced by the real app shell in later phases.
- Light/dark mode infrastructure.
- GitHub Pages live URL verified.

**Operational note:** the workflow currently deployed on `origin/main` still uses the older workflow runtime. A local commit updates it to Node 24 and newer Pages actions, but push is blocked by token scope until the active PAT includes `workflow`.

**Done when:**

- A first-time visitor can open the Pages URL and see the app with no broken assets.
- A contributor can clone, `cd app && npm install && npm run dev`, and run locally.
- The deployment workflow runs green on push.

---

## Phase 0.5 — Prior art assessment

**Status:** ✅ Done

Understand the landscape before locking down product and visual decisions.

**Delivered:**

- Surface survey of roughly 40+ relevant products, research systems, and educational tools.
- Live verification pass with pricing/status/platform corrections.
- Deep dives for:
  - Virtual Metabolic Human / Recon3D
  - HumMod
  - BioDigital Human
  - Visible Body
  - Levels
  - PhysioEx
- Synthesis at `background/prior-art/synthesis.md` covering gaps, borrow/avoid lessons, and proposed design edits.

**Carry-forward:** review the synthesis proposals before major edits to `design.md` or before committing to the anatomical/body-view visual direction.

---

## Phase 1 — Engine skeleton

**Status:** ✅ Done

Substances, locations, one substance flow, one hormone response, eating one meal, and time advancing. Node/Vitest harness only at first; later phases wire it into the app shell.

**Delivered:**

- Strict TypeScript engine state types for the v1 glucose/insulin skeleton.
- `step(state, dt)` with digestion, insulin response, and cellular uptake flows.
- Meal-event application.
- Qualitative end-to-end meal-response test.
- Provenance comments on numerical constants.
- CI test gate established.

**Carry-forward:** calibrate constants against reference postprandial curves before presenting the engine as physiologically credible.

---

## Phase 2 — Simulation shell, persisted runs, and first state/event view

**Status:** 🟡 In progress — most shell foundations are implemented; final acceptance/polish remains.

Build the first real app around the Phase 1 engine: mobile-first shell, named runs, persistence, replayable history, branching, event planning, body-status inspection, and a bottom timeline/run bar.

**Delivered so far:**

- Preact app shell with persistent header, midsection, and footer bands.
- Run model that is multi-individual-ready internally while exposing one body in the first UI.
- Browser persistence via IndexedDB-oriented repository code and active-run restoration.
- New/default runs start at simulated age 25: `788,400,000` seconds.
- Engine host that advances the current run and records history checkpoints.
- Replay and branch-from-history behavior with tests.
- Body-status workspace with overview/status cards and monitor-style readouts.
- Event-planner workspace with day lanes, visible hour marks, lane-click event drafting rounded to 15 minutes, and Add/Edit Event pane.
- Event editor split into a settings/actions side and a placeholder Details side.
- Duration-based meal/activity scheduling scaffolding.
- Footer reworked into controls plus a master/detail timeline:
  - lifetime timeline with year ticks, current-position marker, event bands, and selected-day bracket;
  - selected-day 24-hour timeline with hour ticks and duration event blocks.
- Precise footer timestamp display, e.g. `T+25y 000d 00:00:00`.
- Playback-speed control cycling through `1× → 5× → 15× → 60×`.
- Playback loop advances `60 * playbackSpeedMultiplier` simulated seconds every 300 ms while playing.
- Sparkline metric selector cycling through Blood sugar, Gut sugar, Cell sugar, and Storage signal.
- Label-mode and theme controls in the header.
- Component/model/runtime tests for the shell behavior above.
- Full app test suite and production build passing at the latest local checkpoint.

**Known gaps before calling Phase 2 done:**

1. **Do a fresh 360 × 640 browser acceptance pass.** Verify the current shell visually after the latest playback/sparkline changes, not just via tests.
2. **Finish monitor-card polish.** Monitor cards need a deliberate pass for visible sparklines, numeric-change animation classes, and small-screen legibility.
3. **Replace or explicitly defer the Details placeholder.** The Add/Edit Event pane's right side still says that food and activity selectors will appear there.
4. **Tighten event kind coverage.** Meals are the first real event path; exercise, sleep, alcohol, and other duration event types are still mostly schema/design scaffolding.
5. **Clean up terminology drift.** The implemented shell uses practical header/footer wording, while `design.md` still describes Sim Bar / Viewer Bar / bottom timeline concepts. Decide whether to rename UI labels or simply document the implementation mapping.
6. **Confirm persistence UX end-to-end.** Tests cover restoration pieces, but the user-facing flow should be rechecked in-browser: create/rename run, edit schedule, close/reopen, resume.

**Done when:**

On a 360 × 640 phone viewport, a user can:

- create and return to a named run;
- schedule at least a meal into a visible planner lane;
- add an event by clicking/tapping the planner lane;
- switch between body-status and event-planner workspaces;
- see the current simulator position in both planner and footer timelines;
- play, pause, step, and change playback speed;
- scrub or replay recorded history;
- branch a new future from a historical moment;
- close the browser and return to the same run where they left off.

---

## Phase 3 — Whole Body view, mobile first

**Status:** ⬜ Not started

Add the first anatomical/diagrammatic Whole Body view on top of the Phase 2 shell. The Phase 2 body-status cards are the instrument-panel bridge; Phase 3 introduces the stable body schematic.

**Done when:**

A user can load the page on a phone, stay inside the persisted-run shell, and watch blood sugar respond to a meal across visible body systems without horizontal scroll. Larger viewports add detail without changing positions.

---

## Phase 4 — Full fuel handling and food library

**Status:** ⬜ Not started

Expand from the glucose/insulin skeleton toward the v1 fuel model: food library, meal assembly, carbohydrate/fat/protein handling, fasting and sleep basics, and the Single Hamburger / Healthy Baseline scenarios.

**Done when:**

A user can build a real meal from the library using familiar units with metric truth shown alongside, then watch the body process it across all tracked v1 substances.

---

## Phase 5 — Exercise, recovery, and Fuel Flows view

**Status:** ⬜ Not started

Exercise events affect fuel selection and recovery. Add the Fuel Flows view and the Endurance Athlete scenario.

**Done when:**

A user can schedule a week of training, watch fuel selection shift through each session, see refilling and adaptation between sessions, and see overtraining emerge from inadequate recovery.

---

## Phase 6 — Advanced history, branching UX, and timeline polish

**Status:** ⬜ Not started

Take the Phase 2 history foundation to full v1 depth: progressive history compression, richer branch management, jump-to-event, bookmarks, explicit import/export, and long-run comfort.

**Done when:**

A user can manage several named runs, inspect alternative futures cleanly, keep long simulations without storage pain, and move through history and event logs fluidly.

---

## Phase 7 — Long-term effects, Health, and aging

**Status:** ⬜ Not started

Tissue remodeling, body composition, muscle mass/tone, vessel-wall health, per-organ Health scores feeding back into rate constants, and visible aging cues.

**Done when:**

A user can watch a healthy young adult's body shift visibly over ten simulated years under different lifestyles, with per-organ Health changing engine behavior.

---

## Phase 8 — Foreign substances: alcohol, tobacco, medications, recreational drugs

**Status:** ⬜ Not started

Add the foreign-substance table, beverage/drug libraries, acute effects, chronic effects, and the Night Out / Twenty Years of Smoking scenarios.

**Done when:**

Both scenarios run with effects propagating across systems, and a user can compare twenty years of smoking against the same body quitting at year ten.

---

## Phase 9 — Multiple individuals

**Status:** ⬜ Not started

Expose the multi-individual model carried internally since Phase 2: side-by-side bodies, shared/per-individual calendars, and overlaid charts.

**Done when:**

A user can run two to six bodies side by side on the same clock and see them diverge.

---

## Phase 10 — Life stages and From Birth

**Status:** ⬜ Not started

Age-dependent engine parameters, life-stage transitions and labels, age-gated event editing, and the From Birth scenario.

**Done when:**

The From Birth scenario runs cleanly through life stages with appropriate parameter shifts at each transition.

---

## Phase 11 — Recordings, Hormones view, charts, visual styles, scenario sharing

**Status:** ⬜ Not started

Recording export, additional views/charts, visual-style switching, dark-mode polish, unsettled-science flags, and shareable scenarios.

**Done when:**

A user can export a clip, switch visual styles, share scenarios by URL, and see unsettled-science flags where the model has alternate hypotheses.

---

## Phase 12 — Onboarding and documentation

**Status:** ⬜ Not started

First-run walkthrough, expanded README/docs, and published user-facing guidance.

**Done when:**

A first-time visitor can land on the GitHub Pages site, follow a walkthrough, and reach the Single Hamburger scenario without external help.

---

## Post-v1 deferred work

These are described in `design.md` but are not on the v1 critical path:

- Specialized subsystem views: Fat Metabolism, Blood, Liver, high-resolution Hormones, Brain, Bones, Lymph.
- Kids view: simplified/cartoon-like presentation over the same engine.
- Pregnancy and menopause extensions.
- Larger food/drug/scenario libraries beyond the v1 proving set.

---

## Phase changes log

- 2026-04-29 — Inserted Phase 2 before anatomical Whole Body work. Reason: the first app implementation needs a durable mobile-first shell, run model, persistence, event scheduling, history, and branching before the anatomical rendering layer lands.
- 2026-04-29 — Chose **Preact** as the reactive UI layer. Reason: small enough for the static-site constraint while giving a clean component/state model for shell views and controls.
- 2026-04-29 — Clarified Phase 2 focus areas: mobile-first layout and event planner. Expanded the planner direction from fixed daily/2-day/7-day defaults to an open-ended repeating-cycle model.
- 2026-04-30 — Tightened event-planner/body-status rules: default planner lanes are minimal; longer repeating cycles are explicit; activities are duration-based; body-status panels should remain a balanced family rather than oversized trend panels.
- 2026-05-01 — Cleaned this plan to match the implemented app state. Marked Phase 0.5 research complete, Phase 2 in progress with delivered shell foundations, and moved stale Phase 0 bootstrap instructions out of the active path.
