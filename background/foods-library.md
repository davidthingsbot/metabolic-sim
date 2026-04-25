# Foods Library — What the Simulator Eats and How Each Item Is Described

*Terminology note: Scientific names lead throughout — glucose, insulin, body fat, amino acids, glycogen, ATP, chylomicron, etc. The plain-language functional names that the simulator's UI shows by default (Storage Hormone, Blood Sugar, Sugar Polymer Store, etc.) live in `design/glossary.md`. Where a real-world food name has a chemical or branded counterpart, the brand or chemical name appears in parentheses on first use, then is dropped.*

---

## 1. Overview

The simulator's job is to take a meal as input and produce a believable trajectory of blood glucose, insulin, free fatty acids, amino acids, and the rest across the body's locations. To do that it needs a **Food library**: a structured table of real-world foods described in terms the engine can act on.

The library is not a nutrition app. It needs:

1. **Enough breadth** that a user can compose any normal day's eating without hitting "food not found."
2. **Enough resolution** that the engine can distinguish a banana (high simple sugar, fast blood glucose rise) from a bowl of lentils (slow starch, modest rise) — even though both hit the carbohydrate bucket on a label.
3. **Enough hooks** that the design's built-in scenarios (pre-run apple, McDonald's hamburger, glass of red wine) work out of the box.

This document covers what the v1 library contains, what fields each entry carries, where the numbers come from, and where the data is honestly soft.

---

## 2. Coverage in Version 1

The target is roughly **60 foods** — large enough to cover a normal week of eating for a Western user, small enough that each entry can be hand-checked rather than bulk-imported. The list is organised into functional categories that map onto how the engine routes nutrients.

**Grain Staples (8).** White rice (cooked), brown rice (cooked), pasta (cooked, durum wheat), white bread slice, whole-grain bread slice, oats (cooked rolled), breakfast cereal (sweetened flake, e.g., Frosted Flakes), breakfast cereal (plain, e.g., Cheerios). These dominate carbohydrate intake in most diets and span the slow-starch to fast-starch range.

**Dairy and Eggs (6).** Whole milk, skim milk, plain yogurt (full-fat), Greek yogurt (plain, full-fat), butter, whole egg (boiled). Dairy carries the only naturally occurring food sugar that isn't glucose, fructose, or sucrose — milk sugar (lactose) — and the engine needs to handle it explicitly.

**Cheese (9).** Cheddar, mozzarella (low-moisture, the pizza-and-block kind), parmesan, cream cheese, feta, cottage cheese, blue cheese (e.g., gorgonzola or roquefort, treated as one composite entry for v1), swiss / emmental, brie. Cheeses span a wide range of fat-to-protein ratio and salt content — cottage cheese is high-protein low-fat, parmesan is high-protein high-fat-and-salt, brie is moderate-protein high-fat. They are a separate category from milk-and-yogurt because users routinely substitute between them and the metabolic effect changes meaningfully.

**Common Meats (5).** Grilled chicken breast (skinless), roast chicken thigh (with skin), beef steak (lean, grilled), ground beef (80/20, pan-cooked), pork loin (grilled). The split between lean and fatty cuts matters because dietary fat routes via the chylomicron, which behaves differently from a blood glucose pulse.

**Common Fish (9).** Salmon (cooked, farmed), salmon (cooked, wild — different fat profile), tuna (canned in water), tuna (fresh, cooked), cod (baked), trout (cooked), sardines (canned in oil, drained), mackerel (cooked), shrimp / prawns (cooked), tilapia (cooked). Salmon brings high omega-3 poly-unsaturated fat (and farmed vs wild differ enough in total fat content to merit two entries). Cod and tilapia are near-pure protein with trace fat. Sardines and mackerel are oily fish with notable omega-3 plus calcium when bones are eaten. Canned tuna in water is a low-fat protein reference. Shrimp adds a high-cholesterol low-fat reference.

