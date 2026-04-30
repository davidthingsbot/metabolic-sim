# Metabolic Simulator — Design

*Companion to `background/metabolic-pathways.md`. The background folder is the source of truth for the science the simulator models; this document is the source of truth for what gets built.*

---

## 1. Purpose

Build a browser-based simulator that shows, in plain language, how food and other inputs move through the body and get used. A non-specialist should be able to load the page, set a starting body, drop a hamburger onto the timeline, hit play, and watch — across the bloodstream, the liver, the muscles, the fat tissue, and the brain — what happens over the next twelve hours. They should also be able to leave the simulator running on a daily schedule for ten simulated years and watch a healthy 20-year-old slowly become something else.

The simulator is a teaching and exploration tool first, an accuracy showcase second. Where the science is genuinely unsettled, the simulator says so on screen rather than picking a side silently.

---

## 2. Non-Goals

- Not a medical or diagnostic tool. No personal advice, no health claims.
- Not a complete physiology engine. Reproduction, detailed immune response, neurochemistry beyond fuel handling, and the full endocrine network are out of scope unless they directly drive the visible quantities.
- Not a research-grade model. We aim for the right shape of the curves and qualitatively correct interactions, not for clinical-trial-grade numerical precision.
- Not a back-end app. No server, no accounts, no telemetry. Everything runs in the browser. Hosted from GitHub Pages.

---

## 3. Audience and Naming Architecture

The simulator carries every named entity in three forms: a stable internal identifier, a scientific name, and a plain-language functional name. The full mapping lives in **`design/glossary.md`** and is the single source of truth for the dictionary the simulator reads at render time.

**Internal identifiers (variable names) are scientific.** Source code, scenario JSON keys, saved-state files, and shared URLs reference each entity by a stable camelCase identifier derived from the scientific name — `insulin`, `glucose`, `liverGlycogen`, `bodyFat`, `ldl`, `atp`. These are settled once chosen. Changing a display label never requires touching code.

**Display label modes** are a first-class user setting:

- **Plain** (default) — functional names that describe what each thing does, in everyday language. *Storage Hormone* on the gauge, *Blood Sugar* on the chart axis, *Body Fat* on the depot fill, *Compact Fuel* on the ketone vial. The teaching mode and the simulator's headline experience.
- **Technical** — scientific and anatomical names. *insulin*, *glucose*, *body fat*, *ketones*, *LDL*. For users with formal physiology training who already work in those terms.
- **Mixed** — both side by side. *Storage Hormone (insulin)*. The bridging mode for users moving between the two worlds, useful in classroom and clinical-education settings.

The Kids view (Section 5) layers a fourth label set — even simpler, more cartoon-like names — over the same engine state.

**Hover always reveals the alternate.** Whichever mode is active, hovering on a label shows what it would be called in the other primary mode at minimum. Users never have to switch modes to identify what they are looking at.

**Background research notes** (in `background/`) lead with the scientific name. The plain functional name appears in parens on first use within a section and is dropped thereafter. The notes describe the science the engine simulates, not the user-facing experience; matching the literature's vocabulary keeps them readable for anyone consulting them alongside textbooks or papers.

**Metric units only.** Everywhere. Calories convert to kilojoules on display toggle.

**No acronyms as primary plain labels.** Where an acronym is the standard scientific term (ATP, LDL, HDL, GLP-1), it is the *Technical* label; the *Plain* label uses a descriptive name (*Cellular Energy Token*, *Cholesterol Carrier — Loaded*, etc.). The glossary has both.

Label mode is orthogonal to visual style (Section 14) and orthogonal to the Kids view (Section 5). The active mode is encoded in saved states, scenarios, recordings, and shared URLs (via the stable ID, not the display string), so a recipient sees the same setup the sender intended.

---

## 4. What Is Visible

The simulator depicts as much of the relevant body as it can fit. The layout is fixed, hand-tuned, and **diagrammatic rather than strictly anatomical**. Organs are positioned so the eye can follow food through the system — mouth, stomach, small intestine, large intestine read in a clear sequence; portal blood routes from gut to liver without crossing other paths; the bloodstream loops through lungs, heart, and the systemic tissues legibly. Anatomical fidelity is sacrificed where it would obscure flow. The result reads more like a working diagram than a textbook anatomical illustration — there's no need for general-purpose layout, just careful design.

**Layout stability is non-negotiable.** Positions on the screen are constant — across time, across views (where applicable), across density tiers, and across multi-individual cells. An organ that sits in the top-right at minute 0 sits in the top-right at year 10. A chart axis at the bottom-left stays at the bottom-left whether the simulation is paused, playing forward, or scrubbing through history. This is what makes bookmark toggling, before/after comparison, and side-by-side individual comparison legible — the eye locks onto a position, and any change at that position reads directly. Anything that *would* move is either an animated quantity (a particle stream, a fill level, a glow intensity) or a deliberate density-tier change at a viewport-size boundary (Section 14). Layouts never reflow on time advance.

**Demographic substitutability.** The body figure itself is a swappable layer over the chrome. Sex, age, life stage, body composition, and condition determine which figure the simulator renders and which life-stage-relevant readout vocabulary appears in the per-organ callouts; they do not change which organs sit where, which gauges sit where, or which callouts attach to which anatomical regions. The chrome is invariant across the swap; the data semantics adapt — an infant subject shows *Milk Intake*, *Stool Output*, *Growth*, and life-stage-appropriate norms; an adult subject shows *Nutrient Intake*, *By-Products*, *Body Fat %*, and adult norms. Section 9's life-stage event-gating (alcohol, tobacco, and most drugs not offered for a child body) is the calendar-side counterpart of this readout-side life-stage adaptation. The Multiple Individuals view (Section 8) and the From Birth scenario (Section 10) both depend on this layered architecture — the chrome reads identically across two adults of different sex, across the same body at year 0 and year 10, across an infant body and an older-adult body, and across the panels of a multi-body comparison.

**Core organs and tissues shown:**
- Heart and major blood vessels (the circulatory loop, both pulmonary and systemic)
- Lungs (gas exchange, oxygen ceiling)
- Liver (the central switching station)
- Stomach, small intestine, large intestine (digestion path)
- Pancreas (insulin and glucagon production)
- Adrenal glands (epinephrine, cortisol)
- Kidneys (waste excretion)
- Brain (fuel-dependent, no reserves)
- Skeletal muscle (grouped: legs, core, arms, back) with separate glycogen and intramuscular fat per group
- Fat tissue (subcutaneous and visceral, shown distinctly)
- Lymphatic system (especially the gut → blood route for dietary fat)
- Bones (calcium balance, marrow as a slow contributor)
- Skin (heat dissipation, sweat → hydration coupling)
- Vasculature health overlay (vessel wall condition, plaque accumulation over long timescales)

**Quantities shown for each:**
- Stored amounts (with capacity)
- In/out flows (animated as moving particles or pulsing flows)
- Local state markers (e.g., muscle tone, fat tissue volume, vessel wall thickness)
- **Health** — an aggregate per-organ score combining fitness for task, accumulated deterioration, current efficiency, and the rate constants that govern that organ's flows. Health changes over time: it deteriorates with overload, neglect, or aging, and improves with appropriate use, recovery, and good inputs. Because the engine reads an organ's rate constants from its Health score, a less-healthy liver clears blood glucose more slowly and a less-healthy heart pumps less per beat — Health is not a label sitting on top of the simulation, it is wired into it.

A whole-body Health score aggregates the per-organ scores, weighted by how load-bearing each organ is and age-adjusted (what counts as "healthy" for an 8-year-old, a 25-year-old, and a 75-year-old is different, and the simulator says so).

Animation is continuous and tied to simulated time, not real time. At 1× the heart beats once per second; at 1000× the heart is a steady glow but fat tissue visibly grows and shrinks. Aging and Health changes are visible in the simulation itself — skin tone, posture, muscle definition, vessel wall thickness, and organ silhouettes shift as the years pass.

The visible state extends to inputs that touch many systems at once. Alcohol shows up as elevated liver load, altered brain glow, dehydration markers, vessel changes, and degraded sleep that night. Tobacco smoking shows up as reduced lung gas-exchange capacity, displaced oxygen carriage in the blood, vessel constriction, and accumulated long-term wall and Health damage. Recreational drugs and medications each light up the specific systems they touch. None of these are abstracted into a single penalty number — they propagate through the same engine that handles food and exercise.

**Stylized health diagrams.** Beyond the anatomical schematic, the simulator carries a set of small, focused, zoomed-in stylized diagrams — each one a hand-tuned diagrammatic depiction of one slow-changing aspect of the body. They appear in the Long-Term State view and as detail panels elsewhere. A snapshot of any one of them is an at-a-glance summary of one part of the body's condition.

