# AGENTS.md — background/

Guidelines for any agent writing or editing files in `background/`.

## Style — match the existing notes exactly

`metabolic-pathways.md` is the style exemplar. Read it before writing anything new in this folder.

- **Scientific names lead.** Use the standard scientific or anatomical term — insulin, glucose, glycogen, free fatty acid, chylomicron, ATP, LDL, etc. The canonical mapping for every named entity lives in `design/glossary.md`.
- The plain-language functional name (the dictionary's *Plain* label, e.g. *Storage Hormone* for insulin) appears in parentheses on first use within a section, then is dropped. The functional name is what the simulator's UI shows by default; it lives in the glossary, not the prose, but it is useful to introduce on first appearance for cross-reference.
- Where the scientific name is itself a common English word (cholesterol, testosterone, sodium, caffeine), no parenthetical functional name is needed — the glossary tracks the entry, and prose use of the plain word is unambiguous.
- Metric units only.
- Numbered sections with descriptive titles. Bolded sub-labels inside long sections.
- Plain language overall (despite scientific names leading). Audience is a non-specialist building a simulator; explain mechanisms in everyday terms.

## Reuse names — consult the glossary

`design/glossary.md` is the source of truth for every named entity (variable / scientific / plain). Use the **Scientific** column for prose. Where a `metabolic-pathways.md` or `exercise-responses.md` already establishes a usage, match it.

If you need to introduce a new entity not in the glossary, propose it: pick a stable code variable name (camelCase), the scientific name (literature standard), and a plain-language functional name. Note the proposal in your delivery summary so the user can review and add it to `design/glossary.md`.

## Length

Most notes land between 1500 and 4500 words. Aim for the depth that `metabolic-pathways.md` shows. Shorter is fine if the topic is small; bloating with filler is not.

## Cite sources

Where you make a specific factual claim — a number, a mechanism, a contested finding — cite the source inline. URLs where the source is web-accessible. Investigator names and study descriptors where they aren't. If WebSearch / WebFetch is unavailable in your environment, note that explicitly so the user can decide whether to re-run with web access.

## Mark unsettled science

Where the science is contested, say so. Use a section called "Unsettled Science" (or similar) toward the end of the note. List each contested topic with what is known, what is disputed, and what defensible default the simulator should pick.

## Update the index

When you add a new note, update `background/README.md` in the same change — set the status to ✅ and fill in the file column.

## Don't rewrite existing notes

If existing material is wrong, propose specific edits rather than overwriting the file. Existing background research is a record of the user's investigation; preserve it.

## After delivering

Return a short summary (under 200 words): file path written, word count, structure of sections, any judgment calls you made, and any limits of the environment you worked in. The user uses this summary to decide what to surface to the design.
