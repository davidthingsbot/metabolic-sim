# Metabolic Simulator

**Live: <https://davidthingsbot.github.io/metabolic-sim/>**

A browser-based simulator that shows, in plain language, what food does once you've eaten it.

You drop a hamburger onto a timeline, hit play, and watch — across the bloodstream, the liver, the muscles, the fat tissue, and the brain — what happens over the next twelve hours. Or you set up three fast-food meals a day, sedentary days, no exercise, and let it run for ten simulated years to see what happens to a healthy 20-year-old. Or you set up an endurance athlete's training week and watch the fuel mix shift hour by hour.

It runs entirely in the browser. There is no server, no account, nothing to install.

## Current status

The project is no longer just a design exercise: the first simulation engine skeleton is implemented under `app/src/engine/`, with meal events, time-stepping, glucose movement, and a first insulin-response loop already running under tests. In parallel, the visual research has gone a long way toward a style I like — especially through the body-based, mobile-first, controls, and low-density exploration passes — and has clarified the overall direction of the interface. The biggest surprise so far has been how hard it is to render a convincing reusable human outline that can span different ages, both sexes, and a meaningful range of body sizes without collapsing into either uncanny illustration or a combinatorial asset problem. That outline problem has been the main thing holding back the move from visual research into the first real whole-body view.

---

## What's the point?

Most explanations of metabolism are either too vague to be useful ("carbs turn into sugar") or too technical to be readable (acronyms three deep on every page). This simulator aims at the gap in between: every part of the system gets a name that describes what it does, and every quantity that matters is shown on screen and animated as time advances.

You should be able to see, with your own eyes:

- Why eating a big plate of pasta and then sitting still has a different effect than eating the same plate after a long run.
- Why the brain insists on Blood Sugar even when fat is plentiful.
- Why "stress causes weight gain" is a literal hormone story, not a metaphor.
- Why ten years of one pattern produces a different body than ten years of another.

---

## How it works (briefly)

Everything has a plain-language name. *Storage Hormone* is what most people call insulin. *Release Hormone* is glucagon. *Sugar Polymer Store* is glycogen. *Body Fat* is what's in fat tissue; *Muscle Fat* is the small fat reserve inside muscle cells. The scientific names are available on a label-mode toggle, and hover always reveals the alternate. The full mapping lives in `design/glossary.md`.

The body is laid out as a fixed anatomical schematic — heart, lungs, liver, gut, kidneys, brain, muscle groups, fat tissue, blood vessels, lymphatic paths. Substances flow between locations as little particles. Containers fill and drain. The schematic is the same every run; what differs is what's flowing where and what the longer-term tissues look like.

You can switch among several views without losing simulation state:

- **Whole Body** — the anatomical schematic.
- **Fuel Flows** — the abstracted logic of who's burning what.
- **Hormones** — what's locked, what's open, who's signaling.
- **Long-Term State** — body composition, muscle mass, vessel health. The view that matters when you're running months or years.
- **Timeline** — your calendar of meals, exercise, sleep.
- **Charts** — plot anything against time.

Time runs at any rate from real-time up to roughly a simulated year per real second. Every view has a one-click snapshot button.

---

## Inputs

You give it a starting body and a calendar. The body has settings for age, sex, mass, baseline composition, and starting fitness. The calendar has events:

- Meals and snacks (carbs, protein, fat, fibre, water, total energy in kilojoules)
- Hydration
- Exercise (intensity, duration, type)
- Sleep (timing, duration, quality)
- Light work and sedentary periods
- Stress events
- A small list of dietary supplements with documented modeled effects

Events can be one-off, daily, several times a day, every N days, or follow a weekly pattern.

You can run the calendar autonomously and watch, or step through it manually one event at a time.

---

## Built-in scenarios

The simulator ships with several scenarios you can load and modify:

- **Healthy 20-year-old, balanced diet** — the baseline reference.
- **Single Hamburger** — see what one fast-food meal actually does, hour by hour.
- **Years of Fast Food** — start healthy, eat fast food three times a day, sit still, run it for ten years.
- **Endurance Athlete** — high training volume, deliberate carbohydrate timing.
- **Sedentary Knowledge Worker** — typical office schedule, moderate diet, no formal exercise.
- **Aging Well** — moderate exercise, reasonable diet, thirty simulated years.
- **Intermittent Fasting** — same calories as baseline, compressed eating window.
- **Recovery from Acute Illness** — a brief fever and reduced appetite, watch the fuel flows shift.

Save your own scenarios. Share a scenario with someone by sending them a link — the entire setup encodes into the URL.

---

## Honest limits

The simulator is a teaching and exploration tool. It is **not** medical advice and **not** a diagnostic tool. The numbers it produces are the right shape — the curves bend the way real curves bend, the interactions go in the right directions, the long-term outcomes line up with what physiology textbooks describe — but they are not clinical-grade predictions about any specific person.

Some of the science the simulator depicts is genuinely contested. When a part of the model relies on a contested claim, the legend shows a small badge and the tooltip explains both what the simulator picked and where the disagreement lives. The default is humility, not authority.

All measurements are metric throughout.

---

## Running it

Open the page. That's all. The simulator is a single static site hosted on GitHub Pages.

Light and dark modes are both first-class. Snapshots respect whichever mode you captured them in.

### Running locally

The simulator lives in `app/` as a Vite + TypeScript project.

```sh
cd app
npm install
npm run dev      # http://localhost:5173/
```

The same `npm run build` command produces a static bundle under `app/dist/` that is identical in content to what GitHub Pages serves — Vite's `base` config flips between `/` (local) and `/metabolic-sim/` (Pages) automatically based on the `GITHUB_ACTIONS` env var.

### Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. Pages source must be set to "GitHub Actions" in the repository's Pages settings. No `gh-pages` branch is needed.

---

## Repository layout

```
README.md             you are here
AGENTS.md             guidelines for AI agents working in this repo
design/
  design.md           the design itself — what gets built and why
  plan.md             the build plan — phases, current status, change log
  README.md, AGENTS.md
background/
  README.md           research index with completion status
  AGENTS.md
  metabolic-pathways.md, foods-library.md, exercise-responses.md, ...
app/
  README.md, AGENTS.md
  (the simulator — empty until the build phases begin)
```

`design.md` is the *what*. `design/plan.md` is the *when*. The design itself stays stable; the plan moves with the work.

Start with `background/metabolic-pathways.md` if you want to understand the model. Start with `design/design.md` if you want to understand the simulator. Start with `design/plan.md` if you want to see what's done and what's next.