- **Blood vessel cross-section.** A stylized cutaway of a representative artery and vein, showing wall thickness, plaque accumulation, lumen narrowing, calcification, and elasticity. Updates visibly as years of simulated time pass. Healthy youth reads as smooth thin walls with a wide lumen; decades of poor diet and inactivity read as thickened walls, plaque deposits, narrowed lumen, and calcified patches.
- **Bone density cross-section.** A stylized bone cutaway showing cortical (outer dense) and trabecular (inner spongy) structure. Trabecular density shifts visibly with age, sex, hormone levels, exercise, and nutrition. Healthy 20-year-old: dense scaffolding throughout. Older sedentary adult: thinned scaffolding with larger gaps.
- **Body shape silhouette.** A whole-body silhouette showing current body composition — subcutaneous fat distribution (typical of biological sex), visceral fat around organs, muscle mass and tone. Updates visibly as weeks and years of simulation pass. Side-by-side silhouettes are the cleanest at-a-glance way to compare two scenarios at scale.
- **Liver cross-section.** A stylized liver silhouette showing fat infiltration percentage. Healthy liver reads as a clean reddish silhouette; fatty liver shows visible pale infiltration; advanced fatty liver shows the structural texture changes that come with chronic excess.
- **Muscle definition panel.** A stylized cross-section of one or more major muscle groups showing fibre density, capillary density, mitochondrial density, and intramuscular fat distribution. The depiction shifts with training and detraining.
- **Lung capacity panel.** A stylized lung silhouette showing functional alveolar surface area (gas-exchange capacity) — visibly reduced by sustained smoking, visibly partly recoverable after cessation.
- **Skin texture panel.** A small skin-cross-section diagram showing collagen and elastin density, hydration, and visible aging. Lower priority than the others but cheap to add.

All of these are stylized — diagrammatic, not photorealistic. Each has its own snapshot button.

The stylized health diagrams have their own visual register, which **is allowed to differ from the headline view's visual style**. The painterly-plate look that works for a vessel cross-section may not be the right choice for the Whole Body schematic; the encyclopedia-line treatment that works for a bone cutaway may not fit the Fuel Flows view. Section 14 picks the visual style for the headline schematic and the abstracted diagrams; this set picks its own register, with consistency *within the set* rather than slaved to the outer view.

**Detail panels and cross-entity linkage.** Clicking any named entity on the screen — a hormone gauge, a substance fill, an organ silhouette, a condition badge, a drug pill in the calendar — opens a detail panel. The panel does not just describe the thing; it lists every other entity in the simulator that *connects* to it: every flow that hormone gates, every organ that substance is consumed by or produced in, every condition that modulates the entity's rate constants, every drug or food that touches it. Each item in those lists is a clickable link that scrolls or zooms the active view to highlight the target.

A user investigating *insulin* sees, in one panel: the substances it gates (blood glucose into cells, free fatty acid release suppression), the organs that produce it (pancreas) and respond to it (liver, muscle, fat tissue), the conditions that affect it (type 2 diabetes), and the drugs and foods that interact with it (GLP-1 agonists, exogenous insulin, carbohydrate-rich meals). Clicking any of those entities navigates the highlight there and presents *its* connections.

This makes a complex domain navigable for non-experts without overwhelming the main view, which stays at its fixed level of detail. The connection graph lives in the engine's name dictionary and is generated at build time, not handwritten per panel.

---

## 5. Views and Perspectives

The user can switch among several fixed views. Each is hand-laid-out for clarity, not procedurally generated. Shared time control and shared underlying state — switching views never restarts the simulation, and never reloads. The active view is a render of the same in-memory state; transitions are instant. The clock continues to tick across the transition, or remains paused, depending on the user's play state.

**First app implementation shell.** Before the anatomical Whole Body view is ready, the simulator still ships a real app shell rather than another static placeholder. The shell is organised into three persistent horizontal bands: a **header**, a **midsection**, and a **footer**. The header contains the title/status chrome — the simulator title, the high-level whole-body status, and the top-level controls now described as the **Sim Bar** and **Viewer Bar**. The footer contains the experiment-control and timeline chrome — the persistent **bottom timeline / run bar** with the scrubber, run-position context, bookmarks, and replay affordances. Between them sits the midsection, which is where the user does the actual inspection work.

The midsection is a **master / detail arrangement**. On the left is a vertical systems rail. On the right is the active stack or field of panels. The midsection itself has a tiny top-left **workspace selector** that decides what the right-hand side is doing: sometimes it is the body-status workspace, and other times it is the event-planner workspace. The shell is not throwaway scaffolding: later views inherit the same header/footer bands, the same run model, the same persistence model, and the same history scrubber. The bottom bar follows the same rules as the top status chrome: always visible, layout-stable, and shared across views. At *Compact* the shell compresses into the same three-band structure with the left rail collapsible; at *Standard* and above the rail and panel field are visible together.

1. **Whole Body** — anatomical schematic. Default view. Everything visible at once with informative density tuned for a 1080p screen.
2. **Fuel Flows** — abstracted diagram of fuel currencies (blood glucose, free fatty acids, ketones, amino acids, ATP). Organs drawn as nodes, flows as edges. Best for understanding the metabolic logic.
3. **Hormones** — same node-edge style, focused on insulin, glucagon, epinephrine, cortisol and their downstream effects. Shows what's locked and what's open at any moment.
4. **Long-Term State** — body composition, muscle mass and tone, body fat distribution, vessel wall health, liver fat, per-organ Health scores, and the visible signs of aging (skin, posture, vessel narrowing, muscle definition). The view that matters when running months or years of simulated time.
5. **Timeline** — schedule editor and event log. Shows the calendar of meals, exercise, sleep, etc., and a scrollable history of past events with their consequences highlighted. Doubles as the history scrubber (see Section 7). The Timeline view splits into two interaction modes that the user toggles between: **Plan** (the day-planner / week-planner / multi-year scenario-assembly surface) and **Run** (the live-control cockpit — transport, status, live readouts, and quick-event injection while time is advancing). Both modes share the same calendar and the same body state; they differ only in whether the user is editing the future or driving it. The *plan → body → outcome* three-column layout (Section 9) belongs to **Plan** mode; the live-sparkline cockpit belongs to **Run** mode. Switching between them does not restart the simulation, does not reload, and does not change which calendar is active — it changes which controls are foregrounded.
6. **Charts** — time-series plots of any tracked quantity. User picks which series to overlay; multi-individual runs overlay the individuals automatically on shared axes.
7. **Multiple Individuals** — two to six bodies side by side, each running its own state through the same shared clock. See Section 8 for the full design.

**Future views (post-v1).** The view system is built so additional views can layer over the same simulation state without touching the engine. The following are designed for but not delivered in v1:

- **Specialized subsystem views** — a Fat Metabolism view (the entire fat economy in one frame: body fat, intramuscular fat, free fatty acids, ketones, chylomicrons, and the routing between them); a Blood view (the circulatory system in detail with all blood-borne substances); a dedicated Liver view (zoomed in on the central switching station); a high-resolution Hormones view; a Brain view; a Bones view; a Lymph view. Each replaces the Whole Body view for users who want to drill into one subsystem. Each requires its own hand-tuned layout; the v1 Whole Body view shows the whole picture, and these are the natural follow-ons.
- **Kids view** — a simplified, more abstracted, more cartoon-like presentation aimed at children and complete beginners. Fewer quantities on screen, stronger animations, an even simpler naming layer (the engine still uses *glycogen* internally; the kids view shows it as *Sugar Stash*. *insulin* becomes the *Put-It-Away Signal*. *ATP* becomes an *Energy Sparkle*). Food goes in, energy comes out, the body grows or shrinks. Same engine underneath, different presentation layer.

Every view supports a snapshot: one click produces a PNG (and an SVG for the schematic views) capturing the current frame, the current simulated time, and the active scenario name in a footer. Snapshots are designed to be readable when pasted into a slide or a chat message without further annotation.

---

## 6. Time Control

The simulator decouples wall-clock time from simulated time. The user picks a rate.

- 1× — one simulated second per real second. Useful for watching the heart beat or a sprint play out.
- 60× — one simulated minute per real second. Useful for digestion of a meal.
- 3,600× — one simulated hour per real second. Useful for a workday.
- 86,400× — one simulated day per real second. Useful for a week or a month.
- Up to ~30,000,000× — roughly one simulated year per real second. Useful for chronic-effect scenarios.

The numerical engine does not run at the display frame rate. It runs on a fixed simulated-time step (default 1 simulated second) and the visualization samples it. At very high rates the engine takes larger steps where the math allows it (slow processes only); fast processes are skipped or aggregated. At the highest rates the heart and the digestion of a single meal are below the time step and become summary effects rather than animated detail.

The time control supports play forward, play backward, pause, step in either direction (one minute, one hour, one day), jump to any time the engine has recorded, and "jump to event" — pick an entry from the event log and the simulator scrubs to that moment. The history mechanism that makes backward play possible is described in the next section.

**Sim Bar.** The first-row chrome is a persistent run-and-transport control bar. It owns: the active run selector; create / duplicate / rename / delete run actions; reset-run; play / pause; backwards replay; step controls; the current simulated date/time line; the time-multiplier ladder; and the simulation-resolution control. The time line auto-scales to the run's current duration, shows bookmarks and logged events as marks on the line, and allows real-time scrubbing by dragging the current-time pointer. Scrubbing is continuous — the active viewer updates while the pointer moves, not only on release.

**Resolution is explicit.** The speed control answers "how fast does simulated time advance relative to wall-clock time?"; the resolution control answers "how densely do we record and redraw this run while it advances?" The default pairing is conservative (a resolution that preserves replay quality at the chosen speed), but advanced users can override it. This matters because the simulator is both a machine and a recorder: the user needs to know whether they are running a rough long-range summary or a replayable fine-grained window.

