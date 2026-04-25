# PhysioEx (Pearson)

> A Pearson textbook companion: 12 exercises × 63 simulated lab activities covering cell transport, skeletal muscle, neurophysiology, endocrine system, cardiovascular dynamics, respiratory mechanics, digestion, renal physiology, acid-base balance, blood, and serology — sold bundled with college A&P textbooks or as a standalone access code. Currently at version 10.0 (released January 2020), HTML5 (post-Flash). We study it because it is the closest direct competitor in the "browser-based physiology teaching simulator" niche, because its textbook-bundle distribution model has kept it alive across a decade and four major revisions, and because the gap between what it does and what college students actually need is exactly the gap our project addresses.

![PhysioEx 10.0](images/physioex.jpg)

## What it is

PhysioEx is a suite of simulated wet-lab exercises sold as a paperback lab manual bundled with a web-access code, or as a standalone web-access code, or bundled into Pearson's *Mastering A&P* textbook platform. The 12 exercises and 63 activities are: ([Pearson PhysioEx page](https://www.pearson.com/en-us/subject-catalog/p/physioex-100-laboratory-simulations-in-physiology/P200000010623/9780136447658))

1. **Cell Transport Mechanisms and Permeability** — diffusion, osmosis, facilitated diffusion, active transport, filtration.
2. **Skeletal Muscle Physiology** — single twitch, summation, tetanus, isometric vs isotonic contraction, muscle fatigue.
3. **Neurophysiology of Nerve Impulses** — resting potential, action potential, refractory period, conduction velocity.
4. **Endocrine System Physiology** — metabolism (BMR), thyroid hormones, insulin and glucose tolerance, hormone replacement.
5. **Cardiovascular Dynamics** — vessel-resistance simulator (Poiseuille), pump dynamics.
6. **Cardiovascular Physiology** — frog heart preparations, ECG, baroreceptor responses.
7. **Respiratory System Mechanics** — spirometry, lung compliance, surfactant effect, asthma simulation.
8. **Chemical and Physical Processes of Digestion** — enzyme assays for amylase, pepsin, lipase, with controls.
9. **Renal System Physiology** — glomerular filtration, tubular reabsorption, ADH/aldosterone effects.
10. **Acid-Base Balance** — respiratory and metabolic acidosis/alkalosis with compensation.
11. **Blood Analysis** — haematocrit, ESR, blood typing, total cholesterol.
12. **Serological Testing** — Ouchterlony double diffusion, ELISA, indirect ELISA, immunofluorescence.

Each activity has the same shape: a virtual lab bench, a procedural protocol, controls (sliders, dropdowns, run/reset buttons), data tables that fill as the simulation runs, a chart, and pre/post-lab quiz questions that auto-grade to the LMS gradebook. The HTML5 migration in 10.0 finally got rid of Flash and added basic accessibility features (keyboard navigation, screen-reader hooks).

