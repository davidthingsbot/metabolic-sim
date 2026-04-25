# Metabolic Pathways — How the Body Manages Fuel, Building Materials, and Signaling

*Terminology note: Background notes use scientific names primary (insulin, glucose, glycogen, free fatty acid, etc.). The plain-language functional names that the simulator's UI shows by default (Storage Hormone, Blood Sugar, Sugar Polymer Store, Blood Fat, etc.) live in `design/glossary.md` along with the canonical code variable names. The simulator reads the glossary to render whichever label mode the user has selected. Metric units throughout.*

---

## 1. Overview

The metabolic system is the body's resource management layer. It handles four jobs simultaneously:

1. **Energy supply** — keeping every cell powered, moment to moment, including during wildly varying demand (sleeping vs. sprinting)
2. **Building materials** — supplying raw components to make and repair tissue, enzymes, hormones, membranes, and DNA
3. **Chemical signaling** — producing and degrading the messenger molecules that coordinate every other system
4. **Waste management** — breaking down and exporting metabolic byproducts, worn-out proteins, and toxins

Most popular descriptions focus only on #1. That's a mistake — the same pathways handle all four, often competing for the same raw materials, which is why nutrition timing, sleep, and stress have such concrete physiological effects.

**The core design constraint:** The body runs on a narrow set of chemical "currencies" that cells can actually use. The entire metabolic system exists to convert diverse food inputs into those currencies, buffer supply against demand, and distribute everything via the bloodstream. Blood is the logistics network; the liver is the central switching station; hormones are the control signals.

---

## 2. Key Substances

### Blood glucose

**What it is:** The body's primary fast-access fuel currency. A simple sugar that cells can combust almost immediately for energy. Also the only fuel the brain can use under normal conditions (it cannot burn fat directly).

**How it is created:**
- Digestion of carbohydrates in the small intestine → absorbed into portal blood → delivered to liver → released into general circulation
- Liver breaking down its glycogen → glucose released into blood
- Liver converting amino acids (from protein), lactate (from working muscle), glycerol (from fat breakdown), or alanine (the muscle-to-liver nitrogen shuttle) into glucose via a process called gluconeogenesis. This pathway is *continuous*, not a delayed fallback — it runs all the time, and its rate climbs as glycogen empties. Overnight it contributes a meaningful fraction (around a quarter) of the glucose the liver puts into blood; after 24+ hours of fasting it dominates.

**How it is consumed:**
- Every cell in the body takes it up and burns it for energy — most rapidly in active muscle
- Liver and muscle convert it into glycogen for later use
- Liver converts excess into lipoprotein particles for long-term storage (only when sugar stores are already full)

**Where it travels:** Bloodstream, everywhere. Tightly regulated. Fasting normal sits around 70–100 mg/dL; after a typical mixed meal it routinely peaks at 120–140 mg/dL in healthy people before returning to fasting range over 1–2 hours. Cognitive-safety floor is around 50–60 mg/dL — below that, the brain falters.

**What regulates it:**
- **Insulin** — rises after eating; drives blood glucose into cells and into storage; suppresses fat release
- **Glucagon** — rises when blood glucose drops; tells liver to release stored sugar; antagonist to insulin
- **Epinephrine (adrenaline)** — dumps blood glucose rapidly during intense effort or threat; overrides normal pacing
- **Cortisol** — chronically elevated stress raises blood glucose by breaking down muscle protein to produce glucose

---

### Fructose

**What it is:** A simple sugar that looks like blood glucose's sibling on a label — a single sweet sugar molecule — but the body handles it almost entirely differently. Where blood glucose is fuel for every cell, fructose is processed almost exclusively by the liver. It does not provoke a meaningful insulin response on its own and does not raise circulating blood glucose directly.

**How it is created:** Eaten — the natural sugar in fruit (alongside blood glucose), the second half of table sugar (sucrose splits in the gut into blood glucose + fructose), and the dominant sugar in high-fructose corn syrup-sweetened drinks and processed foods.

**How it is consumed:** Absorbed in the small intestine and routed by portal blood directly to the liver. The liver converts it stepwise into the same intermediates as blood glucose, but earlier in the chain — bypassing the regulatory step that limits blood glucose's flow into the same pathway. As a result, when the liver is supplied with abundant fructose, a larger fraction is converted to fat in place (de novo lipogenesis) and packaged for export as VLDL particles. It also tops up liver glycogen.

**Where it travels:** Gut → portal blood → liver. Almost none reaches general circulation as fructose; it leaves the liver as blood glucose, fat, or stored polymer.

**What regulates it:** No dedicated hormonal feedback loop on the way in — intake is the main control. The downstream products (blood glucose, fat) are then regulated normally.

**Why this matters:** A pure-Blood-Sugar load and a pure-Liver-Routed-Sugar load of the same calorie size produce different downstream behaviour. fructose drives more liver fat accumulation and more outbound VLDL export per gram, contributing to the long-running fast-food and sugar-drink scenarios.

---

### Liver glycogen

**What it is:** Compressed chains of blood glucose stored in the liver. The liver's on-hand reserve for maintaining blood glucose between meals. Think of it as the body's checking account — not the savings account, just the buffer that covers day-to-day fluctuations.

**How it is created:** After a meal, when blood glucose is high and insulin is elevated, the liver converts incoming blood glucose into this compact chain form and packs it away.

**How it is consumed:** When blood glucose starts to drop — between meals, overnight, during exercise — glucagon signals the liver to break these chains back down and release blood glucose into circulation. Can empty meaningfully after a full night without eating (often 30–50% depleted by morning).

**Where it travels:** Doesn't travel — stored in the liver until needed, then converted back to blood glucose and released into blood.

**What regulates it:** insulin (fills it) and glucagon (empties it).

**Critical distinction:** The liver's glycogen exists to maintain blood glucose for the whole body — including the brain. It does not directly fuel muscles. Muscles have their own local version.

---

### Muscle glycogen

**What it is:** The same compressed sugar chains, but stored inside muscle cells rather than the liver. The primary fuel for hard exercise.

**How it is created:** blood glucose + insulin → muscle cells convert and store locally. Refill is fastest in the 30–60 minutes after exercise, when the cells' sugar-intake machinery is still highly active.

**How it is consumed:** Muscle contraction — the muscle breaks these chains down and burns the resulting blood glucose on the spot. Very fast under load.

**Where it travels:** It doesn't, directly. This is a critical point: **Muscle glycogen is locked in the muscle that stored it.** It cannot be exported back to the bloodstream as glucose — muscle lacks the enzyme that would let it. The quads depleted on a hard hill can't directly borrow from the hamstrings or from the liver's version. Each muscle refuels only itself.

There is, however, an *indirect* route. Working muscle exports lactate and an amino-acid carrier (alanine) to the blood; the liver converts both back into blood glucose (the Cori cycle and the glucose-alanine cycle, respectively). So a hard-working muscle can ultimately contribute to whole-body blood glucose through the liver — just not through any direct muscle-to-muscle handoff. The qualitative rule for the engine is: muscle glycogen is a private store; sugar-equivalent loops back through the liver only.

**What regulates it:** insulin (fills it). No direct hormonal drain — it empties only through muscular work.

**Capacity:** ~300–500g total across all muscle (~1,200–2,000 calories). At moderate-hard effort, roughly 90 minutes of capacity.

---

### Intramuscular fat (intramuscular triglyceride, IMTG)

**What it is:** Fat stored directly inside muscle cells, in small droplets close to the cellular energy machinery. A local fat cache — faster to access than fat stored in fat tissue elsewhere in the body.

**How it is created:** Gradual uptake from the blood during rest and recovery — takes 24–48 hours to refill meaningfully after depletion.

**How it is consumed:** During sustained moderate-intensity exercise (roughly 40–90+ minutes), the muscle taps this local fat store before or alongside fat arriving from elsewhere. Trained endurance athletes store significantly more of it — one reason their fat oxidation is higher.

**Where it travels:** Doesn't travel — consumed in place.

**What regulates it:** Depleted by sustained aerobic work; refilled over days of rest.

---

### Body fat (adipose triglyceride)

**What it is:** The body's long-term energy reservoir, stored in fat cells (adipose tissue) throughout the body — under the skin and around organs. A lean adult male carries roughly 10–15 kg of it (around 80,000–100,000 calories); a lean adult female carries notably more in absolute terms because essential body fat is higher (essential reproductive and structural fat alone is several percent of body mass higher in females). The simulator will need sex-specific defaults — see the Sex Differences stub. Effectively unlimited as a fuel source for any normal exercise duration.

**How it is created:** Excess calories — especially when glycogen stores are already full — get converted and packed away here. Dietary fat is also stored relatively directly. Driven by insulin.

**How it is consumed:** When insulin drops (between meals, during exercise), fat cells break their stored fat into free fatty acids and release them into the blood. The dominant active signal is epinephrine (and adrenaline-like signalling generally); the *withdrawal* of insulin is itself half the story. glucagon's direct effect on human fat cells is small — most of its work is on the liver. The engine should weight adrenaline and Storage-Hormone-withdrawal heavily here and treat glucagon's adipose effect as minor.

**Where it travels:** Converted to free fatty acids before leaving the fat cell; these then circulate in the blood.

**What regulates it:** Strongly controlled by insulin. The dose-response is steep: even low insulin levels suppress fat release substantially (around half-maximal at modest fasting-range concentrations); at postprandial levels suppression exceeds 90%. The teaching shorthand is "near-complete block at high insulin." Fat burning requires *low* insulin.

---

### Free fatty acid (FFA)

**What it is:** Fat in transit. When fat cells release stored fat, it breaks into these individual fatty acid chains, which bind to a carrier protein in the blood (albumin) and travel to wherever they'll be burned. Always present at low levels; ramps up during fasting, exercise, and stress.

**How it is created:** Fat cells break down their stored Body Fat under hormonal signal → free fatty acids released into bloodstream.

**How it is consumed:**
- Muscle cells absorb and burn them for energy (requires oxygen; slower than burning blood glucose)
- Liver converts excess into ketones when insulin is very low

**Where it travels:** Bloodstream → muscle, heart, liver.