---

## 7. Saved States, History, and Recordings

The simulator keeps a complete, browsable record of every run. Four overlapping mechanisms make this work.

**Runs.** A *run* is the top-level thing the Sim Bar switches between. It has a name, one or more bodies, one calendar (or one per-body calendar), a current simulated time, an event log, a history stream, bookmarks, and display preferences. The browser always has one active run. Users can create several named runs — *Single Hamburger*, *Fast Food Week*, *What if I slept more?* — and switch among them without losing history.

**Save / Load.** A full simulation state — all substances, all locations, all hormones, all tissues, all Health scores, the calendar, the event queue, the history buffer, and the active scenario — can be saved at any moment. Saves go to IndexedDB by default; the user can also export to a JSON file and re-import later. A save captures the simulation as a state machine, not as a recording: loading places the user back at exactly the moment the save was taken, with the future still simulable from there. Multi-individual runs save and load as a single bundle.

**Browser persistence is automatic.** The active run autosaves to IndexedDB on a short debounce while it is being edited, when the simulation pauses, and on page hide / unload. Reopening the browser restores the last active run at the last active simulated moment, with its history, bookmarks, viewer settings, and pending scheduled events intact. Tiny global preferences (theme, density override, default label mode) can live in localStorage; run data does not.

**History.** As the engine advances, it records two parallel streams. The first is a rolling state buffer — full state snapshots taken at intervals that scale with the time multiplier (every simulated second at 1×, every simulated minute at 60×, every simulated day at 86,400×, and so on). The second is the event log — a chronological list of every meal, exercise bout, sleep period, hormonal surge, and notable threshold crossing (e.g. "liver glycogen dropped below 20%"). Together these allow the user to scrub time backwards through the timeline, jump to any event, and see exactly what the body looked like just before and just after. In the first app implementation, the user-facing promise is simple: every state the engine produces at the selected simulation resolution is replayable from the same viewer. Later storage-budget work is allowed to compress old history, but not to violate that browsing model.

**Backwards play.** The simulator can play time in reverse. Forward play continues the simulation; backwards play replays from history. Backwards play is therefore strictly read-only — the user cannot edit the calendar while moving backward, only observe. Forward play from a historical moment branches a new future, optionally archiving the previous future as a "what-if" timeline visible in the timeline scrubber. Restarting from the last point, or from any earlier moment the user has scrubbed to, is the normal branching workflow rather than an advanced edge case.

**Bookmarks.** Bookmarks are user-set markers on the timeline. A bookmark captures a single simulated moment — its time, its active view, its label mode, and its visual style — and is given a name. Bookmarks live alongside the event log in the timeline scrubber.

Their purpose is **before/after comparison**. Bookmark a "before" moment (a healthy 20-year-old at year 0). Let the simulation run for ten simulated years of fast food. Bookmark the "after" moment (the same body at year 10). Then toggle between the two with a single click or keyboard shortcut — instant, no reload, no animation start, no view switch. The simulator scrubs the in-memory state to the bookmarked moment and renders the same view at that moment.

Because the layout is fixed in space *and* across time (Section 4), the user's eye stays on one organ, one chart, one diagram across the toggle and reads the change directly. A bookmark toggle is the strongest evidence that something has changed, because everything that *hasn't* changed sits still on the screen.

Bookmarks save with the scenario and travel via shared URLs. A built-in scenario can ship with a curated set of bookmarks (e.g. *"year 0", "year 5", "year 10"*) so a recipient lands at the first bookmark and can step through the arc.

**Recordings.** Any segment of history can be saved as a video-style animation. The user picks a start time, an end time, a time multiplier (which can differ from the original run — a heartbeat captured at 1× can be replayed at 0.25× for inspection, or a year captured at high speed can be re-rendered slower), and a view (or sequence of views). The simulator renders out a playable clip — WebM where the browser supports it, otherwise a frame-sequence ZIP for editing elsewhere. Recordings respect the active light or dark mode at render time and include the simulated date, scenario name, and time multiplier as a footer overlay.

**Storage budget.** Full state snapshots are large. The history buffer compresses old snapshots progressively — recent moments at full resolution, older moments at coarser intervals — so a multi-year run still fits comfortably in IndexedDB. The event log is always full-resolution because it is small. The user can clear history manually if they need the space.

---

## 8. Multiple Individuals

The simulator can run two to six bodies side by side, sharing one clock. Each body has its own complete state — its own substances, its own hormones, its own tissues, its own Health scores. They proceed in lockstep through simulated time so the user can compare directly.

**Provision from the start.** Even in the single-body app, the run model is plural internally: a run owns an ordered list of individuals, a shared clock, shared-or-per-individual calendars, and per-individual history/state streams. The first UI may expose only one body, but it does not use a separate one-off data model. This avoids a destructive rewrite when the Multiple Individuals view lands later.

**Where individual differences live.** Real bodies vary along axes the science is solid on, and the simulator exposes those axes:
- Age and life stage
- Biological sex (see below — a substantial axis on its own)
- Mass and height
- Baseline body composition (fat percentage, muscle mass distribution)
- Genetic-style modifiers within the ordinary documented human range — insulin sensitivity, baseline metabolic rate, fat distribution tendency, fast-twitch / slow-twitch muscle fibre balance, lactose tolerance, caffeine clearance speed
- Fitness state — how trained the muscles, heart, and metabolic flexibility are at the start
- Microbiome state (a coarse proxy — the science is contested, flagged accordingly)
- **Chronic conditions** — type 1 diabetes, type 2 diabetes, hypertension, atherosclerosis, COPD, asthma, hypothyroidism and hyperthyroidism, fatty liver, anaemia, common autoimmune conditions affecting metabolism. Conditions are first-class engine state (see Section 11) — they modulate rate constants and can unlock or restrict event types (a body with type 1 diabetes can take exogenous insulin; a body with severe COPD has its exercise event ceiling capped). A starting body can carry zero, one, or several conditions.

**Sex differences.** Biological sex is treated as a first-class axis of the engine, not a cosmetic label. Documented metabolically meaningful differences the simulator reflects: typical lean-mass vs fat-mass ratios; fat distribution patterns (more visceral / android vs more subcutaneous / gynoid); resting metabolic rate (different in absolute terms, similar per kilogram of lean mass); typical baselines for the sex hormones (testosterone, oestrogen, progesterone) and their downstream effects on muscle protein synthesis, fat handling, and bone density; iron requirements; alcohol clearance (smaller body-water volume and different liver enzyme expression in females meaning the same drink reaches a higher blood ethanol level); cardiovascular disease trajectories with age; bone density trajectories with age; rate of muscle mass loss with age. The cyclic monthly hormonal pattern in females of reproductive age is modeled as a slow oscillation in baselines rather than a free-standing system. Pregnancy and menopause are flagged as out of scope for v1 but the sex-hormone scaffolding leaves the door open.

The "Comparing Different Individuals" scenario configures these axes — including sex — within mainstream human ranges. The "Comparing Lifestyles" scenario holds them identical and varies only the calendar.

**What it shows.** Multi-individual runs make differences legible:
- Two identical-on-paper individuals eating the same hamburger absorb it at different rates because of differing insulin sensitivity.
- Two individuals with the same calendar end up with different body composition over a year because of differing baseline metabolic rate.
- Two individuals with identical bodies and different calendars diverge along trajectories the user can pause and inspect.

**Layout.** The Multiple Individuals view shows each body's anatomical schematic at reduced size in a grid. Hovering or clicking a body promotes it to a larger panel; the others remain animated at thumbnail size. Charts in this mode overlay the individuals on shared axes by default. Snapshots and recordings capture the whole grid.

**Engine cost.** Each additional individual is roughly an additional engine instance. The Web Worker design — one worker per individual, plus a coordinator — keeps this clean. Six individuals at once is the practical ceiling on a typical laptop without dropping the visualization frame rate.

**Default cognitive load.** First-time users land in a single-individual configuration; the Multiple Individuals view is opt-in. When the user does open it, the default is *two* bodies, populated as the *Comparing Lifestyles* preset (identical bodies, two different calendars). Two is the cognitive-load default — meaningful comparison without overwhelm. Up-to-six is for users with a specific comparison in mind. The user can always go back to one.

**Calendar mode.** Calendars can be shared (every individual eats the same meals at the same times) or per-individual (the lifestyle-comparison case). The scenario file format supports both, and a single scenario can mix them — for example, a shared sleep schedule with per-individual diets.

---

## 9. Inputs, Foods, and the Calendar

The simulator's input is a starting body state, a calendar of events, and a library of foods that meals are assembled from.

**Foods.** Meals and snacks are not abstract macro splits. The simulator ships with a library of real foods, and users assemble meals from it. Version 1 covers what most users actually eat: grain staples, breads and pasta, dairy in its common forms, multiple cheeses (cheddar, mozzarella, parmesan, cream cheese, feta, cottage cheese, blue cheese, swiss, brie at minimum), eggs, common meats, a real range of fish (salmon, tuna canned and fresh, cod, trout, sardines canned, shrimp, mackerel, tilapia at minimum), common fruits and vegetables, legumes and nuts, fats and oils, common beverages, and the specific items named in the built-in scenarios.

