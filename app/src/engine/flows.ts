// Phase 1 flow functions. Each is a pure mutation on State for one
// physiological process. The engine step composes them in order; later
// phases parameterise the constants per food entry, body, and condition.
//
// All numerical constants below carry @provenance comments per design.md §11.
// Phase 3 will calibrate them against reference postprandial curves.

import type { State } from './state';

/**
 * @provenance background/metabolic-pathways.md §2 "Blood glucose" + §3 "Small intestine"
 * Fasting blood glucose 70-100 mg/dL; in 5 L of blood ≈ 4.5 g.
 */
const FASTING_BLOOD_GLUCOSE_G = 5;

/**
 * @provenance background/metabolic-pathways.md §4 "Insulin"
 * Fasting insulin typically 5-15 µU/mL.
 */
const FASTING_INSULIN_UU_PER_ML = 10;

/**
 * @provenance background/metabolic-pathways.md §3 "Small intestine"
 * First-order rate constant for carbohydrate transfer from gut to blood.
 * 0.025 / minute corresponds to a half-life of ~28 minutes for typical
 * mixed-meal carbohydrate digestion (per-food digestion-rate factor in
 * `background/foods-library.md` §3 will scale this in Phase 3).
 */
const DIGESTION_RATE_PER_MINUTE = 0.025;

/**
 * @provenance background/metabolic-pathways.md §4 "Insulin"
 * Linear approximation of the steady-state insulin level for a given
 * blood glucose elevation. Combined with INSULIN_TIME_CONSTANT_MIN,
 * gives a first-order approach to target (real β-cell response is
 * sigmoidal with phasic + tonic components; Phase 3 replaces with a
 * calibrated saturating curve).
 */
const INSULIN_GAIN_UU_PER_G = 30;

/**
 * @provenance background/metabolic-pathways.md §4 "Insulin"
 * Insulin rises with a time constant rather than instantaneously. ~15 min
 * is a Phase-1-acceptable approximation of the combined first- and second-
 * phase pancreatic response; the real curve is the sum of a fast pulse
 * (~5 min) and a slower tonic rise (~30 min). Phase 3 will split these.
 */
const INSULIN_TIME_CONSTANT_MIN = 15;

/**
 * @provenance background/metabolic-pathways.md §4 "Insulin" — cellular uptake
 * Cellular uptake rate proportional to (insulin excess) × (blood glucose excess).
 * Tuned so that a 50 g meal peaks in 30-60 minutes and returns to baseline
 * within ~3 hours. Phase 3 calibrates against reference curves.
 */
const CELLULAR_UPTAKE_K = 0.004;

/**
 * Move glucose from gut to blood. First-order: rate ∝ gut contents.
 * The continuous-time exponential decay is integrated exactly across the
 * step interval so the result is independent of step size for this flow.
 */
export function digestion(state: State, dtSeconds: number): void {
  const dtMinutes = dtSeconds / 60;
  const transfer =
    state.substances.glucose.gut *
    (1 - Math.exp(-DIGESTION_RATE_PER_MINUTE * dtMinutes));
  state.substances.glucose.gut -= transfer;
  state.substances.glucose.blood += transfer;
}

/**
 * Update insulin level from current blood glucose. First-order approach
 * to target — insulin lags blood glucose with a 10-minute time constant.
 * The exponential factor is integrated exactly across the step interval
 * so the result is independent of step size.
 */
export function insulinResponse(state: State, dtSeconds: number): void {
  const dtMinutes = dtSeconds / 60;
  const excess = Math.max(
    0,
    state.substances.glucose.blood - FASTING_BLOOD_GLUCOSE_G,
  );
  const target = FASTING_INSULIN_UU_PER_ML + INSULIN_GAIN_UU_PER_G * excess;
  const factor = 1 - Math.exp(-dtMinutes / INSULIN_TIME_CONSTANT_MIN);
  state.hormones.insulin += (target - state.hormones.insulin) * factor;
}

/**
 * Move glucose from blood to cells, gated by insulin elevation.
 * Uptake is zero when either insulin is at fasting baseline or blood
 * glucose is at or below fasting (per metabolic-pathways.md §4 — insulin
 * is the gate).
 */
export function cellularUptake(state: State, dtSeconds: number): void {
  const dtMinutes = dtSeconds / 60;
  const insulinExcess = Math.max(
    0,
    state.hormones.insulin - FASTING_INSULIN_UU_PER_ML,
  );
  const bloodExcess = Math.max(
    0,
    state.substances.glucose.blood - FASTING_BLOOD_GLUCOSE_G,
  );
  const ratePerMinute = CELLULAR_UPTAKE_K * insulinExcess * bloodExcess;
  // Clamp: never push blood glucose below fasting in a single step.
  const uptake = Math.min(ratePerMinute * dtMinutes, bloodExcess);
  state.substances.glucose.blood -= uptake;
  state.substances.glucose.cells += uptake;
}
