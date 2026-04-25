# Virtual Metabolic Human (VMH) / Recon3D

> A free, browser-accessible portal that exposes a genome-scale reconstruction of human metabolism — every metabolite, every reaction, every gene — alongside curated linkages to 818 microbes, 8,790 foods, and 255 Mendelian diseases. We study it because it is the *only* widely-used "human metabolism in a browser" resource that exists today, and because its choices about scope, paradigm, and audience define what our project is *not*.

![VMH](images/vmh.gif)

## What it is

VMH (vmh.life) is the public-facing portal for **Recon3D**, the consensus genome-scale human metabolic reconstruction. Users land on a page with five resource panels — **Human metabolism**, **Gut microbiome**, **Disease**, **Nutrition**, and **ReconMaps** — and a quick-search bar across the top. Drilling in:

- **Human metabolism** is a browseable index of every metabolite (5,180), every reaction (17,730), and every gene (3,695). Each has its own page with literature evidence, EC numbers, KEGG/HMDB cross-references, and links to every other entity it touches.
- **Gut microbiome** indexes 818 manually curated microbe-scale models from the AGORA project; each microbe has its own metabolic-reconstruction page.
- **Disease** indexes 255 Mendelian inborn errors of metabolism, each linked to the affected genes and the metabolite biomarkers downstream.
- **Nutrition** wraps the USDA National Nutrient Database — 8,790 foods across 25 food groups — and maps each food's components to the metabolites already in the human reconstruction. The UI lets a user assemble a "diet" by adding foods with portion sizes to a *Selected Foods* list and then run flux analyses against the diet.
- **ReconMaps** is a set of seven manually-drawn metabolic-pathway maps (cytosol + the six organelles) rendered in CellDesigner. Users search for a metabolite and the map highlights every reaction that touches it.