**Composition fields.** Each entry carries water, total energy in kilojoules, carbohydrate broken down by type (glucose, fructose, sucrose, lactose, starch with a digestion-rate factor — see below), protein, fat broken down by class (saturated, mono-unsaturated, poly-unsaturated, trans), fibre split into soluble and insoluble, alcohol as a fourth macronutrient, and a deliberately small set of micronutrients (sodium, potassium, caffeine — chosen because each of those three affects flows that already exist in the engine; calcium, iron, B12, vitamin D and others are excluded for v1 with reasoning recorded in `background/foods-library.md`). Each entry also carries provenance: which source it came from, a confidence level, and a last-verified date.

**Carbohydrate digestion rate factor.** A unitless multiplier on starch-to-Blood-Sugar conversion speed. White bread and instant rice score around 1.0; pasta around 0.6; lentils around 0.4. The simulator's stand-in for the glycaemic index — the engine works in flow rates, not in area-under-curve, so a multiplier is the right shape for it.

**Cooked vs uncooked.** Where it matters, cooked and uncooked forms of the same food are separate entries. A hundred grams of raw chicken breast and a hundred grams of grilled chicken breast have different water content and therefore different protein and fat per gram; the library does not silently convert between them — it carries both, and users pick the one that matches what they actually ate.

