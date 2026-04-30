# Trace Outline Fitting

This experiment asks whether an explicit raster-to-vector trace can produce a
better target for fitting the parametric body outline than raw scanline envelope
measurement.

It copies the current `outline-morph-body` generator and the male/female
reference grids into this folder so the page is self-contained. It also vendors
ImageTracer.js 1.2.6, a dependency-free JavaScript raster image tracer released
under the Unlicense / public domain. The browser loads one grid cell by sex,
age, and body-size row, thresholds it to black/white, runs ImageTracer on that
image data, and samples the traced line and quadratic segments. The generated SVG
goes through the same trace path.

The page now keeps the traced lines visible instead of hiding them behind a
filled region. It overlays target trace lines, generated trace lines, and
matching line pixels. It also infers named target control points from the traced
reference at anatomical height bands, compares those to the generator's named
control points, and includes that control-point loss in the optimizer score.

What this tests: whether tracing the reference drawing into vector segments can
produce usable target control points for the parametric generator. What remains
open: the current target inference is still heuristic. It picks outer traced
edges at named body-height bands, so hair and interior detail strokes can still
confuse some points. It is a first semantic-control extraction pass, not a solved
landmark detector.

Run it with:

```sh
python3 -m http.server
```

from this directory, then open `http://127.0.0.1:8000/`.
