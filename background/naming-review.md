# Naming Review — A Refined Functional Dictionary

> **Historical document.** This review was written before the naming architecture flipped to scientific-names-as-canonical (see `design/glossary.md` for the current canonical mapping). The proposals below were partly adopted as *Plain* mode labels in the glossary; some were superseded when the user opted for plain words (e.g. testosterone, sodium) over functional coinages. Kept as a record of the discussion that led to the current dictionary.

*A working review of the functional names used across `background/` and `design/`, written against the user's principles: names describe character, function, or location — not route; plain language; distinct things get distinct names; commonly-understood plain words can stay as they are; reuse what already works.*

---

## 1. Verdict

The dictionary is in good shape overall. The clear majority of names — easily 80%+ — describe function or character cleanly and survive the user's principles intact. *Blood Sugar, Storage Hormone, Release Hormone, Surge Hormone, Stress Hormone, Building Hormone, Building Blocks, Cellular Energy Token, Body Fat Store, Muscle Fat Pocket, Lactic Acid Molecule, Sugar Polymer Store — Liver/Muscle Version, Compact Fuel Molecules, Inflammation Signal, Heat-Generating Fat, Satiety Hormone, Hunger Hormone, Gut Satiety Hormone, Water Hormone, Salt-Retaining Hormone, Calcium-Mobilising Hormone, Metabolic Rate Hormone* — these all do their jobs and should stay.

The names that need attention cluster on two axes the user has flagged:

1. **Route-based names** that describe where a substance travels rather than what it is. Five names are affected: *Liver-Routed Sugar*, *Liver Fat Transport Packet*, *Dietary Fat Transport Packet*, *Cholesterol Carrier — Outbound*, *Cholesterol Carrier — Returning*. All five sit in the lipid/sugar pipeline and they are the heaviest concentration of route-language in the dictionary.
2. **Technical residue** in *Phosphocreatine Buffer*, where the plain-language rule has been applied to half the name (*Buffer*) but not the other (*Phosphocreatine*).

A smaller set of names is *tentative* rather than wrong — the sex-hormone names in particular — and the user has correctly flagged them for revisit when the underlying note lands. They are not in the "change now" list.

That gives roughly: 80% solid, 12% needing change (six names), 8% tentative pending more research (the sex hormones, plus a couple of stub-doc placeholders).

---

## 2. Names to change — with proposed replacements

### 2.1 Liver-Routed Sugar (fructose) → **Fruit Sugar**

**Problem:** Route-based. The name foregrounds *where* fructose goes (the liver) rather than *what* it is. The user explicitly called this out and named it as the headline example.

**Proposed name:** **Fruit Sugar (fructose)**.

**Justification:** *Fruit Sugar* is what most non-specialists already call it; it is the most commonly understood plain English handle for fructose; and it captures the substance's natural origin. It is character-based (the sugar associated with fruit and table-sugar's sweet half), not route-based.

The user offered three candidates — *Simple Sugar*, *Fruit Sugar*, *Fructose* itself — and the right answer turns on the disambiguation problem the user flagged: glucose is also a simple sugar. *Simple Sugar* therefore fails the "distinct things need distinct names" test. *Fructose* is a serviceable plain word, but the dictionary has already committed to *Blood Sugar* for glucose rather than *Glucose*; using *Fructose* alone for fructose breaks parallel structure. *Fruit Sugar* keeps both halves of the pair plain-language and parallel.

A small cost: high-fructose corn syrup is not from fruit. The user's existing entry already handles this (the body's pathway is the same regardless of source), and the parenthetical *(fructose)* on first use anchors the chemical identity for anyone who needs it.

**Alternatives considered:** *Slow Sugar* (misleading — it is not slow once at the liver, just routed differently); *Liver Sugar* (still route-based and confusable with the Liver Sugar Polymer Store); *Sweetener Sugar* (awkward).

**Recommend:** *Fruit Sugar*.

### 2.2 Cholesterol Carrier — Outbound (LDL) → **Cholesterol Carrier (loaded)**

**Problem:** "Outbound" is route-language — describes which direction it is going relative to the liver.

**Proposed name:** **Cholesterol Carrier (loaded)** — sometimes shortened to **Loaded Cholesterol Carrier** in running prose.