The product is **paid**: $69.32 for the lab manual + access code; access codes alone cost less but still in the $40–$60 range; bundled-with-textbook pricing varies by Mastering A&P bundle. (~$70/year of access is the rough modal cost to a student.) ([Pearson](https://www.pearson.com/en-us/subject-catalog/p/physioex-100-laboratory-simulations-in-physiology/P200000010623/9780136447658), [Amazon listing](https://www.amazon.com/PhysioEx-10-0-Laboratory-Simulations-Physiology/dp/0136643744))

The audience is undergraduate A&P students and their instructors at US community colleges, four-year colleges, nursing programs, and some allied-health programs.

## Audience and business model

- **Textbook-bundle distribution.** The dominant channel: PhysioEx ships as part of Pearson's Mastering A&P platform alongside Marieb, Saladin, and other A&P textbooks. Adoption decisions are made at department level, by instructors, for an entire semester's enrolment.
- **Standalone access codes.** Sold per student, $40–$60 per access term, typically usable for one academic year.
- **Lab manual bundle.** ~$70 for the paperback manual + access code (the manual is a workbook that students fill out as they complete the simulations).
- **Audience:** college-level A&P students, dominantly first- and second-year, dominantly in nursing and allied-health pipelines.
- **No free tier.** Pearson does not publish a free demo. Sample exercises are accessible through some institutional partnerships but the product is fundamentally paid.

## How it works — the modelling approach

PhysioEx is the closest existing competitor in *educational simulation of physiology in a browser*, so the modelling angle matters.

**The engines are mostly *interactive worked examples*, not real ODE simulators.** Each activity has:

- A small parameter space (a slider for solute concentration, a dropdown for membrane permeability, etc.).
- A procedural script (run-this-trial, then-this-trial).
- Tabulated outputs that match the underlying physics for the chosen parameters — sometimes computed live from a formula, sometimes interpolated from a table of pre-computed cases.
- A chart that updates as data accumulates.

The architecture is *per-activity*: each of the 63 activities is its own small encapsulated thing, with its own data tables and its own state. There is no integrated body-level engine and no inter-activity coupling. The endocrine BMR exercise does not share state with the cardiovascular exercise. A change to thyroid hormone in Activity 4 does not change the heart rate in Activity 6.

This is a deliberate teaching design: each exercise mirrors a wet-lab experiment, in isolation, with control variables held outside. It is not a deliberate engineering limitation — it is a pedagogical philosophy from the wet-lab era, ported to software.

**What PhysioEx does well as a model:**

- **Curriculum-shaped scope.** The 12 exercises map cleanly onto a standard A&P syllabus.
- **Procedural realism.** A student running the cell-transport exercise goes through controlled trials with controls, exactly like a wet lab. This builds the right *experimental* habits.
- **Pre/post-lab quizzes** auto-grade and feed back into Mastering A&P. Instructors love this.
- **Stability.** The product has been continuously evolved across versions 5 → 10 since the late 1990s. It runs.
- **HTML5 migration completed.** Version 10.0 (2020) finally exited Flash. Stability and browser compatibility are good.

**What PhysioEx does badly as a model:**

- **No integrated body.** Each activity is its own silo. There is no continuous body that experiences thyroid hormone, exercise, and a meal in sequence with realistic interactions.
- **No time axis spanning hours-to-years.** Activities are short — minutes of simulated time per trial. Chronic-effect arcs don't exist.
- **No real ODE engine.** The underlying simulations are largely curve-fits and parameter-driven equations. Worth nothing wrong with this for the teaching goal but it means PhysioEx cannot deliver the open-ended exploration our project does.
- **Dated UI.** Even after the HTML5 migration, the visual language is academic-software-circa-2010 — boxy, button-heavy, table-led. Charts are functional but not stylish.
- **Paid-only.** No free tier limits incidental discovery.
- **Locked into Pearson's ecosystem.** Mastering A&P + Pearson access codes — an LMS gravitational well. Universities not on the Pearson stack pay extra friction.
- **No scenarios or exploration.** Activities are scripted; you cannot say "what if I wanted to experiment with starving this body for 24 hours?" — that is not in scope.
- **No multi-individual comparison.**
- **No anatomy.** A schematic of the system being studied appears at the top of each exercise; the body as a whole is not visible.

## What to borrow

- **Per-topic exercises as a teaching format.** Even if our project is engine-led and integrated rather than per-topic and isolated, the *idea* of "here is a curated walkthrough of a physiology topic" is appealing for our scenario list. Several of the 12 PhysioEx exercises map cleanly onto our scenarios:
  - PhysioEx 4 (endocrine: insulin and glucose tolerance) → our *Single Hamburger* + *Type 2 Diabetic* scenarios.
  - PhysioEx 5/6 (cardiovascular) → our *Heart Disease* + *Endurance Athlete* scenarios.
  - PhysioEx 7 (respiratory mechanics) → our *Twenty Years of Smoking* scenario.
  - PhysioEx 8 (digestion) → our *Single Hamburger* scenario, but at a different layer.
  - PhysioEx 4 (endocrine BMR) → our *Aging Well* scenario.
  Worth a future pass through `design.md` Section 10 to see if any PhysioEx topic is *not* covered by our scenario list and should be.
- **Pre/post-lab quiz pattern as a future content layer.** A scenario's natural "homework" output is *answer this prompt about what you observed*, snapshot or recording attached. Not a v1 priority.
- **Procedural protocol as a tour format.** PhysioEx's "step 1, step 2, step 3" lab protocol is a tour-format precedent. Our Phase 11 onboarding walkthrough is the analogue.
- **Lab-manual companion idea.** Pearson sells a paper lab manual that mirrors the simulations. A future companion document — chapter-by-chapter walkthroughs of our scenarios — is plausible. Out of scope for v1.
- **Auto-grading as a hook for future LMS distribution.** Not v1; flagged as a long-tail distribution pathway alongside Visible Body's LTI integration.

## What to avoid

- **Do not silo the activities.** PhysioEx's central architectural choice is "each exercise is its own encapsulated thing." This is wrong for what we are building. Our entire premise is one integrated body with scenarios as different *inputs*, not different *modules*.
- **Do not lock into a textbook publisher.** PhysioEx is a Pearson product end-to-end; that's its distribution moat and its constraint. A free, open-source tool that a Marieb instructor and a Saladin instructor and a Tortora instructor can all use is more valuable than a Pearson-only one.
- **Do not gate behind paid access codes.** PhysioEx's $40–$70/access-code is the headline barrier. Free is the right choice for our brief.
- **Do not let scenario design get scripted into linearity.** PhysioEx scripts are step-by-step procedures; ours are starting-state-plus-calendar-plus-clock. A user who deviates from the script is rewarded with new behaviour, not error-handled into the prescribed path.
- **Do not refresh the visual style on a textbook cycle.** Pearson updates PhysioEx every 5–7 years on textbook-revision cadence. Our visual style should not require a publisher's release schedule to evolve; it just evolves on github main.
- **Do not over-rely on "lab" framing.** PhysioEx's lab-bench metaphor is right for some users (nursing students who will eventually be in real labs) and wrong for others (a curious teenager, a clinician explaining to a patient). Our framing is "watch your body, change inputs, see what happens" — closer to a flight simulator than a lab bench.

## How its existence affects our project

**Direct competitor on the educational use-case, in a different paradigm.** PhysioEx is the closest *direct competitor* on our 🔍 list — same audience (physiology students), same medium (browser), same teaching purpose. But the paradigms are different:

- *PhysioEx:* per-topic encapsulated wet-lab simulations, scripted, paid, Pearson-locked.
- *Us:* one integrated body, exploratory scenarios, free, open.

**Our positioning vs. PhysioEx:**

- **For instructors:** PhysioEx is the safe institutional choice that comes pre-bundled with the textbook. We are the free, deeper, more flexible alternative for the parts of the curriculum we cover (cellular metabolism, endocrine system, cardiovascular dynamics, respiratory, digestion). An instructor doesn't have to pick one or the other; they can use ours for the integrated-body parts and PhysioEx for the per-topic procedural parts.
- **For students:** PhysioEx is what they are forced to buy. We are what they can play with on their phone for free at any hour.
- **For independent learners:** PhysioEx is invisible (paid, behind LMS). We are the discoverable answer.

**Cautionary observations.**

- PhysioEx's per-activity siloing is a *feature* in their teaching philosophy. We need to make sure our integrated-body approach doesn't accidentally make any single topic harder to teach. Specifically, an instructor who wants to teach *just* the endocrine system on day 12 of their course should be able to land in our simulator with a scenario that focuses attention on insulin and glucose, hides irrelevant detail, and is bookmarkable — *Single Hamburger* fills this brief; we should validate that the experience is as crisp as PhysioEx's Activity 4.
- The HTML5 migration in PhysioEx 10.0 took years and was overdue. Our static-site, no-Flash-equivalents architecture sidesteps this hazard entirely; we should keep it that way and resist any temptation to depend on shrinking-platform technologies (Web Bluetooth for hardware integration, WebGPU before broad support, etc.).
- The textbook-bundle distribution model is robust but slow. PhysioEx 10.0 was released in 2020 and is still current in 2026 — six years between major revisions. We can iterate on a weekly cadence and reach unbundled audiences PhysioEx structurally cannot.

## Pointers

- **Status:** alive but slow-moving. Version 10.0 (2020) is still current as of April 2026. No 11.0 announced.
- **Pearson product page:** https://www.pearson.com/en-us/subject-catalog/p/physioex-100-laboratory-simulations-in-physiology/P200000010623/9780136447658
- **PhysioEx web access:** https://www.physioex.com/ (institutional / access-code login)
- **Mastering A&P platform (the dominant access channel):** https://www.pearson.com/en-us/higher-education/products-services/mastering.html
- **Lab manual + access bundle (Amazon):** https://www.amazon.com/PhysioEx-10-0-Laboratory-Simulations-Physiology/dp/0136643744
- **Pearson video walkthrough transcript:** https://www.pearson.com/content/dam/global-store/en-us/resources/transcripts/PhysioEx-video-transcript.pdf
- **Saved image:** `images/physioex.jpg` (PhysioEx 10.0 lab-manual cover)
