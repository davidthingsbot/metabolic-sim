# Levels

> A consumer "metabolic health" subscription that pairs an over-the-counter continuous glucose monitor (CGM) with an app that scores meals, surfaces glucose patterns, and pushes nutritional and lifestyle suggestions. Now offered in three tiers from $80/yr (app only) to $1,999/yr (CGM + comprehensive labs + nutritionist), claims 100,000+ "lives changed", and runs a large observational glucose study. We study it because it is the closest *consumer-facing* analogue in narrative framing — "see what food does to your body" — and because its reception (mixed; 7/10 from sympathetic reviewers) tells us a lot about what consumer-grade metabolic-feedback users actually want.

![Levels](images/levels.webp)

## What it is

Levels is a phone app, a web companion, and an optional CGM hardware bundle. The core product loop is:

1. User wears a CGM (Dexcom Stelo, Dexcom G7, or Abbott Libre 3 — the underlying sensor is multi-vendor now). The sensor reads interstitial glucose every few minutes.
2. The Levels app pulls the glucose stream and overlays it with the user's logged meals, exercise, sleep, and stress.
3. The app computes a **per-meal "metabolic score"** based on the glucose curve in the 2 hours after eating, plus daily and longer-window scores for stability, time-in-range, and trends.
4. The app surfaces *insights* — pattern-matched observations like "your blood glucose responds better to oats with protein than oats alone" — and bundles them with content (articles, podcasts, courses).
5. Higher tiers add quarterly lab panels (HbA1c, fasting insulin, lipid panel, inflammatory markers) and dietitian sessions through a Season Health partnership. ([Levels](https://www.levelshealth.com/), [Levels CGM cost article](https://www.nutrisense.io/blog/cost-of-levels-cgm))

The data flows from the CGM through the manufacturer's app (Stelo's, Libre's, G7's) and *also* requires the Levels app — a two-app setup users have repeatedly complained about. ([Powermoves review, 2026](https://powermoves.blog/health/levels-health-review/))

A key piece of the brand is the **observational study**: Levels is enrolling its non-diabetic users into a large-N observational dataset of glucose responses, partly to fill what Levels calls "a gap in reference data for non-diabetic populations" and partly to underwrite the company's research-credibility claim.

## Audience and business model

Direct-to-consumer. Three tiers:

| Tier | Annual | What's included |
|---|---|---|
| **Build / Classic** | $80–$288/yr | App-only or CGM-only. Glucose tracking, meal logging, scores, content. |
| **Core** | $499/yr | CGM + 2 essential lab panels per year + biannual clinician review. |
| **Complete** | $1,999/yr | CGM + 2 comprehensive lab panels (100+ markers) + nutritionist sessions + concierge. |

HSA/FSA eligible. App available on iOS and Android, with a web companion. Prior pricing was tighter ($199/mo flat with CGM) — the multi-tier reshuffle is a 2024–2025 move toward broadening the funnel and capturing high-end users with concierge services.

**Audience:** "metabolic-health-curious" non-diabetics, early-stage prediabetes, biohacker tier of consumer-health users, weight-conscious adults. The under-told audience is *physicians* — Levels markets a clinician dashboard for medical professionals who want to use the tool in practice.

**Funding:** raised >$50M including from Andreessen Horowitz; co-founder positioning is essentially "make CGM mainstream for non-diabetics."

## How it works — the consumer-narrative-framing angle

The angle that matters for us is **how Levels frames the metabolic story for non-specialists**, because we are trying to do something adjacent in our own UI.

**Framing patterns Levels uses:**

- **"Metabolic fitness" as a concept.** Levels does not use the words *insulin sensitivity* or *postprandial hyperglycaemia*; it uses *metabolic fitness*, *glucose stability*, *spike*, *energy crashes*. The vocabulary is colloquial-but-precise — a layperson can adopt it without prior education.
- **Meal score as the headline output.** Every logged meal gets a number 1–10. Discoverability is via "what did I eat that scored 9?" and "why did that pizza score 4?". The single number is the hook even though the underlying signal is a curve.
- **Causal pairing.** The app encourages users to see meals as inputs and glucose curves as outputs. This is the same conceptual frame we are trying to teach, and Levels has done meaningful pre-work persuading the consumer market that *food causes a measurable metabolic event*.
- **Personalised vs population.** Levels emphasises that the same food affects different people differently — this is true and important. Their evidence is the user's own CGM trace.
- **Friction as a feature.** Wearing a sensor on your arm for two weeks is friction; Levels frames this as worth it because the data is yours, real, and personal. The hardware *anchors* the experience; without the sensor, the app would be just another nutrition tracker.

**Friction signals from reviews:**

- Users churn when the testing is over. The reviewer at Powermoves says explicitly that they recommend "buy sensors twice a year, not year-round." For most users, the *insight density* of CGM data plateaus after a few weeks.
- The two-app setup (Levels + Stelo or Libre or G7) is repeatedly called a UX failure.
- Meal scoring's 2-hour post-meal window misses delayed dinner spikes; mega-zones merge overlapping windows; scores can be reassuring even when curves are bad.
- Connection drops produce inaccurate or missing readings — accuracy concerns are common.
- $300–$400 for a single month of testing puts continuous use out of reach for most.

## What it does well

- **Vocabulary.** "Metabolic fitness", "spike", "stable", "time in range", "rolling 30/60/90". Adopted broadly enough that other tools now use the same terms.
- **The single-score wedge.** Every meal gets a 1–10. Reductive but engaging. People share their high-scoring meals.
- **Real data.** A user gets their own glucose curve for their own breakfast. This is the most persuasive feedback the consumer-metabolism space has produced.
- **Content + community.** Articles, podcasts, member challenges, Facebook group. The brand is a media property as much as an app.
- **Multi-vendor CGM.** Recent unbundling from a single sensor brand — Stelo, G7, Libre 3 all supported — is a meaningful unlock.
- **Tiered pricing.** Three price points capture the curious, the committed, and the all-in. The $80/yr Build tier is genuinely accessible.
- **Lab + nutritionist bundling.** Higher tiers bundle services that historically lived in separate clinics (dietitian, lipid panel, HbA1c). Convenience is real.
- **Observational research.** The "we are filling gaps in non-diabetic reference data" story is good marketing and probably good science.

## What it does badly (or has chosen not to do)

- **Single signal.** Glucose only. Meals affect fat oxidation, ketones, triglycerides, GLP-1, leptin, cortisol — Levels shows none of those. The app's claim of "metabolic health" is anchored to one variable.
- **No prediction, no model.** Levels does not say "if you eat X next time, your glucose will probably do Y" beyond simple pattern-matching on the user's own history. There is no underlying engine.
- **No anatomy, no body.** The app is curves, scores, and text. The body is implicit.
- **No long-term arc.** A user can compare 30-day windows, but there is no pre-CGM-era depiction of "this is what your last decade looked like" or "here's what the next decade looks like under your current pattern." The horizon is the duration of the subscription.
- **Friction of hardware.** Sensor-on-arm is uncomfortable. Sticky pads fail. Sensors fall off in showers. The hardware is the experience and the hardware is unreliable.
- **The double-app gotcha.** Levels app + manufacturer app together. Repeatedly called out as a setup nightmare.
- **Scoring artefacts.** 2-hour windows miss late spikes. Mega-zones merge windows. A curve can be objectively bad and still receive a 6.
- **Cost-recurrence model.** $80–$1,999/yr is ongoing. Most users churn in 3–6 months. Customer lifetime value vs. acquisition cost is presumably a real internal worry.
- **No simulation.** The app cannot show a curve for a meal the user is *thinking about eating*. It is descriptive, not predictive — by design.

## What to borrow

- **Vocabulary.** Where Levels' plain-language terms are clean — *metabolic fitness*, *spike*, *stable*, *time in range* — we should consider matching. *Stable* and *spike* in particular are now broadly understood. Worth a pass through `glossary.md` to see if any plain labels would improve by adopting consumer-CGM vocabulary.
- **The single-score wedge.** Our per-organ Health scores (Section 4) and whole-body Health score are the analogue. A user lands and sees their body's Health number; that's a hook.
- **Causal pairing as the central UX.** Eat → curve. Meal-on-timeline + body-state-changes is the central interaction in our project (Section 5 / Section 6). Levels validates this is the right hook for a non-specialist audience.
- **Personalised matters.** Multi-individual mode (Section 8) is our analogue of "the same meal affects different bodies differently." Our advantage is that we can show the underlying *why* (different insulin sensitivity, different baseline metabolism), not just the curve.
- **Tiered presentation.** Our Plain / Mixed / Technical label modes (Section 3) are an analogous tiered surface — same engine, different presentation. Worth ensuring the default landing is the most accessible; users level up into more technical surfaces.
- **The educational content layer.** Levels has built a substantial editorial library around its app. We don't need to ship one in v1, but the *unsettled-science* badges (Section 13) plus per-flow background notes are an editorial pattern in the same shape, integrated into the simulator rather than orbiting it.
- **Observational data as credibility.** Levels' observational study is part of why it sounds credible. We don't have user data to mine, but our *background notes* with citations are the analogous credibility lever — the simulator's outputs trace to literature, transparently.

## What to avoid

- **Do not depend on a single signal.** The most-criticised limitation of Levels is glucose-only. Our project is multi-signal from day one (substances, hormones, locations, conditions, foreign substances, Health). Don't fall back to a glucose-led demo even in early phases — a hamburger affects glucose, fat oxidation, hepatic glycogen, insulin, and gastric emptying simultaneously, and we should show all of them.
- **Do not build a media business.** Levels' editorial empire works for a $50M-funded company. We are a free static site with no monetisation pressure; the in-page content (background-note links, scenario descriptions) is the editorial layer.
- **Do not score meals with a 2-hour-window number that hides 4-hour reality.** When we eventually surface a "this meal scored X" output (we don't, in v1, but it's a future possibility), the score should reflect the full curve, not a 2-hour artefact.
- **Do not require an account.** Levels' login wall is fine for a paid subscription; ours is fundamentally different. The simulator should run for an anonymous first-time visitor, no login, no email capture.
- **Do not gate the headline experience.** Free-tier-with-upsell is Levels' model and the wrong fit for ours. Our headline experience — load the page, drop a hamburger, watch — is free and complete.
- **Do not lean on hardware.** Levels' value is hardware-anchored; we are the opposite — pure software, runs in any browser, no purchase required. This is a positioning advantage, not a constraint to mimic.
- **Do not use *score* casually.** A meal score is fine framing; an organ Health score is fine framing; a "metabolic age" or "biological age" number — Levels avoids these and so should we. Composite-of-poorly-validated-signals scores invite criticism.

## How its existence affects our project

**Complementary in framing, distinct in method.** Levels and we are pointed at the same conceptual market — *help me understand what food is doing to my body* — from opposite ends.

- *Levels:* real data, single signal, single individual, no model, no anatomy, paid subscription with hardware. Excellent at "your meal yesterday spiked your glucose."
- *Us:* simulated data, many signals, multiple individuals, full underlying engine, anatomical visualisation, free. Excellent at "here is *generally* what a meal like that does to a body like yours, and here is what twenty years of meals like that does to a body like yours."

**Our positioning gets sharper next to Levels.** The argument is: Levels tells you *what happened*. We tell you *how it works, and what would happen* across scenarios and timescales you cannot afford to live through. The two are happily compatible — a Levels user could easily be a power user of our simulator.

**Validation of the consumer appetite.** Levels' growth (claimed 100,000+ users) demonstrates that a non-trivial slice of the consumer market actually wants metabolic feedback delivered in everyday vocabulary. This is reassuring for our brief — we are not betting on inventing demand, we are betting on serving demand that already exists with a tool of a different shape.

**Cautionary tale on customer-lifetime-value.** Levels' user-churn-after-a-few-months is the field's open secret. Insight density plateaus. For us, this is less acute — our content is *generative* (any new scenario produces new behaviour), and we don't depend on subscription renewal — but the underlying lesson is real: *passive monitoring of a single number gets old fast*. Our scenarios, our chronic arcs, and our multi-individual comparisons keep the surface area of "new things to discover" much larger than a glucose curve.

## Pointers

- **Status:** alive, well-funded, growing. Three-tier pricing is the current shape.
- **Homepage:** https://www.levelshealth.com/
- **CGM cost article (third-party comparison):** https://www.nutrisense.io/blog/cost-of-levels-cgm
- **Long-form user review:** https://powermoves.blog/health/levels-health-review/
- **App Store reviews:** https://apps.apple.com/us/app/levels-metabolic-health/id1481511675
- **Independent review (Nucleus):** https://mynucleus.com/blog/levels-health-review
- **Saved image:** `images/levels.webp` (Levels app insights screenshot)
