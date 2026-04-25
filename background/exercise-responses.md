# Exercise Responses — How Different Workouts Reshape Metabolic Flows

*Terminology note: Scientific names lead throughout. The plain-language functional names that the simulator's UI shows by default (Storage Hormone, Blood Sugar, Sprint Fuel, etc.) live in `design/glossary.md`. Metric units throughout. The simulator's "unsettled science" convention is used to flag claims where the literature is contested or the magnitudes are uncertain.*

---

## 1. Overview

Exercise is the largest perturbation the metabolic system handles in a normal day. Resting energy demand at the muscle is roughly 1 kJ/min per kg of working tissue; under hard effort it can rise twenty- to thirty-fold within seconds. The body has no single response to this — it has *four characteristic response shapes*, depending on what kind of demand is being placed on it.

This document defines those four shapes, the fuel-selection curves they trace, the hormones they invoke, the recovery they require, and the adaptations they drive over weeks and months. It is written for the simulator engine.

**The core idea:** Exercise type is not a continuous variable. Endurance, interval, strength, and mixed work engage *different* sets of fuels and *different* hormones, with different time-courses. A simulator that only varies intensity and duration will produce wrong outputs. The engine needs four event sub-kinds, not one.

---

## 2. The Four Exercise Types

### Endurance (steady aerobic)

**What it is:** Continuous effort at a heart rate the body can sustain for at least 30 minutes — typically 60–80% of the individual's maximum heart rate. Running, cycling, swimming, brisk hiking, rowing at conversational pace.

**Heart rate range:** 110–160 bpm in most adults. On the simulator's 1–10 effort scale, this is 4–7.

**Duration profile:** 30 minutes to several hours. Long-duration sessions (>90 min) cross a metabolic threshold where glycogen stores start to run low and the body increasingly leans on body fat.

**Fuels engaged, in order of contribution as the session unfolds:**
1. blood glucose (glucose) and Muscle glycogen (muscle glycogen) dominate the first 20 min.
2. intramuscular fat (intramuscular triglyceride) ramps up through 20–40 min.
3. free fatty acids from body fat (adipose triglyceride) become the largest single contributor past 60 min at moderate intensity.
4. Liver glycogen maintains blood glucose for the brain throughout.

**Hormones engaged:** insulin falls. glucagon rises. epinephrine (adrenaline) moderately elevated. cortisol rises slowly, meaningful only past 90 min or in poorly-fuelled states.

**What the engine needs:** A duration-driven fuel-mix curve, slow rise in fat oxidation, insulin suppression persisting 1–3 hours post-session.

---

### Interval (high-intensity intermittent)

**What it is:** Alternating bouts of near-maximal effort (30 seconds to 4 minutes) with active or passive recovery. Sprint intervals, hill repeats, Tabata-style protocols, Norwegian 4x4. The work bouts push past the lactate threshold; the recovery bouts are deliberate.

**Heart rate range:** 160–190+ bpm during work bouts; drops to 110–140 bpm in recovery. Effort scale: 8–10 during work, 3–5 during recovery.

**Duration profile:** Short overall — typically 15–40 minutes including warmup and cooldown. Total work time within a session is often only 4–16 minutes.

**Fuels engaged:**
1. Muscle glycogen and blood glucose dominate during work bouts. The fast (no-oxygen) path is heavily engaged — lactate production spikes.
2. ATP demand outruns oxygen delivery in the work bout; the cell uses phosphocreatine buffer and fast path.
3. During recovery bouts, lactate are cleared — heart and slow-twitch fibres burn them, liver converts a fraction back to blood glucose.
4. body fat contributes little during work bouts — epinephrine has mobilised free fatty acids into the blood, but the muscle is moving too fast to use them efficiently. Fat oxidation rises *between* bouts and especially after the session.

**Hormones engaged:** epinephrine is the headline — sharp rise, stays elevated. cortisol rises substantially. glucagon rises. insulin suppressed for several hours after.