Behind the portal sits a REST API at `vmh.life/_api/docs/`. The underlying models are downloadable as SBML/MAT for use in COBRA Toolbox (MATLAB) or COBRApy. Project home is now branded as the **Digital Metabolic Twin Centre** at the University of Galway, but vmh.life remains the canonical portal. ([VMH](https://www.vmh.life/), [Digital Metabolic Twin Centre](https://www.digitalmetabolictwin.org/), [VMH paper, NAR 2019](https://academic.oup.com/nar/article/47/D1/D614/5146204))

## Audience and business model

- **Free, academic.** No paywalls, no accounts required to browse. Login is needed only for power features (saving custom diets, uploading models).
- **Funder-supported.** University of Galway, with Science Foundation Ireland and EU Horizon support visible in publication acknowledgements.
- **License:** models under CC-BY; the COBRA tooling stack is GPL/LGPL.
- **Audience:** systems biologists, computational biology researchers, graduate students working on flux balance analysis (FBA), and a small slice of nutrition researchers who use the food-to-metabolite mapping. **The portal is unusable to a non-specialist** without an FBA primer; the resource pages assume you already know what a stoichiometric matrix is.

## How it works — the modelling angle

This is the angle that matters for us, because VMH and our project sit on opposite ends of a deep methodological split.

VMH is a **stoichiometric, steady-state** representation of metabolism. The reconstruction is a giant matrix S where rows are metabolites and columns are reactions; each column lists how many of each metabolite go in or out per unit reaction flux. There are no time variables. There are no rate constants. There are no ODEs. To get a quantitative answer out, the user has to:

1. Pick a set of *exchange* reactions to define what crosses the system boundary (a "diet" — what comes in; an "objective" — what's optimized, typically biomass production).
2. Run **flux balance analysis (FBA)**: solve the linear program `max c·v subject to S·v = 0, v_lower ≤ v ≤ v_upper`. The output is a steady-state flux through every reaction.
3. Optionally run flux variability analysis (FVA), gene knock-outs, or sampling.

This paradigm answers "given this diet, what flux distribution is feasible and optimal?" It cannot answer "what does blood glucose look like 90 minutes after a hamburger?" The model carries no concept of a transient — no insulin pulse, no glycogen filling, no postprandial peak.

The **whole-body** extension (Harvey/Harvetta sex-specific models, ~600,000 reactions across organ-resolved compartments) is still steady-state. It can simulate inter-organ exchange under a chosen feeding state — fed, fasting, exercising — by changing exchange-reaction bounds and re-solving. Each "state" is a separate optimization, not a continuous trajectory.

Our project is the opposite: **dynamic, time-resolved** ODEs over a small set of lumped substances and locations, animated, with hormonal gating. We will get the qualitative shape of glucose-after-a-meal right; VMH could in principle compute a flux distribution at *one* moment of that meal but cannot show the trajectory.

This is not a flaw in VMH — FBA is the right tool for genome-scale questions. But it is *why VMH does not fill our brief*, even though both projects say "human metabolism in the browser."

## What it does well

- **Comprehensive linkage across resources.** Click a metabolite, see every reaction it participates in, every gene that catalyses those reactions, every disease that affects those genes, every microbe that produces or consumes it, and every food that contains it. The cross-resource navigation is the portal's headline feature, and it works.
- **Real food data.** The Nutrition resource ties USDA's actual nutrient breakdown to actual metabolites in the model. A serving of cheddar maps to grams of palmitic acid, lactose, calcium, etc., which then map to reactions in the reconstruction. The library is large and reproducible.
- **Disease integration.** 255 inborn errors are wired in as gene knockouts on the human reconstruction; users can simulate the metabolic consequences directly.
- **Curated literature evidence.** Each reaction page cites the papers it came from. The model is auditable in a way our lumped engine will never be.
- **Open data.** Models are downloadable, citable, and re-runnable in COBRApy / COBRA Toolbox. Reproducibility is built in.
- **Stable home.** Active publications through 2024–2025; the project has a long-term institutional anchor (Galway), not a single grad-student PI.

## What it does badly (or has chosen not to do)

- **No transients.** No notion of "time since meal", "peak", "half-life", "recovery". The user cannot watch anything play out.
- **No animation, no anatomy.** A reaction page is a wall of identifiers, EC numbers, and cross-references. There is no body, no organ, no flow visualisation. ReconMaps are CellDesigner static diagrams — informative for researchers, opaque for everyone else.
- **No plain language.** Labels are scientific names only. *3-hydroxybutyrate* is *3-hydroxybutyrate*; nobody is told that this is a ketone the body uses for fuel during fasting.
- **No hormones.** Insulin, glucagon, cortisol — none of the regulatory layer that makes metabolism *behave* — are first-class objects. Hormone effects can be approximated through bounds tweaks, but they aren't surfaced.
- **No exercise, no sleep, no acute conditions, no drugs.** The model is purely about chemistry. Lifestyle inputs that drive metabolism don't have first-class representations.
- **Single individual.** Side-by-side comparison is not a feature. The Harvey/Harvetta sex-specific models exist but are not paired against each other in the UI.
- **Steep learning curve.** Without a working knowledge of FBA the portal looks like a glossary.
- **2010s-era UX.** Tables, dropdowns, dense pages. Functional but not inviting.

## What to borrow

- **Cross-resource linkage as a navigation pattern.** Every entity on a page links to every other entity it touches. We should make sure that clicking *Storage Hormone (insulin)* on a hormone gauge takes the user to a panel listing every flow it gates, every organ it affects, every condition that modulates it, and every drug that mimics or blocks it. This kind of linkage is what makes VMH useful even when the underlying paradigm is alien.
- **Food → composition → metabolite mapping.** Our food library should carry the same structure: a food has macronutrient and micronutrient composition, and each composition field maps to a substance the engine tracks. VMH's USDA-anchored approach validates the design choice in `design.md` Section 9.
- **Provenance fields.** VMH's per-entity literature evidence is a model worth copying for our background notes and the unsettled-science badges (Section 13). Every modelled flow should be traceable to its source.
- **Disease as gene knockout / parameter shift.** VMH's pattern of "a disease is a perturbation of the underlying model, not a label" lines up exactly with our `Conditions` table (Section 11). Worth re-reading their Disease resource design before we lock down the conditions schema.
- **Open data as a credibility lever.** VMH's "everything is downloadable, everything is citable" stance is part of why it has lasted. Our scenarios, food entries, and engine parameters should be similarly inspectable and forkable.

## What to avoid

- **Don't build a researcher portal.** VMH is excellent for researchers and impenetrable for everyone else. Our default surface needs to be the opposite — a non-specialist sees the body, the food, the time, and the response. Researcher-facing surfaces (raw flux readouts, per-substance numbers) are secondary, behind a toggle.
- **Don't lead with scientific names.** *3-hydroxybutyrate* on a chart axis fails the brief. Plain labels first, scientific labels on hover or via the *Technical* mode (Section 3).
- **Don't use FBA.** Tempting because the math is clean and the data is open, but FBA cannot show the curves the simulator's whole purpose is to show. Our engine has to be ODE-shaped from the start. (We can still *consume* VMH's stoichiometry as a sanity check on what reactions we lump and how, but it should never be the runtime.)
- **Don't bury the dynamics behind "states".** VMH's "fed vs fasted vs exercising" pattern of switching between optimizations is exactly what we are not doing. Continuous time is the headline experience.
- **Don't depend on an institutional grant for survival.** VMH's longevity comes from grant cycles; our longevity comes from being a static GitHub Pages site that costs essentially nothing to keep alive. This is a positioning advantage, not a constraint to mimic.

## How its existence affects our project

**Complementary, not competing.** VMH serves a research audience we are not chasing, in a paradigm we are not using, with content depth we will not match. A research-grade FBA browser and a teaching-grade dynamic visualiser can both exist; users who outgrow ours could realistically end up in VMH.

**Our positioning sharpens** when stated against VMH:

- *They* answer "what is the steady-state flux of palmitate β-oxidation in liver under a Western diet?" — for a postdoc.
- *We* answer "what does my liver do with the cheeseburger I just ate, and what does the next decade of cheeseburgers look like?" — for a curious teenager, a high-school teacher, or a clinician explaining to a patient.

There is a future link to make at the technical level: VMH's food → metabolite mapping is a *gold mine* of provenance for our food library. We don't have to reinvent the USDA mapping; we can verify our entries against theirs. That's borrowing data, not architecture.

## Pointers

- **Status:** alive, actively published, currently rehoused under the Digital Metabolic Twin Centre at University of Galway. Last major Recon3D paper 2018; whole-body Harvey/Harvetta papers ongoing through 2024.
- **Homepage:** https://www.vmh.life/
- **API docs:** https://www.vmh.life/_api/docs/
- **Umbrella / lab home:** https://www.digitalmetabolictwin.org/
- **GitHub (community-curation issues):** https://github.com/VirtualMetabolicHuman/Recon
- **Original portal paper:** Noronha et al., *Nucleic Acids Research* 47(D1), 2019. https://academic.oup.com/nar/article/47/D1/D614/5146204
- **Recon3D paper:** Brunk et al., *Nature Biotechnology* 36, 2018. https://www.nature.com/articles/nbt.4072
- **Saved image:** `images/vmh.gif` (portal cover animation)
