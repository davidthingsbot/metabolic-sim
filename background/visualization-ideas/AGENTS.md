# AGENTS.md — background/visualization-ideas/

Guidelines for adding a new series of visual exploration here.

## What goes here

Visual research that feeds `design/design.md` §4 (What Is Visible) and §14 (Look and Feel) — generated images, mood boards, scanned sketches, side-by-sides. Nothing in this folder is a commitment.

## Structure

- Each batch of related images is a **series**, sitting in its own subdirectory directly under `visualization-ideas/`.
- Subdirectory names are short, lowercase, hyphen-separated, and describe the *subject* — `system-diagrams/`, `motion-mockups/`, `mobile-compact-layouts/`. Not the technique, not the date.
- All image files for a series live in that subdirectory. No images at the root of `visualization-ideas/`.

## Each series carries a README

Every series subdirectory has a `README.md` with this layout:

1. **Source.** Where the images came from — tool, prompts, creation date, file names. If a prompt is not recorded, say so rather than reconstructing it.
2. **Per-image entries.** One per image, in an order that reads naturally. Each entry has:
   - The image embedded inline with a short descriptive title.
   - **What it shows** — composition, palette, density, where the eye lands. Specific to *this* image.
   - **Pointers for the app** — which `design.md` view (§5), which §14 style direction, which §14 density tier, which §3 label mode. Cite sections.
   - **Strengths and weaknesses** — including honest assessment of survival at the §14 mobile-first 360 × 640 Compact baseline.
3. **Cross-cutting themes.** Spectrum covered, gaps, visual clusters, design-relevant observations.
4. **Pointers for the next visual-research run.** Concrete suggestions the user can feed to the next generation pass.

Series READMEs typically run 1500–3000 words.

## Do not modify `design.md` or `plan.md`

This folder is upstream of the design. Surface findings in the "Pointers for the app" sections and the "Cross-cutting themes" closer, and call them out in the delivery summary. The user makes the design.md change.

## Language conventions

Match `background/AGENTS.md`. Scientific names lead in prose (*insulin*, *glucose*, *glycogen*) with the §3 plain label in parens on first use within a section. When describing what the *user* sees in the simulator UI, the plain functional names (*Storage Hormone*, *Blood Sugar*, *Body Fat*) take over. Metric units only.

## After delivering

Return a short summary (under 300 words): the series subdirectory written, visual-style clusters identified, the most-useful reference image and why, the obvious gap, and any cross-cutting suggestion that warrants a follow-up note in `design.md` (proposed, not applied).