**Justification:** The distinguishing property is that this carrier is full of cholesterol it is delivering to tissues; the partner (HDL) is the one that picks cholesterol up and brings it home. *Loaded* describes the carrier's state (full of its delivery cargo), which is property-based, not route-based. It also sets up a clean visual pair with the partner: *loaded* vs *scavenging*.

**Alternatives considered:** *Delivery Cholesterol Carrier* (slightly route-flavoured — "delivery" implies a destination); *Cargo Cholesterol Carrier* (close, but a *Cargo Carrier* sounds like it could equally mean either direction); *Cholesterol Delivery Particle* (cleaner but loses the parallel with Returning's replacement).

The design doc Section 3 already shows *Cholesterol Carrier (loaded)* in its example list of dictionary edits, which is a strong nudge.

### 2.3 Cholesterol Carrier — Returning (HDL) → **Cholesterol Carrier (scavenging)**

**Problem:** "Returning" is route-language — describes the carrier coming back to the liver.

**Proposed name:** **Cholesterol Carrier (scavenging)** — or **Scavenging Cholesterol Carrier** in running prose.

**Justification:** The distinguishing property is that this carrier is *picking up* cholesterol from peripheral tissues and from vessel walls. *Scavenging* is the textbook descriptor for this behaviour, it is plain enough, and it captures the protective character (the vessel-wall pickup is what makes HDL "the good cholesterol"). The pair *loaded* / *scavenging* describes character cleanly: one is full of delivery cargo, the other is roving and collecting.

**Alternatives considered:** *Empty Cholesterol Carrier* (fails — the carrier is not empty, it is collecting); *Pickup Cholesterol Carrier* (close but reads as a vehicle); *Cholesterol Recycler* (good plain word but loses the "Carrier" link to its sibling).

### 2.4 Liver Fat Transport Packet (VLDL) → **Liver-Made Fat Packet**

**Problem:** "Liver" here is the *origin* — arguably location, not route. But the original phrasing pairs with *Dietary Fat Transport Packet* (which is route-flavoured) and the whole pair reads as a routing diagram. The user did not flag this directly but applied the same principle.

**Proposed name:** **Liver-Made Fat Packet (very-low-density lipoprotein, VLDL)**.

**Justification:** Origin is character — what made this packet is a real, durable property of the particle, not a description of where it is going. *Liver-Made* says the same thing more naturally than *Liver* alone and pairs cleanly with *Gut-Made* (below). Drops *Transport* because every Fat Packet transports something — the word adds no information.

**Alternatives considered:** *Liver Fat Packet* (fine but less explicit about origin); *Outbound Liver Fat Packet* (route-based, fails); *Liver Export Packet* (route-based again).

### 2.5 Dietary Fat Transport Packet (chylomicron) → **Gut-Made Fat Packet**

**Problem:** "Dietary" describes a route (the fat came in through the diet). The user did not call this out specifically but the same principle applies — and the parallel rebuild with *Liver-Made Fat Packet* is much cleaner than leaving one origin-named and one route-named.

**Proposed name:** **Gut-Made Fat Packet (chylomicron)**.

**Justification:** Built in the cells of the small intestine after a fat-containing meal — a true origin/character property of the packet. Pairs symmetrically with *Liver-Made Fat Packet*. The user's "Body Fat / Muscle Fat / Blood Fat" location-based framing extends naturally: gut-made vs liver-made are the two production sites for these large packets.

**Alternatives considered:** *Meal Fat Packet* (close — "meal" is character not route — but slightly imprecise since the packet is built downstream of the meal, not by it); *Fresh Fat Packet* (cute but vague); keeping *Dietary* (still route-flavoured).

### 2.6 Phosphocreatine Buffer → **Sprint Fuel**

**Problem:** *Phosphocreatine* is a chemical name, not a plain-language one. The compound word *Phosphocreatine Buffer* applies the plain-language rule to half the name only — the user's "Phosphocreatine? What?" reaction is exactly the test failing.

**Proposed name:** **Sprint Fuel (creatine phosphate)**.

**Justification:** The defining functional property is "the energy reserve that powers the first eight to fifteen seconds of all-out effort." *Sprint Fuel* says that. It is character-based (the kind of work it powers), not technical, not Latin, not an acronym. It also reads cleanly in context ("Sprint Fuel is dumped in the first eight seconds of a heavy lift," "Between sets, Sprint Fuel refills 60–80% in a minute"). The design doc already gestured at this name in Section 3's example list.

**Alternatives considered:** *Instant Energy Reserve* (accurate but bulky and not as evocative); *Burst Buffer* (good but "buffer" is jargonish in plain English); *Spark Reserve* (poetic but vague — does not say what kind of work). *Sprint Fuel* is the most legible, and "sprint" generalises naturally to "any explosive first-second-or-two of effort" without needing the user to know that lifts and jumps are also "sprints" in the metabolic sense.

**Recommend:** *Sprint Fuel*.

### 2.7 Fat Transport Molecule (free fatty acid, FFA) → **Blood Fat**

**Problem:** Not strictly route-based, but the user has explicitly suggested location-based naming for fat substances and offered *Blood Fat* for this one. *Fat Transport Molecule* describes the role (it is in transit) more than it describes where it lives, and it overloads the word *Transport* that the Fat Packets also use.

**Proposed name:** **Blood Fat (free fatty acid, FFA)**.

**Justification:** Aligns with the user's location-based fat-naming axis: *Body Fat* (in fat tissue), *Muscle Fat* (in muscle cells), *Blood Fat* (in the bloodstream). Three fats, three locations. Plain, parallel, immediately legible. Frees *Transport* to do work in *Liver-Made Fat Packet* and *Gut-Made Fat Packet* without ambiguity.

**Alternatives considered:** *Free Fat Molecule* (close — "free" matches the chemistry — but less plainly location-anchored); *Travelling Fat* (fine but route-flavoured); keeping *Fat Transport Molecule* (functional but loses the location-axis parallelism the user wants).

### 2.8 Smaller follow-on simplifications (location-based fat axis)

The user's location-based axis suggests two more small changes that drop redundant words. These are not corrections — they are simplifications that keep the names parallel and short:

- **Body Fat Store** → **Body Fat**. The word *Store* is implicit in the location — "body fat" in plain English already means the long-term reservoir. Aligns with *Body Fat* / *Muscle Fat* / *Blood Fat*.
- **Muscle Fat Pocket** → **Muscle Fat**. Same logic — *Pocket* is mildly cute but adds no information once the location-based naming pattern is in place.

Both are optional. If the user prefers the slightly more vivid *Body Fat Store* and *Muscle Fat Pocket* (they are evocative and currently familiar), keeping them is fine — they are not breaking any principle. But the cleaner parallel is the simpler form.

**Recommend:** Make the change. *Body Fat / Muscle Fat / Blood Fat / Heat-Generating Fat* is a clean four-name location/character axis that reads itself.

---

## 3. Names to keep as-is

These names are working — character-based, plain, and where they reuse common words those words are widely understood.

**Sugar/fuel currencies:**
- Blood Sugar (glucose)
- Sugar Polymer Store — Liver Version (liver glycogen)
- Sugar Polymer Store — Muscle Version (muscle glycogen)
- Compact Fuel Molecules (ketones)
- Cellular Energy Token (ATP)
- Lactic Acid Molecule (lactate)

**Building/waste:**
- Building Blocks (amino acids)
- Urea — already a plain enough word in everyday English; keep
- Raw Nitrogen Intermediate (ammonia) — character-based, fine
- Inflammation Signal (lumped cytokine pool)

**Hormones — short-term:**
- Storage Hormone (insulin)
- Release Hormone (glucagon)
- Surge Hormone (adrenaline)
- Stress Hormone (cortisol)

**Hormones — slower / appetite / fluid / minerals:**
- Building Hormone (growth hormone)
- Metabolic Rate Hormone (thyroid hormone)
- Satiety Hormone (leptin)
- Hunger Hormone (ghrelin)
- Gut Satiety Hormone (GLP-1)
- Water Hormone (vasopressin)
- Salt-Retaining Hormone (aldosterone)
- Calcium-Mobilising Hormone (parathyroid hormone)

**Fat (after the location-axis cleanup in §2.8):**
- Body Fat (was Body Fat Store)
- Muscle Fat (was Muscle Fat Pocket)
- Heat-Generating Fat (brown adipose) — character-based and fine as-is

**Already-plain words kept as-is:**
- Cholesterol — keep, the public knows the word
- Glucose / Fructose — visible only as parentheticals on first use; the *primary labels* are Blood Sugar and Fruit Sugar respectively
- Caffeine, Alcohol, Nicotine — keep; common words
- Carbon Monoxide — keep; specific and known

---

## 4. Names to revisit when more research lands

These are tentative because the underlying topic is not fully researched. They should not be reworked now — just flagged so the user knows to revisit when the relevant note arrives.

- **Drive Hormone (testosterone), Cycle Hormone (oestrogen), Cycle-Phase Hormone (progesterone).** The user has flagged these as "a little odd," and the metabolic pathways doc itself notes "some of these names are tentative." The *Cycle / Cycle-Phase* pair in particular reads strangely without context, and *Drive* leans interpretively rather than describing a clear function. The right time to fix these is when `sex-differences.md` is written — the note will surface what each hormone *does* metabolically (rather than what it does reproductively), and the names should follow from that. Defer.
- **Salt-Maker (sodium), Cell-Cation (potassium).** Introduced in the §10 stub of `metabolic-pathways.md`. *Salt-Maker* is OK but slightly odd — sodium does not "make" salt, it *is* half of salt. *Cell-Cation* is technical-jargonish (*cation* is not a plain word). Both should be reworked in `water-electrolytes.md` when it lands. Likely candidates: **Blood Salt** (sodium — the dominant outside-cell electrolyte) and **Cell Salt** (potassium — the dominant inside-cell electrolyte), but defer until the dedicated note settles the dynamics.
- **Cycle-Phase Hormone** specifically: *progesterone*'s primary metabolic effect that the engine needs is "raises basal body temperature, raises ventilation, modestly raises Storage Hormone resistance." A name like *Warming Hormone* or *Second-Half Hormone* might fit better, but again this should land with the sex-differences note, not now.

---

## 5. New name candidates for things not yet named

A pass through the science doc surfaced a few referenced things that lack a clean functional name yet. These are *proposals* for the dictionary; the user can accept or defer.

- **Vitamin D (active form)** — `metabolic-pathways.md` mentions this in the Skin entry and the Kidney entry without a functional name. Candidate: **Sun Vitamin (active vitamin D)** — character-based, references the skin/sunlight production route in plain language. Lower priority — only matters once vitamins are tracked.
- **Erythropoietin (kidney's red-cell-output hormone)** — already described in plain language wherever it appears, but not given a functional name. Candidate: **Red-Cell Hormone (erythropoietin)** — character-based and short.
- **Insulin-like growth factor (IGF-1)** — referenced in the Building Hormone entry as "the downstream messenger the liver produces in response." Candidate: **Growth Messenger (IGF-1)** — keeps the linkage to *Building Hormone* clear.
- **Bile** — `metabolic-pathways.md` uses "bile" plainly. Candidate: keep as **Bile (bile)** — it is already a common English word (like Cholesterol, Glucose) and does not need a functional rename.
- **Adenosine (brain "I'm tired" signal)** — referenced in the caffeine entry of §9. Candidate: **Tired Signal (adenosine)** — character-based, ties to the caffeine action.

None of these are urgent. They become urgent when the relevant note (vitamins, kidney, brain, etc.) is written.

---

## 6. Recommended migration path

Per design Section 3, names are decoupled from source code — the dictionary is a single file that the engine reads at render time. Changing a name is a dictionary edit, not a refactor. That said, names appear in *prose* across the background and design docs, and updating the prose is a real chore that the user does manually. Order the changes by impact-vs-clarity-gain.

**Wave 1 — high clarity gain, contained blast radius (do these first):**

1. **Liver-Routed Sugar → Fruit Sugar.** Highest clarity gain (the user's headline example). Appears in: `metabolic-pathways.md` §2 (own entry), §11 stub references, Confidence Levels; `foods-library.md` (in the Composition Fields discussion of fructose); a few mentions in `metabolic-pathways-review.md`. ~6–8 occurrences.
2. **Phosphocreatine Buffer → Sprint Fuel.** High clarity gain (the user's other named example). Appears in: `metabolic-pathways.md` §2, Confidence Levels; `exercise-responses.md` §2 (interval, strength, mixed) and §6 (recovery state machine). ~8–10 occurrences. Note: the phrase "phosphocreatine" alone (lowercase, mid-sentence) appears separately in `exercise-responses.md` and should be standardised at the same time.

**Wave 2 — paired changes that should land together:**

3. **Cholesterol Carrier — Outbound → Cholesterol Carrier (loaded).**
4. **Cholesterol Carrier — Returning → Cholesterol Carrier (scavenging).**

Do these as a pair to keep the symmetry visible. Appears in: `metabolic-pathways.md` §2 (the two own entries plus the lipid pipeline narrative), Confidence Levels; `design.md` §10 (Heart Disease scenario references LDL); design.md §3 (one is already used as an example). ~5–7 occurrences across both.

5. **Liver Fat Transport Packet → Liver-Made Fat Packet.**
6. **Dietary Fat Transport Packet → Gut-Made Fat Packet.**

Also a pair. Appears in: `metabolic-pathways.md` §2 (two own entries), §3 (Liver, Small Intestine, Lymphatic System), §5 Overflow Rules, Confidence Levels; `foods-library.md` (twice, in the dietary-fat discussion); `exercise-responses.md` (one mention); `design.md` §5 (the Fat Metabolism subsystem view enumeration). ~10–12 occurrences. This is the highest-volume change but mechanical.

**Wave 3 — location-axis cleanup (optional but recommended):**

7. **Fat Transport Molecule → Blood Fat.** Highest occurrence count of any change here — this name appears throughout `metabolic-pathways.md` (multiple substance entries reference it), throughout `exercise-responses.md` (it shows up in every section on fat oxidation), and in `design.md` §5 (the Fat Metabolism view), §11 (engine state). ~25–35 occurrences. Mechanical but tedious.
8. **Body Fat Store → Body Fat** and **Muscle Fat Pocket → Muscle Fat.** Each appears 15–25 times across the three background docs and design.md. Do them together with the Blood Fat change so the parallel reads correctly.

**Wave 4 — defer:**

9. The sex-hormone names (Drive Hormone, Cycle Hormone, Cycle-Phase Hormone) — wait for `sex-differences.md`.
10. The electrolyte names (Salt-Maker, Cell-Cation) — wait for `water-electrolytes.md`.

**Order rationale:**

- Waves 1 and 2 are the user's flagged concerns — clearest justification, smallest occurrence counts, biggest legibility wins.
- Wave 3 is high-volume but high-clarity-gain through parallelism. Doing it after the route-fixes means each name change goes in clean, not stacked on top of unsettled language.
- Wave 4 should not happen now even though the names are flagged — making changes before the underlying research lands risks needing to undo them.

**Per-change downstream impact summary:**

| Change | Primary docs | Approx occurrences | Code/UI impact |
| --- | --- | --- | --- |
| Liver-Routed Sugar → Fruit Sugar | metabolic-pathways.md, foods-library.md | 6–8 | Dictionary one-liner |
| Phosphocreatine Buffer → Sprint Fuel | metabolic-pathways.md, exercise-responses.md | 8–10 | Dictionary one-liner |
| Cholesterol Carrier — Outbound → loaded | metabolic-pathways.md, design.md | 3–4 | Dictionary one-liner |
| Cholesterol Carrier — Returning → scavenging | metabolic-pathways.md | 2–3 | Dictionary one-liner |
| Liver Fat Transport Packet → Liver-Made Fat Packet | metabolic-pathways.md, foods-library.md, design.md | 6–8 | Dictionary one-liner |
| Dietary Fat Transport Packet → Gut-Made Fat Packet | metabolic-pathways.md, foods-library.md, exercise-responses.md, design.md | 4–5 | Dictionary one-liner |
| Fat Transport Molecule → Blood Fat | all four background/design docs | 25–35 | Dictionary one-liner |
| Body Fat Store → Body Fat | all four | 15–25 | Dictionary one-liner |
| Muscle Fat Pocket → Muscle Fat | all four | 15–25 | Dictionary one-liner |

The code/UI impact column is uniform because the design's Section 3 architectural commitment makes it so — every one of these changes is, in code terms, a single dictionary entry. The prose update is the only real cost, and it is modest.

**One operational note.** The user reviews proposals and decides which to apply; this review proposes — it does not modify any document outside this file. When the user accepts a name change, the canonical place to record it is wherever the dictionary itself lives (per design Section 3, that is `app/src/naming/`), and the background docs follow in the same change so the prose and the dictionary do not drift.

---
