# Visualization Ideas

Visual exploration ahead of the simulator's actual UI design. The point of this folder is to look at a wide range of styles, densities, and framings *before* committing to one in `design/design.md`. Nothing here is a commitment — it is research, the same way `background/metabolic-pathways.md` is research for the engine.

Each subdirectory is a *series*: a coherent batch of images generated or assembled around one prompt direction or one question. Series are written up with a curated `README.md` so the design discussion can refer to "the dashboard image in `system-diagrams/`" rather than "that one PNG you sent me."

Conventions for adding a new series live in [`AGENTS.md`](./AGENTS.md).

## Series

- [`system-diagrams/`](./system-diagrams/) — first pass at the "all the metabolic systems on one diagram" reference image. Eight generative-AI outputs spanning anatomical-painterly, infographic-poster, encyclopedia line-art, and futuristic dashboard treatments. Used to triangulate which of the §14 visual-style directions in `design.md` actually carries the §4 anatomical schematic.
- [`body-based/`](./body-based/) — second pass, this time built around a whole-body human figure as the primary subject. Six generative-AI outputs ranging from vintage-poster through painterly watercolour and old-encyclopedia line plates to clean clinical UI and a dark neon HUD. Tests whether centring a literal body changes the visual-style trade-offs and applies a §14 mobile-first lens to each.
- [`mobile-first/`](./mobile-first/) — third pass, phone-shaped framings at the §14 Compact tier — the gap both prior series flagged. Six generative-AI outputs across cardboard-relief, old-textbook engraving, two dark dashboards, and two clean-white flat variants, most paired with a Standard or Detailed tier alongside. Tests whether the simulator's headline view is genuinely shippable on a 360-px-wide phone and what each style sacrifices to fit.
- [`controls/`](./controls/) — fourth pass, focused on the simulator's *entry surfaces* (meal editing, calendar / timetable setup, scenario builders, live-control consoles) and on the architectural question of whether the central human figure can be rendered in a hand-tuned SVG diagramming idiom rather than depending on illustrative or AI-generated artwork. Eight phone-and-desktop pairs spanning a cardiovascular detail console, scenario builder, meal-flow-and-day editor, advanced event editor, body-and-event setup, day planner, programmable 2D body (the SVG-style anchor), and live control room.

*(Future series will sit alongside the existing four. Expected directions include: motion mockups for flow particles; bookmark before/after toggles; the stylized health diagrams from §4 — vessel cross-section, bone density, body silhouette — at varying ages and Health scores; Multiple Individuals grids; Kids view candidates.)*