**What the engine needs:** Per-bout state with separate fuel curves for work and recovery sub-intervals; large epinephrine and lactate excursions; meaningful post-exercise oxygen-consumption tail.

---

### Strength (resistance / weight training)

**What it is:** Loaded muscular contractions, typically organised as sets of 3–12 repetitions at 60–90% of the individual's maximum lift, with 1–3 minute rest between sets. Squats, deadlifts, presses, pulls. Each set is short (10–60 seconds) but very high force.

**Heart rate range:** Variable and often misleading — heart rate climbs during a hard set (to 140–170 bpm) but the *average* across a session including rest is moderate. The metabolic stress is not well represented by heart rate. Effort scale: 7–10 during sets, 1–3 between.

**Duration profile:** 30–75 minutes. Total time under load within a session is typically only 5–15 minutes.

**Fuels engaged:**
1. ATP stored in muscle, plus phosphocreatine, fuel the first ~10 seconds of a set.
2. Muscle glycogen (fast, no-oxygen path) covers the rest. lactate rises sharply within the muscle.
3. Between sets, the cell rebuilds phosphocreatine and clears local lactate.
4. body fat contributes negligibly within the session — but insulin suppression and elevated free fatty acids persist for hours after.

**Hormones engaged:** epinephrine rises with each hard set. cortisol rises significantly with high-volume short-rest sessions. growth hormone (growth hormone — see §4) and the muscle-repair signalling cascade are activated. insulin sensitivity is sharply elevated for 24–48 hours.

**What the engine needs:** A muscular damage / repair-signal accumulator; elevated amino acid demand for 24–48 hours; a insulin sensitivity bump in trained muscles.

---

### Mixed (team sports, climbing, martial arts, circuit work, hiking with packs)

**What it is:** Irregular intensity, irregular duration, combining sustained aerobic load with intermittent high-force efforts. The defining feature is that *neither* a steady fuel-selection curve *nor* a clean interval pattern fits.

**Heart rate range:** Wide swings, often 100–180 bpm within one session. Effort scale: 3–9, with rapid transitions.

**Duration profile:** 45 min to several hours. Total intense time is unpredictable.

**Fuels engaged:** All of them, in shifting combinations. The cost is poor metabolic efficiency — every fuel transition carries lag and lactate accumulation.

**Hormones engaged:** epinephrine fluctuates with intensity spikes. cortisol rises with duration. insulin suppressed throughout.

**What the engine needs:** Either explicit intensity samples (heart rate every 30 seconds), or a stochastic intensity model on a moving baseline. Mixed work cannot be a single rectangle in the timeline.

---

## 3. Fuel Selection Curves

### Within a session: the time-axis

For a single moderate-intensity endurance session at ~65% of maximum heart rate:

- **0–5 min:** blood glucose and Muscle glycogen dominate. Fat oxidation minimal — fat cells beginning to release free fatty acids. epinephrine has spiked.
- **5–20 min:** Muscle glycogen is the largest single source. insulin has dropped; free fatty acids are arriving in blood but muscle fat oxidation is still ramping up.
- **20–60 min:** Fat oxidation reaches a meaningful fraction. intramuscular fat burning in place. free fatty acids from body fat arriving via blood. Roughly even sugar-fat mix.
- **60–120 min:** Fat oxidation peaks. In a well-fed athlete at moderate intensity, fat can supply 50–70% of demand. Liver glycogen can be 60–80% depleted by 90 min.
- **>120 min:** Sugar reserves low. The body uses amino acids from muscle protein for gluconeogenesis (cortisol rising). Output capacity drops — the "wall" is when Muscle glycogen is essentially gone and the cell is forced onto fat alone, which can't combust fast enough to maintain the prior pace.

### Across intensity: the crossover concept