**What regulates it:** insulin (suppresses release), glucagon and epinephrine (stimulate release from fat cells).

---

### Ketones (ketone bodies)

**What it is:** An alternative fuel the liver manufactures from free fatty acids when insulin is very low and free fatty acids are arriving faster than they can be burned directly. The brain and heart can run on these when blood glucose is scarce. Normally present only in trace amounts. Meaningful elevation begins within roughly 16–24 hours of fasting in most adults; sustained very-low-carbohydrate eating raises the baseline over days to weeks.

**How it is created:** Liver + low insulin + abundant free fatty acids → liver packages them into these compact molecules and releases them into the blood.

**How it is consumed:** Brain and heart absorb and burn them directly. The brain prefers blood glucose but substitutes these progressively over days of adaptation; in fully keto-adapted individuals they can supply roughly 60–70% of brain energy. Liver makes them but cannot use them itself (it lacks the enzyme that other tissues use to import them back into the energy pathway), which is why the liver makes ketones rather than burning the fat directly.

**Where it travels:** Bloodstream → brain, heart (and to a lesser extent muscle).

**What regulates it:** Primarily insulin — as long as insulin is above a threshold, the liver doesn't make meaningful quantities.

---

### VLDL (very-low-density lipoprotein)

**What it is:** The liver's outbound fat-shipping container. Where the chylomicron brings fat *in* from the gut, this packet ships fat *out* of the liver into general circulation. The body makes these whenever the liver has more fat to dispatch than it wants to keep — from incoming dietary fat, from carbohydrate excess converted to fat in the liver, and especially from fructose processing.

**How it is created:** Liver assembles triglyceride plus a protein shell plus cholesterol → packet released into general circulation.

**How it is consumed:** Tissues — particularly fat cells and muscle — pull fat out of the packet as it passes by, the same way they do with the chylomicron. As the packet sheds its triglyceride cargo it becomes denser and is reclassified along the way; the depleted remnant is the LDL described below.

**Where it travels:** Liver → bloodstream → fat tissue, muscle, heart → matures into the LDL.

**What regulates it:** Output rises with dietary fat load, with carbohydrate excess (especially fructose), and with chronic over-supply. This is the route by which excess carbohydrate ends up as adipose triglyceride: liver makes fat from sugar, packages it as VLDL particles, and ships it to fat tissue.

---

### LDL (low-density lipoprotein)

**What it is:** What's left of the VLDL after most of its triglyceride cargo has been delivered: a smaller particle still carrying cholesterol, on its way to deliver that cholesterol to peripheral tissues that need it (every cell membrane uses it). Often nicknamed "the bad cholesterol" because elevated levels track with vessel-wall changes — but it is not bad in itself; it is doing essential delivery work, and only becomes a hazard when there is too much of it for too long, or when it gets oxidatively damaged in transit.

**How it is created:** From VLDL remnants in circulation, after most triglyceride has been extracted.

**How it is consumed:** Tissues take it up via dedicated receptors and use the cholesterol for membrane and hormone synthesis. The liver also reclaims a large fraction.

**Where it travels:** Bloodstream → tissues, vessel walls (slow uptake), liver (recycling).

**What regulates it:** Liver receptor expression (controlled by intracellular cholesterol levels) and dietary saturated-fat load (which suppresses receptor expression) are the main day-to-day levers. Total levels also reflect chronic VLDL output.

---

### HDL (high-density lipoprotein)

**What it is:** A small protein-rich particle made by the liver and gut that picks up cholesterol from peripheral tissues — including from vessel walls — and carries it back to the liver for recycling or excretion. Often nicknamed "the good cholesterol" because higher levels track with lower vessel-wall risk, though the causal direction has been harder to establish than once assumed.

**How it is created:** Liver and small intestine assemble starter particles; these acquire cholesterol from tissues and circulating particles in transit.

**How it is consumed:** Liver receptors pull the loaded particles back, extract the cholesterol, and either repackage or excrete it via bile.

**Where it travels:** Liver / gut → bloodstream → tissues → liver.

**Why these two carriers matter:** The vessel-wall trajectory in long-running scenarios is driven by the balance between outbound delivery (LDL) and return pickup (HDL), modulated by chronic dietary fat composition, fructose load, insulin exposure, cytokines level, and time. The exact contribution of saturated versus unsaturated dietary fat to vessel-wall changes is one of the simulator's flagged unsettled-science items.

---

### Phosphocreatine (creatine phosphate)

**What it is:** A seconds-timescale energy reservoir held inside muscle cells. Where ATP are the universal currency cells actually spend, the phosphocreatine is the small cash-on-hand that can regenerate spent tokens almost instantaneously by handing over a phosphate group. It is what powers the first ten seconds of a sprint or a heavy lift, before any other fuel pathway can ramp up.

**How it is created:** Muscle cells synthesise it at rest from the amino acid arginine and from dietary creatine (meat is the main food source; vegetarians have lower stores). The synthesis is slow; what matters acutely is recharging the buffer between efforts, which uses ATP generated by full combustion.

**How it is consumed:** During very short, very high-intensity efforts the buffer dumps its phosphate to regenerate ATP at a rate the fast and full-combustion pathways cannot match. Empties in roughly 8–15 seconds of all-out work. Refills 60–80% within about 60 seconds of rest and approaches full in 3–5 minutes — which is why between-set rest of 3 minutes restores most strength capacity.

**Where it travels:** Doesn't travel — manufactured and consumed within each muscle cell.

**What regulates it:** Acute work rate empties it; rest plus aerobic ATP production refills it. Dietary creatine supplementation modestly raises baseline capacity (one of the few sports supplements with strong evidence).

**Why this matters:** Sprints, heavy lifts, jumps, and the explosive first-second-or-two of any sudden movement all run on this buffer. The ATP entry alone misses the seconds-timescale dynamics of strength and sprint events.

---

### Chylomicron

**What it is:** The packaging the small intestine uses to ship dietary fat into the body. Because fats don't dissolve in water (and blood is water), the gut wraps them in a protein shell to move them. These are large, temporary particles that exist just long enough to deliver their cargo.

**How it is created:** In the cells of the small intestine, after fat is absorbed from digested food — the intestine packages it into these particles and releases them into the lymphatic system (not directly into the portal blood like sugars and amino acids).

**How it is consumed:** The particles circulate, and tissues (primarily fat cells and muscle) pull fat out of them as they pass by. The remnant particles end up at the liver.

**Where it travels:** Lymphatic system → bloodstream → fat tissue, muscle → liver (remnant).

**What regulates it:** Depends on dietary fat intake; appears in blood 1–3 hours after a fat-containing meal.

---

### Amino acids

**What they are:** The components the body uses to build proteins — enzymes, structural tissue, hormones, immune proteins, transport molecules, and more. Sourced from dietary protein or recovered from breaking down the body's own proteins.

**How they are created:** Digestion breaks dietary protein into individual amino acids → absorbed in small intestine → enter portal blood → liver processes first.

**How they are consumed:**
- Cells use them to synthesize new proteins (ongoing, continuous)
- If in excess, liver strips the nitrogen-containing part (excreted as urea through kidneys), and converts the carbon backbone to blood glucose (slow, hours) or to fat intermediates

**Where they travel:** Bloodstream → all tissues, continuously.

**What regulates them:** No tight single-hormone regulator like blood glucose has — protein synthesis is driven by demand signals (exercise, growth) and supply. insulin does modestly promote protein synthesis; cortisol promotes protein breakdown. The bigger drivers of muscle protein synthesis specifically are mechanical load and the amino acid leucine, which together activate the muscle-repair signalling cascade (anchored on a kinase called mTOR). growth hormone and testosterone modulate the baseline rate.

---

### ATP (adenosine triphosphate)

**What it is:** The universal energy currency cells actually use to do work. Every fuel — blood glucose, free fatty acids, ketones — ultimately gets converted to these tokens. Cells cannot store more than a few seconds' worth; they must be continuously regenerated.

**How it is created:**
- **Fast path (no oxygen required):** blood glucose or muscle glycogen → partial combustion → small yield of tokens + lactate as byproduct. Very fast but inefficient.
- **Full combustion path (oxygen required):** blood glucose, intramuscular fat, free fatty acids, or ketones → complete combustion in the cell's power plant → large yield of tokens + carbon dioxide + water as byproducts. Efficient but slower; limited by oxygen delivery.

**How it is consumed:** Instantly, by everything the cell does — muscle contraction, protein synthesis, ion pumping, signaling. The body turns over its entire token supply roughly every 1–2 minutes at rest; much faster during exercise.

**Where it travels:** Does not travel between cells — manufactured and consumed within each cell.

---

### Lactate

**What it is:** The byproduct of the fast (no-oxygen) energy path. Contrary to the popular myth, it is not a "waste product" that causes soreness — it is a fuel that can be recycled. Muscle produces it during hard effort; the heart and other muscles can burn it directly; the liver can convert it back to blood glucose.

**How it is created:** Fast combustion of blood glucose or muscle glycogen in muscle during high-intensity effort when oxygen supply can't keep up with demand.

**How it is consumed:** Heart and slow-twitch muscle fibers burn it directly for energy. Liver converts it back to blood glucose (a process called the Cori cycle). At moderate intensity, production and clearance are roughly balanced; at very high intensity, it accumulates.

**Where it travels:** Released from working muscle into the blood → heart, liver, other muscles.

**What regulates it:** Exercise intensity and oxygen availability. Not a meaningful factor at moderate aerobic pace.

---

### Urea (nitrogen waste)

**What it is:** The disposal form of nitrogen from protein metabolism. When amino acids are broken down for fuel or when worn-out proteins are recycled, the nitrogen-containing portions must be excreted. The liver packages this as urea.

**How it is created:** Liver processes excess amino acids or recycled proteins → strips nitrogen → assembles it into urea.

**How it is consumed/excreted:** Urea travels in blood to the kidneys, which filter it out and excrete it in urine.

**Where it travels:** Blood → kidneys → urine.

---

### Ammonia

