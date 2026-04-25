# Prior-Art Synthesis

After the deep-dives on the six 🔍 candidates — VMH/Recon3D, HumMod, BioDigital Human, Visible Body, Levels, and PhysioEx — and the wider surface sweep, this is what the field actually looks like, what we should keep, what we should change, and what `design.md` edits would be warranted.

## 1. What we're competing with — and what we're not

- **Virtual Metabolic Human (VMH) / Recon3D.** Different lane. Researcher-focused stoichiometric portal (FBA, no transients, no animation, no plain language). We share the *substrate question* — "what are the relevant metabolites and reactions in human metabolism?" — but the paradigm and audience are non-overlapping. **Complementary, near-zero competition.**

- **HumMod.** Different lane on shipping platform; *same lane in spirit*. The closest existing whole-body, time-resolved, integrated physiology engine. Windows-only, dense engineering UI, sublicense-required modifications, and almost no chronic-arc visualisation. We are doing a much smaller, browser-native, plain-language, free, chronic-and-acute-spanning version. **Spirit-competitor; complementary in practice because nobody outside an institution can run HumMod.**

- **BioDigital Human.** Different lane. Owns 3D anatomy + condition pictures in a browser. No engine, no time evolution, no metabolism. **Complementary; sets the production-polish bar on a related axis.** A user who outgrows BioDigital's static condition views is exactly our user.

- **Visible Body.** Different lane. Owns curriculum-shaped 3D anatomy distribution into A&P classrooms via Cengage and LMS integrations. "Physiology animations" are short canned loops, not engine-driven. **Complementary on content type; instructive on distribution model.**

- **Levels.** Same conceptual lane (consumer-facing metabolic narrative); different method (real CGM data, single signal, paid, single individual). **Complementary in framing, distinct in method.** Levels validates that consumer demand for this kind of content exists.

- **PhysioEx.** Same conceptual lane (browser-based physiology teaching); different paradigm (per-topic encapsulated wet-lab procedures, scripted, paid, Pearson-locked). **The closest direct competitor on the educational use-case.** Different teaching philosophy — they teach experimentation in isolation; we teach an integrated body over time.

The middle of the field — *browser-first, time-resolved, plain-language, free, multi-individual, single-meal-to-multi-year, non-Pearson* — remains empty across all six deep-dives.

## 2. Validated gaps the field actually has

The five gaps the surface sweep flagged hold up. The deep-dives sharpen them.

1. **Disease-as-starting-condition.** Confirmed. None of the six (and nothing in the wider sweep) lets a user start with type 2 diabetes / atherosclerosis / COPD as an *engine state* and run a meal or a year of lifestyle through it as a perturbation. UVA/Padova does T1D properly but only T1D; VMH supports knockouts but only as steady-state lesions; BioDigital and Visible Body show conditions as *pictures*, not behaviours. **`design.md` Section 8 + Section 11 already commit to this — well-positioned.**

2. **Multi-individual side-by-side comparison.** Confirmed and *more* validated. None of the six does it; none of the surface-sweep entries do it. **This is genuinely empty space.** Levels in particular makes the *individuality* point ("the same food affects different people differently") but cannot show two bodies side-by-side. **`design.md` Section 8 is on solid ground.**

3. **Single-meal-to-multi-year in one engine.** Confirmed. HumMod can run for arbitrary duration but is acute-strong, chronic-weak in practice. PhysioEx caps at minutes per activity. Levels caps at the duration of CGM wear. VMH has no time at all. BioDigital and Visible Body show static states. **The chronic arc is structurally absent across the field.**

4. **Plain-language over real engine.** Confirmed. Either you get plain language *without* an engine (Levels, BioDigital, Visible Body) or you get an engine *without* plain language (HumMod, VMH, PhysioEx — though PhysioEx is closer). Nothing combines a real ODE-shaped engine with a default UI that says *Storage Hormone*, *Blood Sugar*, *Body Fat*. **`design.md` Section 3's three-mode naming layer is filling a real gap.**

5. **Free-browser-with-PhET-polish.** Confirmed. PhET's *Eating & Exercise* sim (200-line scope, 1-year time horizon, BMI-only) is the closest free, browser, teacher-trusted analogue, and it is tiny. Nothing in our 🔍 set is *both* free *and* polished *and* browser *and* engine-led. **The "PhET cultural target" framing in the surface-sweep README is exactly right, and the gap is genuine.**

**New gaps surfaced by the deep-dives:**

6. **Foreign-substance modelling alongside metabolism is essentially absent.** Of the six, only HumMod has any treatment of alcohol, tobacco, or medications, and even there it is research-grade and inaccessible. No consumer or educational tool models *what alcohol does inside the body* or *what twenty years of smoking does to the lungs and vessels* over time. **`design.md` Sections 9, 10, 11 commit to this; well-positioned for what may be a uniquely strong angle.**

