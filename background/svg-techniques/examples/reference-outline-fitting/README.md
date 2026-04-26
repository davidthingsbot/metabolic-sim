# Reference Outline Fitting

This experiment asks whether the parametric body outline can be judged against
the generated reference grids with a closed measurement loop instead of more
hand tuning.

It copies the current `outline-morph-body` generator and the male/female
reference grids into this folder so the page is self-contained. The browser
loads one grid cell by sex, age, and body-size row, thresholds the line art, and
builds a scanline envelope silhouette from the outer ink. This is more robust
than flood-filling because the reference drawings have small outline gaps. The
generated SVG goes through the same process. The page then overlays target-only
area, generated-only area, and overlap, and reports width and centerline error
at named body bands.

What this confirms: the reference images can be turned into measurable target
silhouettes without manually tracing them first. What remains open: the current
measure is still whole-envelope based, so arm position can affect torso bands.
The next step is to add a small optimizer that changes anatomical coefficients
and minimizes this score across a calibration set.

Run it with:

```sh
python3 -m http.server
```

from this directory, then open `http://127.0.0.1:8000/`.
