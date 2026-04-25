# HumMod

> The most ambitious whole-body human physiology model that has ever been built and published — over 10,000 variables across cardiovascular, respiratory, renal, neural, endocrine, skeletal-muscle, and metabolic systems, descended from Guyton's 1972 cardiovascular model. We study it because it is the only existing engine in the same *spirit* as ours (whole body, time-resolved, integrated), and because understanding why it never broke out of an academic-Windows-binary niche is the most direct guidance available on what to do differently.

*(No stable hotlinkable image asset on hummod.org; HumMod's logo is the page header. JustPhysiology is the closest browser-facing surface — referenced below.)*

## What it is

HumMod is a desktop physiology simulator that runs an enormous mathematical model of an integrated human body. The current published version contains "over 10,000 variables" describing the cardiovascular, pulmonary, renal, autonomic-neural, endocrine, skeletal-muscle, gastrointestinal, and metabolic subsystems and their interactions. Its lineage is direct from Arthur Guyton's 1972 cardiovascular model, through quantitative physiology generations led by Tom Coleman, Bob Hester, John Hall, and others at the University of Mississippi Medical Center (UMMC). ([HumMod](https://hummod.org/), [HumMod paper, Hester et al., Frontiers in Physiology 2011](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2011.00012/full))

What the user gets from hummod.org:

- A **Windows-only** standalone download. Unzip to a folder; the executable parses XML model files at startup.
- A **home screen** showing a panel of physiological state variables on the left side, with the rest of the interface dedicated to tracking and plotting variable trajectories over simulated time.
- An **Editor tool** that lets the user modify XML model files to introduce parameter changes, lesions, or new submodels.
- A **Documentation** site (help.hummod.org) describing the XML schema and the structural decomposition of the model.

The model itself is XML-encoded — every variable, every parameter, every relationship lives in an XML tree. Roughly 5,000 peer-reviewed sources, catalogued in a public Zotero library, document the source of each constant. The codebase is open enough to be re-used: the GitHub repo `HumMod/hummod-standalone` mirrors the runnable wrapper, and the XML model is GPL-2.0.

The headline browser front-end is **JustPhysiology** (justphysiology.com) — a commercial wrapper that pairs the HumMod engine with a web UI of "interactive physiology experiments." Cases include hemorrhage, exercise, heart failure, high-altitude physiology, fight-or-flight, inappropriate ADH, A-V fistula, baroreceptor reflex, carbon-monoxide poisoning, and pneumothorax. The UI shows a variable-by-variable graphing interface and pre-scripted scenarios. ([JustPhysiology](https://www.justphysiology.com/))

A second commercial product, **TrainingTwin** (trainingtwin.com), uses the same engine for digital-twin scenarios in clinical training. ([HumMod home page](https://hummod.org/))

## Audience and business model

- **The standalone download itself is free** for personal, educational, and research use. Modifications and any commercial use require a sublicense from **HC Simulation, LLC**, which holds the exclusive commercial license from UMMC. ([HumMod terms of use](https://hummod.org/agreement/))
- **JustPhysiology and TrainingTwin** are commercial products built on top, presumably institutionally licensed; pricing is not published — institutions contact the company.
- **Funders:** historically NSF and NHLBI; UMMC institutional support.
- **Audience:** medical-school physiology departments, physiology researchers, control-systems modellers using the engine as a substrate, and (via JustPhysiology) undergraduate physiology students at institutions that buy seat licences. Decidedly *not* a consumer or general-public surface.

## How it works — the modelling angle

HumMod is the closest existing answer to "what would a real, time-resolved, whole-body physiology engine look like?" It is worth understanding deeply because almost every architectural choice we make has a HumMod analogue.

**Time resolution.** HumMod integrates at sub-second time steps for fast processes (cardiac cycle, baroreceptor reflex). Slower processes (renal filtration, hormone half-lives, fluid shifts) are computed at appropriately larger steps. Long-term simulations (days to weeks) are tractable but not the headline use case — most published HumMod work is acute / minutes-to-hours.

**State decomposition.** The engine is an enormous network of interlinked variables, each computed from others by an explicit XML-encoded relationship — typically a saturating function, a first-order differential, or a tabulated curve. There is no global ODE solver in the textbook sense; instead, each variable is updated each tick from its inputs. Stability is empirical, secured by the modellers having tuned each piece against the underlying physiology paper.

**Compartmentalisation.** The body is divided into anatomical compartments — heart, kidneys, lungs, gut, muscle, fat, brain, skin, liver — and each compartment carries its local versions of the substances and signals. Inter-compartmental flows are explicit. (Our `Substance × Location` table in `design.md` Section 11 maps onto the same idea.)

**Hormone and neural regulation.** First-class. Insulin, glucagon, ADH, aldosterone, cortisol, epinephrine, thyroid hormones, ACTH, renin, angiotensin, ANP, and several others are all dynamic variables with explicit production, clearance, and downstream effects. The autonomic nervous system has its own subnetwork.

**Modifiability.** The XML schema means a researcher can introduce a lesion (a kidney with reduced GFR, a heart with reduced stroke volume, a pancreas with no β-cells) by editing one or two values. This *is* the model's power and *is* its barrier — the user has to know XML, has to know the schema, and has to know which variables to touch. The engine is configurable; the configuration surface is not friendly.

**What it doesn't do.** Despite the variable count, HumMod is not specifically tuned for chronic-effect *progression* — vessel-wall remodeling over decades, slow body-composition change, atherosclerosis growth — the way our brief requires. It is fundamentally an *acute-physiology* model in spirit, even though it can run for arbitrary simulated time. Multi-individual side-by-side comparison is not a feature. Visualisation is variable plots, not anatomy.

## What it does well

- **Comprehensive coupling.** Almost no other model couples cardiovascular, renal, endocrine, respiratory, and metabolic systems at this depth simultaneously. A change in cardiac output propagates correctly through renal filtration, plasma volume, hormone levels, and back. This kind of cross-system coupling is rare and hard.
- **Auditability.** Every constant traces to a paper. The 5,000-source Zotero library is one of the most thorough modelling-provenance trails in biomedical software.
- **Stability of the engine.** It runs. It has run for decades. Successive teams have inherited and extended it without it falling apart.
- **Editor + XML.** A model that *can* be modified by domain experts who aren't programmers — an XML editor is a lower bar than C++.
- **Subgame coverage.** The set of pre-scripted JustPhysiology cases — hemorrhage, exercise, altitude, baroreceptor reflex, ADH, pneumothorax, carbon monoxide poisoning — is tightly aligned with how physiology is taught. The matching of model to curriculum is excellent.
- **Long lineage / institutional anchor.** UMMC + the Guyton legacy gives HumMod a credibility no startup has.

## What it does badly (or has chosen not to do)

- **Windows-only standalone.** In 2026 this is a substantial barrier — no Mac, no Linux, no browser, no mobile. The site says "for the time being" but that note has been there for years.
- **Engineering UI.** The home screen is a spreadsheet of variables and a graph plotter. Anatomy as such is not in the UI. Compare with what the same engine could be wearing — the JustPhysiology wrapper, which is an order of magnitude friendlier — and it is clear the ceiling on adoption is the front end, not the model.
- **Not free for derivatives.** Free to run; sublicense required to modify and redistribute. This blocks the "fork it on GitHub and build" path that most open-source ecosystems run on. The XML is GPL-2.0 but the executable is not, and the practical experience is "this is HC Simulation's product."
- **Variable-name vocabulary.** Variable identifiers are mnemonic, not scientific-clean: e.g. `RenalArtP`, `Aldo`, `EpiSV`. A non-physiology-researcher cannot read them. There is no plain-language layer.
- **No multi-individual comparison.** The architecture supports it (just instantiate twice), but the UI does not surface it.
- **No long-arc visualisation.** Plot a variable over time and you see a chart. There is no body silhouette that ages, no vessel cross-section that thickens, no fat depot that grows. The chronic-effect story is out of reach in the standard UI.
- **Discoverability collapse.** hummod.org last looks updated mid-2010s. The active locus has shifted to JustPhysiology and TrainingTwin, which are both behind logins and not crawled by general-public search. Many people who would benefit from the engine never find it.
- **Non-publication of pricing.** "Contact us for licensing" is the only signal. This blocks teachers from building it into a syllabus speculatively.

## What to borrow

- **The compartment-centric state model.** Substance per location per anatomical compartment, with explicit flows between compartments. Our `Substance × Location` table follows this pattern; HumMod is the proof it scales to a whole body.
- **First-class hormones.** HumMod's depth of regulatory modelling validates `design.md` Section 11's hormone list. Insulin/glucagon/cortisol/epinephrine plus the slower hormones (thyroid, growth, sex) are the right minimum set.
- **Saturating functions everywhere.** The HumMod codebase is full of saturating curves (Michaelis-Menten-like, sigmoidal). `design.md` Section 11 already commits to "every flow is a saturating curve, not a linear or hard-clipped relation." HumMod confirms this is the right call at scale.
- **Provenance per parameter.** Even if our background notes don't reach 5,000 citations, every numerical constant in `metabolic-pathways.md` should be traceable. That trail is what kept HumMod credible across decades.
- **Pre-scripted scenarios as a teaching surface.** JustPhysiology's case-based UI — *hemorrhage*, *altitude*, *fight-or-flight* — is essentially what our scenario list is (Section 10). Worth comparing the two lists and seeing if there are scenarios HumMod includes that we should consider (e.g. *altitude exposure* — feasible if we model oxygen carriage and ceiling).
- **XML / JSON model files.** HumMod's XML pattern argues for our scenario JSON to be *text-editable, hand-readable, and source-controllable*. Section 10 already says scenarios are JSON files; reading HumMod XML reinforces that they should be human-friendly JSON, not opaque blobs.

## What to avoid

- **Do not ship anything Windows-only.** This is the obvious one but it bears stating: HumMod's Windows binary is the single biggest reason it never broke into the consumer space. Browser-only is the right answer.
- **Do not require a sublicense to modify.** Open MIT/Apache or equivalent — anyone can fork, anyone can build.
- **Do not surface variable identifiers as labels.** `RenalArtP` is unreadable. The plain/technical/mixed naming layer (Section 3) is HumMod's lesson, applied.
- **Do not build a variable-spreadsheet UI.** A home screen full of numbers signals "this is for engineers." Anatomy first, numbers in tooltips and detail panels.
- **Do not split the consumer surface from the engine.** JustPhysiology is the friendly face HumMod *should have grown itself*; instead the engine and its surface are owned by different organisations. We should ship them as one bundle.
- **Do not let acute physiology eat all the model attention.** HumMod is acute-strong, chronic-weak. Our v1 has to deliver the chronic arc (years of fast food, twenty years of smoking, aging well) — these need to be first-class from Phase 1's engine design, not retrofitted.
- **Do not assume a textbook lineage will keep the project alive.** Guyton's name carries HumMod; nobody is going to carry ours. Longevity has to come from the static-site architecture, not from institutional inertia.

## How its existence affects our project

**Complementary in the same way VMH is — different audience, different paradigm, different surface.** HumMod is the gold-standard *engine* for an audience we are not chasing. If we get our engine right, we will hit a much shallower depth than HumMod (single-digit hundreds of variables vs. their five-figure count), but we will hit it across an audience HumMod cannot reach.

There is a serious **idea credit**: HumMod's existence is empirical proof that whole-body, time-resolved, integrative physiology *can* be modelled with sane engineering. The "but is this even tractable?" question is settled. We are doing a much smaller version of something that is known to work.

**Cautionary tale on positioning.** HumMod has the most powerful engine in the field, an excellent provenance trail, and decades of papers. It also has roughly one academic generation of users at most. The lesson: engine quality alone does not produce reach. Distribution, surface design, and free re-use do.

**JustPhysiology specifically** is the precedent we should keep watching. It demonstrates the appetite for browser-based interactive physiology among instructors. If we can build something that does for *metabolism over time* what JustPhysiology does for *acute physiology cases*, and ship it free, we are filling a real gap. The gap closes in the other direction too: a JustPhysiology subscriber is *exactly* the kind of user we want, and the price tag is presumably per-seat institutional, which means a free public alternative has obvious appeal.

## Pointers

- **Status:** alive but uneven. hummod.org rarely updated. The engine is being kept current via JustPhysiology and TrainingTwin (commercial wrappers). Referenced in 2024 research literature.
- **Homepage:** http://hummod.org/
- **Terms of use:** https://hummod.org/agreement/
- **Documentation:** http://help.hummod.org/schema/index.html
- **GitHub mirror:** https://github.com/HumMod/hummod-standalone
- **Browser front-end (HumMod-powered):** https://www.justphysiology.com/
- **Commercial twin product:** https://trainingtwin.com/
- **HumMod paper:** Hester et al., *Frontiers in Physiology* 2:12, 2011. https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2011.00012/full
- **Saved image:** none. hummod.org has no hotlinkable image; the site logo is in the header. JustPhysiology has its own screenshots that could be saved if useful.
