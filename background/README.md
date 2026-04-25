# background/

Research notes feeding the design. The source of truth for the underlying science the simulator models.

Each topic gets its own `.md` file in this folder. The style is set by `metabolic-pathways.md` — every substance, organ, hormone, and process gets a *functional name* describing what it does, with the chemical or anatomical name in parentheses on first use. Metric units only. Plain language. New research notes match this voice and reuse the established names.

## Topic index

Status legend: ✅ Done · 🟡 In progress · ⬜ Not started

### Foundational

| Status | Topic | File |
|--------|-------|------|
| ✅ | Metabolic pathways (foundational science) | `metabolic-pathways.md` |
| ✅ | Real foods composition library | `foods-library.md` |
| ✅ | Exercise types, responses, and recovery | `exercise-responses.md` |

### Body systems (Tier 2 — feeds Phase 6)

| Status | Topic | File |
|--------|-------|------|
| ⬜ | Cardiovascular system in depth (vessels, plaque, blood pressure) | — |
| ⬜ | Respiratory system in depth (gas exchange, oxygen ceiling, lung capacity) | — |
| ⬜ | Tissue remodeling rates (muscle, fat, vessel walls over time) | — |
| ⬜ | Aging and Health deterioration (what falls off, at what rate) | — |
| ⬜ | Lymphatic system in depth | — |
| ⬜ | Bones and calcium balance | — |
| ⬜ | Skin: heat dissipation, sweat, hydration coupling | — |
| 🟡 | Water, sodium, and electrolytes (plasma volume, sweat, kidney handling) | stub in `metabolic-pathways.md` §10 |

### Foreign substances (Tier 3 — feeds Phase 7)

| Status | Topic | File |
|--------|-------|------|
| 🟡 | Foreign substances (ethanol, nicotine, caffeine, carbon monoxide, generic-drug template) | stub in `metabolic-pathways.md` §9 |
| ⬜ | Alcohol metabolism (acute, chronic, J-curve debate) | — |
| ⬜ | Tobacco, vaping, smoking (acute and chronic) | — |
| ⬜ | Caffeine and common stimulants | — |
| ⬜ | Cannabis metabolism and effects | — |
| ⬜ | Common medications affecting metabolism | — |

### Individual variation (Tier 4 — feeds Phase 8)

| Status | Topic | File |
|--------|-------|------|
| ⬜ | Individual variation in metabolism (mainstream documented ranges) | — |
| 🟡 | Sex differences in metabolism | stub in `metabolic-pathways.md` §12 |
| ⬜ | Microbiome contribution (contested) | — |

### Life stages (Tier 5 — feeds Phase 9)

| Status | Topic | File |
|--------|-------|------|
| 🟡 | Life-stage metabolism (newborn through older adult) | stub in `metabolic-pathways.md` §11 |
| ⬜ | Recovery from cessation (quitting smoking, returning to fitness, dietary turnaround) | — |

### Visual and UX (Tier 6 — feeds Phase 10)

| Status | Topic | File |
|--------|-------|------|
| ⬜ | Visual style references (biological, dashboard, line-drawing illustration) | — |
| ⬜ | Anatomical layout reference (whole-body schematic conventions) | — |
| ⬜ | Responsive density patterns (4K to embedded-window scale) | — |

## How research lands here

1. The user approves a topic.
2. A subagent researches and writes `background/<topic>.md` matching the established style.
3. The result returns. Design-actionable items are identified and proposed as specific edits to `design/design.md`.
4. On approval, the design edits land. The status above moves to ✅.

When a new note is added, update this index in the same change.

## Tier ↔ Phase alignment

The tier groupings above match the phasing in `design/plan.md`. Tier N's research feeds Phase N+2 (roughly). This is a soft alignment — research lands when it is ready, and phases pull from whatever is available.