7. **Hypothesis selection / "where the science is unsettled" surface.** None of the six exposes the *epistemic* layer — none lets a user pick between competing models of the J-curve for alcohol, the post-exercise anabolic window, or saturated-fat-and-vessel-walls. They all silently pick a side. **`design.md` Section 13's selectable-hypothesis design is, as far as I can tell, novel in this niche.**

8. **Recovery as a parallel-pools first-class concept.** Confirmed adjacent gap. Even sports-training apps treat recovery as a single "readiness" number; HumMod has the engine for it but not the surface; PhysioEx does not. **`design.md` Section 11's parallel-pools recovery model + Section 9's exercise-and-recovery pairing is unusually deep for this audience.**

9. **Embeddability of an engine-led visualisation.** BioDigital validates that *anatomy-led* embedding works as a distribution channel. Nothing in the field offers an engine-led embeddable analogue. Worth keeping the door open architecturally even though it's not a v1 priority.

## 3. UX and architectural patterns worth borrowing

- **Cross-resource linkage as the core navigation pattern (from VMH).** Click *insulin* on a hormone gauge → see every flow it gates, every organ it affects, every condition that modulates it, every drug that mimics or blocks it. VMH proves at scale that this kind of linkage is what makes a domain navigable.
- **Compartment-centric state model (from HumMod).** Substance × location with explicit inter-compartment flows. Our `Substance × Location` table follows this pattern; HumMod is the proof-of-scale.
- **First-class hormones with explicit production/clearance/effect (from HumMod).** Validates `design.md` Section 11's hormone list and treatment.
- **Saturating curves everywhere, not linear/clipped (from HumMod).** Already a `design.md` commitment; HumMod confirms it scales.
- **Always-visible body silhouette as home (from BioDigital).** Validates the Whole Body view as default in `design.md` Section 5.
- **Click-to-inspect over menu navigation (from BioDigital).** Direct manipulation; the user clicks the liver and a panel opens.
- **Condition as an engine state, not a label, that visibly changes the body (from BioDigital).** The user with type 2 diabetes lands on a body that *visibly carries* the condition, not just a tag. Already in `design.md` Section 11; BioDigital validates the visual pattern.
- **URL-as-state for sharing (from BioDigital).** Already in `design.md` Section 10; BioDigital confirms the pattern at scale.
- **Premade-content-as-wedge (from Visible Body).** Our scenarios *are* the headline content, not "examples." Visible Body's data point is that 90% of teachers use premade quizzes — the parallel is that most of our users will start from a built-in scenario, not author one.
- **Procedural protocol / tour format (from PhysioEx).** A scenario can carry a "step 1: pause at 30 minutes, look at the liver; step 2: pause at 90 minutes, look at the muscle..." overlay. Future-tense (Phase 11+).
- **Vocabulary calibrated to the consumer (from Levels).** *Stable*, *spike*, *time in range*, *metabolic fitness* are now broadly understood and worth a glossary check. Plain labels should land where the audience already lives.
- **Tiered presentation surfaces (from Levels' tiered pricing → our label-mode tiers).** Same engine, three audiences. Already in `design.md` Section 3.
- **Provenance per parameter (from VMH and HumMod).** Every numerical constant traceable to a paper. Already implicit in our background notes; should be made explicit in the engine code.

## 4. Things to deliberately not do

- **Don't ship Windows-only or any OS-locked binary (from HumMod).** Browser-only.
- **Don't require a sublicense to modify (from HumMod).** Permissive license; fork-friendly.
- **Don't surface variable identifiers as labels (from HumMod).** Plain labels first, scientific second.
- **Don't gate the headline experience behind a login or paywall (from BioDigital, Levels, PhysioEx).** Land, browse, run, snapshot — no account.
- **Don't use FBA / steady-state as the runtime (from VMH).** Cannot show curves; wrong tool.
- **Don't lead with scientific names (from VMH).** Plain mode is the default.
- **Don't ape photorealistic 3D (from BioDigital).** Stylised, diagrammatic, engine-driven.
- **Don't require reload to switch views (from BioDigital).** State preserved across view switches.
- **Don't outsource curriculum to users (from BioDigital).** Ship strong default scenarios.
- **Don't lean on Wikipedia for descriptions (from BioDigital).** Background notes with citations.
- **Don't outsource the engine to canned animation loops (from Visible Body).** Every animation driven by engine state.
- **Don't lock into a textbook publisher's ecosystem (from PhysioEx).** Free static site, no LMS dependency.
- **Don't silo activities per topic (from PhysioEx).** One integrated body, scenarios as inputs.
- **Don't depend on a single signal (from Levels).** Multi-substance, multi-hormone, multi-organ from day one.
- **Don't depend on hardware (from Levels).** Pure software.
- **Don't require an account or email capture (from Levels, BioDigital).** First-time visitor runs the simulator immediately.
- **Don't build a media business or sales team (from Levels, Visible Body).** Documentation + in-page walkthrough do all onboarding work.

## 5. Open design decisions that prior art could inform

`design.md` Section 17 lists deferred decisions. The deep-dives can speak to several:

- **"The exact numerical constants for every flow."** VMH's per-reaction literature evidence model and HumMod's 5,000-source Zotero library are strong precedents for *per-constant traceability*. Section 17 already says these settle in Phase 3 against reference curves; we should note that they should also carry per-constant citations in code, in the same way the background notes do. This is not a change to *what's deferred*, just a note about *how to settle it when the time comes*.

- **"Whether long-term tissue remodeling deserves its own slow-tick engine module or sits inside the main loop."** HumMod's pattern is "fast loop + daily-tick slow loop", which Section 11 already implicitly endorses ("slow processes at lower frequency... once per simulated day"). The HumMod precedent argues for keeping the slow tick *inside* the main loop with frequency-modulated execution rather than splitting it into a separate worker. Worth noting in Section 17 or the relevant Phase 5 plan entry.

- **"The exact set of supplements with modeled effects."** Levels' (and the broader CGM-app field's) evidence is that the *interesting* short list is small: protein, creatine, omega-3, fibre, caffeine. Section 9's Section already names this scope; the deep-dives confirm we don't need to chase the full supplement market.

