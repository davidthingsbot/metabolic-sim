# AGENTS.md — design/

Guidelines for any agent editing files in `design/`.

## Two files, two purposes

- **`design.md`** is the *what*. It describes the system being built. It is curated, stable, and changes only when an explicit decision moves it.
- **`plan.md`** is the *when*. It tracks phases and current status. It is meant to move — update status markers, add notes, log phase changes.

If the change is "we're going to build X", it belongs in `design.md`. If the change is "we finished phase N" or "phase ordering changed", it belongs in `plan.md`.

## Don't auto-merge research

When research lands in `background/`, do not auto-merge it into `design.md`. Read the research, identify the design-actionable items, write them up as a proposal, and wait for explicit approval before applying.

The pattern is: *summarize, propose specific edits, then apply on approval*. Do not skip the propose step.

## Section numbering

`design.md` uses contiguous numbered sections. When inserting or removing a section, renumber the rest. When adding new content, prefer extending an existing section over adding a new one — section count creep is a real cost.

If a section's number changes, search for cross-references in the same file (`see Section N`) and update them.

## Naming architecture (read `glossary.md`)

The canonical mapping for every named entity lives in `design/glossary.md`:

- **Variable** — camelCase code identifier (matches scientific name). Stable.
- **Scientific** — literature-standard name. Used in `background/` notes.
- **Plain** — user-friendly functional name. Default UI label.

`design.md` itself uses scientific names where it talks about engine internals; it uses plain functional names where it talks about what users see in the UI. Both are correct in their own contexts. Don't bulk-replace one for the other.

Renaming a display label is a single edit to `glossary.md`. Do not touch source code or other docs to "propagate" a name change — the dictionary is read at render time.

Metric units everywhere.

## What the design does not decide

`design.md` deliberately leaves some things open until earlier phases force a concrete answer. That section is load-bearing — do not "resolve" deferred items prematurely. If something genuinely needs to be decided now, propose it explicitly rather than slipping it in.

## Plan-file rhythm

Update `plan.md` when:

- A phase moves to in-progress or done.
- The order of phases shifts (record why in the change log).
- A phase's "done when" criteria need to change.
- Post-v1 deferred items shift, get added, or get pulled into v1.

Don't fork the build plan across multiple places. `plan.md` is the only living plan.