**Common Fruits (8).** Apple, banana, orange, grapes (table), strawberries, blueberries, watermelon, mango. Range of sugar profiles: apple is mostly fructose with notable fibre; banana shifts toward glucose and starch as it ripens; watermelon is mostly water and quick-acting sugar.

**Common Vegetables (8).** Potato (boiled), sweet potato (baked), broccoli (steamed), carrot (raw), tomato, lettuce (mixed greens), onion (cooked), green beans. Potatoes are effectively a starch staple, not a "vegetable" in the metabolic sense, and the library should reflect that.

**Legumes and Nuts (4).** Lentils (cooked), chickpeas (cooked), peanut butter, almonds. These are the simplest way to get a slow-protein, slow-carb, fibre-rich entry into a meal. The engine should treat their carbohydrate as substantially slower than grain starch.

**Fats and Oils (3).** Olive oil, butter (already covered under dairy — but appears in cooking-fat contexts too), vegetable oil (e.g., canola). One liquid mono-unsaturated reference, one solid saturated reference, one neutral poly-unsaturated reference.

**Beverages (8).** Water, black coffee (no additions), tea (black, no additions), orange juice (not from concentrate), apple juice, cola (sweetened), diet cola, beer (lager, ~5% alcohol).

**Alcohol (2 additional).** Red wine (dry, ~13% alcohol), whisky (40% alcohol, single shot). Alcohol is a fourth macronutrient from the engine's perspective — it is not protein, fat, or carbohydrate, but it carries energy and affects the liver's behaviour, so it needs explicit treatment.

**Branded and Restaurant Items (8).** McDonald's hamburger (the design's reference fast-food item, defined as a composite — see section 6), McDonald's quarter-pounder (composite), McDonald's medium fries, Big Mac (composite), Coca-Cola 330 ml can, a chocolate bar (Snickers), a glazed doughnut, frozen pepperoni pizza (composite). These exist so users can log a real-world meal as one selection — and when the meal is a composite, the simulator resolves it to component flows automatically.

**Condiments and Sweeteners (3).** Table sugar (sucrose, granulated), honey, ketchup. Useful because they show up in scenario meals as small but disproportionately fast blood glucose contributors.

That gives roughly 80 single-food entries, plus a layer of composite foods on top (hamburger and pizza variants, common cocktails, common breakfast bowls). A v1.1 expansion would add another 20–30 — common Asian and Latin staples (tofu, beans, tortillas, kimchi), more cocktails, more regional cereals, dessert and pastry composites — without any structural change.

**Composite foods are first-class.** The library carries assembled foods as proper entries: a hamburger as bun + patty + cheese + lettuce + tomato + ketchup; a margherita pizza as dough + tomato sauce + mozzarella + olive oil + basil; a Big Mac with its specific component breakdown; a margarita cocktail as tequila + triple sec + lime juice + ice. Composites are not a separate kind of thing in the library — they are entries that reference other entries by ID and quantity. They are in v1, not deferred, because users think in composites ("I had a hamburger" not "I had a 60 g bun, an 80 g patty…") and the resolution from composite to component composition is exactly what the simulator should do for them. See section 6 below.

**Water gets an entry.** Even though water is metabolically inert, the engine tracks hydration as a side channel, water content matters for stomach emptying, and a glass of water is a real input the user logs.

---

## 3. Composition Fields Each Entry Needs

Each food entry is a record. The fields below are what the engine actually consumes; anything else (cuisine tags, photos, recipe links) is presentation, not simulation.

### Identity

- **Functional name** — the simulator-side name, e.g., "Apple."
- **Common name** — the everyday name, normally identical for whole foods.
- **Source name** and **Source ID** — the exact entry string and identifier from the underlying database, kept for traceability and re-pulls.
- **Reference portion** — a default serving (e.g., "1 medium apple, 182 g"). All composition fields are stored per 100 g; the reference portion is UI convenience.

### Macronutrients (per 100 g of food)