**What it is:** The first form nitrogen takes when amino acids are broken apart — a small, toxic molecule the liver immediately repackages into Urea before it can do harm. In a healthy liver this intermediate barely accumulates. It matters in liver dysfunction (cirrhosis, alcoholic liver disease, severe hepatitis), where the urea-packaging step falters and ammonia climbs in blood, crosses into the brain, and produces cognitive symptoms ranging from confusion to coma.

**How it is created:** Liver and (to a smaller extent) muscle break amino acids apart for fuel or recycling → nitrogen freed as this intermediate.

**How it is consumed:** Liver immediately bundles it with carbon to make Urea. A small amount is excreted directly by the kidneys.

**Where it travels:** Mostly stays inside the liver. Spills into general circulation when liver capacity is exceeded.

**What regulates it:** Liver health and amino-acid throughput. Important for the chronic-alcohol scenario; not a normal-physiology variable.

---

### Cytokines (lumped cytokine pool — interleukin-6, tumour necrosis factor, C-reactive protein)

**What it is:** A single lumped substance representing the body's inflammatory tone. Real inflammation is a cocktail of dozens of distinct messenger molecules with different targets and timescales; for the simulator, one quantity is enough to wire the dynamics that depend on it. The cytokines rises with infection, tissue damage, sustained cortisol elevation, abdominal body fat accumulation, poor sleep, alcohol, smoking, and many chronic disease processes. It falls with rest, recovery, and resolution of the trigger.

**How it is created:** Immune cells, fat cells (especially abdominal body fat), and damaged tissues release inflammatory messengers into blood.

**How it is consumed:** Cleared by the liver and by the resolution of its trigger. The signal is meant to be transient — chronic elevation is itself a problem.

**Where it travels:** Bloodstream, everywhere; particularly affects liver, fat tissue, vessel walls, and brain.

**What regulates it:** Acute triggers (infection, injury, hard exercise) cause sharp short-lived rises. Chronic triggers (visceral fat, chronic stress, smoking, poor sleep, sustained alcohol) keep it elevated at a low level for years.

**What it does to the engine:** Raises basal metabolic rate (fever — roughly 7% per degree celsius of fever), suppresses appetite, drives muscle protein breakdown (amino acids recruited for immune use), reduces insulin sensitivity, accelerates vessel-wall changes over years, and shifts mood and cognition. Required by acute illness, overtraining, alcohol, smoking, and chronic-disease scenarios.

**Confidence:** The qualitative role is settled; the magnitudes of each downstream effect are mostly-settled at best — see Confidence Levels.

---

## 3. Key Locations

### Blood / Circulatory System

**Stored:**
- blood glucose (~5g, ~20 cal — the tightly regulated float)
- free fatty acids (always present; elevated during exercise/fasting)
- ketones (trace normally; elevated in fasting/keto)
- amino acids (continuous transit)
- Hormones (insulin, glucagon, epinephrine, cortisol, and dozens of others)

**Created:** Not a production site — blood is a transport medium.

**Absorbed/Exported:** Everything flows through. Blood is the logistics network connecting all other locations.

**What regulates it:** The liver, kidneys, and lungs continuously adjust blood composition. Hormones are the primary control signals.

---

### Liver

**Stored:**
- liver glycogen (~80–100g, ~320–400 cal)
- Small amounts of fat (normal); accumulation here is a sign of metabolic dysfunction

**Created:**
- blood glucose (from glycogen, from amino acids, from lactate)
- ketones (from free fatty acids, when insulin is very low)
- Urea (from amino acid processing)
- Bile (for fat digestion — released into small intestine)
- Carrier proteins (including the protein that transports free fatty acids in blood)
- Clotting factors, immune proteins, and many others

**Absorbed:**
- Everything from the gut arrives here first via portal blood: blood glucose, amino acids, some fats
- free fatty acid remnants (after tissues have extracted most of their fat)
- lactate from working muscle
- Worn-out hormones and toxins (for processing and excretion)

**Exported:**
- blood glucose (the only organ that can do this)
- ketones
- Urea → kidneys
- Bile → small intestine
- Proteins into circulation

**Why it matters:** The liver is the central switching station. It sees all incoming nutrients first, decides what to store, what to release, what to convert, and what to discard. No other organ has this control role.

---

### Muscle Tissue

**Stored:**
- muscle glycogen (~300–500g total, ~1,200–2,000 cal)
- intramuscular fat (mainstream estimates land in the low hundreds of grams range with significant interindividual variability; treat as ~200–300 g / ~2,000 cal as a working figure, flagged for phase-3 calibration — see Confidence Levels)
- Contractile proteins (the structural machinery itself — metabolically expensive to build)

**Created:**
- ATP (from all fuel sources)
- lactate (during high-intensity effort)
- Heat (significant — muscles are inefficient; most fuel becomes heat, not work)

**Absorbed:**
- blood glucose (when insulin is present)
- free fatty acids (from blood, especially during sustained aerobic effort)
- ketones (during fasting or keto adaptation)
- amino acids (for repair and synthesis)

**Exported:**
- lactate → blood → liver/heart
- Carbon dioxide → blood → lungs

**Key constraint:** Muscle glycogen is strictly local — cannot be exported to blood. Each muscle pool is self-contained.

---

### Fat Tissue (Adipose)

**Stored:**
- body fat (~10–15 kg in a lean person, ~80,000–100,000 cal)

**Created:**
- Fat from incoming chylomicrons, blood glucose overflow, or amino acid overflow (all require insulin signal)

**Absorbed:**
- Fat from chylomicrons (as they circulate past)
- blood glucose (when insulin is high and glycogen is full → converted to fat)

**Exported:**
- free fatty acids → blood → muscle, liver, heart
- Leptin (satiety signaling hormone — tells brain how full the fat stores are)

**Key control:** insulin is the lock. While it's elevated, fat cells absorb; they don't release. Release requires low insulin plus glucagon or epinephrine signal.

---

### Brain

**Stored:** Almost nothing. No meaningful fuel reserves — entirely dependent on continuous blood supply.

**Created:**
- Neurotransmitters (signaling molecules) from amino acids
- Vast amounts of ATP (brain is the most energy-intensive organ per gram)

**Absorbed:**
- blood glucose — primary fuel, always
- ketones — substitute fuel after several days of low blood glucose (keto adaptation); can supply 60–70% of brain energy when fully adapted
- lactate — a meaningful brain fuel, especially during exercise. Astrocytes (the support cells in brain tissue) take up blood glucose and hand off lactate to neurons, which can supply 25%+ of brain energy during hard exercise. This is part of why exercise can sharpen rather than dull cognition.
- amino acids (for neurotransmitter synthesis)

**Exported:**
- Carbon dioxide
- Neurohormones into blood (e.g., the signal chain that releases epinephrine from adrenal glands)

**Key constraint:** Cannot burn long-chain fat directly — long-chain fatty acids do not cross the blood-brain barrier. The brain's primary energy substrates are blood glucose (always), ketones (under low blood glucose conditions), and lactate (especially during exercise). This is why blood glucose regulation matters even when muscles are mostly burning fat — the brain always needs its supply.

---

### Heart

**Stored:** Small amount of intramuscular fat; small glycogen reserve.

**Created:** ATP continuously — the heart never stops.