- **"The precise drawing of the anatomical schematic."** BioDigital's body silhouette and Visible Body's stylised illustrations bracket the visual-style range. PhET's Eating-and-Exercise sim shows that a deliberately-cartoony silhouette also works. Section 14 commits to "stylized, not photorealistic" already; the deep-dives confirm this is a defensible position.

- **Multi-individual cap.** Our Section 8 says "two to six bodies side by side" with six at once being "the practical ceiling on a typical laptop." None of the six 🔍 candidates does this at all, so we have no field guidance — but PhET's small-sim cadence suggests that *two* is the right *default* for first-time users, with up-to-six as the power-user ceiling. Worth adding a default-of-two note.

- **Chart-vs-anatomy emphasis.** Levels is chart-led; BioDigital and Visible Body are anatomy-led; PhysioEx is per-activity. None of these has the integrated *anatomy-with-charts-on-side* shape we are building. There is no field precedent that says either is wrong. Sticking with anatomy-led with charts as a separate view is defensible and distinguishes us.

## 6. Proposed `design.md` edits — for user review, not yet applied

Seven proposals. Each names the section, summarises the existing text, proposes an addition or change, and cites the prior-art finding that triggered it.

### Proposal 1 — Section 4 / Section 5: cross-entity linkage

**Section affected:** Section 4 (What Is Visible) or Section 5 (Views and Perspectives).

**Existing text (paraphrased):** Hovering over a label reveals the alternate (Plain ↔ Technical). Clicking a substance or organ shows a detail panel.

**Proposal:** Add a paragraph under Section 4 or 5 committing to *cross-entity linkage in detail panels*: clicking a hormone gauge opens a panel that lists every flow that hormone gates, every organ it affects, every condition that modulates it, and every drug or food that touches it — each as a clickable link that scrolls or zooms the view to highlight that target. Same for substances, organs, and conditions.

**Rationale:** VMH's deep-dive shows that exhaustive cross-resource linkage is the single feature that makes a complex domain navigable for non-experts; without it, a detail panel is a wall of names. ([vmh.md](vmh.md))

---

### Proposal 2 — Section 8: default to two individuals, not one

**Section affected:** Section 8 (Multiple Individuals) and possibly Section 5.

**Existing text:** "The simulator can run two to six bodies side by side... Six individuals at once is the practical ceiling..."

**Proposal:** Add: "First-time users land in a single-individual configuration. The Multiple Individuals view defaults to *two* bodies — chosen as the *Comparing Lifestyles* preset (identical bodies, two different calendars) — when first opened. *Two* is the default cognitive load; up-to-six is for power users with a specific comparison in mind."

**Rationale:** None of the six 🔍 candidates does multi-individual at all, so we are inventing the UX. The Levels and BioDigital deep-dives both show that consumer onboarding tolerates very low cognitive load at first contact; PhET's *Eating and Exercise* sim works in single-person mode entirely. Defaulting to two for the multi view (rather than six) gives a meaningful comparison without overwhelming. ([levels.md](levels.md), [biodigital-human.md](biodigital-human.md))

---

### Proposal 3 — Section 11: per-parameter provenance is a code-level commitment

**Section affected:** Section 11 (The Simulation Engine), and indirectly Section 16 (File Layout).

**Existing text:** Section 11 describes the engine's tables and step. Provenance is implicit in the background notes.