- **Water (g).** Drives stomach-emptying rate. A 100 g of watermelon (~92 g water) leaves the stomach much faster than 100 g of cheese (~37 g water).
- **Total energy (kJ).** Metric only. The kilocalorie value can be computed for display.
- **Carbohydrate, total (g).**
  - **Glucose (g).** Already in the body's blood glucose form on absorption — fastest possible rise.
  - **Fructose (g).** Routes through the liver before becoming blood glucose. Different curve, different insulin response.
  - **Sucrose (g).** Splits in the gut into one glucose + one fructose; the engine treats it as half each on absorption.
  - **Lactose (g).** Splits into glucose + galactose; galactose is converted to glucose in the liver. Slower curve than sucrose.
  - **Starch (g).** Long glucose chains from grains, potatoes, legumes. Released as glucose during digestion at a rate that depends on the food matrix (faster for white rice and bread, slower for pasta and lentils). Stored alongside an estimated digestion-rate factor (see below).
  - **Fibre, soluble (g).** Slows gastric emptying and blood glucose rise; ferments in the large intestine into short-chain fatty acids.
  - **Fibre, insoluble (g).** Bulks stool, minimal direct metabolic effect; small contribution to short-chain fatty acid production.
- **Protein, total (g).** The engine treats dietary protein as a stream of amino acids; v1 does not distinguish individual amino acids except for one optional flag (see Micronutrients below).
- **Fat, total (g).**
  - **Saturated (g).** Solid at room temperature; routes via chylomicrons the same as other fats but is the form the body most readily stores in body fat.
  - **Mono-unsaturated (g).** The dominant fat in olive oil, avocados, most nuts.
  - **Poly-unsaturated (g).** Omega-6 plus omega-3. The split matters for inflammation and signalling but not for fuel routing in v1; tracked as one number.
  - **Trans (g).** Industrial trans fat. Mostly relevant for branded baked goods and some older fried items. Important enough to carry as a flag because of its disproportionate signalling effects, even though most modern food has very little.
- **Alcohol (g).** Treated as its own fourth macronutrient. Carries 29 kJ/g. Routes through the liver and partially blocks blood glucose production by the liver while it is being processed.

### Carbohydrate digestion rate factor

A unitless multiplier on starch-to-Blood-Sugar conversion speed in the small intestine. White bread and instant rice score around 1.0 (fast); pasta around 0.6; lentils around 0.4. This is the simulator's stand-in for the glycaemic index without copying that index directly — the engine works in flow rates, not in area-under-curve relative to a standard. Default is 1.0; the field is populated for foods where the matrix slows digestion meaningfully.

### Micronutrients worth modelling in v1

The criterion for inclusion is: **Does this nutrient meaningfully change a flow described in `metabolic-pathways.md`?**

- **Sodium (mg).** Yes — drives water retention and blood volume, affects renal handling and matters acutely in endurance contexts. Include.
- **Potassium (mg).** Yes — counter-ion to sodium. Bananas, potatoes, dairy are major sources. Include.
- **Calcium, magnesium, iron, B12, vitamin D.** Affect long-term bone, oxygen delivery, enzyme cofactor, neural, and immune dynamics — none of which are visible at a per-meal timescale. **Exclude in v1.** Iron is the most likely candidate to add when an endurance-capacity module appears.
- **Caffeine (mg).** Yes — mildly raises epinephrine, mobilises free fatty acids, suppresses appetite. Coffee, tea, cola need it. Include.

The v1 micronutrient set is therefore **Sodium, potassium, caffeine** — three fields, all relevant to flows the engine already simulates.

### Provenance and quality

- **Source.** Which database the numbers came from (FoodData Central, CoFID, manufacturer, etc.).
- **Confidence.** Low / medium / high. High for FoodData Central foundation foods with full lab analysis; medium for FoodData Central legacy values or restaurant disclosures; low for items reconstructed from recipes.
- **Last verified.** A date. The library should be re-checked at least annually.

### Familiar units