**Absorbed:**
- blood glucose
- free fatty acids (heart preferentially burns fat at rest and at moderate whole-body effort)
- lactate (the heart is an excellent consumer of lactate; during heavy whole-body exercise lactate becomes the heart's *dominant* fuel)
- ketones (during fasting/keto)

**Exported:** Carbon dioxide, mechanical work (pumping blood).

**Notable:** The heart is metabolically flexible — it uses whatever fuel is available. The preference is intensity-dependent: fat-leaning at rest and low-to-moderate effort, lactate-leaning during hard whole-body work when working muscles are pumping out lactate. This is one reason hard exercise doesn't make lactate accumulate as fast as you'd expect — the heart eats it.

---

### Small Intestine

**Stored:** Nothing meaningful.

**Created:**
- chylomicrons (assembled from absorbed dietary fat)
- Digestive enzymes (for local use)

**Absorbed:**
- blood glucose from carbohydrate digestion → portal blood → liver
- amino acids from protein digestion → portal blood → liver
- Fatty acids from fat digestion → assembled into chylomicrons → lymphatic system

**Exported:**
- blood glucose + amino acids → portal vein → liver
- chylomicrons → lymphatic system → bloodstream (bypasses liver initially)
- Gut hormones that regulate appetite and insulin release (GLP-1, GIP, etc.)

**Key distinction:** Dietary fat bypasses the liver on first pass — it goes lymph → blood → circulates to tissues → liver only gets the remnants. blood glucose and amino acids go liver-first.

---

### Large Intestine

**Stored:** Nothing relevant to metabolism.

**Created:**
- Short-chain fatty acids (butyrate, propionate, acetate) — byproducts of gut bacteria fermenting fiber. These are absorbed and used for energy by intestinal cells and the liver.

**Absorbed:**
- Water and electrolytes
- Short-chain fatty acids from bacterial fermentation

**Exported:** Waste (feces), including bacteria, fiber remnants, dead cells, bile remnants.

**Metabolic role:** Smaller than the small intestine's role, but the bacterial fermentation products are a real (if minor) fuel contribution and have significant effects on gut health signaling.

---

### Stomach

**Stored:** Food temporarily, during digestion.

**Created:** Digestive acid (hydrochloric acid) and enzymes (pepsin) to begin protein breakdown.

**Absorbed:** Almost nothing for fuel — minimal alcohol and a few other small molecules.

**Exported:** Partially digested food (chyme) → small intestine; ghrelin → bloodstream → brain (signals hunger when empty).

**Metabolic role:** Mostly mechanical and chemical pre-processing for the small intestine.

---

### Kidneys

**Stored:** Nothing relevant.

**Created:** The hormone that signals the body to produce more red blood cells (erythropoietin — relevant to endurance capacity). Active form of Vitamin D.

**Absorbed:** Urea from blood (for excretion). Also reabsorbs blood glucose if blood levels are in the normal range — does not let it leak into urine until levels are high (above ~180 mg/dL).

**Exported:** Urea, excess electrolytes, water, waste products → urine.

**Metabolic role:** Primary excretion organ for metabolic waste. Also does a small amount of gluconeogenesis (making blood glucose) during extended fasting.

---

### Lungs

**Stored:** Nothing.

**Created:** Nothing metabolically relevant (gas exchange only).

**Absorbed:** Oxygen from inhaled air → blood → all tissues.

**Exported:** Carbon dioxide from blood → exhaled.

**Metabolic role:** The lungs set the oxygen ceiling for aerobic metabolism. Aerobic fuel burning requires oxygen delivery — lung capacity and blood delivery together determine how much fat or sugar the body can combust per minute. During high-intensity exercise, breathing rate is driven largely by the need to clear carbon dioxide, not just to bring in oxygen.

**Oxygen-carrying capacity is in the blood, not the lungs.** Oxygen does not dissolve appreciably in blood plasma; it is bound and ferried by haemoglobin inside red blood cells. The total mass of haemoglobin (and the underlying red-blood-cell count) sets how much oxygen one lung-full of breath can move to working tissues — the lung's exchange surface and the carrier mass are two different limits. The smoking scenario depends on the carrier limit specifically: carbon monoxide binds the same site on haemoglobin that oxygen does, with much higher affinity, so it functionally removes carriers from rotation. This is why smoking visibly drops aerobic capacity even when lung mechanics still look normal.

---

### Pancreas

**Stored:** Nothing relevant for fuel.

**Created:**
- insulin — from islet beta cells, in response to rising blood glucose
- glucagon — from islet alpha cells, in response to falling blood glucose
- Several smaller signalling hormones from other islet cells (somatostatin, pancreatic polypeptide) — relevant to fine-tuning the insulin/glucagon balance, not directly modelled in v1
- Digestive enzymes — separate machinery from the islets, secreted into the small intestine: a starch-cutter (amylase), a fat-cutter (lipase), and several protein-cutters (proteases including trypsin and chymotrypsin)

**Absorbed:** blood glucose (which it senses to set hormone output).

**Exported:** insulin and glucagon into blood; digestive enzymes into the small intestine via a duct.

**Why it matters:** The pancreas is two organs sharing a building — an endocrine organ (the islets, ~1% of mass) running the body's fuel-traffic-light, and an exocrine organ (the rest) supplying the small intestine's digestive enzymes. Damage to either side has different consequences: islet failure produces diabetes; exocrine failure produces malabsorption.

---

### Adrenal Glands

**Stored:** Small reserves of epinephrine for rapid release.

**Created:**
- epinephrine (adrenaline / epinephrine) — from the inner core (medulla), under nervous-system signal
- cortisol — from the outer rind (cortex), under signal from the brain (the pituitary's adrenal-stimulating hormone)
- aldosterone — also from the outer rind; tells kidneys to hold onto sodium and dump potassium (see Hormonal Control Layer)
- Small amounts of sex hormones — relevant in older adults and post-menopause; trivial otherwise

**Absorbed:** Cholesterol from blood (used as the raw material for cortisol, aldosterone, and the sex-hormone trace).

**Exported:** All of the above hormones, into blood.

**Why it matters:** The adrenal glands are where short-term emergency response (epinephrine) and longer-term stress regulation (cortisol) physically originate. Both heavily covered in §4.

---

### Thyroid Gland

**Stored:** A multi-day reserve of its own hormones, attached to a carrier protein within the gland.

**Created:** thyroid hormone (thyroid hormone, dominant active form triiodothyronine — T3 — derived from a less-active precursor T4). Manufactured from the amino acid tyrosine plus dietary iodine; iodine deficiency historically produces goitre.

**Absorbed:** Iodine from blood; signal from the brain (the pituitary's thyroid-stimulating hormone).

**Exported:** thyroid hormone into blood.

**Why it matters:** Sets baseline metabolic rate — how much fuel every cell burns at rest. Genuine inter-individual variation in resting metabolic rate is partly thyroid-driven. Relevant to the "Aging Well" trajectory (thyroid output drifts with age), to body-composition trajectories generally, and to clinical scenarios (over- and under-active thyroid are common conditions). See §4.

---

### Bones and Bone Marrow

**Stored:** The body's calcium reserve — roughly 99% of body calcium is held in bone mineral. Also a reservoir for phosphate and a smaller amount of magnesium. Bone marrow, in the cavities of the larger bones, is the manufacturing site for blood cells.

**Created:**
- Red blood cells — manufactured in marrow under signal from the kidney's red-cell-output hormone (erythropoietin). Set the oxygen-carrying capacity of blood.
- White blood cells and platelets — also from marrow.
- Bone matrix itself — an active tissue, continuously remodelled by two opposing cell types: bone-builders (osteoblasts) and bone-breakers (osteoclasts).

**Absorbed:**
- Calcium from blood when blood levels are adequate and the bone-builders are active.
- amino acids for the protein scaffold (mostly collagen) that bone mineral grows on.
- Iron, B-vitamins, and other inputs needed for blood-cell manufacture.

**Exported:**
- Calcium into blood when blood levels fall — under signal from the parathyroid glands' parathyroid hormone
- Phosphate
- Newly minted blood cells

**Why it matters:** The bone-density cross-section is one of the design's stylized health diagrams. Bone is not inert structural material; it is a continuously turning calcium reservoir and the body's blood-cell factory. Calcium balance (intake vs loss) and the build-vs-break balance drift over decades and are sex-, age-, and exercise-sensitive. Detail lives in a forthcoming `bones-and-calcium.md` note.

---

### Skin

**Stored:** Subcutaneous body fat (under-skin layer). Small water reserve in the dermis. Vitamin D precursor (made from cholesterol and activated by sunlight).

**Created:** Sweat (from sweat glands; mostly water with sodium, potassium, and trace amounts of other electrolytes). Vitamin D precursor activation under ultraviolet light.

**Absorbed:** Almost nothing for normal metabolism. A handful of small molecules and certain medications cross.

**Exported:**
- Heat — by radiation from warm skin and by evaporation of sweat. Sweat-driven cooling can dump several hundred watts of heat under hot or hard-exercise conditions.
- Water (~0.3–1 L/day at rest; up to 1.5–2 L/hour in extreme heat or hard exercise)
- Sodium and potassium with the sweat

**Why it matters:** Skin is the body's primary heat-dissipation organ and a real player in fluid balance. Required by the temperature-regulation logic, the alcohol vasodilation flush, the dehydration penalty, and the silhouette diagram in the From Birth and Aging trajectories. Detail lives in a forthcoming `skin-and-temperature.md` note.

---

### Lymphatic System

**Stored:** Nothing meaningful for fuel.

**Created:** Houses and routes white blood cells (immune cells); not a metabolic creator in the fuel sense.

**Absorbed:** chylomicrons from the small intestine (already named); excess interstitial fluid from tissues; immune-cell traffic from infected sites.

**Exported:** Drains into the bloodstream at large veins near the heart, dumping its dietary fat cargo and recirculating fluid back into general circulation.

**Why it matters:** The reason dietary fat reaches systemic tissues *before* the liver — the lymphatic route bypasses the portal-vein-to-liver path that carbohydrate and protein take. Also important as the fluid-balance overflow channel: when small fluid surpluses accumulate in tissues, the lymphatic system collects them. Lymphatic dysfunction produces visible swelling (edema). Worth noting alongside the gut for the routing logic; deeper coverage deferred.

---

### Reproductive Organs

**Stored:** Nothing relevant to fuel metabolism.

**Created:**
- Ovaries — estrogen (oestrogen) and progesterone, in cyclic patterns through reproductive years
- Testes — testosterone and small amounts of oestrogen
- Both — small amounts of related steroid hormones

**Absorbed:** Cholesterol from blood (raw material for the steroid hormones).

**Exported:** Sex hormones into blood.

**Why it matters:** Reproduction itself is out of scope for the v1 simulator (per the design's non-goals), but the sex hormones produced here are first-class metabolic regulators — see §4. The hormones need a production location once the engine names them.

---

## 4. The Hormonal Control Layer

Four hormones control essentially all *short-term fuel partitioning*. Slower regulators — growth, sex, thyroid, appetite, fluid balance, blood-pressure — sit on top of those four and shape the longer-timescale trajectories. The four come first because understanding them explains most of the "why" behind nutrition timing, training effects, and sleep/stress impacts. The slower regulators come second because they explain growth, body-composition trajectories, multi-day appetite control, hydration, and the long arcs the simulator promises.

### Insulin

**What it does:** Issued by the pancreas in response to rising blood glucose (and to a lesser extent, protein). Opens the gates for cells to absorb blood glucose. Directs liver and muscle to convert blood glucose to glycogen. Directs fat cells to absorb and store fat. Suppresses fat release from fat cells. Promotes protein synthesis.

**When it's high:** After eating, especially carbohydrates. Fat access is locked. The body is in storage mode.

**When it's low:** Between meals, overnight, during extended exercise. Fat cells can release free fatty acids. Liver can produce ketones if needed.

**The critical point:** insulin's suppression of fat release is not a subtle effect — at high levels it's nearly a complete block. This is why large, frequent carbohydrate meals have a direct mechanical effect on how much time the body spends able to access fat.

---

### Glucagon

**What it does:** Direct opponent of insulin. Issued by the pancreas when blood glucose drops. Tells the liver to break down its glycogen and release blood glucose. Tells fat cells to release free fatty acids. Cannot override insulin — when both are elevated, insulin wins.

**When it's high:** Between meals, overnight, during exercise, during fasting.

---

### Epinephrine (adrenaline / epinephrine)

**What it does:** Issued by the adrenal glands in response to intense exercise, fear, or threat. Rapidly mobilizes both glycogen stores and Body Fat simultaneously, at a rate faster than the normal hormonal pacing. This is what enables the sudden explosive output at the start of a sprint — the body is treating it as an emergency and dumping fuel reserves fast.

**When it's high:** Intense exercise, fear response, acute stress, caffeine (mild effect).

---

### Cortisol

**What it does:** Issued by the adrenal glands during sustained stress (physical or psychological) and routinely peaks in early morning (the cortisol awakening response). The acute glucose-raising effect is mostly via upregulating liver gluconeogenesis and via inducing peripheral insulin resistance; the slower contributor is muscle protein breakdown, which supplies amino acids for that gluconeogenesis. Over sustained elevation it promotes fat storage, especially visceral (around organs), and suppresses repair and immune function.

**When it's chronically high:** Poor sleep, sustained psychological stress, overtraining, severe illness. The mechanism behind "stress causes weight gain and muscle loss" is direct hormone action — not a metaphor — *at high enough levels*. The effect size in healthy people under ordinary life stress is genuinely contested in the literature; this is one of the simulator's flagged unsettled-science items. See Confidence Levels.

**The morning rise:** The cortisol level reliably climbs in the hours before waking. It is widely interpreted as a signal that mobilises blood glucose in advance of the first meal, and that interpretation fits the timing — but the *purpose* attribution is more teleology than settled mechanism. What the engine should treat as solid is the timing and the mobilisation effect; the "to help you wake up fed" framing is a useful story rather than a verified function.

---

### Growth hormone

**What it does:** Issued by the pituitary gland in pulses — mostly overnight during deep sleep, with smaller pulses after intense exercise and during fasting. Drives tissue growth in childhood and adolescence; in adults its main jobs are tissue repair, mobilising body fat, sparing blood glucose (by reducing tissue uptake), and regulating amino acid traffic into muscle and bone. Acts both directly and indirectly via a downstream messenger the liver produces in response (insulin-like growth factor).

**When it's high:** Deep sleep (the main daily pulse), the hours after hard exercise, fasting, childhood and adolescence overall, recovery from injury.

**When it falls:** Steadily across adult life — by middle age, total daily output is a fraction of what it was at twenty. This decline contributes to the slow erosion of muscle mass, the drift toward fat accumulation, and slower wound healing in older bodies.

**Critical points:** Sleep loss flattens the overnight pulse — chronic short sleep produces measurably less growth hormone. Excess body fat also suppresses pulses. The post-exercise pulse is one mechanism by which strength and interval training drive structural adaptation. Required by the From Birth arc, the Aging Well arc, and any sleep-loss scenario. Already named in `exercise-responses.md`.

---

### Thyroid hormone (thyroid hormone — T3 / T4)

**What it does:** Sets the basal rate at which every cell burns fuel. Controls how much heat the body produces at rest, how fast ATP turn over, how rapidly amino acids are recycled, and indirectly how reactive the body is to epinephrine (it sensitises cells to adrenaline). Issued by the thyroid gland under signal from the pituitary's thyroid-stimulating hormone, which is itself under brain-side feedback control.

**When it's high (over-active thyroid):** Resting metabolic rate climbs, body temperature runs warm, weight drops, heart races, hands tremble, anxiety rises.

**When it's low (under-active thyroid):** Resting metabolic rate drops, body temperature runs cold, weight gain comes easily, fatigue and slowed thinking appear, hair thins.

**Daily and lifetime variation:** Output is slow-changing — measured in days to weeks rather than minutes to hours. Drifts down with age. Crash dieting, prolonged caloric restriction, and overtraining all suppress it (one mechanism behind the metabolic adaptation that frustrates long-term weight loss). Pregnancy raises demand. Iodine deficiency limits production.

**Why it matters:** Genuine inter-individual variation in resting metabolic rate is partly thyroid-driven. Required for the body-composition trajectories, the aging arcs, and any caloric-restriction scenario.

---

### Testosterone

**What it does:** Issued primarily by the testes (and to a smaller extent by the ovaries and adrenal glands in females). Drives muscle protein synthesis, red-blood-cell production (which raises oxygen-carrying capacity), bone density, and the male pattern of body-fat distribution (less subcutaneous, more visceral). Levels in adult males are roughly 10–15× higher than in adult females.

**When it's high:** Adolescence (the puberty surge), early adulthood, after intense strength training (a small acute pulse).

**When it falls:** Steadily across adult life, accelerating in some men past 50–60 (so-called andropause, contested in scope and severity). Dropped sharply by chronic illness, overtraining, severe caloric restriction, and poor sleep.

**Why it matters:** Sex differences in muscle mass, recovery from training, alcohol clearance (partial mechanism), and red-blood-cell mass are partly testosterone-mediated. Required by the Sex Differences treatment, the From Birth arc, and the Aging Well arc.

---

### Estrogen (oestrogen)

**What it does:** Issued primarily by the ovaries (and in smaller amounts by adrenal glands and body fat in both sexes). In females during reproductive years it cycles roughly monthly; in males and post-menopausal females it sits at a low steady baseline. Drives the female pattern of body-fat distribution (more subcutaneous, especially hip and thigh), bone density (the post-menopausal drop in estrogen is the main reason bone loss accelerates after menopause), insulin sensitivity (modestly higher when estrogen is high), and a number of cardiovascular and cognitive effects with timescales spanning hours to decades.

**Cyclic modulation:** Across a typical menstrual cycle, estrogen runs low in the first days, rises through the first half to peak around ovulation, drops briefly, then runs at moderate levels through the second half before falling sharply at the end. This produces real metabolic modulation: insulin sensitivity, body temperature baseline, fluid balance, fat oxidation during exercise, and appetite all shift modestly across the cycle. The size of these effects is contested — see Confidence Levels and the dedicated Sex Differences note.

**Why it matters:** Required by Sex Differences, the From Birth arc, and any long arc that crosses menopause (out of scope for v1 per design, but the hormone needs to exist).

---

### Progesterone

**What it does:** Issued by the ovaries in the second half of each menstrual cycle and during pregnancy. Raises basal body temperature by ~0.3–0.5 °C, modestly increases ventilation rate, modestly raises insulin resistance, and shifts mood and appetite. Steady low baseline outside reproductive cycles.

**Why it matters:** The body-temperature modulation is the basis of cycle tracking; the metabolic effects co-modulate exercise capacity and fuel selection alongside estrogen. See the Sex Differences stub.

---

### Leptin

**What it does:** Issued by body fat cells in proportion to how much fat they contain — more fat, more leptin. Reaches the brain, where it suppresses appetite and signals "fuel reserves are adequate." Also raises thyroid hormone activity slightly and supports normal reproductive-hormone output.

**When it's high:** After meals (acutely), and chronically when body fat is large.

**When it's low:** During fasting (acutely), after sustained caloric restriction (leptin falls disproportionately fast — a key mechanism of the rebound appetite that follows weight loss), and in lean people.

**The resistance problem:** In sustained over-supply, the brain becomes less responsive to leptin — high circulating levels stop suppressing appetite reliably. This is the leptin-resistance phenomenon, observed in many people with chronic excess body fat. The exact mechanism is contested.

**Why it matters:** Multi-day caloric scenarios, the rebound after weight loss, and the long-term appetite arc all run through this hormone. Already named in passing as a fat-tissue export.

---

### Ghrelin

**What it does:** Issued mainly by the stomach when it is empty. Reaches the brain and registers as the conscious sensation of hunger. Also stimulates a small growth hormone pulse and modestly raises body fat accumulation when chronically elevated.

**When it's high:** Before meals, after weight loss (chronically elevated for at least a year following sustained loss — another rebound mechanism), with poor sleep.

**When it's low:** Just after meals, dropping sharply with the stretch of food in the stomach and with absorbed nutrients.

**Why it matters:** Required for any multi-day appetite scenario, weight-loss rebound, and the meal-timing dynamics. Already named in the Stomach entry.

---

### Gut leptin (glucagon-like peptide 1, GLP-1)

**What it does:** Released by the small intestine wall when nutrients (especially fat and carbohydrate) arrive there. Three downstream effects: (1) amplifies the pancreas's insulin response to incoming blood glucose — this is why a glucose load eaten by mouth raises insulin more than the same glucose load delivered by IV (the "incretin effect"); (2) slows stomach emptying, which broadens and softens the blood glucose curve; (3) registers in the brain as a satiety signal, shortening meals.

**When it's high:** After eating, peaking 30–60 minutes after a mixed meal.

**When it's low:** Between meals.

**Why it matters:** The mixed-meal insulin response shape is partly this hormone's work, and synthetic drugs that mimic it (the GLP-1 agonists — semaglutide and the related class) are an obvious near-future addition to the medications library. Required by the foreign-substances and chronic-condition scenarios.

---

### Vasopressin (antidiuretic hormone, vasopressin)

**What it does:** Issued by the pituitary when blood becomes more concentrated (high salt-to-water ratio) or blood volume drops. Tells the kidneys to hold onto water — produce less urine, more concentrated. Also tightens blood vessels modestly. The body's primary acute fluid-conservation lever.

**When it's high:** Dehydration, sweat-driven fluid loss, blood loss.

**When it's low:** When over-hydrated. Also directly suppressed by alcohol — which is why drinking produces disproportionate urine output and a hangover-quality dehydration even from modest fluid intake.

**Why it matters:** Required as soon as Water and Sodium are tracked. Already named here for the alcohol scenario; full treatment lives in the forthcoming `water-electrolytes.md` note.

---

### Aldosterone

**What it does:** Issued by the adrenal glands' outer rind. Tells the kidneys to hold onto sodium (and therefore water, since water follows sodium) and to dump potassium. Triggered by an upstream signalling cascade (the renin-angiotensin system) that fires when blood pressure or sodium levels drop.

**When it's high:** Salt depletion (heavy sweat with limited replacement), low blood pressure, low blood volume.

**When it's low:** Salt-loaded states.

**Why it matters:** Required for sodium balance, blood-pressure regulation, and the long-term cardiovascular arc. Full treatment in `water-electrolytes.md`.

---

### Parathyroid hormone

**What it does:** Issued by four small parathyroid glands behind the thyroid. Sensitive to blood calcium — when blood calcium drops, this hormone rises and tells the bones to release calcium, the kidneys to reabsorb it from urine, and the gut (indirectly, through the active form of vitamin D) to absorb more calcium from food. The opposing hormone (calcitonin, from the thyroid) tells bones to lock calcium in and is much weaker in adults.

**Why it matters:** Required for the bone-density cross-section and the long-term skeletal trajectory. Detail deferred to `bones-and-calcium.md`.

---

## 5. The Overflow Rules

The body follows a strict priority order when fuel comes in:

```
Carbohydrates arrive →
  First: refill any depleted glycogen (liver, then muscle)
  Then: burn for immediate energy if demand exists
  Overflow: if glycogen stores are already full → convert to fat and store
  (This conversion is real but slow and inefficient — the body doesn't love it)

Protein arrives →
  First: supply amino acids for protein synthesis wherever needed
  Then: replace worn-out proteins
  Excess: liver strips nitrogen → converts carbon backbone to blood glucose (slow)
  Minimal fat storage regardless of amount (unlike carbs)

Dietary fat arrives →
  Goes directly to tissues via chylomicrons (bypasses liver initially)
  Burned for immediate energy or stored in fat cells
  In isolation does not spike insulin significantly —
    but in a mixed meal (the normal case) the carbohydrate and protein components
    do drive a insulin response, and the fat in the meal slows stomach
    emptying, broadening and prolonging that response. Pure-fat-is-insulin-neutral
    is a teaching shorthand, not a guide to mixed-meal behaviour.
```

**The practical loop:** When glycogen stores are regularly depleted by exercise, incoming carbs refill them and don't overflow to fat. When stores are already full — sedentary day, no exercise — incoming carbs have nowhere to go but fat storage. This is why exercise frequency, carb timing, and carb quantity interact: it's tank capacity, not willpower.

---

## 6. What Happens During David's Runs

**Setup:** Hilly course, ~90 minutes, moderate pace, peak heart rate ~135. Typically a pre-run apple.

---

### 0–5 minutes: Steep Start

**Fuels active:** blood glucose + Muscle glycogen simultaneously. Both are fast-access and fire immediately.

**What the apple does:** Tops up blood glucose just before demand spikes. The steep start demands immediate fuel — having adequate blood glucose prevents an early glucose dip and the sluggish feeling that follows.

**Fat status:** Not a meaningful contributor yet. Fat mobilization is beginning (fat cells are sensing the signal to release free fatty acids, muscle is beginning to warm up its fat-burning machinery) but it takes minutes to ramp up.

---

### 5–20 minutes: Glycogen Dominant

**Fuels active:** Muscle glycogen is the primary driver. blood glucose contribution continues.

**Fat status:** Mobilization is underway but fat oxidation machinery is still warming up. If Muscle glycogen was already low coming in (from poor recovery, late training the previous day, or low-carb dinner), blood glucose can dip noticeably here — this is the "laggy at 20 min" feeling.

**What's happening in the liver:** glycogen is being released to maintain blood glucose as muscles draw it down. glucagon is elevated; insulin is falling.

---

### 20–40 minutes: Blend Phase

**Fuels active:** Muscle glycogen is still the larger fraction at moderate-high intensity, but fat is now a meaningful contributor.

**Fat pathways now active:**
- intramuscular fat (already inside the muscle — fastest fat access)
- free fatty acids arriving from fat cells via blood (arriving faster now)

**Heart rate at ~135 bpm:** This is solidly in aerobic territory. Oxygen delivery is keeping up with demand, so cells can use the efficient (full combustion) path. lactate are being produced but the heart and liver are clearing them roughly as fast as they appear.

---

### 40–90 minutes: Fat Doing Real Work

**Fuels active:** Fat is now contributing substantially. Specifically:
- intramuscular fat is being burned inside the muscle cells
- free fatty acids from fat tissue are arriving continuously via blood
- Muscle glycogen is depleting — the rate depends on intensity

**Why no mid-run fuel is needed:** Muscle glycogen holds roughly 90 minutes at moderate effort. Fat is supplementing and extending this. The intramuscular fat is particularly important here — it's fast enough and local enough to allow sustained output without tapping blood glucose heavily.

**If the hilly course pushes intensity up temporarily:** Each steep section shifts the fuel mix back toward Muscle glycogen (fat combustion can't keep up with sudden intensity spikes). The descent allows some recovery but doesn't refill anything meaningful — that requires hours of rest and carbohydrates.

**At ~90 minutes:** If well-nourished at the start, glycogen stores will be substantially depleted but not empty. blood glucose will have been maintained by the liver throughout. Fat has covered a significant fraction of total energy demand.

---

### Post-Run: The Refill Window

**0–60 minutes after finishing:** Muscle cells have elevated uptake machinery active — this is when glycogen refills fastest. Eating carbohydrates in this window (even with protein to trigger insulin) refills muscle glycogen faster than waiting several hours. The size and uniqueness of this window is contested in the recent literature (some reviews argue total daily intake matters more for non-elite training, and the window is wider than the "30–60 minute" rule of thumb suggests). The phenomenon is real; the strict-window framing should be hedged. See Confidence Levels.

**Intramuscular fat:** Takes 24–48 hours to fully refill from circulating fats. No rush.

**What this means practically:** The run depletes Muscle glycogen. Post-run eating (carbs + protein) reloads it. Skipping post-run food delays the refill and means arriving at the next session partially loaded — which shows up as earlier fatigue.

---

## 7. Additional Notes

### The Brain's Special Status

The brain cannot store meaningful fuel and cannot burn fat. It is entirely dependent on continuous blood glucose delivery (or, under prolonged fasting/keto adaptation, ketones). The liver's glycogen and the glucagon/insulin control system exist partly because of this constraint. If blood glucose falls significantly (below ~50–60 mg/dL), cognitive function degrades rapidly — the brain defends its supply aggressively.

This is why blood glucose regulation is the highest-priority metabolic function. Everything else can be deprived temporarily; the brain cannot.

---

### Skipping Breakfast and Morning Runs

The liver maintains blood glucose overnight by two parallel mechanisms: breaking down its glycogen and continuously running gluconeogenesis from amino acids, glycerol, and lactate. Both contribute; gluconeogenesis is not a delayed fallback but a continuous baseline that increases its share as the polymer empties. A morning run without breakfast is typically feasible because both systems have been at work all night. The risk is not starting with low blood glucose per se — it's starting with a *depleted liver glycogen* (from a late workout the night before, or a low-carb dinner that didn't refill it). In that case the liver has less to give from the polymer; gluconeogenesis carries more of the load and blood glucose can drop during the run if the demand outruns the gluconeogenic rate.

---

### Two Fat Stores, Different Speeds

Most people think of body fat as a single thing. In practice, there are two distinct fat pools for exercise purposes:

- **Body fat (adipose):** The large reservoir. Slow to mobilize — takes minutes to start releasing free fatty acids, and those then have to travel through the blood to reach working muscle. Provides sustained contribution during long aerobic efforts.
- **Intramuscular fat (IMTG):** Already inside the cell, right next to the energy machinery. Faster to access. Particularly important in the 40–90 minute range of sustained aerobic work. Trained athletes store significantly more of it.

Endurance training develops both: better fat mobilization from body fat, and higher intramuscular fat capacity.

**The athlete's paradox.** Larger intramuscular fat correlates with *better* metabolic health in trained endurance athletes and with *worse* metabolic health (insulin resistance) in sedentary individuals. The same substance, in similar amounts, reads as a sign of fitness in one body and a sign of dysfunction in another. The difference is what the surrounding muscle is doing with it: trained muscle continuously turns it over; untrained muscle accumulates it without burning it. The simulator should not treat intramuscular fat size alone as a health proxy.

---

### Metabolic Flexibility

A metabolically flexible body can shift smoothly between burning blood glucose and free fatty acids depending on availability. This is the normal evolved state. A less flexible system (from chronically high insulin — e.g., frequent large carbohydrate meals, sedentary lifestyle) becomes more dependent on blood glucose and less efficient at switching to fat during a gap in food supply — the "must eat every 3 hours" experience.

The phenomenon itself is well documented; the *intervention claim* — that protein-first eating and regular exercise improve metabolic flexibility — is plausible mechanistic extrapolation rather than a clinical-grade settled finding. Listed in Confidence Levels.

---

### Sleep and Stress Are Metabolic Inputs

This is not metaphorical. cortisol is a hormone with direct, measurable effects on fuel flows:
- Breaks down muscle protein to produce blood glucose
- Promotes abdominal fat storage
- Suppresses protein synthesis and repair

Chronic sleep deprivation maintains elevated cortisol. This shifts the body toward fat storage and muscle loss mechanically — the same lever that exercise and nutrition are working against. Sleep deprivation also impairs insulin sensitivity (the cells respond less efficiently to the same insulin signal), which means more insulin is needed to clear the same amount of blood glucose, which means more time in fat-storage-locked mode.

---

### Carb Timing and Tank Capacity

The fundamental reason carb timing matters is tank capacity. After a run:
- Muscle glycogen stores are partially or fully depleted → incoming carbs refill them
- body fat stores are untouched → not a destination for carbs

Before a workout when Muscle glycogen stores are already full:
- Incoming carbs have nowhere to go in muscle
- Liver will fill its own store, then overflow the rest to fat

Eating carbs *around training* exploits the depleted tank. Eating the same carbs *when sedentary and fully fueled* routes them to fat. Same food, different destination — entirely determined by what's depleted at the time.

---

### Protein's Role Beyond Fuel

Protein is discussed primarily as a fuel source in most metabolic summaries. That's a distortion. The primary role of dietary protein is supply of amino acids for:
- Muscle repair and synthesis (ongoing, especially after exercise)
- Enzyme production (all chemical reactions in the body require protein-based enzymes)
- Hormone synthesis (insulin, glucagon, epinephrine, and most others are proteins)
- Immune proteins
- Transport proteins (including the carrier that moves free fatty acids in blood)
- Structural components of every cell

Protein becoming fuel is a secondary, fallback function — the body uses excess amino acids for energy, but it strongly prefers to use carbs and fats for fuel and protein for building. Dietary protein above maintenance requirements does not efficiently convert to fat (unlike excess carbs) — it mostly gets converted to blood glucose or excreted.

---

## 8. Edge Cases

The basic four-job/four-hormone story handles a normal day. The simulator's promised scenarios push past that into territory the doc above does not directly cover. This section sketches each edge case at the level the engine needs.

### Fasting beyond 24 hours

The first 12–18 hours look like a long overnight gap: liver glycogen empties, gluconeogenesis ramps, fat oxidation rises. From hour ~16 onward ketones begin to appear meaningfully. By day 2–3 they are climbing toward levels that supply a real fraction of brain energy. By day 3–5 the brain is running on roughly 60–70% ketones. Kidney gluconeogenesis becomes a meaningful contributor (perhaps 20–40% of total glucose output by week 2). Muscle protein breakdown is initially elevated (the body needs amino acids to make glucose) but is *spared* after day 2–3 as the brain shifts to ketones — protein loss plateaus rather than continues linearly. Basal metabolic rate drops roughly 10–15% by week 2 (the energy-conservation response — partly thyroid hormone falling, partly epinephrine activity dropping). The trajectory is required by intermittent-fasting and extended-fasting scenarios.

### Exercise above the lactate threshold

At low and moderate intensity, fat oxidation rises modestly with effort and crosses with carbohydrate oxidation somewhere around 60–75% of maximum aerobic capacity (the "crossover concept" — see `exercise-responses.md` for the curve). Above that crossover, free fatty acid combustion falls toward zero in the working muscle: oxygen delivery becomes the bottleneck and the cell switches to the fast (no-oxygen) path, which can only burn sugar. lactate production climbs faster than the heart and liver can clear it, so lactate accumulates. The session becomes time-limited by glycogen and acid-handling rather than by oxygen delivery. The simulator's intensity-vs-fuel-mix curve must bend, not stay linear.

### Heat stress

In hot conditions or during hard work, the skin opens (vasodilation) to dump heat by radiation, and sweat glands open to dump heat by evaporation. Sweat takes water and sodium with it. Plasma volume drops, the heart compensates by raising rate at the same workload (cardiovascular drift — heart rate climbs over time at constant pace), and at the limits sweat rate itself falls as the body runs out of water to spare. Cognition and pace both deteriorate. Required by hot-weather scenarios and the alcohol-vasodilation flush. Detail in `water-electrolytes.md` and `skin-and-temperature.md`.

### Cold stress

The skin closes (vasoconstriction) to retain heat. Shivering activates muscle as a heat producer (significant fuel cost — shivering at full output approaches moderate-exercise energy expenditure). A specialised fat tissue with extra mitochondria — brown adipose tissue — burns free fatty acids and blood glucose to produce heat without contraction. Once dismissed as something only infants had, brown adipose tissue in adults has been rehabilitated by recent imaging studies; activity is small but measurable, and adults with more of it tend to handle cold better and trend leaner. The contribution to whole-body energy expenditure is modest and contested.

### Dehydration

Plasma volume drops; heart rate climbs at the same workload; thermal regulation degrades; eventually sweating itself falls off; cognition deteriorates. A 2% body-mass loss from dehydration produces measurable performance drop. Required by the alcohol scenario, hot-day exercise, and any multi-hour endurance event. Detail in `water-electrolytes.md`.

### Acute illness

The cytokines climbs sharply. Fever raises basal metabolic rate roughly 7% per degree celsius. Appetite drops (driven by inflammatory messengers acting on the brain). Muscle protein breakdown rises — amino acids recruited for immune use, including making the proteins that fight the infection. insulin sensitivity drops temporarily. Sleep architecture shifts toward more deep sleep, where growth hormone pulses cluster. Required by the Recovery from Acute Illness scenario.

### Hypoglycaemia and counter-regulation

When blood glucose drops below roughly 70 mg/dL, the body fires a counter-regulatory cascade in roughly this order: glucagon first (within minutes), then epinephrine (also fast), then cortisol, then growth hormone (slower contributors, mostly relevant to sustained low-glucose states). Symptoms follow a corresponding hierarchy: at first the autonomic effects of epinephrine — sweat, tremor, palpitations, hunger — and below roughly 50–55 mg/dL the neuroglycopenic effects appear — confusion, slurred speech, eventually unconsciousness. Required for any scenario where blood glucose falls hard (alcohol on an empty stomach, excessive exercise without fuel, certain medications).

### Growth, development, aging

Different life stages run different versions of the same machinery. Newborns burn fuel disproportionately fast for body mass; growth phases require sustained amino acid uptake and high growth hormone tone; adolescence brings the sex-hormone surges; mid-life settles into adult stability; older adults drift toward lower thyroid hormone, lower growth hormone, lower testosterone, lower bone mass, slower repair. Detail in the `life-stages.md` stub below.

### Overtraining

Sustained training without adequate recovery accumulates cytokines and cortisol, suppresses testosterone and growth hormone, drops thyroid hormone slightly, and disrupts sleep — which compounds the hormonal effects. Performance drops, mood drops, illness frequency rises. The simulator should treat this as the chronic outcome of mismanaged training load, not a separate phenomenon. Already a flagged scenario in `exercise-responses.md`.

---

## 9. Foreign Substances — Stub

The simulator's design promises modeled effects for alcohol (a calendar event kind), nicotine and tobacco, caffeine, recreational drugs, and prescription medications. Each is a non-food substance that the body absorbs, processes, and disposes of, with acute effects on hormones and flows and chronic effects on tissue health.

The shortest defensible sketches for each, pending the dedicated note:

- **Alcohol (ethanol).** Absorbed mostly in the stomach and small intestine; processed almost exclusively by the liver via a two-step path (alcohol → acetaldehyde → acetate). The acetate enters the regular fuel-burning pathway and is burned for energy. The bottleneck is stage one. Two side effects matter: the path produces a large amount of a particular electron-carrying molecule (NADH) which the cell then has to spend, and while it does, fat oxidation is suppressed and gluconeogenesis is partially blocked (one mechanism behind alcohol-induced low blood glucose on an empty stomach). The intermediate (acetaldehyde) is itself toxic and is the main driver of the morning-after symptoms and of long-term liver damage. Clearance is roughly zero-order — the liver removes a fixed amount per hour rather than a percentage — which is why blood alcohol drops linearly rather than exponentially. Alcohol also suppresses vasopressin, producing the disproportionate urine output and dehydration. Female and male bodies clear it at different rates partly because of body-water-volume differences and partly because of gut-side first-pass enzyme differences (the latter is contested in magnitude).
- **Nicotine.** Acts on the nervous system to release epinephrine, producing a small, quick rise in heart rate, blood pressure, and blood glucose. Suppresses appetite. Half-life roughly 2 hours. The acute effects are nicotine's; most of the chronic damage from tobacco is from combustion products (tar, carbon monoxide, dozens of carcinogens), not nicotine itself. The relative contribution is one of the design's flagged unsettled-science items. Carbon monoxide displaces oxygen on haemoglobin (see Lungs entry above), reducing oxygen-carrying capacity for hours after each cigarette.
- **Caffeine.** Blocks the brain's "I'm tired" signal (adenosine), modestly raises epinephrine, mildly mobilises free fatty acids, suppresses appetite, raises heart rate slightly. Half-life roughly 5 hours; doubled in pregnancy, halved in heavy smokers. Already named as a tracked micronutrient in the food library.
- **Carbon monoxide.** Not a recreational substance but a tracked load: binds haemoglobin much more tightly than oxygen, taking carriers out of rotation for hours. Produced by smoking and (less commonly) by faulty heating equipment. Required by the smoking scenario.
- **Generic drug template.** Common shape: gut absorption → liver first-pass processing → distribution → effect site → liver and kidney clearance. The engine should support a generic foreign-substance template with absorption rate, distribution volume, clearance rate (zero-order or first-order), peak effect timing, and a vector of effects on named flows/hormones. Specific medications fill out this template.

**Full treatment lives in a forthcoming `foreign-substances.md` note** that covers each substance at the depth of the substance entries in §2, plus the chronic-effect dynamics. This stub exists so the foundational doc has the placeholders the engine and other notes need to refer to.

---

## 10. Water, Sodium, and Other Electrolytes — Stub

Water is the body's matrix substance — every flow in this document happens in it. Plasma volume sits inside blood; intracellular fluid sits inside every cell; interstitial fluid sits between them. The body controls the total amount of water and the salt-to-water ratio aggressively, because both blood pressure and cell volume are sensitive to small changes.

The substances and locations involved:

- **Water.** Tracked as a quantity in three compartments — plasma, interstitial, intracellular. Intake from food and drink; output via urine, sweat, breath, and faeces. Acute regulation by vasopressin (kidneys hold or release water).
- **Sodium.** The dominant extracellular cation. Drives water retention — water follows sodium. Lost in sweat, regulated by the kidneys under aldosterone. Tracked already as a food field in `foods-library.md`.
- **Potassium.** The dominant intracellular cation. Counter-balances sodium. Important to heart rhythm. Bananas, potatoes, dairy are major sources. Tracked already as a food field.
- **Calcium, magnesium, phosphate, chloride, bicarbonate.** Each plays a smaller but real role; calcium specifically connects to the bone-density story.

The mechanisms involved:

- **Sweat.** Water plus sodium loss. Substantial during hot weather and hard exercise. Restores the heat balance at the cost of plasma volume.
- **Urine.** The kidneys' main lever. Concentration controlled by vasopressin; sodium retention by aldosterone; total volume by both, plus filtration rate, plus diuretic substances (alcohol, caffeine modestly).
- **Respiratory loss.** Continuous water vapor in exhaled breath; small but constant.
- **Gut absorption and loss.** Most water absorbed in the small intestine; some recovered in the large intestine. Diarrhoea is a major acute fluid-loss mechanism not currently named.

**Why this stub exists:** plasma volume is load-bearing for blood pressure, sweat-driven heat dissipation, and the dehydration penalty in the alcohol scenario. The engine needs a Water compartment with intake, gut absorption, sweat, urine, and respiratory-loss flows; a sodium compartment with sweat loss and kidney handling; and the two hormones (vasopressin, aldosterone) regulating both. **Full treatment in a forthcoming `water-electrolytes.md` note.**

---

## 11. Life-Stage Parameter Shifts — Stub

The same metabolic machinery runs differently across life stages. The simulator's "From Birth" and "Aging Well" arcs require defensible values for each stage rather than a single adult set.

What changes with stage:

- **Caloric requirements per kilogram of body mass.** Highest in newborns and infants (basal needs ~50–60 kcal/kg/day), falling through childhood, settling in adolescence, then drifting slowly downward in adulthood (~25–30 kcal/kg/day in mid-life adults, less in older adults).
- **Protein demand per kilogram.** Higher in growth phases (infants and adolescents), elevated in older adults (sarcopenia-resistance demand outpaces young-adult requirements), lowest in mid-life adults.
- **Hormonal baselines.** growth hormone high through childhood and adolescence, falling steadily through adulthood. Sex hormones quiet before puberty, surge through adolescence, plateau in adulthood, fall (especially in females at menopause). thyroid hormone drifts downward with age. insulin sensitivity often falls in older adults.
- **Recovery rate constants.** Tissue repair, muscle protein synthesis response, glycogen refill, sleep depth — all faster in younger bodies.
- **Body composition baselines.** body fat fraction climbs with age at constant lifestyle; muscle mass falls; bone density peaks in the late 20s and falls thereafter, accelerating after menopause in females.
- **Pregnancy and lactation.** Out of scope per the v1 design but the parameter shifts are large (~15% higher basal metabolic rate in late pregnancy, several hundred extra kcal/day during lactation, dramatic estrogen and progesterone changes). Reserved for a later note.

**Full treatment in a forthcoming `life-stages.md` note,** which will name each life stage as a functional grouping (e.g., "Infant," "Child," "Adolescent," "Young Adult," "Mid-Life Adult," "Older Adult"), give parameter ranges for each, and characterise the slow drift between them.

---

## 12. Sex Differences — Stub

Biological sex is a first-class engine axis in the design. The science doc owes its own treatment of where the metabolic machinery diverges between bodies, beyond what the foods library and design doc carry.

The substances and mechanisms involved:

- **Body fat fraction and distribution.** Adult females carry a higher essential fraction (several percent of body mass) and tend toward subcutaneous distribution (hip, thigh); adult males trend toward visceral (around organs). The visceral pattern is more inflammatory and more strongly associated with metabolic disease.
- **Muscle protein synthesis.** testosterone-dependent baseline rates differ; female muscle responds slightly differently to the same training stimulus, with a smaller hypertrophy effect per session at matched relative load. The size of the difference is contested.
- **Alcohol clearance.** Females clear alcohol more slowly per gram per kilogram body mass. Two mechanisms: smaller body water volume (a given dose reaches a higher concentration), and lower stomach-side first-pass clearance. The water-volume mechanism is settled; the first-pass mechanism's magnitude is one of the design's flagged unsettled items.
- **Iron handling.** Menstruating females lose roughly 30–40 mg of iron per cycle. Iron requirements are correspondingly higher than in males. Endurance capacity is sensitive to iron stores (low iron drops haemoglobin, which drops oxygen-carrying capacity). Required by the endurance-capacity module and by the Sex Differences axis.
- **Bone density trajectory.** Female peak bone mass is lower; loss accelerates after menopause when estrogen drops. Required by the bone-density cross-section.
- **Cyclic modulation in females.** Within a menstrual cycle, estrogen and progesterone modulate basal body temperature, fluid balance, insulin sensitivity, fat oxidation rate during exercise, and appetite. The size of these effects is a flagged unsettled item.
- **Pregnancy.** Out of scope for v1 per design.

**Full treatment in a forthcoming `sex-differences.md` note.** The note should carry sex-specific defaults for the engine's body-composition, hormone, recovery, and clearance parameters; characterise the cyclic modulation; and align with the foods library on iron specifically.

---

## 13. Confidence Levels

Per the design doc's "Calling Out Unsettled Science" rule (design §13), this section walks the doc's claims and assigns each a defensible confidence — *settled*, *mostly-settled*, *contested*, or *speculative* — and cross-references the design's 17-item unsettled list where it overlaps. Where the science doc and design §13 currently disagree on what is contested, this doc has been edited above to match the design.

### Settled

These are the framing claims and core mechanisms; mainstream physiology accepts them. Failures here would mean the foundation is wrong, not just the numbers.

- The four short-term fuel-handling hormones (Storage, Release, Surge, Stress) and their qualitative roles.
- The structure of the four jobs (energy supply, building, signalling, waste).
- Liver as the central switching station; portal vein routes for sugar/protein vs lymphatic route for dietary fat.
- Muscle glycogen cannot directly export glucose to blood (no muscle glucose-6-phosphatase). Indirect contribution via Cori and glucose-alanine cycles.
- Brain primary fuel is blood glucose, with ketones and lactate as alternatives.
- insulin suppresses fat release at high levels; fat burning requires low insulin.
- Liver lacks the enzyme to use its own ketones; brain and heart can.
- lactate is a fuel, not a waste product.
- Carbon monoxide displaces oxygen on haemoglobin.
- phosphocreatine powers the seconds-timescale energy demand.
- Bone is continuously remodelled.
- Sex-hormone roles in body-fat distribution and bone density are well established.

### Mostly settled

Direction and qualitative shape are accepted; magnitudes carry meaningful uncertainty.

- Numerical ranges for storage capacities (glycogen stores ~80–100 g liver, ~300–500 g muscle; body fat ~10–15 kg in a lean adult). Sex-specific body fat values noted; mark for phase-3 calibration.
- intramuscular fat total mass (~200–300 g working figure). The role is settled; the number is on the high end of mainstream estimates and *flagged for phase-3 calibration*.
- Postprandial blood glucose upper bound (~140 mg/dL); fasting range (~70–100); cognitive-safety floor (~50–60). Edited above to reflect this.
- ATP whole-body turnover roughly every 60–90 seconds at rest. Standard textbook figure; flagged as approximate.
- Time course of meaningful ketone elevation (~16–24 hours for first rise; ~3–5 days for substantial brain adaptation; ~60–70% maximum brain ketone fraction).
- Overnight liver glycogen depletion (30–50% in normal eaters, 50–70%+ in extended overnight fasts).
- growth hormone roles, age decline, and sleep dependence.
- thyroid hormone effects and slow drift with age and caloric restriction.
- Lipoprotein roles (VLDL outbound, Cholesterol Carriers — Outbound and Returning). The qualitative routing is settled; the saturated-vs-unsaturated dietary fat effect on vessel walls is *contested* (design §13 item 1 — flagged in body of this doc).
- phosphocreatine refill timing (60–80% in 60 seconds, full in 3–5 minutes).
- brown adipose tissue (brown adipose) is real in adults; magnitude of contribution is *contested*.
- fructose routing through the liver and disproportionate contribution to liver fat output.

### Contested (matches design §13)

Direction of effect known; magnitude or mechanism actively disputed in the literature; engine should expose a slider and a badge.

- Fraction of carbohydrate excess that becomes fat directly versus first refilling glycogen stores (design §13 item 2). The doc's "real but slow and inefficient" framing is the simulator's defensible default; flagged.
- The post-exercise refill window's strict 30–60-minute size and uniqueness vs the wider, total-daily-intake-matters-more reframe. Doc edited above to hedge.
- Effect size of psychological stress on cortisol in healthy people under ordinary stress (design §13 item 5). Doc edited above to hedge.
- The "metabolic flexibility" intervention claim — that protein-first eating and regular exercise improve flexibility — beyond mechanistic plausibility. Doc edited above.
- The intensity of the crossover point between fat- and sugar-burning (design §13 item 11). Treatment lives in `exercise-responses.md`; doc here defers.
- The magnitude of the post-exercise oxygen consumption tail (design §13 item 12). Lives in `exercise-responses.md`.
- Exact contribution of dietary fat composition to vessel wall changes (design §13 item 1).
- Long-term metabolic effect of meal timing on insulin sensitivity (design §13 item 3).
- Role of gut bacteria byproducts in human energy balance (design §13 item 4).
- Alcohol J-curve on cardiovascular outcomes (design §13 item 6).
- Cannabis effects (design §13 item 7).
- Nicotine vs combustion-product contribution to chronic tobacco damage (design §13 item 8). Doc above flags this.
- Magnitude of menstrual-cycle metabolic effects (design §13 item 9). Sex Differences stub flags this.
- Female-vs-male alcohol clearance mechanism beyond body-water-volume (design §13 item 10). Sex Differences stub flags this.
- Optimal recovery duration between sessions (design §13 item 13).
- Whether high-intensity intermittent matches sustained moderate for cardiovascular adaptation (design §13 item 14).
- Effect of fasted training (design §13 item 15).
- Whether muscle damage is necessary for hypertrophy (design §13 item 16).
- Magnitude of leptin-resistance, mechanism of the post-weight-loss appetite rebound, and the size of the chronic ghrelin elevation that follows weight loss.
- The cortisol awakening response's *functional purpose*. Doc edited above to separate the timing (settled) from the teleology (contested).
- "Athlete's paradox" — intramuscular fat reads opposite ways in trained vs sedentary bodies — the phenomenon is settled; the mechanistic explanation is still being worked out.

### Speculative

Plausible mechanisms; weak or thin evidence; engine should mark these explicitly.

- Specific time courses for the slowest aging adaptations (decade-scale tissue changes in vessel walls, bone, muscle composition) at fine resolution.
- Quantitative inflammation-signal effects on multi-year disease trajectories. The lumped cytokines substance is itself a simplification; magnitudes of its downstream effects are speculative at engine resolution.
- Sex-difference magnitudes for a number of the smaller effects (e.g., training response per session at matched relative load).
- Long-term effect sizes for life-stage transitions (the slope of growth hormone decline through adulthood, the rate of bone-density loss after menopause at population vs individual scale).

### Numerical claims flagged for phase-3 calibration

The following are mainstream-shape but with numbers worth a primary-literature pass before the engine fits parameters:

- intramuscular fat total mass and turnover rate.
- Sex-specific body fat essential fractions and total ranges.
- ketone time course and maximum brain fraction (precise day numbers and percentages).
- Gluconeogenesis baseline rate and its response to fasting duration.
- Post-exercise glycogen-refill window magnitude.
- De novo lipogenesis rate as a fraction of carbohydrate excess.
- Alcohol clearance kinetics — zero-order rate, sex differences, first-pass mechanism magnitude.
- Cortisol effect sizes in healthy people under ordinary stress.
- brown adipose tissue contribution to whole-body energy expenditure in adults.
- Postprandial blood glucose peak distribution in healthy populations (used to set the engine's normal-range alarm bands).
