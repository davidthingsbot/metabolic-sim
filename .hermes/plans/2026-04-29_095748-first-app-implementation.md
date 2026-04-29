# First App Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ship the first real browser app for Metabolic Simulator: a mobile-first shell with named runs, persistence, replayable history, the Sim Bar and Viewer Bar, an Events/State main layout, and enough event scheduling plus engine wiring to make the current glucose/insulin model explorable end-to-end.

**Architecture:** Build the app around a durable **run model** rather than around a specific view. A run owns bodies, clock, calendar(s), event log, history, bookmarks, and display preferences. The first UI is an instrument-panel shell — Sim Bar, Viewer Bar, Events pane, State pane — and later anatomical views mount into the same shell without changing persistence or transport semantics. Keep the engine pure and worker-ready; keep all app state local to the browser with IndexedDB persistence.

**Tech Stack:** TypeScript, Vite, Vitest, small reactive UI layer (prefer Preact or hand-rolled signals/store only if needed), IndexedDB for run persistence, SVG/HTML shell first, Worker boundary prepared even if the first UI still runs on main thread during bring-up.

---

## Current context

- `app/src/engine/` already has a minimal Phase 1 model: meal event → gut glucose → blood glucose → insulin response → cellular uptake.
- Tests already exist and pass for initial state, meal events, flows, step semantics, and one end-to-end postprandial scenario.
- The web app currently renders only a landing page.
- `design/design.md` and `design/plan.md` now describe a new Phase 2 focused on the shell, persistence, and first state/event UI before the anatomical Whole Body rendering phase.

---

## Product slice for the first implementation

1. **Sim Bar**
   - Active run selector
   - New / duplicate / rename / delete run
   - Reset run
   - Play / pause
   - Replay from history
   - Speed control
   - Resolution control
   - Scrubbable time line with event markers

2. **Viewer Bar**
   - Label mode: Plain / Technical / Mixed
   - Over-time window: Instant / Minute / Hour / Day / Week / Year (initial subset acceptable; structure must support full set)

3. **Main display**
   - **Events pane**: schedule lanes + event editor + event log
   - **State pane**: key locations with instantaneous quantity bars and small past-value charts

4. **Persistence / history**
   - Named runs stored in IndexedDB
   - Active run auto-restores on reload
   - Replay history viewable in the same viewer
   - Branch new future from historical time

5. **Data-model future proofing**
   - One run can hold multiple individuals even if UI exposes one initially
   - Shared clock and per-individual state/history support built into types now

---

## Proposed file layout changes

Likely new or expanded app paths:

- `app/src/app/`
  - `AppShell.tsx` or `AppShell.ts`
  - `appState.ts`
  - `runStore.ts`
- `app/src/runs/`
  - `types.ts`
  - `runFactory.ts`
  - `branchRun.ts`
  - `selectors.ts`
- `app/src/persistence/`
  - `indexedDb.ts`
  - `runRepository.ts`
  - `autosave.ts`
- `app/src/history/`
  - `recordSnapshot.ts`
  - `historySelectors.ts`
  - `scrub.ts`
- `app/src/events/`
  - `eventTypes.ts`
  - `scheduleTypes.ts`
  - `cycleLanes.ts`
  - `eventLog.ts`
- `app/src/ui/`
  - `SimBar.*`
  - `ViewerBar.*`
  - `EventsPane.*`
  - `StatePane.*`
  - `RunSelector.*`
  - `TimelineScrubber.*`
- `app/src/charts/`
  - `sparkline.ts`
  - `windowedSeries.ts`
- `app/src/engine/`
  - extend types so run integration can schedule and record steps cleanly
- `app/src/main.ts`
  - replace landing page bootstrap with app shell bootstrap

Tests should live alongside each module.

---

## Implementation phases inside Phase 2

### Task group A — Domain model and persistence backbone

1. Define `Run`, `Individual`, `ScheduleLane`, `EventLogEntry`, `HistorySnapshot`, `ViewerPreferences`, and `SimulationControls` types.
2. Make run model plural from day one (`individuals: Individual[]`).
3. Build a `createRun()` factory with a single default individual.
4. Build deterministic branch logic: create a new run from any historical snapshot.
5. Add persistence repository around IndexedDB.
6. Add autosave and restore-last-active-run logic.

**Tests:**
- creating a run creates one individual by default
- branching from a snapshot preserves past, resets future
- autosave serializes and reloads the same run shape
- last active run id restores correctly

### Task group B — History recorder and simulation driver

