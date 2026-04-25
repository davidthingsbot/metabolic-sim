# Glossary

The canonical mapping for every named entity in the simulator. Three labels per entity:

- **Variable** — the camelCase identifier used in source code. Matches or derives from the scientific name. Stable; used in code, JSON keys, scenario files, and shared URLs.
- **Scientific** — the standard scientific or anatomical term. Primary in *Technical* label mode. Used in background research notes (with the plain-language label in parens on first use, then dropped).
- **Plain** — the user-friendly functional name. Primary in *Plain* label mode (the default UI mode). The names that appear on gauges, charts, and tooltips for non-specialist users.

A fourth column, *Kids*, holds the simplified names used in the post-v1 Kids view; entries are sparse for now and filled out when the Kids view is built.

The simulator's dictionary file (`app/src/naming/`) is generated from this glossary. Hover always reveals the alternate label — whatever is shown primary, the other appears on hover.

**Naming rules for new entries:**

- Variable name: camelCase, no spaces, no punctuation (underscores acceptable but discouraged), no leading digit. Acronyms in lower-case (`atp`, `ldl`, `glp1`, `igf1`, `copd`).
- Scientific name: the term used in mainstream physiology / medical literature. Where multiple spellings exist (estrogen / oestrogen, epinephrine / adrenaline, anemia / anaemia), use the spelling listed below — these are the dictionary's chosen canonical forms.
- Plain name: descriptive of character or function; avoid route-based names (no "outbound" / "returning" / "delivered to liver"). Short.

---

## Sugars and carbohydrates

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `glucose` | glucose | Blood Sugar | Sugar | Tracked at multiple locations; "Blood Sugar" specifically refers to glucose in plasma |
| `fructose` | fructose | Fruit Sugar | — | Liver-first processing; no insulin response |
| `sucrose` | sucrose | Table Sugar | — | Splits to glucose + fructose at digestion |
| `lactose` | lactose | Milk Sugar | — | Splits to glucose + galactose; lactase-dependent |
| `galactose` | galactose | — | — | Liver-converted to glucose; rarely user-facing |
| `starch` | starch | Starch | — | Long glucose chains; digestion-rate-factor applies |
| `dietaryFiberSoluble` | soluble fibre | Soluble Fibre | — | Slows gastric emptying; ferments to short-chain fatty acids |
| `dietaryFiberInsoluble` | insoluble fibre | Insoluble Fibre | — | Bulks stool; minor short-chain fatty acid contribution |
| `liverGlycogen` | liver glycogen | Liver Sugar Reserve | Liver Sugar Stash | Replaces "Sugar Polymer Store — Liver Version" |
| `muscleGlycogen` | muscle glycogen | Muscle Sugar Reserve | Muscle Sugar Stash | Replaces "Sugar Polymer Store — Muscle Version"; locked to the muscle that stored it |

## Fats and lipids

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `adiposeTriglyceride` | adipose triglyceride | Body Fat | — | The long-term reservoir |
| `intramuscularTriglyceride` | intramuscular triglyceride | Muscle Fat | — | Local fat reserve in muscle cells; abbreviated IMTG in literature |
| `subcutaneousAdipose` | subcutaneous adipose tissue | Subcutaneous Fat | — | Tissue location, not a substance — distinct depot from visceral |
| `visceralAdipose` | visceral adipose tissue | Visceral Fat | — | Around organs; metabolically distinct from subcutaneous |
| `brownAdiposeTissue` | brown adipose tissue | Heat-Generating Fat | — | Thermogenic fat tissue; small contributor in adults |
| `freeFattyAcid` | free fatty acid | Blood Fat | — | Replaces "Fat Transport Molecule"; abbreviated FFA in literature |
| `chylomicron` | chylomicron | Gut-Made Fat Packet | — | Replaces "Dietary Fat Transport Packet" |
| `vldl` | very-low-density lipoprotein | Liver-Made Fat Packet | — | Replaces "Liver Fat Transport Packet" |
| `ldl` | low-density lipoprotein | Cholesterol Carrier — Loaded | — | Carries cholesterol from liver to tissues |
| `hdl` | high-density lipoprotein | Cholesterol Carrier — Scavenging | — | Returns cholesterol from tissues to liver |
| `cholesterol` | cholesterol | Cholesterol | — | Plain word kept; it's already common |
| `saturatedFat` | saturated fat | Saturated Fat | — | Dietary class |
| `monounsaturatedFat` | mono-unsaturated fat | Mono-unsaturated Fat | — | Dietary class |
| `polyunsaturatedFat` | poly-unsaturated fat | Poly-unsaturated Fat | — | Dietary class |
| `transFat` | trans fat | Trans Fat | — | Dietary class; mostly historical |
| `ketones` | ketones | Compact Fuel | — | Lump of β-hydroxybutyrate, acetoacetate, acetone |

