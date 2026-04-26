# AGENTS.md — background/svg-techniques/

Guidelines for adding a new SVG-techniques experiment.

## What goes here

Code experiments for the simulator's parametric SVG anatomy. Each experiment is a single self-contained HTML page that opens in a browser, exposes its parameters as sliders or choices, and re-renders an SVG live. Nothing in this folder is a commitment — it is upstream of the design and upstream of `app/`. The simulator's actual anatomy in `app/` will draw on what works here.

Sibling of `background/visualization-ideas/` (which is mood-board research, not code). Match its tone and "everything is exploratory" ethos.

## Naming experiments

Name an experiment by the **question** it asks, not the technique it uses. Good: `compact-body-readability/`, `lung-recursion-budget/`, `vessel-plaque-realism/`. Bad: `svg-with-gradients/`, `experiment-3/`, `pretty-lungs/`. The directory name should make it obvious to a future reader why the experiment exists.

Subdirectory names are short, lowercase, hyphen-separated.

## Self-contained, no build step

Every example must:

- Open in a browser via a one-line `python3 -m http.server` (or any static server) — no npm, no Vite, no webpack, no transpilation.
- Carry its own copy of the lib it depends on (Option A in `README.md`). Do not import up into `../../lib/`. Diverge fearlessly inside your own folder.
- Use vanilla HTML, CSS, and ES modules. No frameworks. No TypeScript. No bundler.

## Promoting improvements back to lib/

When an example's framework or panel change is genuinely better than what's in `lib/`, copy it back into `lib/` deliberately — diff in hand, decide which parts generalise, and apply only those. Note in your delivery summary which lib files you touched and which experiment they came from.

Do **not** silently sync forks back into `lib/`. The lib is the canonical home for the *common-denominator* version; one experiment's clever specialisation may not belong there.

## Each example carries a README

Short — typically 100–300 words. Cover:

- The question the experiment asks.
- What the example tries differently from the lib baseline.
- What it confirmed, what it disconfirmed, what's still open.
- How to run it (the one-line server command).

## Naming inside an experiment

Match the project. In code (panel ids, parameter keys, helper functions): camelCase, scientific-derived — `bodyFat`, `plaqueThickness`, `tidalVolumeFraction`, `boneDensity`, `liverFatFraction`. In UI labels visible to the user: plain functional names where `design/glossary.md` has one (e.g. `Body Fat`, `Liver Sugar Reserve`), plain English elsewhere. Metric units throughout. No acronyms in user-facing labels (acronyms are fine in code).

## Do not modify the design or the plan

Experiments here are upstream of design. Surface findings in your delivery summary and in the per-example README. The user folds the lessons into `design/design.md` and `design/plan.md` — those files are off-limits from this folder.

Do not modify `app/` from here either. Promotions into the simulator proper are a separate, explicit step the user takes when an experiment matures.

## Do not pre-create files outside this folder

If an experiment needs reference imagery, ask the user — do not drop placeholders into `background/svg-illustrations/` or anywhere else. The only directory you write into is `background/svg-techniques/`.

## After delivering

Return a short summary (under 300 words): the experiment subdirectory, the question it asked, what worked, what didn't, any lib changes you propose, and one or two follow-up experiments that fall out of what you found.