**Composite foods.** A composite food is a defined assembly of other foods — a hamburger is a bun + a beef patty + cheese + lettuce + tomato + ketchup; a pizza is dough + tomato sauce + mozzarella + toppings; a margarita is tequila + triple sec + lime juice + ice. Composite foods are first-class library entries from v1 onwards, not deferred. The library ships common composites with multiple named variants (a McDonald's hamburger, a Big Mac, a homemade hamburger, a quarter-pounder; a thin-crust margherita pizza, a pepperoni deep-dish). Users define their own composites by combining existing entries with quantities, and once defined a composite is just another library entry — usable in meals, shareable, and nestable inside larger composites. Cocktails and mixed drinks are handled the same way (a margarita, a gin and tonic, a negroni — each a composite of component entries).

In the meal-editor UI, every composite food is **expandable in place**: tapping the composite reveals its component ingredients as an indented list, each with its own portion control in familiar units and its own cooked-vs-uncooked toggle where the library distinguishes them. The user can adjust component quantities, swap a component for another library entry, remove a component, or add a new one. Edited composites can be saved back to the library as new named entries; nested composites (a salad dressing inside a salad) render as nested expandable rows. The composite tree is the editor's primary affordance for the commitment that meals are assembled, not picked.

**Plan / body / outcome layout.** At Section 14 *Detailed* and above, the calendar lives in a left-column day-or-week timeline of stacked event cards. The body figure occupies the middle column, animated against the calendar. The right column carries live consequences — sparklines of the body's substances, a daily-summary metric pile, recovery and trend gauges. This *plan → body → outcome* three-column layout is the calendar-as-input model rendered spatially: editing a calendar cell visibly changes the body and the outcomes on the same screen, without a separate run-and-view step. At *Compact* the three columns collapse to a single column with the body and outcomes available behind a swipe-to-reveal panel.

**First implementation layout.** Before the anatomical body view is drawn, the State side is organised around a compact **Whole Body summary capsule set** followed by a stack or field of body-part panels. Each body-part panel uses the same base card grammar — title, health/status chip, upper diagram area, and lower chart/history area. The default card size is standardised so panels can flow in a grid-like layout, and that size consistency is deliberate: result capsules should read as one family, and oversized trend panels that dominate the screen are explicitly out of bounds for the resting layout. Cards may be collapsed, shown at the standard size, or expanded for more detail, but the baseline view preserves an equal-capsule balance.

The **upper diagram area** of those standard panels uses one consistent diagram family rather than ad hoc per-card illustrations. If the diagram set is produced in batches with generator assistance, that is acceptable — including OpenAI-assisted image generation — so long as the resulting assets are normalised into one coherent visual system before they ship.

A **left vertical systems rail** sits beside the panel field. It is the master selector for which detail panels appear on the right. The rail lists both individual body parts and higher-order **system presets** such as *Blood System*, *Digestive System*, *Lymph System*, and similar groupings. Choosing a preset brings in a curated set of panels on the right; users can also save their own named sets. The rail chips use colour to reflect health or current status, and they can center or refocus the detail field on demand.

The right-hand detail area supports both curated and user-defined arrangements. User-controlled arrangement is allowed, but temporal instability is not: panels may be drag-reordered by the user, yet once placed they stay fixed across play, pause, scrubbing, replay, and branch comparison. The point is to let the user choose their inspection layout without sacrificing the design's position-stability rule over time.

**Familiar units, metric truth.** Few people know how much a handful of nuts weighs. The UI accepts familiar units — a handful, a cup, a tablespoon, a slice, a "medium apple", a 330 ml bottle, small / medium / large drink size — and the library carries the conversion to grams or millilitres for each entry (the conversions are food-specific: a cup of nuts is not the same mass as a cup of milk). The active quantity is *always* shown in metric alongside whatever the user typed, so no one is fooled about what they actually entered.

**Serving sizes** (the printed-on-the-package "serving") are supported but treated as a slightly suspect unit. Manufacturer servings are notoriously inconsistent and rarely match what people actually pour or pile on a plate; the UI always shows the metric weight beside the serving and notes when the requested serving differs from a typical real-world portion.

**Static library.** The library is a JSON file generated once from the underlying sources (FoodData Central as canonical, national equivalents for cross-check, manufacturer disclosures for branded items) and committed alongside the code. The simulator does not fetch food data live — it runs offline. The library is regenerated periodically with source IDs preserved so updates are reproducible.

**Naming.** Each food's plain-language name leads; the technical or branded name is available on the toggle. Where a food's composition varies in real life (a "hamburger" depends on which one), the entry names the specific source it modeled.

**Event kinds:**
- Meals (assembled from the food library)
- Snacks (assembled from the food library)
- Dietary supplements (a small allow-list — protein powder, creatine, omega-3, multivitamin — each with documented modeled effects; everything else is "supplement, no modeled effect")
- Hydration (water intake in millilitres — also implicit in foods)
- Exercise (intensity 1–10, duration in minutes, type: endurance / interval / strength / mixed)
- Sleep (start time, duration, quality 1–10)
- Light work / sedentary periods (duration; affects activity baseline and cortisol slowly)
- Stress events (duration and intensity — directly raise cortisol)
- **Alcohol** (specific drinks from a beverage library — a 330 ml beer, a 150 ml glass of red wine, a 45 ml shot of spirits — each carrying its alcohol content. The engine tracks blood ethanol as a substance and routes it through liver processing, brain effects, dehydration, sleep quality degradation, fat-burning suppression, and over long timescales liver and vessel deterioration.)
- **Tobacco and smoking** (cigarettes, cigars, pipe, vaping; per session count and nicotine content. The engine models acute effects — vessel constriction, displaced oxygen on red blood cells, brief stimulant kick, appetite suppression — and chronic effects on lung gas-exchange capacity, vessel wall condition, and Health scores throughout the cardiovascular and respiratory systems.)
- **Medications and other drugs** (an extensible library of prescription, over-the-counter, and recreational compounds with documented modeled effects. v1 covers, at minimum:
  - **Diabetes medications** — metformin, GLP-1 receptor agonists (semaglutide, liraglutide), SGLT2 inhibitors, sulfonylureas, exogenous insulin (rapid-acting and long-acting).
  - **Cholesterol reducers** — statins (atorvastatin, simvastatin, rosuvastatin) and the related lipoprotein-lowering effects.
  - **Blood pressure reducers** — beta-blockers, ACE inhibitors, ARBs, calcium channel blockers, diuretics. Each class has a distinct mechanism and the engine reflects that.
  - **Anti-inflammatories** — aspirin, ibuprofen, paracetamol.
  - **Mental health** — common antidepressants (SSRIs, SNRIs), common anxiolytics. Each has measurable metabolic and appetite-side effects.
  - **Stimulants and depressants** — caffeine, cannabis, common recreational stimulants and depressants.

  Anything outside the library is recorded as "drug, no modeled effect" so the timeline still reflects the user's actual life even when the simulator can't follow the chemistry. Per-drug dose, route, and timing are captured. Effects propagate through the same flows as food and exercise — a beta-blocker visibly slows the heart and shifts fuel selection; a GLP-1 agonist visibly suppresses appetite, slows gastric emptying, and flattens postprandial blood glucose curves; a statin lowers circulating LDL; metformin shifts liver blood glucose release; exogenous insulin acts on the same insulin receptors as the body's own. The detailed pharmacology lives in `background/medications.md` (forthcoming).)
- **Illness and acute conditions** (acute infections like pneumonia, gastroenteritis, influenza, common cold; acute injury; acute psychological events. Each is an event with a duration, severity, and resolution profile. While active, the body's parameters shift — fever raises basal metabolic rate, inflammation diverts amino acids toward immune protein synthesis, appetite suppression reduces intake, recovery extends. The simulator carries a small library of common acute conditions; users can define their own. Distinct from the chronic conditions on the body axis (Section 8) — chronic conditions are state, acute conditions are events.)

Age and life stage gate which event kinds are offered in the editor — alcohol, tobacco, and most drugs are not offered for a child body without explicitly overriding the default.

**Exercise and recovery are paired.** Every exercise event triggers an extended recovery process that the engine simulates explicitly. In the immediate post-exercise window, muscle glycogen refills fast (the elevated insulin sensitivity in that window makes this the fastest moment for restocking). Over the following 24–48 hours, intramuscular fat refills more slowly. Micro-damage repair and protein synthesis depend on amino acids supply and on sleep. On the timescale of weeks, the longer-running adaptations show up — mitochondrial density, capillary density, heart stroke volume, intramuscular fat capacity — and feed back into Health and the engine's rate constants. Inadequate recovery between sessions (too short an interval, too little sleep, too much overall load) accumulates as elevated cortisol, reduced subsequent performance, and over time a downward trajectory in muscle Health rather than upward. Recovery is a first-class outcome of the exercise event in the simulator, not a passive default.

**Duration over points.** Meals, exercise, drinking, and sleep are modeled as duration-based activities laid onto the planner's minute-grid clock, not as instantaneous point events. They begin at a simulated minute, remain active across a span, and contribute incrementally while that span is in progress. The planner therefore shows them as bars with duration, and the engine consumes them as active intervals rather than one-tick impulses.

**Recurrence:**
- One-off (a single hamburger at 12:30 on day three)
- Daily at a fixed time (breakfast at 07:30 every day)
- Multiple times per day (three meals plus two snacks)
- Every N days (long run every third day)
- Weekly pattern (heavier eating on weekends)

Recurrence is selected from a visible pill-chip row inside the event editor — *None / Daily / Every N Days / Weekly Pattern / Multi-Daily* — with the chosen chip's sub-options (which days of the week, what times of day, how many per day) opening below the chip row. At *Compact* the pill row sits above the event-detail bottom-sheet rather than being hidden inside it; the user must see what recurrence shape is active without a tap. Recurrence is what turns a one-off into a scenario, and a scenario is what the simulator is for.

**Cycle sets.** The schedule editor's top section is organised into visible cycle lanes rather than one undifferentiated repeating list. The default lane set is intentionally minimal: **One-Off** and **Daily**. Additional repeating lanes are added explicitly by the user through a custom-lane flow, not seeded automatically. Each lane shows its own day cells and the events pinned into them.

**Schedule above, editor below.** In the dedicated event-planner workspace, the planner can take over the whole midsection detail area rather than living as a sub-pane beside body status. The top section is the schedule itself — day cells within the active cycle lane, with events rendered as bars or chips. The lower section is the event editor. Tapping or clicking the schedule at a time/location opens the detail editor, which asks first for the event kind and then expands the appropriate form below. Events are therefore created from the schedule itself rather than from a disconnected "new event" dialog. Along the bottom of the page, beneath both the body-status and event-planner workspaces, sits the persistent timeline / run bar: the shared scrubber for recorded history, event marks, bookmarks, and run-position context.

**Cycle model.** The planner always supports a one-off event and a permanently repeating daily cycle. Beyond that, the repeating-cycle model is open-ended: the user can add as many extra cycle lanes as needed, each with an arbitrary user-specified duration. Events can be placed on any cycle regardless of its length. The common examples are a **1-day** cycle for meals and sleep, a **2-day** alternating cycle for exercise schedules, and a **7-day** weekly cycle for selected drinking days, but these are examples rather than pre-seeded defaults. All repeating cycles run forever, dropping their events into the simulation at the appropriate times and for the appropriate durations.

**Cycle layout.** Cycle planners read **down by hour and across by day**. Events can span any duration, including rolling over midnight into the first minutes or hours of the next day. The planner always indicates where the simulation currently is within the active cycle so the user can see where the next drop-in events will come from and avoid placing something "before" the current cycle position by mistake. Selecting a cycle in the rail or planner centers the detail view on that cycle's current position.

Each event has an *amount* and an *intensity*. Both are explicit numbers with units in the editor; the user is never asked to pick from "small / medium / large."

**Two run modes:**
- *Manual* — user advances time and triggers events directly. Good for "what does one hamburger do?"
- *Scheduled* — the calendar runs autonomously with the time control. Good for "what does ten years of this pattern do?"

---

## 10. Scenarios

A scenario bundles one or more starting bodies, a calendar (or a set of per-individual calendars), and a time-control default. Built-in scenarios are *examples* of what the simulator can do, not a closed catalogue — most of the value comes from users assembling their own.

**Single-body examples:**

1. **Healthy 20-year-old, balanced diet** — baseline reference scenario.
2. **Single Hamburger** — healthy 20-year-old, one hamburger, watch the next twelve hours.
3. **Years of Fast Food** — healthy 20-year-old starting point, calendar of three fast-food meals daily, sedentary lifestyle, run for ten simulated years.
4. **Endurance Athlete** — high training volume, deliberate carbohydrate timing, structured recovery between sessions. Includes rest days; demonstrates how stores refill in the post-exercise window, how rest shapes the weekly trajectory, and how cumulative load without recovery turns into overtraining.
5. **Sedentary Knowledge Worker** — typical office schedule, moderate diet, no formal exercise.
6. **Aging Well** — moderate exercise, reasonable diet, run for thirty simulated years.
7. **Intermittent Fasting** — same diet quality as baseline but compressed eating window.
8. **Recovery from Acute Illness** — short scenario showing how a fever and reduced appetite shift fuel flows.
9. **From Birth** — start at day zero with newborn physiology and run forward, with the calendar shifting through life stages: infant feeding, childhood growth, adolescent appetite and sleep, adult maintenance, mid-life, late-life. The simulator highlights which needs change and why at each transition (caloric requirements per kilogram of body mass, protein demand for growth, hormonal shifts at puberty, declining metabolic rate with age, recovery time lengthening). Designed for very high time multipliers; meaningful as an arc, not a moment.
10. **A Night Out** — healthy adult, an evening of moderate-to-heavy alcohol consumption with a typical dinner. Watch blood ethanol rise and clear, fat-burning suppression, dehydration, and the next-day sleep and Health consequences over 36 hours.
11. **Twenty Years of Smoking** — healthy 20-year-old, twenty cigarettes a day for twenty years. Watch lung gas-exchange capacity drop, vessel walls thicken, oxygen ceiling fall, and downstream effects on exercise tolerance and cardiovascular Health. Compare against the same body that quits at year ten.

**Multi-body examples (use the Multiple Individuals view):**

12. **Comparing Different Individuals** — same calendar (a typical week), different bodies. Spans the ordinary documented human range on the dimensions described in Section 8: sex, age, insulin sensitivity, baseline metabolic rate, fast/slow muscle fibre balance, fat distribution tendency. Shows how identical inputs produce different outputs across normal human variation. A "same body except for sex" pairing is one of the included presets — useful for separating sex-driven differences from everything else.
13. **Comparing Lifestyles** — identical bodies at the start, different calendars. Sedentary vs. moderately active vs. endurance-training, or balanced diet vs. fast food, or seven hours of sleep vs. five, or daily-drinker vs. teetotaller. Same starting point; ten years later, different bodies.

**Disease-state examples:**

14. **Type 2 Diabetic** — body with established type 2 diabetes (reduced insulin sensitivity, elevated baseline blood glucose, partial liver and muscle insulin resistance). Watch how a typical day's eating and a single hamburger play out differently than in the healthy baseline. Compare the same body before and after starting metformin or a GLP-1 receptor agonist.
15. **Heart Disease** — body with established atherosclerosis (narrowed vessels, reduced cardiac output capacity, elevated blood pressure, elevated LDL). Watch how exercise tolerance is reduced, how a high-saturated-fat meal affects vessel state acutely and chronically, and the effect of starting a statin and a blood-pressure reducer.
16. **Acute Pneumonia** — healthy adult contracts pneumonia. Watch the acute shift in metabolic parameters: elevated basal metabolic rate from fever, suppressed appetite, diverted amino acids toward immune response, reduced lung gas-exchange capacity, slowed recovery. A 14-day arc through the illness and recovery, with and without antibiotic treatment.
17. **From Pre-diabetic to Diabetic** — body starting at the high end of healthy with insulin sensitivity declining slowly under sustained excess intake and inactivity. Watch the trajectory across a decade as type 2 diabetes develops, and the divergence under intervention (diet change, exercise, GLP-1 agonist) at different points along the path.

**Scenario format.** Scenarios are JSON files. They support both single-individual and multi-individual setups, both shared and per-individual calendars, and references into the food library. Users can save and load their own. Scenario sharing is a URL-encoded round-trip: the entire scenario fits in a URL fragment, so a user can paste a link into chat and the recipient gets the same setup without any backend.

**Life stages.** The "From Birth" scenario depends on the engine modeling life stage as part of body state. Growth, puberty, peak adulthood, and aging each shift the engine's parameters: caloric requirements, protein demand, hormonal baselines, recovery rates, and the deterioration constants behind the Health score. The simulator labels the current life stage prominently when it differs from "adult" and notes transitions in the event log.

---

## 11. The Simulation Engine

A single-file TypeScript module. Pure functions where possible; one mutable state object that the engine advances one step at a time. In multi-individual mode the engine instantiates once per body, with a coordinator advancing them all on the same clock.

**State, conceptually:**
- A `Substance` table — for each tracked substance (blood glucose, body fat, amino acids, etc.), the current amount in each location.
- A `Location` table — for each anatomical location, current physical properties (volume, capacity, condition).
- A `Hormone` table — current bloodstream level of each tracked hormone. v1 covers, at minimum: insulin, glucagon, epinephrine (adrenaline), cortisol, growth hormone, thyroid hormone, testosterone, estrogen (oestrogen), progesterone, leptin, ghrelin, Gut leptin (GLP-1), vasopressin (vasopressin / ADH), aldosterone, and parathyroid hormone. Some of these names are tentative — see the naming note in Section 3.
- A `Tissue` table — slow-changing tissue properties (muscle mass per group, vessel wall thickness, liver fat percentage, fat tissue mass distribution) plus the trainable dimensions exercise affects: mitochondrial density, heart stroke volume, capillary density, intramuscular fat capacity, glycogen capacity, oxygen ceiling, vascular health, and metabolic flexibility.
- A `Health` table — per-organ Health scores. The engine's rate constants for each location read from this table, so changes to Health visibly change behaviour.
- An `Age` and `Life Stage` field on the body. These gate which parameter set the engine uses (newborn, child, adolescent, adult, mid-life, older adult) and shift baselines across all the other tables.
- A `Sex` field on the body, with the corresponding sex-hormone baselines (testosterone, oestrogen, progesterone) entering the `Hormone` table and shifting parameters in the `Tissue`, `Substance`, and `Health` tables — body composition targets, muscle protein synthesis response, fat distribution, bone density trajectory, alcohol clearance, iron handling. For females of reproductive age, a slow cyclic modulation of the sex hormones is layered on top.
- A `Foreign Substance` table — blood ethanol, Blood Nicotine, carbon monoxide load on red blood cells, and active levels of each modeled drug or medication. These flow and clear like other substances, gate or modulate hormone levels and organ function while present, and contribute to chronic Health change with cumulative exposure.
- A `Conditions` table — the body's chronic and acute conditions with severity. Each condition modulates rate constants in the other tables: type 2 diabetes reduces effective insulin sensitivity; atherosclerosis reduces vessel elasticity and lumen; COPD reduces lung gas-exchange capacity; hypothyroidism reduces basal metabolic rate; acute infections temporarily raise basal metabolic rate, raise cortisol, and divert amino acids toward immune protein synthesis. The Conditions table is read by every other table — conditions don't sit alongside the simulation, they reach into it.
- An `Event` queue — pending calendar events that fire at their scheduled simulated time.

**One simulation step:**
1. Apply any events firing in this step (eating, starting exercise, etc.), and advance any already-active duration events by the current time slice.
2. Compute hormone levels from current substance levels and active state (eating, exercising, sleeping, stressed).
3. Compute flows: each substance moves between locations according to its rules, gated by hormones.
4. Apply consumption: cells burn fuel proportional to their current activity demand.
5. Apply slow processes at lower frequency: tissue remodeling (muscle gain/loss, fat accumulation, vessel wall changes), exercise-driven adaptations (mitochondrial density, capillary density, stroke volume, intramuscular fat capacity), and recovery debt (when recent training load outruns sleep and rest, this drives cortisol up and Health down). These updates run once per simulated day, not every step.
6. Bookkeeping: clamp to physiological limits, log notable events, record series for the charts.

**Rate-of-change shape:** Every flow is a saturating curve, not a linear or hard-clipped relation. This matters because the body's machinery has finite capacity everywhere — a cell can absorb blood glucose only so fast, the gut can ship dietary fat only so fast, the liver can produce ketones only so fast. The simulator gets its qualitative behaviour from these saturations, not from specific magic numbers.

**Per-constant provenance.** Every numerical constant in the engine — every rate, every capacity, every saturating-curve parameter — is annotated in code with a structured comment naming its source: the section of `background/` where the value is defended (or flagged as soft) and, where applicable, an external citation. The engine carries a debug overlay that surfaces the provenance of any value displayed in the UI, so a user (or a reviewer) can ask "where does this number come from?" and read the answer without leaving the simulator. This is not extra work: the constant count is small (~100s, not 10,000s), and committing to the discipline at code level forces the design's calibration questions to stay visible rather than getting buried.

**Recovery as parallel pools.** Recovery is not a single number — it is several refill or clearance processes running in parallel, each with its own time constant. ATP / phosphocreatine restore in seconds. blood glucose normalises in minutes. lactate clears in tens of minutes. glycogen stores refill over hours, faster inside the post-exercise sensitivity window. intramuscular fat refills over 24–48 hours. Muscle damage repair runs over days. Connective tissue remodels over weeks. The engine tracks each pool separately so the visible state at any moment reflects the actual mix of "what is back" and "what is still recovering."

**Asymmetric training and detraining.** The trainable dimensions (mitochondrial density, oxygen ceiling, capillary density, intramuscular fat capacity, and the others on the `Tissue` table) adapt to training stimulus on a multi-week timescale, but they decay slightly faster when stimulus is removed than they accrue when stimulus is added. The engine uses asymmetric rate constants for the up-curve and the down-curve, reflecting the documented "use it or lose it" pattern.

**Conservation:** Mass and energy are conserved within tracked compartments. A unit of blood glucose leaving the gut must arrive somewhere else (or be burned, in which case its energy enters the body's heat budget). The engine includes a debug overlay that displays running totals for sanity-checking.

**Adaptive step size:** At low time-multipliers the engine may sub-step at 1-second resolution for fast physiology, but the planner and scheduled-activity clock are minute-granular: duration events are attached to minutes and contribute incrementally across those minute slices while active. At higher multipliers the engine switches to 1-minute, then 1-hour, then 1-day steps as the fast processes are no longer being watched. The chronic-effect logic (tissue remodeling, vessel wall changes) runs at a daily step regardless of what the fast loop is doing, so years-long runs remain accurate for the slow stuff even at extreme speeds.

---

## 12. Ranges of Modeled Behaviour

Five timescales the engine handles:

- **Seconds** — heartbeat, breathing, neurotransmitter dynamics (sketched, not detailed).
- **Minutes** — digestion onset, hormone surges, fuel switching during exercise.
- **Hours** — full digestion of a meal, sleep cycles, daily hormonal rhythm.
- **Days** — refilling fat depots, recovery from a hard workout, daily energy balance.
- **Months to years** — body composition shifts, muscle gain or loss, vessel wall condition, liver fat accumulation.

The engine resolves all five — but not at full detail simultaneously. At 1× speed seconds are visible; at 1-day-per-second speed seconds are abstracted away.

---

## 13. Calling Out Unsettled Science

Some pieces of the model are genuinely contested in the literature. The simulator handles this by:

1. Flagging the affected component visually (a small badge on the legend; the tooltip explains).
2. Defaulting to a defensible mainstream value but exposing the alternative as a selectable hypothesis in the scenario editor.
3. Linking from the badge to a short note in the `background/` folder explaining the disagreement and what the simulator picked and why.

**Selectable hypotheses.** Where the literature offers genuinely competing models — not just numerical disagreement, but different shapes of the underlying relationship — the simulator carries each as a *named hypothesis* the user can switch between. The scenario editor presents these as a small set of radio choices per topic. Examples:

- **Alcohol cardiovascular dose-response** — J-shaped (moderate intake protective) / monotonic harm (any intake harmful, increasing with dose) / threshold (no effect below a dose, harm above).
- **Carbohydrate-excess-to-fat conversion** — efficient direct conversion / near-zero in normal life (de novo lipogenesis is rare in humans) / threshold-only (only above large carbohydrate excess sustained for days).
- **Post-exercise anabolic window** — narrow critical window (30–60 minutes) / broad window (3–4 hours) / total daily intake dominates (window largely irrelevant for non-elite training).
- **Saturated fat and vessel walls** — linear dose-response / threshold above which damage accelerates / minimal effect with other markers (apoB, lipoprotein particle number) explaining the apparent link.
- **Stress-hormone effect size in healthy people** — large (chronic life stress drives metabolic dysfunction in most people) / moderate / minimal (effects show only at clinical-stress levels).
- **HIIT vs steady-state for cardiovascular adaptation** — equivalent at matched effort / HIIT superior per minute / steady-state superior for vascular health long-term.

The user picks one hypothesis per topic; the simulator runs that model. Hypothesis selections are encoded in saved states, scenarios, and shared URLs, so a recipient sees the same model the sender chose. A multi-individual run can deliberately pair the same body under two different hypotheses to visualize the divergence — an honest way to communicate "this is what we don't know yet."

Where a hypothesis selection would meaningfully change a chart or visualization, the legend names the active hypothesis so a screenshot is never ambiguous about which model produced it. When the user has switched away from the mainstream default, the relevant on-screen elements — chart legends, organ glow intensities, vessel-wall thickness in the long-term diagrams (Section 4) — carry a small badge identifying the active hypothesis. This explicit epistemic layer is, as far as the prior-art survey could tell, novel in browser-based physiology tools: none of the surveyed candidates exposes hypothesis selection to the user at all. Treating it as a deliberate competitive feature, not just an honest hedge, is the right framing.

Examples of areas this applies to:
- The exact contribution of dietary fat composition (saturated vs unsaturated) to vessel wall changes.
- The fraction of carbohydrate excess that becomes fat directly versus first refilling sugar polymer stores.
- The quantitative effect of meal timing on insulin sensitivity over months.
- The role of gut bacteria byproducts in human energy balance.
- The effect size of psychological stress on cortisol in healthy people.
- The shape of the dose-response curve for moderate alcohol on cardiovascular outcomes (the "J-curve" debate).
- The long-term metabolic and neurological effects of recreational cannabis at typical recreational doses.
- The relative contribution of nicotine versus combustion products to the chronic damage from tobacco.
- The size of menstrual-cycle effects on metabolism, exercise capacity, and insulin sensitivity in healthy females.
- The mechanism and magnitude of the female-vs-male difference in alcohol clearance beyond the body-water-volume explanation.
- The exact intensity boundary between the "fat-burning zone" and the "carb-burning zone" in exercise (the so-called crossover point).
- The magnitude of the post-exercise oxygen consumption tail (the "afterburn") and how much it adds to total session energy expenditure.
- The optimal recovery duration between hard training sessions for adaptation rather than overtraining.
- Whether high-intensity intermittent training fully matches sustained moderate-intensity training for cardiovascular adaptation.
- The metabolic and adaptive effects of fasted exercise (training before eating) versus fed exercise.
- Whether muscle damage from training is necessary for muscle growth or merely a frequent side-effect.
- The size and uniqueness of the post-exercise glycogen-refill window — a critical 30–60 minute period vs a broader several-hour window vs total daily intake dominates.
- Leptin resistance and the appetite rebound after weight loss — magnitude, time course, and reversibility.
- The functional purpose (not the existence) of the cortisol awakening response — protective mobilisation, stress preparation, or no clear adaptive role.
- The mechanism behind the athlete's paradox — why intramuscular fat correlates with fitness in athletes but with insulin resistance in sedentary people.
- The contribution of brown adipose tissue to adult human energy expenditure — meaningful at typical ambient temperatures or only under cold exposure.

The default position is humility, not authority.

---

## 14. Look and Feel

- Light and dark modes, both first-class. Diagrams use a palette that reads well in either. Snapshots respect the active mode at capture time.
- Anatomical schematic is hand-drawn SVG, not a procedurally generated mesh. Aimed at clarity, not realism. No gore.
- Flow animations use small particles travelling along defined paths. Density of particles encodes flow rate. Paths run inside the body figure as well as between system nodes — particles travel along the digestive tract from stomach through small intestine, along the bloodstream from gut through portal vein to liver to systemic circulation, and along the lymphatic ducts from gut through thoracic duct to bloodstream. Particle paths are part of the Section 4 fixed layout and read as the body's plumbing made visible.
- Stored quantities use filled containers (bars, vials, organ silhouettes) whose fill level encodes amount and whose colour encodes saturation.
- Hormone levels are shown as glow intensity on the producing organ plus a corner gauge.
- Typography is system-default sans-serif. No icon fonts; SVG icons inline.
- The active simulated time and date are always visible in the top bar. The current scenario name is always visible in the bottom-right. *At Compact, this is a single chip in the top-right showing simulated date and time-of-day, with the time multiplier (×60, ×3,600, ×86,400, etc.) as a subscript or small adjacent chip; on tap, the chip expands to a bottom-sheet with the full multiplier ladder. The top-left carries the simulator title or scenario name. The bottom-right scenario commitment becomes a 'scenario chip' in a dedicated row above the lifespan timeline, since the bottom-right corner is occupied by the bottom-nav at Compact.*
- The first-row **Sim Bar** is always visible in the app implementation. At *Compact* it is a dense but finger-sized strip: run-name chip, play/pause, reset, scrub handle, speed chip, and an overflow affordance for duplicate / rename / delete / branch actions. At wider tiers it expands into a full transport bar with labels.
- The second-row **Viewer Bar** is also always visible. It owns label mode (*Plain / Technical / Mixed*) and the time-aggregation window for over-time displays (*Instant / Minute / Hour / Day / Week / Year* where relevant). At *Compact* it is horizontally scrollable chips; at wider tiers it can render as segmented controls.
- The bottom **timeline / run bar** is the lower counterpart to the top status chrome and follows the same persistence rules: always visible, shared across views, and layout-stable. It carries the active run's timeline, current pointer, bookmarks, event marks, and replay/scrub context. At *Compact* it occupies the dedicated band above the bottom-nav and collapses detail rather than disappearing.
- The **header / midsection / footer** split is persistent across views. The header is title plus high-level body status. The footer is experiment control plus timeline slider. The midsection contains the master/detail workspace: systems rail on the left, detail panels on the right.
- A **Lifespan Timeline** strip sits along the bottom of every Whole Body and Long-Term State view, showing the body's life arc from birth to projected end-of-life with current simulated age marked, life-stage segments labelled and visibly demarcated (prenatal / infancy / early childhood / middle childhood / adolescence / young adult / adult / middle age / older adult), and bookmarks (Section 7) pinned along it. When the active life stage's natural resolution differs sharply from the lifespan-arc resolution — most obviously infancy, where development is paced in months not years — a second sub-scrubber appears beneath the lifespan strip, zoomed to that life stage and labelled with its developmental milestones. For runs spanning years the lifespan strip is the Section 7 history scrubber; for runs spanning hours or days it collapses to a thin band and the Section 6 time-multiplier slider takes the foreground. The scrubbers are stacked, not alternative. *The Lifespan Timeline is non-negotiable at Compact. Every Compact-tier layout reserves a band of ~64–80 px immediately above the bottom-nav, with current age marked, life-stage segments first-letter-abbreviated and visibly demarcated, the active life stage named in full above the strip, and bookmarks pinned as small dots above the strip with tap-to-jump. The KPI / status / detail-panel content above the timeline is what flexes; the timeline does not.*

**Mobile first.** The simulator's primary form factor is a phone. The Compact layout is not a graceful-degradation fallback for a desktop design — it is the *baseline* design, the one that must work end-to-end before any larger size is considered. Every scenario must be runnable to completion on a 360 × 640 phone screen with the schematic, time controls, charts, event log, and bookmarks all reachable without horizontal scroll, and snapshots must be legible at that resolution. Larger viewport sizes *add* density and panels; they do not introduce features that aren't reachable on the phone.

This shapes the build sequence: Phase 2's Whole Body view ships at Compact density first; the wider tiers come once the small one is right. It also constrains the budget — JavaScript bundle weight, animation cost, and memory footprint are sized for a mid-range phone, not a workstation.

**Responsive layout.** Detail level scales smoothly with available pixels, from 320 × 200 embedded all the way up to 4K. The anatomical layout itself is fixed (the heart is always where the heart is); each tier *adds* to the previous, never reorganises:

- *Compact* (≤ 640 px wide) — the baseline. Anatomical silhouette with the most load-bearing flows and stored amounts. Hormone gauges collapse into a corner sparkline. Charts collapse into a single most-relevant series. Multi-individual mode caps at two bodies. Touch targets sized for fingers (44 × 44 px minimum). The visible-tap-target *budget* is approximately 10–14 targets at any moment — beyond that, target boundaries crowd and even targets meeting the 44 × 44 minimum become unreliable. The active-view layout is built to that budget; the long tail of secondary actions hides behind a single 'more' affordance (bottom-sheet, accordion, or hamburger menu). The budget is per-view; switching views replaces the visible set. View switching itself lives in a fixed bottom-nav of four to five icon-and-label tabs covering the most common destinations (Whole Body, Fuel Flows, Hormones, Long-Term State at minimum; secondary views via 'more') — the user's stable reference for where they are in the simulator's structure.
- *Standard* (641–1280 px) — adds the full set of major flows and quantities to the schematic. Hormone gauges visible. Side panel for charts and timeline.
- *Detailed* (1281–1920 px) — adds secondary flows, micronutrient indicators, foreign-substance gauges, and the full event log alongside the schematic.
- *Spacious* (≥ 1921 px) — adds the multi-individual grid alongside the primary view, full-resolution charts, and a wider event log with search.

The user can override the auto-selected density level — pinning a small viewport to *Detailed* (with scrolling) or a large viewport to *Compact* (for a clean glance). Snapshots and recordings respect the active density at capture time.

**Visual style.** The simulator ships with several rendering styles, switchable at any moment without losing simulation state. The exact set will be decided after design research; the styles below are *examples* of the kind of range we want to cover, not a fixed list:

- A *colourful, slightly cartoon-like* style — friendly organ silhouettes, soft shading, a distinct palette per system. The kind of look aimed at non-specialists and teaching.
- A *lean, instrument-panel* style — numeric readouts foregrounded; bars, gauges, and small sparklines in place of organ illustrations. The kind of look aimed at users who want quantitative density.
- An *elegant line-drawing* style — single-weight or double-weight strokes, minimal fill, monochromatic with one accent colour. The kind of look aimed at presentation, print, and snapshots that need to read as illustrations rather than UI.

The architectural commitment is the rendering layer, not the specific styles: each style is a separate rendering pass over the same simulation state and the same anatomical layout. Flow particles, fill levels, glow intensities, and gauge readings come from the same numbers regardless of style — only the drawing differs. Light and dark modes apply within each style. The active style is encoded in saved states, scenarios, recordings, and shared URLs, so a recipient sees the same visual choice the sender intended.

The stylized health diagrams (Section 4) carry their own visual register, which is permitted to differ from the headline schematic's visual style — see that section for the reasoning.

**Style-selection validation.** Before any visual style ships, it must be rendered side-by-side at two density tiers (Compact and Standard at minimum, plus Detailed for desktop-leaning styles) to verify it scales without losing legibility. This catches styles that look great in a hero illustration but fall apart at phone size — the most likely failure mode given the mobile-first commitment. The exercise is a required step during the visual-research phase of Phase 10; the validation pairs themselves end up as artefacts in `background/visualization-ideas/`. *The Compact-tier rendering is produced at actual rendered pixels — a real 360-px-wide DOM render screenshotted from a real or emulated device — not from a generative-AI mockup or a high-DPI asset scaled down. Generative-AI mockups produce phone-shaped images at high source resolutions where strokes, glows, and small typography read crisply; the same rendering at true 360 px frequently degrades. The validation must catch that gap; the rendering medium is the actual web stack, not the design tool.*

**Life-stage-art requirement.** Each visual style must answer "what does this body look like at every life stage the simulator runs across — infant, child, adolescent, young adult, adult, middle-aged, older adult?" before it ships. The Section 4 commitment to visible aging — skin tone, posture, muscle definition, vessel wall thickness, organ silhouettes shifting as years pass — is one face of this; rendering an infant body credibly for the From Birth scenario (Section 10) is another. Painterly, line-drawing, and vintage-plate styles render life stages natively (the body itself is drawn at that stage). Instrument-panel and dashboard styles render life-stage shifts through the Section 4 stylized health diagrams, the readout vocabulary (which is itself life-stage-conditional, see Section 4), and the central figure where one is shown — each style must have a life-stage-art plan covering every stage the From Birth scenario passes through and every age the Aging Well and Years of Fast Food arcs reach. A style without a credible answer to either end of this question is not yet ready to be the simulator's main visual register.

**Figure-rendering pole.** Each visual style commits to one of two figure-rendering poles, decided when the style is selected:

- **Fully diagrammatic** — no human figure on screen, only organs, vessels, flows, and gauges in the Section 4 layout.
- **Figure-present** — a body figure is rendered, with the internal anatomy shown through a deliberate visual device chosen by the style: anatomical opening, translucent skin, x-ray glow, or similar.

Mixed or undecided figure-rendering is not a third option. This commitment is partly aesthetic and partly practical: image-generator pipelines and stock-illustration sources both treat the diagrammatic and figure-present poles as routine, and the middle ground (partially-clothed figures with translucent torsos showing internal anatomy through skin) as content-policy-sensitive. The choice has direct consequences for asset production. A style's figure-rendering pole is recorded alongside its name in the visual-style manifest so future visual-research runs can prompt for the right pole rather than discovering the friction at output time.

Within the figure-present pole, each style further commits to a specific reveal *technique*, recorded in the same manifest:

- **Anatomical opening** — sectioned torso, internal organs visible through a deliberate cutaway.
- **Translucent skin** — attenuated skin layer over rendered viscera; demographically and life-stage-portable.
- **X-ray glow** — luminous viscera on a dark silhouette; reads well on dark backgrounds, feathers at small pixel sizes.
- **Line engraving** — cross-section in single-weight line art; demographically rigid (age/sex change requires re-drawing).
- **Vector overlay** (transparent-stage diagram) — flat body silhouette with the active anatomical system drawn directly on it in flat-colour vector strokes, no concealment device. The body is a transparent stage; the system is the figure. Single-weight strokes, flat fills, no glow, no gradient, no raster. Most demographically and life-stage-portable of the five techniques (silhouette is one layer, system overlay is another; swap either independently); handles both figure-rendering poles with one asset (render silhouette for figure-present, hide it for fully diagrammatic); the most SVG-friendly. The principal limit is colour bandwidth — combined views (cardiovascular + respiratory + digestive simultaneously) need a colour discipline that doesn't degrade to *everything-is-red-and-blue*.

Techniques relying on glow gradients or fine painted detail must be tested at actual 360-px-wide rendered pixels before adoption. Of the four, translucent skin is the most demographically and life-stage-portable; anatomical opening hits content-policy friction in image-generation pipelines for infant and pre-pubescent subjects.

---

## 15. Technology

The simulator must run as a static page on GitHub Pages — no backend, no build server.

- TypeScript for the engine and UI logic.
- A small build step (Vite or esbuild) producing static HTML + JS + CSS bundles. Output is committed to `gh-pages` branch or built by GitHub Actions.
- **SVG for the figure and diagrams; Canvas for particles; HTML for chrome.** The central body figure, the anatomical-system overlays (cardiovascular, respiratory, digestive, hepatic, renal, lymphatic), the Section 4 stylized health diagrams (vessel cross-section, bone density, body silhouette, liver, lung, muscle, skin), and all per-organ icon insets are hand-tuned SVG. Canvas is reserved for the Section 14 flow-particle animation layer that travels along the SVG paths. The DOM/HTML layer carries chrome (top bar, bottom-nav, lifespan timeline, side panels), charts (sparklines, full-resolution time-series), and controls. This three-layer architecture — fixed SVG schematic + dynamic Canvas particles + reactive HTML chrome — is what every visual style renders into; only the SVG layer's drawing pass changes between styles.
- No heavy framework needed. **Preact** is the chosen reactive layer for the shell and upcoming views: small enough for the project's constraints, but structured enough for the Sim Bar, Viewer Bar, planner, persisted-run shell, and later view components. Avoid React + ecosystem unless a clear need emerges.
- Web Workers carry the simulation engine off the UI thread, so the engine can run flat-out without stalling rendering.
- All state is local. Saved scenarios use IndexedDB; shared scenarios use URL fragments.

**Persistence architecture.** IndexedDB stores run manifests, per-run snapshots/history chunks, event logs, bookmarks, and saved scenarios. localStorage is reserved for tiny global preferences only. The persistence boundary follows the run model from Section 7, not the current view: changing from Whole Body to Timeline does not change what is saved because the saved thing is the run.

**Test-driven development.** All engine and view code is built TDD. Write the failing test first, then the implementation. The simulation engine benefits hardest — its substances and flows are pure functions with deterministic inputs and outputs and well-defined reference curves to assert against. UI work uses component-level tests (logic, state transitions, label rendering, label-mode switching, bookmark behaviour, time-control dispatch); pixel-level visual regression is too brittle for a hand-tuned anatomical diagram and is *not* part of the test suite. Tests live alongside the source files they cover. The CI workflow runs the full suite on every push; a red test blocks deploy.

This commitment shapes the engine's structure as much as the dev process: pure functions where possible, mutable state confined to one well-defined object, side effects pushed to the boundaries. Code that's hard to test gets refactored.

**Performance target:** ten simulated years of the "Sedentary Knowledge Worker" scenario should complete in under thirty seconds of wall-clock time on a typical laptop, with the UI remaining responsive throughout. The engine should comfortably hit 1 million simulated seconds per real second on the slow-only paths.

---

## 16. File Layout (planned)

```
metabolic-sim/
├── README.md                  human-friendly intro
├── AGENTS.md                  guidelines for any agent working in the repo
├── design/
│   ├── README.md              what's in design/
│   ├── AGENTS.md              guidelines for design-doc editors
│   ├── design.md              this document — what gets built and why
│   ├── plan.md                the build plan — phases, current status, log
│   └── glossary.md            canonical mapping: variable / scientific / plain names
├── background/
│   ├── README.md              research index + completion status
│   ├── AGENTS.md              guidelines for research agents
│   ├── metabolic-pathways.md  the science we're modeling
│   └── (more research notes as topics come up)
├── app/
│   ├── README.md              orientation for humans
│   ├── AGENTS.md              guidelines for coding agents
│   ├── index.html
│   ├── src/
│   │   ├── engine/            simulation core (pure, framework-free)
│   │   ├── views/             whole-body, fuel-flows, hormones, long-term, timeline, charts, multi-individual
│   │   ├── ui/                shared UI components, time control, scenario editor, food picker
│   │   ├── scenarios/         built-in scenarios as JSON
│   │   ├── foods/             food library — real foods with modeled composition
│   │   ├── history/           save/load, history buffer, recording export
│   │   ├── naming/            functional ↔ technical name dictionary
│   │   └── main.ts
│   └── public/                static assets, diagrams, favicon
└── .github/workflows/         GitHub Pages deploy
```

**`design.md` is the *what*; `design/plan.md` is the *when*.** When the order of work or the status of phases changes, update `plan.md`, not `design.md`. The design itself stays stable; the plan moves with the work.

---

## 17. What This Document Does Not Decide

These are deliberately deferred until earlier phases force a concrete answer:

- The exact numerical constants for every flow. Phase 3 settles them empirically against reference curves cited in the background notes.
- The precise drawing of the anatomical schematic. Hand-drawing happens in phase 2 against a real layout sketch, not in advance.
- Whether the long-term tissue remodeling deserves its own slow-tick engine module or sits inside the main loop. Decided in phase 5 based on profiler data.
- The exact set of supplements with modeled effects. Decided in phase 6 once we know what users actually try to add.
