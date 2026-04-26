# Outline Morph Body

This experiment asks whether the body should be generated as one continuous
outline instead of separate torso, arm, and leg paths.

It tries a landmark model. Named points describe the visible contour from the
top of the head, down the right side of the body, through the foot and crotch,
then mirrored up the left side. A Catmull-Rom spline turns those points into a
single closed SVG path. Age, sex, and body mass index move the landmarks before
the path is built. Chest, belly, and crotch marks are drawn as optional detail
strokes layered over the outline.

This confirms the structural direction: one skin outline avoids the doubled
arm rails and armpit seams in `basic-body`. The current landmark values are
still rough, especially for young children and very high body mass index, but
they are easier to tune because each body region has a named point rather than
anonymous Bezier handles. Interior detail strokes are limited to chest, belly,
and crotch cues so the body does not acquire extra side-torso lines.

The web page includes a Guide overlay control. `Skeleton` shows the rough
bone-and-joint scaffold, `Control points` shows the spline landmarks, and
`Both` shows the two layers together. The overlay is emitted into exported SVGs
too, so debugging captures match the live page. The skeleton is intentionally
independent of body mass index: age and sex move joint dimensions, while body
mass index only changes soft-tissue offsets around that scaffold.
Female pelvic skeleton width now stays matched to male childhood proportions
until puberty, then ramps from about age 14 to mature width around age 19.
Breast detail follows the same puberty ramp and is deliberately modest; body
mass index only adds surface softness over those age/sex structures.

The page is organized into three tabs. `Single` shows the editable one-body
panel. `Male` and `Female` each show a Body Grid with three body mass index rows
(`18`, `27`, `36`) across eight ages (`3`, `6`, `10`, `15`, `20`, `35`, `55`,
`75`). Each grid has its own Guide overlay control so the same
skeleton/control-point checks can be applied across the whole parameter sweep
without horizontal scrolling between sexes.

Run it from this directory:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. For static review, run:

```sh
node render-grid.js --out /tmp/outline-morph-body-grid.png
```