George Brooks's "crossover concept" (1994) is the clearest single model of intensity-driven fuel selection: as exercise intensity rises, the *absolute* rate of fat oxidation rises modestly to a peak around 50–65% of maximum aerobic capacity, then *falls* as intensity continues upward. Carbohydrate oxidation rises monotonically with intensity. The two curves cross somewhere around 60–75% of maximum aerobic capacity — beyond that, sugar dominates regardless.

In practical terms for the simulator:
- **Low intensity (effort 1–3):** Almost entirely fat. Walking pace.
- **Moderate intensity (effort 4–6):** Mixed, with fat doing real work. Easy run, conversational cycling.
- **Hard intensity (effort 7–8):** Sugar-dominant, fat contribution declining.
- **Very hard intensity (effort 9–10):** Sugar nearly exclusively, with significant fast-path (no-oxygen) energy production.

The practical reason fat oxidation falls at high intensity is twofold. First, free fatty acids can only be combusted via the full-combustion (oxygen-requiring) path — at high intensity, oxygen delivery becomes the bottleneck and the cell switches to the fast (no-oxygen) path, which can only use sugar. Second, high circulating lactate levels directly inhibit fat release from body fat.

### Trained vs untrained bodies

Training shifts these curves substantially:

- **Maximum fat oxidation rate:** Untrained adults peak around 0.3–0.5 g/min of fat. Trained endurance athletes can hit 1.0–1.5 g/min — roughly three times higher. The intensity at which the peak occurs also shifts upward, from ~50% to ~65% of maximum aerobic capacity.
- **Crossover point:** Shifts to higher intensity in trained individuals. A trained athlete can be running at 70% of maximum and still be burning meaningful fat; an untrained person at the same relative intensity is on sugar.
- **Intramuscular fat capacity:** Trained athletes store 2–3 times more — a major reason their endurance is higher. (See van Loon's work on intramuscular triglyceride utilisation.)
- **Glycogen capacity:** Trained muscle holds 25–50% more.

**For the engine:** The fuel-mix curve should be parameterised by a "training level" variable that scales the maximum fat oxidation rate, shifts the crossover intensity, and scales the intramuscular fat and Muscle glycogen capacities.

**Unsettled science:** The exact crossover intensity is highly individual — variation across healthy adults at the same relative intensity is large enough that any single number is misleading. The popular "fat-burning zone" concept (typically marketed as 60–70% of max heart rate) is loosely consistent with the intensity of *peak* fat oxidation, but it misleads in two ways: (a) higher intensities burn more total fat per minute even though a smaller fraction is fat, and (b) the zone for one person is not the zone for another. The simulator should use a probabilistic or training-level-adjusted curve, not a fixed band.

---

## 4. Acute Hormone Responses

The four-hormone control layer (insulin, glucagon, epinephrine, cortisol) responds differently to each exercise type. There is also a fifth signal — growth hormone — that becomes important for strength and mixed work.

### Epinephrine (adrenaline / epinephrine)

- **Endurance:** 2–4× resting at moderate intensity, 5–10× at hard pace. Falls quickly post-session.
- **Interval:** 10–20× resting, peaking during work bouts. Stays elevated through the session and 30–60 min after.
- **Strength:** Rises sharply with each hard set, especially heavy compound lifts. Peak excursions similar to interval work.
- **Mixed:** Tracks intensity spikes.

Functionally, epinephrine is the "open every fuel valve" signal: cracks glycogen stores, mobilises body fat, overrides insulin short-term.

### Cortisol

- **Endurance:** Rises slowly. Below 60 min at moderate intensity, the rise is small. Past 90 min, especially in fasted or low-carbohydrate states, substantial.
- **Interval:** Rises significantly. High intensity is a strong stimulus even in short sessions.
- **Strength:** Rises with volume, falls with rest interval. High-volume short-rest sessions produce much more than low-volume long-rest sessions.
- **Mixed:** Long, intense, fasted sessions are the strongest stimulus.

The engine should treat sustained cortisol as a cost — it pushes the body toward muscle protein breakdown and abdominal fat storage, and suppresses the repair signalling that strength and interval work otherwise drive. Two hard sessions back-to-back can produce *less* adaptation than one well-recovered session because the second cortisol spike overwhelms the repair signal.

### Insulin suppression

In all four exercise types, insulin falls during the session and stays low for some period after. The post-session window is the most important fact for the engine:

- **Endurance:** Suppressed during, and for 1–3 hours after.
- **Interval:** Suppressed during, and for 2–6 hours after — the suppression is deeper and longer than steady-state work.
- **Strength:** Suppressed during, with a strong sensitivity rebound: working muscle becomes 25–50% more responsive to the same insulin signal for 24–48 hours afterward (essentially a window in which incoming blood glucose is preferentially stored as glycogen rather than fat).
- **Mixed:** Suppressed during; recovery sensitivity depends on the work distribution.

This is the metabolic basis of the "post-exercise refill window" — the same insulin level recruits more glucose into muscle than it would at rest, because the muscle's glucose-uptake machinery is upregulated.

### Glucagon

Rises in all exercise types as blood glucose drops, but the rise is steepest in sustained endurance work past 60 minutes. It is mainly a Liver glycogen mobilisation signal; for the engine it matters most as a multiplier on hepatic glucose output.

### Growth hormone

Pulses sharply with high-intensity work — particularly intervals and strength training with short rest. Endurance work produces a smaller, slower rise. The pulse promotes amino acid uptake into muscle, fat mobilisation, and tissue repair signalling. It is one of the main reasons strength and interval training drive structural adaptations that endurance training alone does not. (Kraemer and colleagues have characterised this in detail since the 1990s.)

---

## 5. Recovery — What Refills First, What Takes Longer

After a session ends, the body executes a roughly fixed sequence of recovery operations. The simulator should treat recovery as several parallel processes, each with its own timescale.

### Minutes 0–60: Acute restoration

- **ATP and phosphocreatine pools** refill within 2–5 min — why 3 min rest restores most strength between-set capacity.
- **Blood glucose** restored to normal in minutes — Liver glycogen tops it up, or dietary blood glucose arrives.
- **Lactate** clearance is mostly complete within 30–60 min.
- **Heart rate and ventilation** elevated 15–60 min — the post-exercise oxygen-consumption tail, paying off fast-path debt and restoring ion gradients.

### Hours 0–24: Sugar refill and acute repair

- **Muscle glycogen** refills at ~5–7 mmol/kg per hour with adequate carbohydrate intake and insulin signal. Full refill from substantial depletion takes 18–24 hours. The first 60–90 min is the fastest-uptake window (Burke and colleagues).
- **Liver glycogen** restored within a single day with carbohydrate intake.
- **Local muscle inflammation** peaks in the first 24 hours. amino acids are recruited to working muscle.

### Hours 24–72: Structural repair

- **Intramuscular fat** refills slowly — 24–48 hours from substantial depletion. The slowest energy store to restore.
- **Muscle damage repair** runs through this window. amino acid uptake elevated; insulin sensitivity in trained muscle elevated. Delayed-onset muscle soreness peaks here, especially after eccentric or unfamiliar work.
- **Connective tissue** (tendons, ligaments) repairs much more slowly — full remodelling takes 5–14 days, longer for older bodies. Track separately if modelling overuse injury risk.

### Days 3–14: Adaptation

- Mitochondrial protein synthesis elevated for 1–3 days after a hard session.
- New capillaries appear after ~2 weeks of consistent training.
- Heart chamber enlargement and stroke volume increase are measurable after 4–8 weeks.

### The post-exercise sensitivity window

For 24–48 hours after a hard session, the muscle that did the work is in an unusually responsive state: incoming blood glucose is preferentially routed into glycogen, incoming amino acids are preferentially routed into protein synthesis. This is the simulator's post-exercise window where carbohydrate and protein intake have outsized effects on storage-vs-overflow routing (per the overflow rules in §5 of `metabolic-pathways.md`).

The engine should expose this window as a per-muscle (or whole-body, depending on simulation granularity) modifier on insulin sensitivity that decays exponentially with a half-life of roughly 12 hours.

### Soreness and the protein-synthesis signal

Eccentric loading (lengthening contractions — running downhill, the lowering phase of a squat) causes microscopic muscle damage that cues a multi-day repair process. The damage activates a signalling cascade (the muscle-repair network, anchored on a kinase called mTOR) that drives amino acid uptake and protein synthesis for 24–72 hours. This is what produces hypertrophy from strength training. Endurance training produces a much smaller hypertrophy signal but a much larger mitochondrial-density signal — the same amino acids are routed differently depending on the kind of demand.

**Unsettled science:** The optimal recovery duration between hard sessions of the same type is contested. Classical recommendations of 48 hours between strength sessions for a given muscle group are based on the soreness window, but elite training programs routinely violate this with apparently good results. The engine should treat recovery time as a tunable parameter rather than a fixed constant.

---

## 6. Training Adaptations Over Weeks and Months

The simulator should model adaptation as slow drift in rate constants and capacities. The major adaptations and their timescales:

### Mitochondrial density (cellular power-plant count)

- **Trigger:** Endurance and interval. Intervals are at least as effective per-minute as endurance (Gibala et al.).
- **Timescale:** Measurable in 2–3 weeks; substantial in 6–12 weeks; plateau after 1–2 years at high volumes.
- **Engine effect:** Higher maximum full-combustion (oxygen-requiring) energy rate. Higher peak fat oxidation. Crossover intensity shifts upward.

### Heart stroke volume

- **Trigger:** Endurance — sustained moderate-to-hard sessions stretch the heart's left chamber.
- **Timescale:** 4–12 weeks for first changes, 6–24 months for substantial.
- **Engine effect:** Higher maximum oxygen delivery; lower resting and submaximal heart rate.

### Capillary density

- **Trigger:** Endurance, especially long slow distance.
- **Timescale:** 2–8 weeks for first changes; substantial over 6–12 months.
- **Engine effect:** Faster delivery of oxygen and free fatty acids to working muscle; faster lactate and carbon dioxide clearance.

### Intramuscular fat capacity

- **Trigger:** Endurance, especially longer sessions.
- **Timescale:** Several weeks to a few months.
- **Engine effect:** Larger local fat reserve. Higher fat oxidation rate at sub-maximal pace.

### Muscle mass and tone

- **Trigger:** Strength and high-intensity work.
- **Timescale:** Visible in 4–8 weeks; substantial in 6–18 months. Strongly age- and sex-dependent.
- **Engine effect:** Higher Muscle glycogen capacity, higher resting metabolic rate, larger amino acid maintenance demand.

### Maximum oxygen uptake (the oxygen ceiling)

- **Trigger:** Endurance and interval. Intervals drive it faster; endurance drives it longer.
- **Timescale:** Measurable in 4–8 weeks; plateau approached over 1–2 years.
- **Engine effect:** Caps the maximum aerobic energy rate, the top of every other fuel curve.

### Vascular health (arterial elasticity, endothelial function)

- **Trigger:** Endurance and mixed work, especially sustained over years.
- **Timescale:** Measurable in 8–12 weeks; long-term effects accumulate over decades.
- **Engine effect:** Better blood pressure regulation; faster nutrient delivery; lower long-term cardiovascular risk.

### Metabolic flexibility

- **Trigger:** Any regular exercise that periodically depletes glycogen stores.
- **Timescale:** 2–6 weeks for first improvements.
- **Engine effect:** Faster fuel-switching; less lag at intensity transitions; better tolerance of skipped meals.

**For the engine:** Each adaptation is a slow integrator. Give each one a current-level state and a target driven by recent training load (e.g. a 4-week exponential moving average of relevant session minutes). The current level approaches the target with its characteristic time constant. Detraining is symmetric but slightly faster — most adaptations decay in 2–4 weeks of inactivity at roughly twice the accumulation rate.

---

## 7. Practical Numbers for the Engine

Wide ranges are given throughout because individual variation across healthy adults is genuinely large. Where a single number would mislead, the engine should sample from the range.

### Heart rate ranges by exercise type and effort

| Type | Effort 1–3 (warmup) | Effort 4–6 (moderate) | Effort 7–8 (hard) | Effort 9–10 (max) |
|---|---|---|---|---|
| Endurance | 90–110 bpm | 120–155 bpm | 155–175 bpm | rarely sustained |
| Interval (work bout) | n/a | n/a | 165–180 bpm | 180–195+ bpm |
| Interval (recovery bout) | 100–130 bpm | 120–150 bpm | n/a | n/a |
| Strength (during set) | 110–130 bpm | 130–155 bpm | 150–175 bpm | 165–185 bpm |
| Strength (between sets) | 90–115 bpm | 100–125 bpm | n/a | n/a |
| Mixed | wide swings — model per-segment | | | |

Maximum heart rate varies with age (roughly 220 minus age, ±10 bpm), with significant individual variation. The simulator should compute relative intensity as a fraction of the individual's maximum, not absolute heart rate.

### Typical session durations

| Type | Typical | Common range |
|---|---|---|
| Endurance | 45 min | 20 min – 5 hr |
| Interval | 30 min | 15–60 min |
| Strength | 50 min | 30–90 min |
| Mixed | 60 min | 30 min – 4 hr |

### Energy expenditure rates

These are rough figures for a 70 kg adult. Scale linearly with body mass for a first approximation; trained athletes can run at the high end of each range.

| Type and intensity | kJ/min | kcal/min |
|---|---|---|
| Walking, easy (effort 2) | 12–18 | 3–4 |
| Endurance, moderate (effort 4–5) | 30–45 | 7–11 |
| Endurance, hard (effort 6–7) | 50–70 | 12–17 |
| Interval, work bout (effort 9) | 80–110 | 19–26 |
| Interval, average across session | 40–60 | 10–14 |
| Strength, average across session | 25–40 | 6–10 |
| Strength, during a hard set | 60–90 | 14–22 |
| Mixed, moderate average | 30–55 | 7–13 |

### Fuel-mix percentages by exercise type (averaged across session)

| Type | Sugar (Blood + Polymer) | Fat (Pocket + Transport) | Protein |
|---|---|---|---|
| Endurance, 60 min, moderate | 55–70% | 30–45% | <2% |
| Endurance, 180 min, moderate | 35–50% | 45–60% | 3–8% |
| Interval (work bouts only) | 90–98% | 2–10% | <1% |
| Interval (whole session including recovery) | 75–85% | 15–25% | <2% |
| Strength | 80–95% | 5–20% | <2% |
| Mixed | 60–80% | 20–35% | 1–4% |

### Glycogen depletion per session (rough)

| Type | Muscle glycogen depletion | Liver glycogen depletion |
|---|---|---|
| Endurance, 60 min, moderate | 30–50% | 20–40% |
| Endurance, 180 min, moderate | 70–90% | 60–80% |
| Interval, 30 min | 30–55% | 20–35% |
| Strength, 50 min | 25–45% (in trained muscles only) | 10–25% |
| Mixed, 90 min | 40–65% | 30–55% |

### Refill times (with adequate carbohydrate intake)

- Liver glycogen: 6–24 hours
- Muscle glycogen: 18–36 hours from substantial depletion
- intramuscular fat: 24–48 hours
- Muscle structural repair (post-strength): 24–72 hours
- Connective tissue remodelling: 5–14 days

---

## 8. Unsettled Science

Areas where the literature is genuinely contested, flagged per the simulator's convention:

### The boundary of the "fat-burning zone"

Peak fat oxidation occurs at intensities ranging from roughly 40% to 75% of maximum aerobic capacity across individuals. The popular fixed prescription (60–70% of maximum heart rate) is a useful shorthand but a poor predictor for any one person. Trained athletes peak higher; some metabolically inflexible individuals do not show a clean peak at all. The engine should expose this as a per-individual parameter, not a fixed value.

### Magnitude of the post-exercise oxygen consumption tail

The claim that interval training "burns more calories after the workout than during" is largely overstated. Measured tails in controlled studies range from 6% to 15% of the session's energy expenditure, mostly back to baseline within 1–3 hours, with a thin tail of activity extending up to 24 hours in some studies. Real but small. Include it without exaggerating.

### Optimal recovery duration between sessions

Classical "48 hours per muscle group" for strength and hard-easy alternation for endurance are based on observed recovery curves but have not been shown to optimise long-term adaptation. Elite programs frequently violate them. The right answer probably depends on individual recovery capacity, sleep, nutrition, and total training load — precisely what this simulator can experiment with.

### High-intensity intermittent vs steady-state for cardiovascular adaptation

Interval training produces equivalent or better mitochondrial and aerobic adaptation per training-minute than steady-state work in moderately trained populations (Gibala and colleagues). Whether this extends to long-term cardiac chamber enlargement and stroke volume is less clear — elite endurance athletes still spend the majority of their volume at low-to-moderate intensity, and the cardiac adaptation evidence favours sustained steady work for that specific outcome. The engine should treat the two as overlapping but not identical adaptation drivers.

### Effect of fasted training

Training in a fasted state shifts fuel mix toward fat within the session — uncontested. Whether it produces greater long-term adaptation in fat oxidation, mitochondrial density, or body composition is contested. Plausible mechanisms exist (lower insulin, depleted glycogen as a stronger adaptation signal); confounders are large. There is a real cost at high intensity — cortisol rises further, muscle protein breakdown contributes more — that may offset benefits.

### Whether muscle damage is necessary for hypertrophy

The long-held view that microscopic muscle damage drives growth has weakened. Recent work suggests mechanical tension (heavy load, full range) drives growth via the muscle-repair signalling cascade largely independently of damage, and damage-induced inflammation may actually subtract from the growth signal. The engine should treat hypertrophy as driven by integrated mechanical work, with damage as a separate (and partially negative) recovery cost.

---

## 9. What the Engine Needs — Summary

To simulate Exercise events faithfully:

1. **Exercise type tag** per session: endurance, interval, strength, mixed.
2. **Per-type fuel-mix curves** parameterised by intensity and elapsed time.
3. **Per-individual training-level state vector** for mitochondrial density, heart stroke volume, capillary density, intramuscular fat capacity, glycogen capacity, oxygen ceiling, vascular health, metabolic flexibility — each with its own slow-integration update rule.
4. **Per-session hormone trajectories** for epinephrine, cortisol, insulin, glucagon, growth hormone.
5. **A recovery state machine** with separate timescales for ATP / phosphocreatine, blood glucose, lactate clearance, Muscle and Liver glycogen refill, intramuscular fat refill, muscle damage repair, connective tissue remodelling.
6. **Post-exercise sensitivity window** modifying insulin sensitivity and amino acid uptake for 24–48 hr.
7. **Adaptation integrator** turning training stimulus into slow drift in the training-level state, with realistic time constants and slightly faster detraining decay.
8. **Individual variation** so two simulated bodies at the same training level respond differently to the same session.

If the engine has these pieces, the four exercise types will produce qualitatively different metabolic signatures even when their total energy expenditure matches. That is the test of whether the simulator captures exercise faithfully or only calorically.
