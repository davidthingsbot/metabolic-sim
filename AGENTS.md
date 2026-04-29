# AGENTS.md — root

Guidelines for any AI agent working anywhere in this repository.

## What this project is

A browser-based metabolic simulator hosted on GitHub Pages. Plain-language teaching tool. See `README.md` for the human-friendly overview, `design/design.md` for the design, `design/plan.md` for the build plan and current status.

## Folder layout

- `design/` — what gets built and why (`design.md`), and when (`plan.md`).
- `background/` — research notes feeding the design. Source of truth for the underlying science.
- `app/` — the simulator itself (the static page).

Each folder has its own `README.md` (orientation for humans) and `AGENTS.md` (guidelines for agents). Read the `AGENTS.md` of the folder you are about to write in.

## Naming architecture

Every named entity has three labels — a code variable, a scientific name, and a plain functional name. The canonical mapping is **`design/glossary.md`**.

- **Code, scenario JSON keys, saved-state files, shared URLs** → use the variable name (camelCase, scientific-derived: `insulin`, `glucose`, `liverGlycogen`).
- **Background research notes** → scientific name leads; plain functional name in parens on first use of a section, then dropped.
- **UI** → plain functional name by default (the *Plain* label mode), with hover always revealing the alternate. Users can switch to *Technical* mode (scientific) or *Mixed* (both side by side).

Renaming a display label is a one-line edit to `glossary.md`. Do not touch code or propagate a rename through prose — the dictionary is read at render time.

Metric units everywhere. No Latin. No acronyms as primary plain labels (they are fine as scientific labels — ATP, LDL, GLP-1).

## How design and research interact

Research lands in `background/`. When a research note contains design-relevant decisions, those are *surfaced for review* before being merged into `design.md`. Do not auto-merge research findings into the design — propose specific edits and wait for confirmation.

`design.md` is the *what*. `design/plan.md` is the *when*. Status changes go in `plan.md`, not in `design.md`.

## Memory

A persistent memory store lives at `/home/david/.claude/projects/-home-david-work-metabolic-sim/memory/`. Update it when you learn anything that would help a future conversation continue cleanly — project conventions, decisions, the user's preferences. Keep `MEMORY.md` (the index) terse.

## Workflow note

When a discrete piece of work is complete, offer the user a commit-and-push step. Do not commit or push until the user explicitly says yes.

## What not to do

- Do not refactor or restructure existing files unless explicitly asked.
- Do not invent new functional names when an existing one already covers the concept.
- Do not commit code unless the user asks. This is a docs-and-design phase for now.
- Do not delete or rewrite background research notes; add new ones, or extend with appended sections.
