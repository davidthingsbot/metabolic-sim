import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { applyEvent } from './events';
import { step } from './step';

/**
 * End-to-end Phase 1 acceptance test. A 50 g carbohydrate meal at t=0,
 * stepped at 1-minute resolution for 4 hours. The blood glucose curve
 * should match the qualitative shape described in
 * `background/metabolic-pathways.md` §2 "Blood glucose":
 *   - rises after the meal
 *   - peaks somewhere in the 30–60 minute range
 *   - returns toward fasting baseline by 2–3 hours
 *
 * This test asserts shape, not specific calibrated values. Phase 3
 * settles the numerical constants against reference curves.
 */
describe('end-to-end: 50 g meal post-prandial blood glucose curve', () => {
  function runMealScenario(carbsGrams: number, totalMinutes: number) {
    const s = createInitialState();
    applyEvent(s, { type: 'meal', carbsGrams });
    const samples: { minute: number; blood: number; insulin: number }[] = [];
    for (let m = 1; m <= totalMinutes; m++) {
      step(s, 60);
      samples.push({
        minute: m,
        blood: s.substances.glucose.blood,
        insulin: s.hormones.insulin,
      });
    }
    return { state: s, samples };
  }

  it('blood glucose rises in the first 30 minutes', () => {
    const { samples } = runMealScenario(50, 30);
    const initial = 5;
    const finalBlood = samples[samples.length - 1].blood;
    expect(finalBlood).toBeGreaterThan(initial);
  });

  it('insulin rises with blood glucose', () => {
    const { samples } = runMealScenario(50, 30);
    const peakInsulin = Math.max(...samples.map((s) => s.insulin));
    expect(peakInsulin).toBeGreaterThan(10);
  });

  it('blood glucose peaks well after the meal but well before the run ends', () => {
    // Phase 1 explicitly does not promise calibrated peak timing — this
    // bound is loose ("the curve has a peak in the middle of the run, not
    // at minute 1 and not at minute 240"). Phase 3 calibrates against
    // reference postprandial curves and tightens to 30-60 minutes.
    const { samples } = runMealScenario(50, 240);
    const peakIndex = samples.reduce(
      (best, sample, i) => (sample.blood > samples[best].blood ? i : best),
      0,
    );
    const peakMinute = samples[peakIndex].minute;
    expect(peakMinute).toBeGreaterThan(5);
    expect(peakMinute).toBeLessThan(120);
  });

  it('blood glucose returns toward baseline within 4 hours', () => {
    const { samples } = runMealScenario(50, 240);
    const final = samples[samples.length - 1].blood;
    // Within 1 g of fasting (5 g) — i.e. concentration within ~20 mg/dL of fasting.
    expect(final).toBeLessThan(6);
  });

  it('conserves total glucose across the run (gut + blood + cells = initial blood + meal)', () => {
    const { state } = runMealScenario(50, 240);
    const total =
      state.substances.glucose.gut +
      state.substances.glucose.blood +
      state.substances.glucose.cells;
    // Initial blood (5) + meal (50) = 55
    expect(total).toBeCloseTo(55, 4);
  });
});
