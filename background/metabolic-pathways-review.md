# Review: `background/metabolic-pathways.md`

> **Historical document.** This review was written when `metabolic-pathways.md` used functional names primary (Storage Hormone, Blood Sugar, etc.). The doc has since been migrated to scientific names primary; see `design/glossary.md` for the current canonical mapping. Recommendations were applied; the review's framing of names refers to the older convention.

Reviewer: critical read against mainstream physiology, with the simulator design (`design/design.md`) as the consumer of the science.

---

## 1. Verdict

This is a strong foundational document for a teaching simulator. The structural choice — substances, locations, hormones, then dynamics — maps cleanly onto the engine's `Substance` / `Location` / `Hormone` / `Tissue` tables, and the qualitative shape of every major flow is recognisably correct: insulin-locks-fat-release, liver-as-switching-station, brain-needs-glucose-or-ketones, muscle-glycogen-is-local, IMTG-as-fast-fat. A non-specialist would learn correct intuitions from it. The biggest strength is the disciplined functional-naming convention combined with explicit "what regulates it / where it travels" fields — these directly give the engine its rate-law scaffolding. The biggest weakness is scope: the document covers what David's 90-minute run needs, but the simulator's stated ambitions (ten-year scenarios, alcohol, smoking, drugs, sex differences, "From Birth" arcs, Health scores driven by physiological deterioration) require substances, signals, and organs the document does not name. As shipped, it is sufficient for v1's "single hamburger" / "single run" scenarios and clearly insufficient for the multi-year and lifestyle scenarios the design promises. A second pass is needed before phase-3 numerical fitting.

---

## 2. Completeness — what's missing

### 2.1 Substances the simulator will need but that aren't tracked