**Proposal:** Add to Section 11: "Every numerical constant in the engine — every rate, every capacity, every saturating-curve parameter — is annotated in code with the citation it derives from, in the form of a structured comment that links to a section of `background/`. The engine carries a debug overlay that surfaces the provenance for any value displayed in the UI."

**Rationale:** HumMod's 5,000-source Zotero library and VMH's per-reaction literature evidence are the field's two strongest credibility levers and both are *per-constant traceability* baked into the engine, not the documentation. We can match this trivially because our constant count is ~100x smaller. ([hummod.md](hummod.md), [vmh.md](vmh.md))

---

### Proposal 4 — Section 5: explicit "no reload" commitment between views

**Section affected:** Section 5 (Views and Perspectives).

**Existing text:** "Shared time control and shared underlying state — switching views never restarts the simulation."

**Proposal:** Strengthen to: "Shared time control and shared underlying state — switching views never restarts the simulation, and never reloads. The active view is a render of the same in-memory state; transitions are instant. Clock continues to tick across the transition (or remains paused, depending on user state)."

**Rationale:** BioDigital's reload-on-scene-switch is a documented frustration in educator reviews. Our clear commitment to seamless transitions distinguishes us materially. ([biodigital-human.md](biodigital-human.md))

---

### Proposal 5 — Section 14: explicit responsive commitment about phone usability

**Section affected:** Section 14 (Look and Feel).

**Existing text:** Section 14's responsive layout already commits to four density tiers down to 320 px wide.

**Proposal:** Add a stronger phone-priority sentence in the responsive paragraph: "The Compact density level is a first-class shipping target, not a graceful-degradation fallback. The Single Hamburger scenario must be runnable to completion on a 360 × 640 phone screen with the schematic, time controls, charts, and event log all reachable without horizontal scroll, and snapshots must be legible at that resolution."

**Rationale:** BioDigital's scroll-wheel-mouse dependency is a real accessibility hit; Visible Body invests heavily in mobile and AR; Levels is mobile-first. Our brief is browser-first — we should make sure that includes the phone browser. ([biodigital-human.md](biodigital-human.md), [visible-body.md](visible-body.md), [levels.md](levels.md))

---

### Proposal 6 — Section 10: scenarios are the headline content, not "examples"

**Section affected:** Section 10 (Scenarios).

**Existing text:** "Built-in scenarios are *examples* of what the simulator can do, not a closed catalogue — most of the value comes from users assembling their own."

**Proposal:** Soften the "examples" framing: "Built-in scenarios are *the headline content* — most users will start from one and most of the simulator's value lands through them. The scenario set is open — users can also assemble their own — but the built-in list is curated to cover the core teaching moments and is treated as a first-class deliverable."

**Rationale:** Visible Body's data point — 90% of instructors use premade quizzes, not a Quiz Builder — and BioDigital's user-built-content gap together argue that "users will compose their own content" is overoptimistic for our audience. Our 17 built-in scenarios *are* the product; framing them as "just examples" undersells them and drops the curation bar. ([visible-body.md](visible-body.md), [biodigital-human.md](biodigital-human.md))

---

### Proposal 7 — Section 4 / Section 11: hypothesis switching as a visible, encoded feature

**Section affected:** Section 13 (Calling Out Unsettled Science) — possibly cross-referenced from Section 4.

**Existing text:** Section 13 already commits to selectable hypotheses encoded in saved states, scenarios, and shared URLs.

**Proposal:** Strengthen by adding a phrase under Section 13 making the *novelty* explicit and the cross-link to Section 4: "Where a hypothesis selection is non-default, the relevant on-screen elements (chart legends, organ glow intensities, vessel-wall thickness in the long-term diagrams) carry a small badge identifying the active hypothesis, so a screenshot or recording can never be misread as a single authoritative claim. This explicit epistemic layer is, as far as we can tell, novel in browser-based physiology tools."

**Rationale:** None of the six 🔍 candidates exposes hypothesis selection. The current Section 13 framing is solid; this proposal adds a single sentence positioning it as a deliberate differentiator and reinforces the visual-badge requirement. ([vmh.md](vmh.md), [hummod.md](hummod.md), [biodigital-human.md](biodigital-human.md), [visible-body.md](visible-body.md), [levels.md](levels.md), [physioex.md](physioex.md))

---

These seven are all genuine, none is bloat. Three (1, 4, 6) sharpen existing commitments; two (3, 5) make implicit commitments explicit at code/design level; one (2) adds a missing default-state decision; one (7) reinforces a differentiator that was already strong in Section 13.

Open question for the user before applying: Proposal 6 reframes scenarios from "examples" to "headline content" — this is a substantive editorial shift in `design.md`. Worth flagging explicitly for sign-off rather than treating as a tweak.
