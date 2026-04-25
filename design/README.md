# design/

This folder is where decisions live. It is the source of truth for what gets built and in what order.

## Files

- **`design.md`** — the design itself. What gets built and why. Numbered sections covering the visible system, views, time control, history, multi-individual mode, inputs and foods, scenarios, the simulation engine, modeled timescales, unsettled-science handling, look and feel, technology, file layout, and what the document deliberately does not decide.
- **`plan.md`** — the build plan. Phases, current status of each, definitions of done, and a change log. *This file moves with the work; `design.md` does not.*
- **`glossary.md`** — the canonical mapping for every named entity in the simulator. Three columns per entry: code variable, scientific name, plain functional name (with a Kids column reserved for the post-v1 Kids view). The simulator's runtime dictionary is generated from this file; renaming a display label is a glossary edit, not a code change.
- **`AGENTS.md`** — guidelines for any agent editing files in this folder.

## How to use it

Reading: start with `design.md` if you want to understand the simulator. Read `plan.md` if you want to know what's done and what's next.

Editing: changes to *what* the simulator is go in `design.md` after surfacing for review. Changes to *when* (status, ordering, phase definitions, or current-state notes) go in `plan.md`.

## Companion folders

- `../background/` — the research that feeds the design. Source of truth for the underlying science.
- `../app/` — the simulator itself.
