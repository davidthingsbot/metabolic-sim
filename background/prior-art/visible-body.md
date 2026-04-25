# Visible Body

> An education-software company (now a division of Cengage Learning) selling 3D anatomy and physiology learning tools to schools, universities, libraries, and individual subscribers. Over 1 million users, 1,000+ institutional customers, content in seven languages, 24,000+ visual assets. We study it because it owns the *educational distribution* model in the same niche our simulator addresses, because its premade-curriculum-and-quizzes scaffolding shows what teachers actually buy, and because most of its "physiology animations" are exactly what our project replaces with a real engine.

![Visible Body](images/visible-body.png)

## What it is

Two SKUs aimed at different buyers:

- **Visible Body Suite** (consumer / library / individual student) — an interactive 3D anatomy app available on web, iOS, iPadOS, Android, and as a Chrome extension. Includes the full anatomical model library, physiology animations, dissectable views, AR mode on mobile, and over 6,000 individually selectable structures. Offline-capable on mobile.
- **Visible Body Courseware** (institutional, LMS-integrated) — Suite plus a teaching layer: pre-built courses, lessons, quizzes, gradebook integration, single sign-on, instructor analytics, content-correlation with major A&P textbooks. Marketed at instructors of college-level human anatomy and physiology courses.

The content library covers all 12 standard body systems plus a biology section (cells, blood, genetics) and clinical content. Animations show, e.g., heartbeat sequence, peristalsis, action potentials, hormone signalling — short, looping, expository. ([Visible Body](https://www.visiblebody.com/), [Courseware comparison vs BioDigital](https://www.visiblebody.com/blog/how-does-visible-body-courseware-compare-with-the-biodigital-human))

Distinctively from BioDigital, Visible Body ships:
- **Premade quizzes, flashcard decks, lesson plans, lab activities, and tours.** Per the company, 5,000 instructors used Courseware in 2023 and 90% of them used premade quizzes — i.e. the prefab content is the headline value, not the underlying viewer.
- **Textbook correlation.** Courseware content is mapped to popular A&P textbooks (Marieb, Saladin, Tortora) lesson by lesson.
- **A dedicated Customer Engagement Team** providing 1:1 instructor training.
- **Translations.** English, Spanish, French, German, Italian, Japanese, Chinese.

The acquisition by Cengage is a structural fact — Visible Body is no longer an independent EdTech shop, it is a division of an EdTech conglomerate. Pricing for Suite is now mostly hidden behind Cengage's institutional pipelines; historic public pricing for Courseware was around $8/student/year. Library subscriptions for the public-library market are an additional channel. ([Visible Body](https://www.visiblebody.com/))

## Audience and business model

- **Institutional, dominantly.** Universities, community colleges, high schools, hospital training programs, public libraries.
- **Pricing:** opaque on the public site since the Cengage absorption. Historic Courseware pricing was ~$8/student/year; Suite individual subscriptions historically in the $25-$80/yr range. Library subscriptions priced per FTE / branch.
- **Audience:** A&P students (gross anatomy / nursing / pre-med foundations), high-school biology classes, healthcare-professional onboarding, and the Cengage-correlated textbook market.
- **Distribution:** Cengage MindTap integration, Canvas / Moodle / D2L LTI integrations, Chromebook K-12 distribution, public-library shelves.
- **Funding:** for-profit, now part of a publicly-traded conglomerate (CG, NASDAQ).

## How it works — the educational-distribution angle

Visible Body's interesting story for us is **how it gets into a classroom**. The product itself is a sister to BioDigital, not a meaningful step ahead on visual fidelity or feature surface; the *Courseware* product is what dominates revenue, and the lessons it teaches are about distribution, not pixels.

**Distribution levers we should learn from:**

- **Textbook correlation.** Visible Body Courseware content is keyed to lesson numbers in major A&P textbooks. An instructor adopting Marieb chapter 18 can drop in the Visible Body lesson on the endocrine system and the LMS gradebook fills correctly. This is *integration into existing curriculum infrastructure* and is the single biggest factor in adoption.
- **LMS integration.** LTI 1.3 single sign-on into Canvas, Blackboard, D2L, Moodle. Quiz scores write back to the gradebook. Instructors don't run a separate tool; they assign Visible Body content as a homework item.
- **Premade quizzes are the wedge.** Instructors don't have time to author quizzes, and Visible Body knows that. The product's "free trial" experience leads with quizzes-ready-to-use, not with anatomy-models-ready-to-explore.
- **Public-library shelf.** Most users don't know they have access. A library card unlocks Visible Body Suite at hundreds of US public libraries through an EBSCO / Gale partnership. This is silent distribution.
- **Multilingual.** Seven languages broadens the addressable market beyond Anglophone schools, and Cengage's existing localisation pipelines absorb the translation cost.
- **Customer Engagement Team.** Live, human onboarding for institutional buyers. Not scalable for a free product like ours — but instructive about what buyers expect.

**Pedagogical scaffolding levers:**

- **Tours.** Pre-scripted walkthroughs of the body. A tour is a sequence of camera positions, structure highlights, and narration. Comparable to our scenarios but pedagogically narrower — a tour shows, our scenarios run.
- **Quiz Builder + premade decks.** Multi-modal: identify-on-the-model, fill-in-the-blank, multiple choice. Anchored to specific structures.
- **Lab activities.** Click-through guided "labs" that mimic dissection or palpation exercises.
- **Course templates.** A semester's worth of A&P content laid out lesson-by-lesson, with assessments. The instructor edits, doesn't create from scratch.

## What it does well

- **Curriculum-shaped product.** Everything Visible Body sells is shaped to fit how A&P is taught in real classrooms. The product is not "explore the body" — it is "complete the chapter on the endocrine system."
- **Premade content is genuinely premade.** Quizzes, flashcards, tours, lessons all ship ready-to-use, not as templates the instructor has to fill in.
- **Strong textbook correlations.** Adoption is one decision (we use Marieb), not many (we use Marieb + we author all our own quizzes + we build a custom course).
- **Cross-platform.** Web, iOS, Android, Chromebook, AR. Where BioDigital invested in VR, Visible Body invested in mobile-friendly AR — arguably the more practical bet for K-12.
- **Localisation.** Seven languages widens the funnel.
- **Offline mobile.** Suite works offline on mobile; this is non-trivial and matters for under-resourced schools.
- **Library distribution.** Quietly enormous — most public-library users don't realise their card unlocks it.

## What it does badly (or has chosen not to do)

- **"Physiology animations" are short canned loops, not real simulations.** A heartbeat is animated frame-by-frame, not driven by an underlying engine. A user cannot adjust a parameter and watch the heartbeat respond. This is the gap our project fills.
- **No metabolism, no time-axis, no chronic effects.** Same gap as BioDigital — Visible Body shows structure and mechanism in canned form, not behaviour over hours/days/years.
- **No quantitative state.** No glucose number, no insulin level. The product is qualitative.
- **Hidden pricing post-acquisition.** Discoverability of cost is worse than before the Cengage move.
- **Walled garden by design.** Outputs aren't easily shareable outside the Visible Body ecosystem. A scene the instructor builds lives in Courseware; embedding it in a public blog post is awkward.
- **Animation is decoupled from interaction.** The user can rotate the model and the user can play the loop, but the model's state is not driven by the loop or vice versa. Our project fuses these.
- **Cengage absorption homogenises.** Decisions now live inside a publicly-traded EdTech roadmap. The kind of focused, opinionated product evolution that built Visible Body in the first place is harder to replicate post-acquisition.

## What to borrow

- **Premade-content-as-wedge.** Our scenarios (Section 10) are this. The 17 built-in scenarios are not "examples of what the simulator can do" they are *the headline content*. Land on the page, click *Single Hamburger* or *Twenty Years of Smoking*, watch.
- **Tours.** The tour pattern — a sequence of pre-scripted moments with narration — is appealing as a future content format on top of our scenarios. v1 doesn't need it; post-v1 does. Phase 11 (onboarding) is the natural place for a single first-run tour.
- **Textbook correlation as a future distribution lever.** If we ever want to be assigned in classes, mapping our scenarios to chapters in mainstream physiology textbooks (Guyton & Hall, Marieb, Tortora) is a high-leverage activity. Not a v1 priority but worth noting.
- **LMS embeddability is plausible later.** Our scenario URL fragments and our self-contained static-site architecture make LTI integration *possible* down the road. Not a v1 priority.
- **Multilingual.** Our naming layer (Section 3) already separates display strings from internal IDs, which means translations are a swappable dictionary. A Spanish or French build is mostly editing the glossary. Visible Body's seven-language reach is achievable for us in principle.
- **Library distribution.** Public-library and school-library channels are an interesting future for a free, no-account, embed-friendly tool. Not a v1 distribution channel; worth keeping in mind.
- **Mobile AR is a credible future surface for the Long-Term State view.** Not v1, but a body silhouette in AR scaling between fit-twenty-year-old and post-decade-of-fast-food is a vivid demo.

## What to avoid

- **Don't outsource the engine to canned loops.** Visible Body's animation strategy (loop, no state) is the antithesis of our project. Every animation should be driven by the engine state at simulation time, never pre-rendered.
- **Don't price-gate.** The Cengage-pipeline opacity is the opposite of our positioning. Free, browseable without an account, no pricing page necessary.
- **Don't depend on a sales team.** Visible Body's Customer Engagement Team is a fine business model for a paid product; for us, the documentation, the in-page walkthrough (Phase 11), and the scenario examples have to do all the onboarding work alone.
- **Don't ship without quizzes-or-equivalent.** This is more of an opportunity flag than an avoidance. Visible Body's data point is that *teachers buy on quizzes, not on models*. Our analogue is the *scenario set itself* — a teacher can assign a scenario as a homework item, and the screenshot or recording is the deliverable. This wires up better if scenarios are inherently shareable (they are; Section 10) and snapshots are inherently captionable (Phase 5+).
- **Don't blur the engine and the curriculum layer.** Visible Body fuses content and viewer; for us, the engine is a separate layer from the scenarios, the foods, and the views. Teachers and curriculum builders should be able to compose new scenarios on top of a stable engine.
- **Don't ignore the chronic / time arc.** Visible Body has nothing on years-long progression. This is one of the validated gaps the field has, and it is exactly what our project's chronic-arc scenarios address.

## How its existence affects our project

**Complementary on content type, instructive on distribution.** Visible Body's surface (anatomy + canned animation) and ours (live engine over time) don't overlap directly. A school using Visible Body for A&P could plausibly add our simulator alongside as the *physiology-in-motion* component without conflict — at zero cost, for whatever fraction of the curriculum touches metabolism.

**Cengage absorption is a positioning gift.** As Visible Body becomes more integrated into Cengage's textbook bundles, the room for an *independent, free, no-login* alternative widens. Schools that can't afford the bundle, public libraries, individuals, free-clinic educators — all are increasingly served by tools that are explicitly outside the EdTech-conglomerate funnel.

**Distribution lessons we should internalise:**
- The first thing teachers ask about is assessment-grade content. We don't ship quizzes (out of scope), but our scenarios + snapshots + recordings are the analogue: a teacher can assign "run the *Single Hamburger* scenario, take a snapshot at 90 minutes, write a paragraph explaining what happened" and grade it.
- The second thing teachers ask about is textbook fit. We don't have to ship correlations in v1, but the scenario list (Section 10) should be re-examinable through the lens of "what physiology chapter does each map to?" later.
- The third thing teachers ask about is LMS integration. Our self-contained static site, scenario URL fragments, and snapshot exports already put us most of the way there; LTI is a future add-on.

## Pointers

- **Status:** alive, well-distributed, now a division of Cengage Learning.
- **Homepage:** https://www.visiblebody.com/
- **Suite product page:** https://www.visiblebody.com/anatomy-and-physiology-apps/
- **Courseware:** https://www.visiblebody.com/teaching-anatomy/courseware
- **Library subscriptions:** https://www.visiblebody.com/librarians/overview
- **Comparison vs BioDigital:** https://www.visiblebody.com/blog/how-does-visible-body-courseware-compare-with-the-biodigital-human
- **Comparison vs Complete Anatomy:** https://www.visiblebody.com/blog/how-does-visible-body-courseware-compare-to-3d4medicals-complete-anatomy
- **Saved image:** `images/visible-body.png`