## Proteins and nitrogen handling

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `aminoAcids` | amino acids | Building Blocks | — | Lump; v1 does not distinguish individual aminos |
| `dietaryProtein` | dietary protein | Dietary Protein | — | Pre-digestion food field |
| `urea` | urea | Urea | — | Plain word kept |
| `ammonia` | ammonia | Raw Nitrogen Intermediate | — | Liver-converted to urea |

## Energy currencies (cell-internal)

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `atp` | ATP (adenosine triphosphate) | Cellular Energy Token | Energy Sparkle | The universal currency |
| `phosphocreatine` | phosphocreatine | Sprint Fuel | — | Replaces "Phosphocreatine Buffer"; seconds-timescale ATP buffer |
| `lactate` | lactate | Lactate | — | Fuel intermediate, not waste |

## Hormones

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `insulin` | insulin | Storage Hormone | Put-It-Away Signal | |
| `glucagon` | glucagon | Release Hormone | Bring-It-Out Signal | |
| `epinephrine` | epinephrine | Surge Hormone | — | Also called adrenaline; epinephrine is the canonical scientific spelling |
| `cortisol` | cortisol | Stress Hormone | — | |
| `growthHormone` | growth hormone | Building Hormone | — | Abbreviated GH in literature |
| `thyroidHormone` | thyroid hormone | Metabolic Rate Hormone | — | Aggregate of T3 and T4 |
| `testosterone` | testosterone | Testosterone | — | Plain word kept; "Drive Hormone" was tentative |
| `estrogen` | estrogen | Estrogen | — | Plain word kept; "Cycle Hormone" was tentative; canonical spelling estrogen (vs oestrogen) |
| `progesterone` | progesterone | Progesterone | — | Plain word kept; "Cycle-Phase Hormone" was tentative |
| `leptin` | leptin | Satiety Hormone | — | |
| `ghrelin` | ghrelin | Hunger Hormone | — | |
| `glp1` | GLP-1 (glucagon-like peptide 1) | Gut Satiety Hormone | — | |
| `vasopressin` | vasopressin | Water Hormone | — | Also called ADH |
| `aldosterone` | aldosterone | Salt-Retaining Hormone | — | |
| `parathyroidHormone` | parathyroid hormone | Calcium-Mobilising Hormone | — | |
| `igf1` | IGF-1 (insulin-like growth factor 1) | Growth Messenger | — | Liver downstream of growth hormone |
| `erythropoietin` | erythropoietin | Red-Cell Hormone | — | Kidney-produced |
| `calcitriol` | calcitriol (active vitamin D) | Sun Vitamin | — | Active form of vitamin D |

## Other signals and small molecules

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `cytokines` | cytokines | Inflammation Signal | — | Lump; not individual species in v1 |
| `adenosine` | adenosine | Tired Signal | — | Caffeine acts here |
| `bile` | bile | Bile | — | Plain word kept |
| `oxygen` | oxygen | Oxygen | — | |
| `carbonDioxide` | carbon dioxide | Carbon Dioxide | — | |
| `water` | water | Water | — | |