1. Build a simulation driver separate from UI rendering.
2. Define speed and resolution settings separately.
3. After each simulation tick, record a snapshot at the selected history cadence.
4. Build scrub selectors to derive visible state from current playback pointer.
5. Enforce replay as read-only when moving backwards through history.
6. Allow branch-from-current-pointer into a new run.

**Tests:**
- running forward records history snapshots in order
- scrubbing returns the expected historical state
- replay does not mutate future engine state
- branch-from-history produces divergent future while preserving source history

### Task group C — Event scheduling and logging skeleton

1. Define first-class event types and editor payloads for meal, sleep, exercise, drink/alcohol.
2. Define visible cycle lanes: daily, alternating-days, weekly.
3. Build event placement helpers: lane + day slot + time-of-day → scheduled occurrence(s).
4. Build event log generation for scheduled activation and notable engine events.
5. Wire meal events into the current engine now; represent sleep/exercise/drink as scheduled/logged events whose physiology expands in later phases.

**Tests:**
- event appears in the correct lane after creation
- occurrences materialize at the right simulated times
- meal event fires into engine queue correctly
- event log records activation time and source event id

### Task group D — Mobile-first shell UI

1. Build app shell layout for 360 × 640 first.
2. Add Sim Bar.
3. Add Viewer Bar.
4. Add Events pane with top schedule / bottom editor split.
5. Add State pane with key quantities and sparklines.
6. Add scrubbable time pointer and live state updates while dragging.
7. Add empty-state and named-run flows.

**Tests:**
- Sim Bar dispatches play/pause/reset/scrub events
- Viewer Bar changes label mode and time window
- selecting a run swaps visible state
- editing an event updates schedule state
- drag scrubbing updates the rendered state immediately

### Task group E — Replace landing page and verify end-to-end

1. Swap `main.ts` bootstrap from static landing content to the shell app.
2. Keep the README-accurate project description accessible somewhere in-app or as about/help content if desired.
3. Verify mobile layout first, then standard width.
4. Run full tests, build, and manual dev-server verification.

**Tests / verification:**
- `npm test`
- `npm run build`
- manual verification at ~360 × 640 and desktop width
- reload browser and confirm run restore
- run meal simulation, scrub backward, branch, continue

---

## TDD rules for execution

For every code module:

1. Write failing test first.
2. Run only the new test and confirm failure.
3. Implement the minimum code to pass.
4. Run the focused test again.
5. Run the relevant local suite.
6. Commit.

Suggested commit rhythm:
- `feat: add run model and persistence types`
- `feat: record replayable run history`
- `feat: add event scheduling lanes and logging`
- `feat: add mobile simulation shell`
- `feat: replace landing page with first simulator app`

---

## Risks and tradeoffs

- **History size vs fidelity:** recording every step can grow quickly. For the first implementation, favor correctness and replayability over aggressive compression.
- **UI before anatomy:** this is intentional. The shell must be durable enough that the anatomical view plugs into it rather than replacing it.
- **Event schema ahead of physiology:** sleep/exercise/drink should exist in the schedule model early even if only meals have rich physiological effect initially.
- **Multiple-individual future proofing:** plural run model adds complexity now but avoids a larger refactor later.
- **Framework choice:** if state wiring grows awkward without a small reactive layer, add one deliberately during this phase and record the reason in `design/plan.md`.

---

## Acceptance criteria for this plan slice

The Phase 2 implementation is successful when:

- the landing page is replaced by a working simulation shell
- the shell works on a phone-sized viewport first
- runs are named, persisted, and restorable
- history can be scrubbed and replayed in-place
- a new future can be branched from a historical point
- at least the meal/glucose/insulin loop is explorable through the shell
- the codebase remains TDD-first and testable

---

## Open questions to settle during execution

1. Whether to adopt a tiny reactive library or stay framework-free for Phase 2.
2. Exact visualization primitive for instantaneous state (bars vs organ-box fills vs mixed).
3. Whether replay and live mode share one unified time pointer component or two specialized modes behind one API.
4. Whether the first cycle-lane layout at Compact is tabs, horizontally scrollable lanes, or vertically stacked collapsibles.

---

## Verification commands

```sh
cd ~/work/metabolic-sim/app
npm test
npm run build
npm run dev
```

Manual checks:
- create a run
- rename it
- add a meal to a daily lane
- run simulation
- scrub backward
- branch from historical point
- reload tab/browser
- confirm same run restores

---

Plan complete. Ready for implementation when you want to proceed.