Few users measure food in grams. Each entry carries a small table of conversions from familiar units to grams or millilitres. Examples:

- Apple — `1 small ≈ 150 g`, `1 medium ≈ 182 g`, `1 large ≈ 220 g`
- Olive oil — `1 teaspoon = 4.5 g`, `1 tablespoon = 13.5 g`
- Almonds — `1 handful (~23 nuts) ≈ 28 g`, `1 cup ≈ 143 g`
- Whole milk — `1 cup (US) ≈ 244 g`, `1 large mug ≈ 350 g`
- Beer — `1 bottle (12 oz / 355 ml) = 355 g`, `1 pint (UK, 568 ml) = 568 g`
- Bread — `1 slice (medium-cut) ≈ 36 g`, `1 thick slice ≈ 50 g`
- Cheddar — `1 thin slice ≈ 17 g`, `1 cube (1 inch) ≈ 17 g`, `1 cup grated ≈ 113 g`

The UI accepts whichever unit the user prefers. The engine always works in metric, and the metric equivalent is shown alongside whatever the user typed, so no one is unclear about what they actually entered. The conversions are food-specific (a cup of nuts is not the same mass as a cup of milk) and live with the entry, not in a generic conversion table.

The library also accepts a "manufacturer serving" unit where applicable — a serving of cereal, a single-serve yogurt, a "small / medium / large" drink size from the chain that sells it. Manufacturer servings are treated as a slightly suspect unit because real-world portions rarely match them; the UI shows the metric weight beside the serving and notes when the requested serving differs from a typical real-world portion.

### Cooked vs uncooked

Where it matters, cooked and uncooked forms of the same food are separate entries. Cooking changes water content and therefore per-gram everything else: 100 g of raw chicken breast becomes roughly 75 g of grilled chicken breast (the rest is water lost to evaporation), and the cooked entry is denser in protein, denser in fat, and a bit higher in sodium per gram. The library does not silently convert between them — users pick the entry that matches what they actually ate.

Common foods carry both variants where the cooking step changes intake meaningfully: rice, pasta, meat, fish, most vegetables, beans and legumes. Foods eaten only one way (apple, milk, oil, water) need only the one entry. Cooking-method variants on top of cooked-vs-uncooked (grilled vs pan-fried chicken, baked vs fried potato) are carried as separate entries where they differ enough to matter — see section 7 for the limits of this approach.

---

## 4. Authoritative Data Sources

The numbers have to come from somewhere. The strategy is to draw from public food composition databases for whole foods and staples, and from manufacturer or restaurant disclosures for branded items.

### USDA FoodData Central (primary source for whole foods)

**What it is.** The U.S. Department of Agriculture's consolidated food composition database at `fdc.nal.usda.gov`. Free; an API key is needed for bulk programmatic access. Around 400,000 entries.

**Data types.** *Foundation Foods* — full lab analysis with provenance and uncertainty; highest quality, limited coverage. *SR Legacy* — the historic Standard Reference dataset, frozen at release 28 (2018), broad coverage but no longer updated. *Survey (FNDDS)* — what the U.S. dietary survey uses; covers prepared and mixed dishes. *Branded Foods* — manufacturer-submitted label data; huge coverage but only carries what the label requires, so no fat-class breakdown, no fibre split, no sugar breakdown beyond "total sugars."

**Pros.** Free, comprehensive, well-documented, stable JSON API.

**Cons / gotchas.** The branded-foods section is not analyst-verified. SR Legacy values for some foods are decades old. The sugar breakdown (glucose / fructose / sucrose / lactose) is only in Foundation Foods and a subset of SR Legacy; for many foods it has to be inferred from the food's biology.

**Reference URLs.** `https://fdc.nal.usda.gov/`, API guide at `https://fdc.nal.usda.gov/api-guide.html`.

### National equivalents (for cross-checking and gap-filling)