## Electrolytes

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `sodium` | sodium | Sodium | — | Plain word kept; tentative "Salt-Maker" was awkward |
| `potassium` | potassium | Potassium | — | Plain word kept |
| `calcium` | calcium | Calcium | — | |
| `magnesium` | magnesium | Magnesium | — | |
| `chloride` | chloride | Chloride | — | |

## Foreign substances

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `ethanol` | ethanol | Alcohol | — | "Blood Alcohol" = ethanol in bloodstream |
| `nicotine` | nicotine | Nicotine | — | |
| `caffeine` | caffeine | Caffeine | — | |
| `carbonMonoxide` | carbon monoxide | Carbon Monoxide | — | From smoking; displaces oxygen on hemoglobin |
| `thc` | THC (tetrahydrocannabinol) | THC | — | Cannabis primary active compound |

## Organs and locations

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `heart` | heart | Heart | — | |
| `liver` | liver | Liver | — | |
| `pancreas` | pancreas | Pancreas | — | |
| `adrenalGlands` | adrenal glands | Adrenal Glands | — | |
| `thyroidGland` | thyroid gland | Thyroid | — | |
| `kidneys` | kidneys | Kidneys | — | |
| `lungs` | lungs | Lungs | — | |
| `brain` | brain | Brain | — | |
| `stomach` | stomach | Stomach | — | |
| `smallIntestine` | small intestine | Small Intestine | — | |
| `largeIntestine` | large intestine | Large Intestine | — | |
| `skeletalMuscle` | skeletal muscle | Skeletal Muscle | — | Subdivided by muscle group in engine: legs, core, arms, back |
| `lymphaticSystem` | lymphatic system | Lymphatic System | — | |
| `bones` | bones | Bones | — | |
| `boneMarrow` | bone marrow | Bone Marrow | — | |
| `skin` | skin | Skin | — | |
| `reproductiveOrgans` | reproductive organs | Reproductive Organs | — | |
| `bloodstream` | bloodstream / circulation | Blood | — | The transport medium, not an organ |

## Chronic conditions

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `type1Diabetes` | type 1 diabetes mellitus | Type 1 Diabetes | — | Autoimmune; insulin-dependent |
| `type2Diabetes` | type 2 diabetes mellitus | Type 2 Diabetes | — | Insulin resistance ± insufficiency |
| `hypertension` | hypertension | High Blood Pressure | — | |
| `atherosclerosis` | atherosclerosis | Hardened Arteries | — | |
| `copd` | chronic obstructive pulmonary disease | COPD | — | Plain matches scientific abbreviation |
| `asthma` | asthma | Asthma | — | |
| `hypothyroidism` | hypothyroidism | Underactive Thyroid | — | |
| `hyperthyroidism` | hyperthyroidism | Overactive Thyroid | — | |
| `fattyLiver` | hepatic steatosis | Fatty Liver | — | |
| `anemia` | anemia | Anemia | — | Canonical spelling anemia (vs anaemia) |

## Acute conditions

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `pneumonia` | pneumonia | Pneumonia | — | |
| `gastroenteritis` | gastroenteritis | Stomach Bug | — | |
| `influenza` | influenza | Flu | — | |
| `commonCold` | common cold | Cold | — | |
| `acuteInjury` | acute injury | Injury | — | Generic; subtype on the event |

## Trainable state markers (engine `Tissue` table)

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `mitochondrialDensity` | mitochondrial density | Mitochondrial Density | — | Cellular power-plant count |
| `heartStrokeVolume` | heart stroke volume | Heart Stroke Volume | — | Volume per beat |
| `capillaryDensity` | capillary density | Capillary Density | — | |
| `muscleFatCapacity` | intramuscular triglyceride capacity | Muscle Fat Capacity | — | Storage ceiling for `intramuscularTriglyceride` |
| `glycogenCapacity` | glycogen storage capacity | Sugar Reserve Capacity | — | Per location (liver vs muscle group) |
| `oxygenCeiling` | maximal oxygen uptake | Oxygen Ceiling | — | Often called VO2max |
| `vascularHealth` | vascular health | Vessel Health | — | Composite: elasticity, lumen, wall integrity |
| `metabolicFlexibility` | metabolic flexibility | Metabolic Flexibility | — | Substrate-switching capability |