- **Water / hydration.** The design lists hydration as a calendar event kind and mentions sweat and dehydration as visible markers, but the science doc does not name water as a tracked substance. Plasma volume is load-bearing for blood pressure, sweat-driven heat dissipation, and the dehydration penalty in the "Night Out" alcohol scenario. The engine needs a Water compartment with intake, gut absorption, sweat, urine, and respiratory loss flows.
- **Sodium, potassium, and other electrolytes.** The design's food composition fields explicitly include sodium and potassium "because each affects flows that already exist in the engine." Those flows must exist somewhere, and the science note doesn't define them. At minimum: extracellular vs intracellular distribution, sweat loss during exercise, kidney handling.
- **Oxygen and carbon dioxide as tracked substances, not just gas exchange.** The doc treats oxygen as an implicit ceiling and CO2 as a byproduct that exits via the lungs. For the simulator's heart-rate / VO2 / breathing visuals and the smoking scenario (where carbon monoxide displaces O2 on haemoglobin — design Section 11 names "carbon monoxide load on red blood cells"), oxygen carrying capacity in blood needs to be a first-class quantity, with haemoglobin / red-blood-cell mass as the carrier.
- **Phosphocreatine / creatine phosphate.** The design's recovery model explicitly names "Cellular Energy Token / phosphocreatine restore in seconds" as a parallel pool. The science doc collapses this into ATP and never names the phosphocreatine buffer. For the "0–5 minutes: Steep Start" phase and any sprint or strength scenario, the ~10-second phosphocreatine reservoir is the dominant fuel and is not represented.
- **Bilirubin / bile acids beyond the throwaway "bile" mention.** Fine for v1, but the alcohol and chronic-liver scenarios will want bile acid recycling at least sketched.
- **Cholesterol and lipoproteins (LDL/HDL/VLDL).** The doc names chylomicrons (Dietary Fat Transport Packet) and FFAs (Fat Transport Molecule) but does not name VLDL (the liver's outbound triglyceride packaging), LDL, or HDL. For the design's "vessel wall thickness, plaque accumulation over long timescales" overlay and the explicit unsettled-science item on saturated-vs-unsaturated fat and vessel walls, these are unavoidable. A "Liver Fat Transport Packet" (VLDL) and a "Cholesterol Carrier" (LDL/HDL) would slot in cleanly.
- **Fructose as a separate sugar.** The design's food fields distinguish glucose, fructose, sucrose, lactose, starch — explicitly. The science doc treats all carbohydrate as "Blood Sugar" the moment it crosses the gut wall. Fructose is metabolically distinct: it bypasses the muscle-uptake pathway, is processed almost exclusively by the liver, contributes disproportionately to liver fat (de novo lipogenesis) and to VLDL output, and does not provoke a meaningful insulin response on its own. For "Years of Fast Food" (high-fructose-corn-syrup-heavy) this is a real gap.
- **Alcohol (ethanol) and acetaldehyde.** The design has alcohol as a first-class event kind and Blood Alcohol as a tracked Foreign Substance, with liver clearance, sleep degradation, fat-burning suppression, and chronic damage. The science doc never mentions ethanol metabolism. This needs at least a paragraph: ADH/ALDH pathway, the acetate that ends up in the Krebs cycle, the NADH pile-up that suppresses fat oxidation and gluconeogenesis, the acetaldehyde toxicity step, the zero-order clearance kinetics.
- **Nicotine, caffeine, and a generic drug template.** Same argument — design promises modeled effects; science doc is silent.
- **Calcium and bone mineral.** "Bone density cross-section" is one of the stylized health diagrams in the design. There is no calcium / bone remodeling / vitamin-D-active-form story in the science doc. The doc names erythropoietin and active vitamin D as kidney products in passing without the bone connection.
- **Iron.** Design names "iron requirements" as a sex-difference axis; doc has no iron substance, no haemoglobin synthesis, no menstrual loss model.
- **Inflammatory signals (cytokines, generically).** Acute illness scenario, overtraining, recovery debt, and chronic disease trajectories all hinge on a coarse inflammation signal. Even one lumped "Inflammation Signal" substance would be enough to wire the engine.
- **Ammonia as a separate intermediate.** Currently the doc jumps from amino acids to urea. Fine for normal physiology; matters in liver dysfunction (cirrhosis, alcoholic liver disease) where the chronic-alcohol scenario needs it.

### 2.2 Hormones beyond the named four

The doc states "Four hormones control essentially all fuel flows." That is defensible as a teaching simplification for fuel handling, but the simulator's ambitions extend beyond fuel handling. Missing hormones the design explicitly references or implicitly needs:

- **Growth Hormone / "Building Hormone."** Design Section 3 names "Building Hormone (growth hormone)" in the naming examples and the engine `Hormone` table (Section 11) lists it. Science doc never mentions it. GH matters for the "From Birth" arc, sleep (GH pulses overnight), exercise adaptation, and aging.
- **Sex hormones — testosterone, oestrogen, progesterone.** Design Section 8 makes biological sex a first-class engine axis with sex hormones in the Hormone table and downstream effects on muscle protein synthesis, fat distribution, bone density, alcohol clearance, iron handling. Science doc has zero coverage. This is the single largest content gap relative to design ambition.
- **Thyroid hormones (T3 / T4).** Set basal metabolic rate; relevant to "Aging Well," to body-composition trajectories, and to genuine inter-individual baseline-metabolic-rate variation (a Section 8 axis). Worth a "Metabolic Rate Hormone" entry.
- **Leptin and ghrelin.** The doc mentions leptin in passing as an export from fat tissue and ghrelin in the stomach section, but neither is treated as a regulated hormone with intake / hunger / satiety dynamics. For multi-day caloric scenarios these drive appetite and weight regulation.
- **GLP-1 / GIP (incretins).** Mentioned once in the small-intestine section. Worth a slightly longer treatment for the "Storage Hormone response is bigger to oral glucose than to IV glucose" intuition — and because GLP-1 agonists are an obvious near-future addition to the medications library.
- **ADH / vasopressin and aldosterone.** Required as soon as water and sodium are tracked (which they must be — see 2.1).
- **Renin / angiotensin.** Vessel tone, blood pressure, long-term cardiovascular trajectories. Probably v2 unless blood pressure is shown.
- **PTH / calcitonin.** Required for the bone-density diagram.

The "four hormones run all fuel flows" framing is fine as a chapter heading but should be explicitly scoped: "for short-term fuel partitioning. Slower regulators — growth, sex, thyroid, appetite, fluid balance — are covered in Section X." Right now the doc reads as if the four are the complete hormonal story.

### 2.3 Organs and tissues with no entry

- **Pancreas.** Mentioned only as the producer of insulin and glucagon. Has no entry in Section 3 ("Key Locations"). The design's anatomical schematic shows it. Needs at least a stub: endocrine (islets) and exocrine (digestive enzymes — amylase, lipase, proteases) functions.
- **Adrenal glands.** Same — named as producer of adrenaline and cortisol but not given a location entry. Needed once the design exposes them in the schematic.
- **Bones / bone marrow.** The design shows them and has a stylized cross-section diagram. The doc has nothing.
- **Skin.** Design mentions sweat and heat dissipation; doc has no entry. For temperature regulation, alcohol vasodilation flush, and the "From Birth" / "Aging" silhouette diagram, skin needs at least a stub.
- **Lymphatic system.** Mentioned twice (chylomicron route) but not given a location entry. Worth a short one.
- **Thyroid gland.** Producer of T3/T4 (see 2.2).
- **Spleen and immune tissue.** Almost certainly v2, but worth flagging that the acute-illness scenario will want them.
- **Reproductive organs.** Out of scope for v1 per design, but the sex-hormone production sites (testes, ovaries) need to exist somewhere once sex hormones are tracked.

### 2.4 Inter-organ flows the doc does not name

- **Cori cycle is named** (lactate liver→glucose) — good.
- **Glucose-alanine cycle is not named.** Working muscle exports alanine to the liver as a nitrogen-and-carbon shuttle; matters in fasting and prolonged exercise.
- **Ketone export rules.** Doc says liver makes ketones and brain/heart burn them. Liver itself cannot use them (lacks the enzyme). Worth stating; helps explain why liver makes them rather than burning the fat itself.
- **Enterohepatic bile acid recycling.** Mentioned implicitly. Fine for v1.
- **Portal vs systemic distinction is well handled** for sugars/amino acids vs dietary fat. Good.
- **Dietary fat → VLDL → tissues path (the liver's outbound triglyceride export).** Missing entirely. This is how excess dietary carbs end up as adipose triglyceride; the doc says "liver converts excess into Fat Packets for long-term storage" but does not name the VLDL packaging step.
- **The "no muscle-glycogen-to-blood" rule** is correctly emphasised. Good — this is a common misconception and the doc nails it.

### 2.5 Edge cases

- **Fasting beyond 24 hours.** Doc's longest fast scenario is overnight. Multi-day fasting (which the design's "Intermittent Fasting" scenario can extend) involves: progressive ketosis, brain shifting to ~60–70% ketone fuel by day 3–5, kidney gluconeogenesis becoming significant, muscle protein sparing kicking in after day 2–3, BMR dropping ~10–15% by week 2. None of this trajectory is described.
- **Very high intensity exercise (anaerobic threshold and above).** Doc covers David's 135-bpm aerobic case. Above lactate threshold, fat oxidation falls toward zero, glycogen burn rate climbs sharply, lactate accumulates faster than clearance, and the run becomes time-limited by glycogen and acid handling rather than by oxygen. The "crossover concept" is named in the design's unsettled-science list (Section 13) but the doc never describes the underlying intensity-vs-fuel-mix curve at all.
- **Heat and cold.** Heat: vasodilation, sweat (water + sodium loss), plasma volume drop, cardiovascular drift (HR creep at the same workload). Cold: shivering thermogenesis, brown adipose tissue (a real adult contributor — recently rehabilitated science), cutaneous vasoconstriction. Design mentions skin as a heat-dissipation site; doc has nothing on temperature.
- **Dehydration.** Drops plasma volume, raises heart rate at the same workload, degrades thermal regulation, eventually reduces sweating, impairs cognition. Required for the alcohol scenario and any hot-day exercise.
- **Acute illness.** "Recovery from Acute Illness" is a built-in scenario. The doc has no model for fever (raises BMR ~7%/°C), reduced appetite (cytokine-driven), muscle protein breakdown for immune use, or shifted fuel selection.
- **Hypoglycaemia and counter-regulation.** Doc mentions cognitive degradation below 50–60 mg/dL but does not describe the counter-regulatory cascade (glucagon → adrenaline → cortisol → growth hormone) or the symptomatic hierarchy (autonomic → neuroglycopenic).
- **Pregnancy, lactation, growth, menopause.** Design declares pregnancy and menopause out of scope for v1 — fine. "From Birth" is in scope, and growth-stage metabolism (much higher protein turnover, different fuel partitioning, growth hormone / IGF-1 axis) gets no treatment.

---

## 3. Accuracy — what's wrong, oversimplified, or misframed

Most of the substantive claims are mainstream-correct. The exceptions:

### 3.1 Numerical claims worth a second look

- **"Muscle Fat Pocket (~200–300g, ~2,000 cal)" in the Muscle Tissue section.** The text earlier says IMTG is depleted over 40–90 minutes of moderate exercise. 200–300 g of triglyceride is roughly 1,800–2,700 kcal, which would supply ~3–4 hours of moderate aerobic work on its own — more than the entire muscle glycogen pool. Mainstream estimates of total-body IMTG are typically in the low hundreds of grams range with significant uncertainty, but the role described (a fast, local fat cache that meaningfully extends a 90-minute run) is mainstream. The number is plausibly on the high end; flag for phase-3 calibration. Would not change qualitative behaviour.
- **"Liver Sugar Polymer Store ~80–100 g, ~320–400 cal."** Mainstream range; fine.
- **"Muscle Sugar Polymer Store ~300–500 g, ~1,200–2,000 cal."** Mainstream range; fine. The "90 minutes at moderate-hard effort" rule of thumb is reasonable, though intensity-dependent — at 75% VO2max it can deplete in ~75 minutes; at 50% VO2max it can last several hours.
- **"Body Fat Store ~10–15 kg in a lean person, ~80,000–100,000 cal."** Reasonable for a lean adult male. A lean adult female carries notably more (essential body fat is higher). The simulator's sex-difference axis will need this corrected per-sex.
- **"30–50% depleted by morning"** for liver glycogen overnight — reasonable for a normal eater with a normal-sized dinner; closer to 50–70% after 12+ hours fasted. Fine.
- **"Body turns over its entire token (ATP) supply roughly every 1–2 minutes at rest."** Standard textbook figure is closer to once every 60–90 seconds at rest (entire body ATP turnover is ~50–75 kg/day). Close enough.
- **"Blood Sugar tightly regulated between ~70–100 mg/dL."** Fasting normal. Postprandial peaks reach 120–140 mg/dL routinely in healthy people; the doc's stated range will read as "spikes above 100 are bad" if used as the engine's normal band. Should be: fasting ~70–100, postprandial up to ~140, lower limit of cognitive-safety ~50–60.

### 3.2 Genuinely oversimplified points

- **"The brain cannot use fat directly."** True for long-chain fatty acids (which don't cross the BBB). However, the brain *does* metabolise medium-chain fatty acids (a small contribution) and notably uses lactate as a fuel — astrocyte-neuron lactate shuttle is mainstream science now. The doc only names ketones as the alternative brain fuel. A short note that lactate is also a brain fuel (especially during exercise, where it can supply 25%+ of brain energy) would be more accurate. Matters for the "exercise sharpens the mind" intuition.
- **"Gluconeogenesis takes hours; this is a fallback, not a primary source."** Gluconeogenesis is *continuous* — it contributes meaningfully to blood glucose maintenance overnight (perhaps 25% of glucose output by morning) and dominates after liver glycogen is depleted (~24 hours fasted). It is not a "takes hours to start" pathway; it is always running, and its rate goes up. The way the doc frames it suggests there is a multi-hour delay before any gluconeogenic glucose appears, which is wrong.
- **"Muscle Sugar Polymer Store is locked in the muscle that stored it. It cannot be exported back to the bloodstream."** This is a famous and correct rule about glucose-6-phosphatase being absent in muscle. However, muscle *can* indirectly contribute to blood glucose by exporting lactate (Cori cycle) and alanine (glucose-alanine cycle) which the liver converts to glucose. The doc's emphatic "each muscle refuels only itself" risks wiring the engine to forbid those well-established indirect contributions. Recommend a clarifying sentence.
- **"Storage Hormone's suppression of fat release is nearly a complete block at high levels."** Substantially correct as a teaching point. In reality it's a steep dose-response, ~50% suppression of lipolysis at quite low insulin levels and >90% at postprandial levels. "Near-complete block" is fine; "complete block" would be wrong.
- **"Lactic Acid Molecule" terminology.** Lactate (the conjugate base) is what circulates at physiological pH, not lactic acid (the protonated form). The simulator's functional-naming rule allows this to slide, but the doc's parenthetical should be "(lactate)" — which it is. Fine.
- **"Lactate is not a waste product; it's a fuel."** Correct and important. Good.
- **"Chronic stress raises Blood Sugar by breaking down muscle protein."** Correct mechanism, but cortisol's bigger acute glucose effect is via hepatic gluconeogenesis upregulation and via insulin-resistance induction at peripheral tissues — muscle proteolysis is the slow-burn contributor. Worth nuancing.
- **"Dietary fat does not spike Storage Hormone significantly."** True in isolation but misleading as written: a mixed meal with fat + carbs + protein produces a substantial insulin response, and fat in the meal slows gastric emptying, which broadens the insulin curve. The doc reads as if fat is insulin-neutral in any meal, which the engine should not assume.
- **"Protein does not efficiently convert to fat (unlike excess carbs)."** True and well established. Good.
- **"Carbohydrate excess to fat conversion is real but slow and inefficient — the body doesn't love it."** This is the design's flagged unsettled-science item. Mostly correct in healthy people on normal diets — de novo lipogenesis is quantitatively small unless carb intake is sustained well above maintenance. Doc handling is reasonable.

### 3.3 Misframings that may bite the simulator

- **"Heart preferentially burns fat at rest and moderate effort."** True, but the heart is described as *the* big lactate consumer. Both are correct simultaneously; the doc handles it well, but a future engine fitter should know that the heart's fuel mix shifts toward lactate during heavy whole-body exercise.
- **"Compact Fuel Molecules normally present only in trace amounts; significantly elevated during extended fasting or sustained very-low-carbohydrate eating."** "Extended fasting" reads as multi-day; meaningful ketone elevation begins within ~16–24 hours of fasting in most adults. Worth tightening.
- **"Surge Hormone overrides normal pacing."** Correct intuition; in mechanism, adrenaline activates hormone-sensitive lipase and phosphorylase rapidly via cAMP — it doesn't *override* glucagon, it stacks. Fine for the simulator.
- **"Release Hormone tells fat cells to release Fat Transport Molecules."** Glucagon's direct effect on human adipose tissue is small; most fat-cell mobilisation is driven by adrenaline (and by withdrawal of insulin). The doc lists glucagon as a fat-cell signal alongside adrenaline. Mainstream physiology is that this is mostly a rodent finding; in humans, glucagon's adipose effect is modest. The engine should weight adrenaline and insulin-withdrawal heavily and treat glucagon's direct lipolytic role as small.
- **"Storage Hormone modestly promotes protein synthesis."** Correct. The bigger driver is leucine / mTOR signalling and mechanical load. Worth at least naming in a future revision.
- **"Bones (calcium balance, marrow as a slow contributor)."** Fine in the design doc; not in the science doc at all (gap, see 2.3).
- **"Sleep deprivation impairs Storage Hormone sensitivity."** Correct and well established. Good.
- **"The liver's Sugar Polymer Store can sustain Blood Sugar for several hours overnight."** Correct, but combined with gluconeogenesis (which the doc downplays), the liver can sustain blood glucose for far longer than hours. The "morning run feasible" framing is right; the underlying mechanism is liver glycogen + continuous gluconeogenesis, not just glycogen.

---

## 4. Settled vs unsettled — calibration

### 4.1 Settled science presented as unsettled (or hedged when it shouldn't be)

The doc actually under-hedges more than it over-hedges. A few cases of borderline hedging:

- **Metabolic flexibility.** The doc presents this as a settled concept driven by chronic insulin exposure. The phenomenon is real and well documented, but the *intervention claim* ("protein-first eating and regular exercise improve metabolic flexibility") is an extrapolation from mechanistic plausibility rather than a clinical-grade settled finding. The framing is fine for a teaching tool; flag in the simulator's unsettled-science badges.
- **The post-exercise "anabolic window" (30–60 minutes).** The doc frames this as a clear window where carb-protein refuels glycogen significantly faster than waiting hours. The size and importance of this window is contested in the literature — some recent reviews (Aragon & Schoenfeld and follow-ups) argue total daily intake matters more for most people, and the window is wider than 30–60 minutes for non-elite training. The doc presents it more confidently than warranted.

### 4.2 Unsettled or contested claims presented as settled

- **"Each muscle pool is self-contained / cannot borrow from other muscles."** True at the level of glycogen-as-glucose export but, as noted in 3.2, indirect cross-talk via lactate and alanine exists. The strong rule risks misleading.
- **"The body turns over its entire token supply roughly every 1–2 minutes at rest."** Stated as fact. The cited number is widely repeated but is itself a back-of-envelope figure; fine for teaching, would be worth a "(approximately)."
- **"Trained endurance athletes store significantly more IMTG."** True directionally, with significant interindividual variability ("athlete's paradox" — IMTG correlates with fitness in athletes and with insulin resistance in sedentary people). The doc's framing is fine; the "athlete's paradox" itself is worth a sentence because it confounds the naive "more IMTG = healthier" reading.
- **"The cortisol morning rise helps mobilise Blood Sugar before waking."** The cortisol awakening response (CAR) is real; the *purpose* attribution is a teleological just-so story. Mainstream physiology accepts the rise; its functional role is contested. Doc is fine but reads more confidently than warranted.
- **"Stress causes weight gain and muscle loss — direct hormone action, not a metaphor."** True at high cortisol levels (Cushing's, sustained psychological stress in some studies). The effect size in healthy people with ordinary life stress is contested (the design's Section 13 flags exactly this). The science doc itself states it without the caveat. Worth aligning the two documents.
- **"Sustained very-low-carbohydrate eating elevates ketones."** True. The downstream claim that "the brain prefers Blood Sugar but will substitute these effectively after a few days of adaptation" is reasonable; the precise time course (3 days? a week? two weeks?) and the maximum brain ketone fraction (~60% vs ~75%) are softer than the doc implies.
- **"Dietary fat does not spike Storage Hormone."** As a standalone claim about pure fat: true. As a guide to mixed-meal behaviour: misleading (see 3.2).
- **Carbohydrate-to-fat conversion as "real but slow and inefficient."** This is exactly one of the design's flagged unsettled items — the science doc states it as if settled. The two documents need to agree.

The design doc (Section 13) lists 17 unsettled items the simulator will badge. The science doc has roughly four hedged claims and treats the rest as settled. The mismatch is the calibration problem: the science doc owes a section listing its own confidence levels, ideally per claim, and the design's badge list should be cross-referenced from there.

---

## 5. Recommendations

Numbered, in priority order for the engine builder:

1. **Add a hormone-coverage section** beyond the four. Cover Building Hormone (GH), thyroid, sex hormones (testosterone, oestrogen, progesterone, with the cyclic modulation note), leptin, ghrelin, GLP-1, ADH, aldosterone — at the same level of detail as the existing four. The "four hormones run all fuel flows" framing should be re-scoped to "four hormones run short-term fuel partitioning."
2. **Add water and electrolytes as tracked substances.** Define plasma volume, sweat loss, kidney handling, ADH/aldosterone control. Required by the alcohol scenario, exercise scenarios, and the Skin location.
3. **Add foreign-substance entries: ethanol, nicotine, caffeine, carbon monoxide, generic-drug.** Each at the same depth as Blood Sugar, with creation, consumption, regulation, and chronic-effect notes. Ethanol especially — full ADH/ALDH path, NADH suppression of fat oxidation and gluconeogenesis, sleep effect.
4. **Add lipoprotein entries: VLDL ("Liver Fat Transport Packet"), LDL/HDL ("Cholesterol Carrier — Outbound / Returning").** Required by the vessel-wall trajectory and the dietary-fat-composition unsettled item.
5. **Add fructose as a distinct sugar substance,** with the liver-only processing route, no insulin response, and DNL contribution.
6. **Add organ stubs for: pancreas, adrenal glands, thyroid, bones (and marrow), skin, lymphatic system, reproductive organs.** Each at the level of the existing Heart entry.
7. **Add phosphocreatine as a tracked muscle-cell substance** (the seconds-timescale ATP buffer). Needed for sprints and strength events.
8. **Soften the "muscle pool is self-contained" rule** with a sentence on the Cori cycle and glucose-alanine cycle as indirect contributions.
9. **Reframe gluconeogenesis as continuous, not "takes hours / fallback."** Add a sentence on its overnight contribution.
10. **Add a "Brain alternative fuels" sentence** noting lactate as a meaningful brain fuel, especially during exercise.
11. **Add an edge-cases section** covering: fasting >24 hours (ketosis trajectory, kidney gluconeogenesis, BMR drop), exercise above lactate threshold (intensity-vs-fuel-mix curve), heat (vasodilation, sweat, plasma volume), cold (shivering, BAT), dehydration (plasma volume, HR drift), acute illness (fever, cytokine effects), hypoglycaemia counter-regulation, growth and aging.
12. **Add a confidence-level annotation** to each claim — settled / mostly-settled / contested / speculative — and align it with the design doc's Section 13 unsettled list. The two documents should agree on what is contested.
13. **Tighten numerical ranges** that will hit the engine: postprandial blood glucose upper bound, sex-specific body fat ranges, time-course of ketone elevation, intensity dependence of muscle glycogen depletion time. Mark each as "calibrate in phase 3."
14. **Add an inflammation signal,** even if just one lumped "Inflammation Signal" substance. Required by acute-illness, overtraining, alcohol, and chronic-disease trajectories.
15. **Add a section on life-stage parameter shifts** (newborn, child, adolescent, adult, mid-life, older adult) — caloric requirements per kilogram, protein demand, hormonal baselines, recovery rate constants. The "From Birth" scenario can't be built without this.
16. **Add a sex-difference section** beyond what the design doc carries — the science layer should have its own treatment of body-fat targets, muscle protein synthesis differences, alcohol clearance mechanism, iron handling, bone density trajectories. Currently the design doc carries the science the science doc should be carrying.
17. **Re-state the heart-fat / heart-lactate fuel preference** as intensity-dependent: fat-preferring at rest and low intensity, lactate-preferring during heavy whole-body work.

Items 1, 2, 3, 4, 6 are blocking for the v1 design's stated scenario list (alcohol, smoking, multi-year, sex differences). Items 7, 9, 11, 14, 15 are blocking for the more ambitious scenarios (From Birth, Aging Well, Recovery from Illness). Items 5, 8, 10, 12, 13, 16, 17 are quality improvements that don't block v1 but will save the phase-3 calibrator a lot of pain.

---

## 6. Process notes

- **Environment.** I had `Read`, `Edit`, `Write`, `Bash` and (via search) `WebSearch` and `WebFetch`. WebSearch was denied at runtime, so I could not pull live citations. The numerical and mechanistic claims in this review are checked against established physiology knowledge from standard medical-physiology references (Guyton & Hall; Berne & Levy; mainstream review articles I have prior knowledge of) rather than freshly cited sources. Where I have flagged a number as "plausible but on the high end" or "mainstream range," that is from memory of those references, not a live citation.
- **Depth of the check.** I read both documents end-to-end and stepped through each substance, location, and hormone claim. I did not attempt to verify every numerical range against a primary source — I flagged the ones that struck me as load-bearing for the engine's behaviour or as outliers from textbook values. A deeper review would: (a) pull primary literature for each numerical range, especially IMTG capacity, the post-exercise glycogen-refill window, brain ketone fraction, and the intensity-vs-fuel-mix crossover curve; (b) cross-check the food-related claims against the FoodData Central pipeline the design Section 9 names; (c) sit with a clinical-physiology reviewer for the chronic-disease and aging trajectories; (d) verify the alcohol pharmacokinetics section once it exists.
- **What needs a deeper review before phase-3 numerical fitting.** Specifically: ketosis time-course; gluconeogenesis baseline rate and its response to fasting duration; the IMTG total mass and turnover rate; the post-exercise carbohydrate uptake window magnitude; the de novo lipogenesis rate as a fraction of carbohydrate excess; the sex-specific body fat targets and muscle protein synthesis rate constants; the alcohol clearance kinetics (zero-order rate, sex differences, first-pass metabolism); cortisol effect sizes in healthy people under ordinary stress.
- **What I did not check.** Spelling, grammar, style — the brief said the functional-naming is deliberate and not a target. I did not. The document reads cleanly.
- **Assumption made.** I treated `design/design.md` Section 11 (the engine's tables) and Section 13 (the unsettled-science list) as authoritative for what the simulator needs the science layer to feed. Where the science doc was silent on something the engine table promised, I scored that as a completeness gap. If `background/exercise-responses.md` (referenced in the design Section 3) exists and covers some of this, the gap shrinks accordingly — I did not look for that file because it was not named in the brief.

---

## Document referenced

- `/home/david/work/metabolic-sim/background/metabolic-pathways.md` — under review.
- `/home/david/work/metabolic-sim/design/design.md` — consumer; defines what the science layer must deliver.