- **United Kingdom — CoFID** (McCance & Widdowson's Composition of Foods Integrated Dataset), maintained by the Office for Health Improvement and Disparities. Strong on traditional UK foods. Free spreadsheet download; no API.
- **Australia / New Zealand — AUSNUT and the Australian Food Composition Database**, Food Standards Australia New Zealand. Free, downloadable.
- **Canada — Canadian Nutrient File (CNF)**, Health Canada. Similar in shape to SR Legacy.
- **Netherlands — NEVO.** English-language interface available.
- **European multi-country — EuroFIR.** Aggregator; mostly behind a membership wall.

**Policy.** FoodData Central is canonical; CoFID and AUSNUT are used to spot-check or fill gaps where FoodData Central lacks a fibre split or sugar breakdown.

### Manufacturer and restaurant disclosures (branded and fast-food items)

For packaged branded foods (cereal, soft drink, chocolate bar) and chain restaurant items (McDonald's, Starbucks), the manufacturer's published nutrition information is the source. Most jurisdictions require disclosure of energy, protein, total fat, saturated fat, total carbohydrate, sugars, fibre, and sodium per 100 g and per serving.

**McDonald's hamburger reference.** Disclosed values across markets land in a fairly tight range: roughly 100 g item, 1,050–1,100 kJ, 12–14 g protein, 9–11 g fat (3.5–4.5 g saturated), 30–33 g carbohydrate (5–7 g sugars), 1–2 g fibre, 480–540 mg sodium. The library uses U.S. values as the primary anchor.

**Gotchas.** No fat-class breakdown beyond saturated. No sugar-type breakdown — sucrose versus corn-syrup glucose/fructose has to be estimated from the ingredients list (a bun made with high-fructose corn syrup contributes glucose and fructose roughly 50/50). Sodium is the most reliable single data point because it directly drives labelling rules. Trans fat is reported as 0 g for almost all major chain items now, but legacy fryer oil makes some regional values 0.1–0.5 g; v1 defaults to 0 g and flags rather than chase regional variation. Manufacturers sometimes restate formulations without updating the label for months.

### Re-pull strategy

The engine never fetches data live. The library is a static JSON file generated once from the sources and committed. A small script records pull date and source IDs so data can be regenerated annually — avoids runtime API failures and keeps the data reproducible.

---

## 5. Example Entries

The proposed structure, in JSON-ish form, with values populated from FoodData Central plus the breakdowns argued for in Section 3. Numbers are per 100 g of the food unless noted.

### Apple (whole fruit)

```
name:                  Apple
common_name:           Apple, raw, with skin
source:                FoodData Central — Foundation Foods, FDC ID 171688
reference_portion:     1 medium, 182 g
water_g:               85.6
energy_kJ:             218
carbohydrate_g:        13.8
  glucose_g:           2.4
  fructose_g:          5.9
  sucrose_g:           2.1
  lactose_g:           0.0
  starch_g:            0.05
fibre_soluble_g:       0.7
fibre_insoluble_g:     1.7
protein_g:             0.3
fat_total_g:           0.2
  saturated_g:         0.03
  monounsaturated_g:   0.01
  polyunsaturated_g:   0.05
  trans_g:             0.0
alcohol_g:             0.0
sodium_mg:             1
potassium_mg:          107
caffeine_mg:           0
carb_digestion_rate:   0.7   # whole-fruit matrix slows it
confidence:            high
last_verified:         2026-04
```

### White rice, cooked

```
name:                  White Rice (cooked)
common_name:           Rice, white, long-grain, regular, cooked
source:                FoodData Central — SR Legacy, FDC ID 169756
reference_portion:     1 cup, 158 g
water_g:               68.4
energy_kJ:             544
carbohydrate_g:        28.2
  glucose_g:           0.0
  fructose_g:          0.0
  sucrose_g:           0.05
  lactose_g:           0.0
  starch_g:            27.9
fibre_soluble_g:       0.1
fibre_insoluble_g:     0.3
protein_g:             2.7
fat_total_g:           0.3
  saturated_g:         0.08
  monounsaturated_g:   0.09
  polyunsaturated_g:   0.08
  trans_g:             0.0
alcohol_g:             0.0
sodium_mg:             1
potassium_mg:          35
caffeine_mg:           0
carb_digestion_rate:   1.0   # fast-digesting starch
confidence:            high
last_verified:         2026-04
```

### Grilled chicken breast (skinless)

```
name:                  Chicken Breast (grilled, skinless)
common_name:           Chicken, broiler, breast, skinless, grilled
source:                FoodData Central — SR Legacy, FDC ID 171477
reference_portion:     1 fillet, 120 g
water_g:               65.3
energy_kJ:             691
carbohydrate_g:        0.0
  glucose_g:           0.0
  fructose_g:          0.0
  sucrose_g:           0.0
  lactose_g:           0.0
  starch_g:            0.0
fibre_soluble_g:       0.0
fibre_insoluble_g:     0.0
protein_g:             31.0
fat_total_g:           3.6
  saturated_g:         1.0
  monounsaturated_g:   1.2
  polyunsaturated_g:   0.8
  trans_g:             0.02
alcohol_g:             0.0
sodium_mg:             71
potassium_mg:          343
caffeine_mg:           0
carb_digestion_rate:   n/a
confidence:            high
last_verified:         2026-04
```

### Olive oil, extra virgin

```
name:                  Olive Oil
common_name:           Oil, olive, extra virgin
source:                FoodData Central — SR Legacy, FDC ID 171413
reference_portion:     1 tablespoon, 13.5 g
water_g:               0.0
energy_kJ:             3700
carbohydrate_g:        0.0
fibre_soluble_g:       0.0
fibre_insoluble_g:     0.0
protein_g:             0.0
fat_total_g:           100.0
  saturated_g:         13.8
  monounsaturated_g:   73.0
  polyunsaturated_g:   10.5
  trans_g:             0.0
alcohol_g:             0.0
sodium_mg:             2
potassium_mg:          1
caffeine_mg:           0
confidence:            high
last_verified:         2026-04
```

### Whole milk

```
name:                  Whole Milk
common_name:           Milk, whole, 3.25% fat, with vitamin D
source:                FoodData Central — Foundation Foods, FDC ID 781084
reference_portion:     1 cup, 244 g
water_g:               88.1
energy_kJ:             255
carbohydrate_g:        4.8
  glucose_g:           0.0
  fructose_g:          0.0
  sucrose_g:           0.0
  lactose_g:           4.8
  starch_g:            0.0
fibre_soluble_g:       0.0
fibre_insoluble_g:     0.0
protein_g:             3.2
fat_total_g:           3.3
  saturated_g:         1.9
  monounsaturated_g:   0.8
  polyunsaturated_g:   0.2
  trans_g:             0.08
alcohol_g:             0.0
sodium_mg:             43
potassium_mg:          132
caffeine_mg:           0
carb_digestion_rate:   0.6   # lactose + matrix
confidence:            high
last_verified:         2026-04
```

### McDonald's hamburger

```
name:                  Hamburger (McDonald's)
common_name:           McDonald's Hamburger, U.S. menu
source:                Manufacturer disclosure — McDonald's USA nutrition page
reference_portion:     1 hamburger, ~100 g (per item, not per 100 g)
# Values BELOW are per item, not per 100 g — note the unit switch
energy_kJ:             1090
carbohydrate_g:        32
  glucose_g:           ~3   # estimated from bun + ketchup
  fructose_g:          ~3   # estimated from bun + ketchup (HFCS)
  sucrose_g:           ~0.5
  lactose_g:           0.0
  starch_g:            ~25
fibre_soluble_g:       ~0.3
fibre_insoluble_g:     ~1.5
protein_g:             13
fat_total_g:           10
  saturated_g:         4.0
  monounsaturated_g:   ~3.5   # estimated from beef profile
  polyunsaturated_g:   ~0.4
  trans_g:             0.5
alcohol_g:             0.0
sodium_mg:             510
potassium_mg:          ~210
caffeine_mg:           0
carb_digestion_rate:   1.0   # white bun, fast
confidence:            medium   # disclosed totals are firm; sub-class breakdowns are estimates
last_verified:         2026-04
```

The hamburger entry illustrates two design choices the library has to support: per-item reference quantities (because no one weighs a hamburger in 100 g units), and explicit "estimated from ingredients" tagging for sub-class breakdowns the manufacturer doesn't disclose.

---

## 6. Composite Foods and Cocktails

A composite food is a defined assembly of other library entries: a hamburger is a bun + a beef patty + cheese + lettuce + tomato + ketchup; a margherita pizza is dough + tomato sauce + mozzarella + olive oil + basil + salt; a margarita cocktail is tequila + triple sec + lime juice + ice. The simulator carries composites as first-class library entries from v1, not deferred to a later phase, because users think in composites and the resolution from a named composite to a stream of nutrient flows is exactly what the simulator should do for them.

### Structure

A composite entry has the same identity, provenance, and confidence fields as any other entry, plus an `ingredients` list that names component entries by ID and quantity. The composition fields (water, energy, macros, micros) are computed from the components rather than carried separately.

One useful exception: a composite can override a computed field when the assembled product behaves differently from the simple sum of its parts. Baked dough is not the simple sum of flour + water + yeast — the bake drives off moisture and the resulting carbohydrate-density is higher per gram than the inputs. Where this matters, the override carries the resolved values and notes which fields are overridden and why.

### Variants

Common composites ship with multiple named variants because no two hamburgers are alike: McDonald's hamburger, McDonald's quarter-pounder, Big Mac, homemade hamburger (typical), homemade hamburger (lean), restaurant hamburger (typical). Likewise pizza by style and topping (thin-crust margherita, deep-dish pepperoni, frozen-supermarket pepperoni, New York slice). Variants share component entries, differing only in component quantities and field overrides.

### User-defined composites

Users define their own composites in the meal editor by combining existing entries with quantities, naming the result, and saving it. Once saved, a user composite is just another library entry — it can be used in meals, exported with scenarios, shared via URL, and nested inside larger composites (a "Tuesday lunch" composite that contains a sandwich composite plus an apple plus a coffee).

User composites do not pollute the shipped library; they live in the user's local store (IndexedDB, with JSON export). Sharing a scenario that uses user composites bundles the composite definitions into the URL fragment alongside the scenario itself.

### Cocktails and mixed drinks

Cocktails are composites of spirits, mixers, and modifiers. The library ships common ones — gin and tonic, margarita, mojito, negroni, old-fashioned, vodka soda, Bloody Mary, espresso martini, Aperol spritz — each as a composite of component entries (gin, tonic water, lime juice, simple syrup, etc.). Custom cocktails work the same way as custom food composites. The components — base spirits, common mixers (tonic water, soda water, cola, ginger ale), common citrus juices, simple syrup, vermouth — are all in the v1 library so a user can build any reasonable cocktail without adding new entries.

### Why this is in v1

A meal-builder that requires "60 g bun + 80 g patty + 18 g cheese + 6 g lettuce + 14 g tomato + 14 g ketchup" for the user to log a hamburger is a meal-builder no one will use. The composite layer is what makes the food library workable at all, not a polish feature.

---

## 7. Unsettled and Variable Areas

Some of the numbers are honestly soft. The library should carry a confidence score on each entry, but the simulator's behaviour should also degrade gracefully when the input is fuzzy.

**Apple-to-apple variation.** A Granny Smith and a Honeycrisp differ in sugar by ~30%, and both differ from the FoodData Central "apple, raw" composite by similar amounts. Storage time also matters — starch in a freshly picked apple converts to sugar over weeks in cold storage. The single "Apple" entry is an average; cultivar variants are a v1.1 question.

**Brand-specific variation in fast food.** A McDonald's hamburger in the U.S., UK, Australia, and Japan has different bun weight, beef-to-fat ratio, and salt level. Disclosed energy varies ~10% across markets. v1 anchors on U.S. values; international expansion needs market-tagged variants.

**Missing micronutrient data for restaurant items.** Restaurant disclosures rarely include potassium and never break down fat classes beyond saturated. For the hamburger, potassium is estimated from components (beef + bun + condiments) using FoodData Central averages — order-of-magnitude correct, which is all v1 needs.

**Cooking-method effects on fat content of meats.** Grilled and pan-fried chicken breast at 100 g cooked weight differ — pan-frying adds 3–5 g of fat per 100 g, grilling renders some out. The library carries common cooking-method variants as separate entries (alongside the raw form) rather than modelling the cooking step; extra cooking oil is logged separately. Less common methods (smoking, sous-vide, deep-frying) are not in v1 and route to the closest available variant.

**Sugar breakdown when only "total sugars" is given.** For most branded foods and many SR Legacy entries, only total sugars is recorded. The library imputes a glucose / fructose / sucrose split based on the ingredients list and known biology of the food (a soft drink with high-fructose corn syrup is roughly 55% fructose / 45% glucose; a fruit-juice-sweetened item follows the source fruit's profile). These imputed values are flagged with a lower confidence.

**Fibre split when only "total fibre" is given.** FoodData Central reports total dietary fibre for most foods. The soluble / insoluble split is in a smaller subset. For foods without a measured split, the library imputes from food category (whole grains roughly 15% soluble, oats 50% soluble, fruits with skin 30% soluble, legumes 35% soluble). Imputation is a worse approximation than for sugars; the engine treats this as a soft input.

**Alcohol's metabolic profile.** The engine treats alcohol as a fourth macronutrient, but its handling in the liver is only loosely modelled in v1 — it suppresses blood glucose production and competes for processing capacity. The exact interaction with insulin and glucagon is an unsettled area in the simulator, not just in the data. The food entries themselves carry alcohol grams accurately; what to do with that input is a model question rather than a data question.

**Ripeness and ageing.** A green banana is mostly starch with a little sugar; a brown-spotted banana is mostly sugar with some starch. The library carries "banana" as a single composite (FoodData Central "ripe, raw" values). Users tracking blood-sugar response carefully would need ripeness variants — out of scope for v1.

**Coffee strength.** "Black coffee" is a wide range — drip, espresso, cold brew, French press, varying bean and dose. Caffeine per 250 ml cup runs from roughly 80 mg (drip) to 200 mg (strong French press). The v1 entry uses a 95 mg-per-250 ml drip-coffee value and notes that this is the most variable single number in the library.

---

## 8. Summary

The v1 food library is roughly 80 single-food entries spanning grains, dairy, cheese, eggs, meats, a useful range of fish, fruits, vegetables, legumes and nuts, fats, beverages, and a small set of branded items required by the design's scenarios — plus a layer of composite foods on top (hamburger and pizza variants, common cocktails, common breakfast bowls) and the user's own composites. Each entry carries water, energy in kilojoules, carbohydrate split by sugar type plus starch with a digestion-rate factor, fibre split soluble / insoluble, protein, fat split saturated / mono-unsaturated / poly-unsaturated / trans, alcohol, three micronutrients (sodium, potassium, caffeine), and a per-entry conversion table from familiar units (cups, handfuls, slices, "medium" of a thing) to metric. Cooked and uncooked forms of foods that change meaningfully with cooking are separate entries. FoodData Central is canonical; CoFID and AUSNUT cross-check; manufacturer and restaurant disclosures cover branded items. Soft spots — cultivar and ripeness variation, brand variation across markets, sub-class breakdowns missing from labels, cooking-method effects — are tracked per-entry through a confidence flag, and the engine treats low-confidence sub-fields as soft inputs.