## Body composition / state markers

| Variable | Scientific | Plain | Kids | Notes |
|---|---|---|---|---|
| `bodyMass` | body mass | Body Mass | — | Total kilograms |
| `bodyFatPercent` | body fat percentage | Body Fat % | — | |
| `leanBodyMass` | lean body mass | Lean Body Mass | — | |
| `muscleMass` | skeletal muscle mass | Muscle Mass | — | |
| `boneMineralDensity` | bone mineral density | Bone Density | — | |
| `liverFatPercent` | hepatic fat percentage | Liver Fat % | — | |
| `bloodPressure` | blood pressure | Blood Pressure | — | Tracked as systolic / diastolic pair |
| `restingHeartRate` | resting heart rate | Resting Heart Rate | — | |
| `plasmaVolume` | plasma volume | Blood Plasma Volume | — | |
| `bodyTemperature` | core body temperature | Body Temperature | — | |
| `hydrationLevel` | total body water | Hydration | — | |

## Macronutrient totals (food-level fields)

These are food-entry composition fields, not engine substances. Listed for completeness.

| Variable | Scientific | Plain | Notes |
|---|---|---|---|
| `totalEnergy` | total food energy | Energy | kilojoules; kilocalories on display toggle |
| `totalCarbohydrate` | total carbohydrate | Total Carbohydrate | sum of sugars + starch + fibre |
| `totalProtein` | total protein | Protein | |
| `totalFat` | total fat | Total Fat | sum of saturated + mono + poly + trans |
| `totalFibre` | total dietary fibre | Total Fibre | sum of soluble + insoluble |
| `totalAlcohol` | total alcohol | Alcohol | grams of ethanol per food entry |
| `digestionRateFactor` | starch digestion rate factor | Digestion Rate Factor | unitless; engine multiplier on starch→glucose conversion |

---

## Notes on choices made

- **Acronyms as variable names** (`atp`, `ldl`, `hdl`, `vldl`, `glp1`, `igf1`, `copd`, `thc`) — these are the universal scientific identifiers; expanding them in code obscures rather than clarifies.
- **British vs American spelling** — chosen the form that dominates current scientific literature: *epinephrine* (over adrenaline), *estrogen* (over oestrogen), *anemia* (over anaemia). Background notes already mostly use the chosen form.
- **Plain words kept as Plain** — *Cholesterol*, *Testosterone*, *Estrogen*, *Progesterone*, *Sodium*, *Potassium*, *Bile*, *Caffeine*, *Nicotine*, etc. The plain-language rule does not require coining a name when the scientific term is already plain English.
- **Defaulted to scientific spelling for the Plain column** when the proposed functional name was awkward (*Drive Hormone* → *Testosterone*, *Salt-Maker* → *Sodium*, *Cell-Cation* → *Potassium*). The functional alternatives can be reinstated later by editing this file.
- **Glycogen Reserve names** — switched *Sugar Polymer Store — Liver Version / Muscle Version* to *Liver Sugar Reserve / Muscle Sugar Reserve*. Shorter, clearer, parallel.
- **Kids column** — sparse on purpose. Filled in when the Kids view is built.

## What this glossary does not yet cover

- Specific food entries (apples, salmon, etc.) — they live in the food library, not the dictionary. Each food's display name comes from its entry.
- Specific medications — they live in the medications library and inherit the same three-label structure when added.
- Per-muscle-group identifiers (legs, core, arms, back) — pending engine layout decisions in Phase 1.
- Visual style names, label modes, view names — UI labels rather than entity labels; live in their own small dictionary.
