# BioDigital Human

> The dominant interactive 3D anatomy product in a browser — over 5 million users, more than 1,000 mapped health conditions, embedded by Wolters Kluwer, Novartis, and Johnson & Johnson, available in WebGL, on iOS/Android, and on VR headsets. We study it because it owns the production-polish bar for "interactive human body in a browser," because its UX choices are the public's mental model of what such a thing should feel like, and because the pieces it deliberately does *not* do (no time evolution, no metabolism) are exactly the pieces our project does.

![BioDigital](images/biodigital.png)

## What it is

BioDigital Human is a WebGL-rendered, fully-3D, manipulable anatomical body. The user lands in a viewer with the whole body visible, can rotate, zoom, dissect (peel layers), isolate systems, hide structures, and click any part to get a label and a description. On top of the anatomical baseline sits the **Condition Library** — over 1,000 named diseases, each rendered as a custom 3D scene that visualises the affected anatomy and (sometimes) the pathology (a tumour, a plaque, an inflamed organ, a herniated disc, a fractured bone). ([BioDigital](https://www.biodigital.com/))

Tooling around the viewer:
- **Human Studio** — content-creation tool that lets a user (typically an institutional content team) compose custom 3D scenes from the model library and publish them as embeddable assets.
- **Quiz Builder** — multiple-choice quizzes that anchor questions to highlighted anatomy.
- **Embed SDK** — the viewer drops into a third-party LMS or CMS as an iframe; this is how Wolters Kluwer's Lippincott products and many drug-company patient-education sites use it.
- **Mobile apps** for iOS and Android with offline access for downloaded scenes.
- **VR/AR** — Meta Quest 2 and HoloLens 2 builds, with voice commands.

The content provenance is mixed: BioDigital's writers plus excerpts from the NIH NCI Thesaurus and Wikipedia. Per Doody's review, descriptions often link out to Wikipedia rather than expert-curated content, which Visible Body and others use as a comparative talking point. ([Doody's review, 2025](https://dcdm.doody.com/2025/06/a-review-of-the-biodigital-human/))

Co-branding visible on the site now pairs BioDigital with **Anatomage** (the cadaver-imaging/dissection-table company); the relationship is a partnership rather than an acquisition.

## Audience and business model

Freemium with steep tiers. ([BioDigital pricing](https://pricing.biodigital.com/), [School pricing](https://pricing.biodigital.com/school.html))

| Tier | Price | What you get |
|---|---|---|
| **Personal** | Free | All anatomy + 1,000+ condition models. **10 in-app 3D Model Views / month, 5 saved models.** |
| **Personal Plus** | $29.99/yr | Unlimited views, unlimited saved models, email support. |
| **Class** | $15/student/yr | Class plan with 5 faculty seats, full content, Human Studio + Quiz Builder. Published outputs only usable within the class. |
| **Institution** | Custom (contact sales) | Unlimited faculty/students, AR/VR, mobile SDKs, IP restrictions, bulk export, dedicated account manager, SLA. |

Customers include Wolters Kluwer (Lippincott Medicine), Novartis, Johnson & Johnson, NYU, the American College of Surgeons, and 5M+ self-signed users. The "100 million health conversations annually" claim positions the product as a *patient-engagement* surface as much as an educational one — physicians and pharma reps use it to explain conditions to patients, not just to teach anatomy.

## How it works — the visualisation/UX angle

The angle that matters for us is **interaction design** — what BioDigital made the right call on, and what it didn't.

**Right calls:**
- **WebGL-only viewer is the table-stakes platform.** Loads without install, on any modern browser. We learn from this that a static GitHub-Pages-served WebGL/Canvas/SVG bundle is a viable shipping unit even at this scale.
- **Body silhouette as the home view.** Always-visible whole-body context with progressive layer reveal (skin → muscle → skeleton → organs → vessels). Users navigate spatially, not through a menu tree.
- **Click-to-isolate, click-to-hide.** Direct manipulation of structure visibility. The user never has to think "open the layers panel and toggle the right checkbox" — they can just click.
- **Hover labels.** Every structure surfaces its name on hover. The label is the first piece of information; the description panel is the second.
- **Curated views as a publishing format.** "A 3D scene focused on X" is a first-class shareable asset, with its own URL. Embedding it in a webpage is one line. This is the right unit of sharing for content like ours; *scenarios* in our project are the analogue.
- **Condition overlays.** A condition page is a 3D model where the affected anatomy is highlighted, plus a textual description, plus a subset of related scenes. The visual differentiation makes it instantly clear what's wrong, even before reading.
- **Embedding model with isolation.** The iframe carries the BioDigital UI inside whatever surrounding site the customer has. This is the distribution lever — Wolters Kluwer doesn't have to rebuild anatomy, they license a viewer.

**Wrong / missing calls:**
- **No time.** A condition is a *state*, not a process. Atherosclerosis appears as a plaque; the build-up over decades is not animated. Diabetes appears as a labelled pancreas; the loss of β-cell function over time isn't shown. (This is precisely the gap our project fills.)
- **No physiology beyond static animations.** Some scenes have looping animations (heart beating, peristalsis), but they are short canned loops, not driven by an underlying engine. A user cannot *change a parameter* and watch the heart respond.
- **No quantitative state.** No glucose number, no insulin level, no fluid volume, no metabolic rate. The product is qualitative.
- **Free tier viewport on usage** is harsh. 10 in-app views/month is enough for a curiosity browse but not enough to use as a teaching companion through a semester. The conversion bait is obvious.
- **Description provenance is uneven.** Wikipedia + NIH NCI Thesaurus + BioDigital writers means a scene about (e.g.) hepatic steatosis can pull from any of those, with citations not visible to the user.
- **Reload to switch views.** Per Common Sense / Doody review: switching from one curated scene to another requires reloading, breaking a sense of continuity. Our switching between Whole Body / Fuel Flows / Hormones (Section 5) should not have this seam.
- **Best on a desktop with a scroll-wheel mouse.** Touch is supported but the experience is materially worse. Our responsive-density commitments (Section 14) need to be more aggressive about phone usability than BioDigital is.

## What it does well

- **Production polish.** The 3D models are detailed, the lighting is restrained, the labels are tasteful. It looks like a serious product, not a research demo.
- **Onboarding.** A new user can be navigating the body in under a minute. The home view, the layer toggles, and the search bar are immediately legible.
- **Cross-system overlays.** A scene about a condition can highlight the heart, the kidneys, and the lungs simultaneously, making the multi-system pattern visible at a glance.
- **Scale of content.** 1,000+ conditions is enough that almost any common disease has *some* representation, and the breadth itself is the marketing story.
- **Distribution polish.** The embed SDK and iframe model means BioDigital scenes show up everywhere — in pharma patient sites, in hospital portals, in textbook companion sites — without users noticing they're using BioDigital. This is how the platform reaches 100M conversations.
- **Mobile + VR + AR coverage.** All paths are real builds, not press releases. The brand visibly invests in every surface.

## What it does badly (or has chosen not to do)

- **No metabolism, no time-resolved physiology.** The headline architectural choice. This is what makes BioDigital and our project complementary rather than competing.
- **Walled-garden licensing.** Free tier is deliberately restrictive; pricing for institutions is opaque. Class plans start at $15/student/year — modest but not free, which puts BioDigital out of reach for community schools, public libraries, free clinics, etc.
- **Authoring is the customer's job.** A pharma company building a patient-education site has to use Human Studio to compose scenes; BioDigital is a platform, not a finished product. This is fine for paying customers; for a curious end-user, the available scenes are someone else's choice.
- **Citations are weak.** Doody's and educator reviews call out the Wikipedia-lean as a credibility issue.
- **Limited educator scaffolding.** Per Visible Body's comparison piece, BioDigital ships almost no premade curriculum or aligned-to-textbook content — the platform is a substrate, not a syllabus. Visible Body Courseware specifically markets *against* this gap.

## What to borrow

- **Always-visible body silhouette as home.** Our Whole Body view (Section 5) is the same idea. BioDigital validates that this is the right home.
- **Click-to-inspect over menu navigation.** The user clicks the liver and a detail panel opens. We should make sure this is the dominant interaction in our Whole Body view, not "open the liver tab."
- **Condition as a 3D state.** A user starting a scenario with type 2 diabetes (Section 10 example #14) should land on a body that *visibly carries the condition* — pancreas glow tinted, vessel state shifted, fat distribution shifted — without having to read a paragraph. This is BioDigital's "condition view" pattern.
- **URL as state.** A BioDigital scene has its own URL; pasting it into chat brings the recipient to the same scene. We commit to this in `design.md` Section 10 (URL-fragment scenario sharing); BioDigital validates the pattern at scale.
- **Embed-friendly.** A future "embed our simulator in your blog post" path is a minor architectural commitment now (the bundle has to be reasonably self-contained and accept query parameters that configure the scenario). Not a v1 priority but worth keeping the door open.
- **Free first-touch with view limits.** BioDigital's free tier is monthly-capped; ours can be uncapped (we have no cost) but the *idea* of "land, browse, share, no account required" is the same — and we beat them on it.

## What to avoid

- **Don't ape BioDigital's visual realism.** Our brief says "stylized, not photorealistic" (Section 4 / Section 14). 3D-medical-illustration realism is BioDigital's brand; ours is closer to PhET / Kurzgesagt — diagrammatic, friendly, readable. Trying to compete on photorealism is a losing trade-off given our budget and the wrong outcome for our audience.
- **Don't gate the meaningful content.** BioDigital's 10-views-per-month free cap is a sensible monetisation move and a frustrating user experience. We don't have a monetisation requirement — keep the whole thing free and unaccount-gated.
- **Don't outsource curriculum to users.** BioDigital's "users compose scenes via Human Studio" is great if you have institutional customers; for our audience the *built-in* scenarios (Section 10) are the value proposition. Ship a strong default set; user-composition is gravy.
- **Don't lean on Wikipedia for descriptions.** Background notes in our `background/` folder are the source of truth for the science; their plain-language paraphrases drive the UI text. Reviewers should see "this paragraph cites Wolfsdorf 2014" not "this paragraph excerpts Wikipedia."
- **Don't require reload to switch views.** Switching among Whole Body / Fuel Flows / Hormones / Long-Term State must be seamless and instant — the simulation state is preserved, only the rendering changes. This is `design.md` Section 5's existing commitment; BioDigital's reload pattern is a counter-example we should not replicate.
- **Don't forget mobile.** BioDigital is best on desktop; we should be at least *good* on phones. Section 14's Compact density level is the right framework.

## How its existence affects our project

**Complementary, sharply.** BioDigital owns "browse the anatomy of conditions"; we own "watch the body operate over time." A user who's seen a BioDigital scene of a fatty liver is well-prepared to land in our Long-Term State view and watch the same liver develop over a decade.

**Bar-setter, not competitor.** Production polish, onboarding, navigation patterns — BioDigital sets the standard. We don't have to match their 3D-asset budget, but we have to match their *legibility*. A non-specialist needs to land and orient in under a minute.

**Embed possibility worth holding open.** A future where our simulator drops into a Wolters-Kluwer-style platform alongside BioDigital scenes — anatomy from one, dynamics from the other — is plausible and not blocked by our v1 architecture. Worth not painting ourselves out of it.

**Free as positioning.** BioDigital's freemium model has a hard ceiling at 10 views/month. We are not freemium; we are free, period. For users (especially K-12 teachers, public-health educators, low-resource clinics, anyone outside an institution) for whom BioDigital is locked behind a paywall, we are a real alternative on the parts of the brief we cover.

## Pointers

- **Status:** alive, growing, well-funded. 5M+ users, top-tier enterprise customers, partnerships with Anatomage and Wolters Kluwer.
- **Homepage:** https://www.biodigital.com/
- **Pricing:** https://pricing.biodigital.com/
- **School pricing:** https://pricing.biodigital.com/school.html
- **Viewer (free with account):** https://human.biodigital.com/
- **Wolters Kluwer integration:** https://www.wolterskluwer.com/en/solutions/lippincott-medicine/medical-education/bio-digital
- **Doody's review (June 2025):** https://dcdm.doody.com/2025/06/a-review-of-the-biodigital-human/
- **Visible Body's comparison piece:** https://www.visiblebody.com/blog/how-does-visible-body-courseware-compare-with-the-biodigital-human
- **Saved image:** `images/biodigital.png` (multi-device hero from biodigital.com)
