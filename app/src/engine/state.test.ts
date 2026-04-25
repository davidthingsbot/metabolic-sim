import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';

describe('initial state', () => {
  it('starts at simulated time zero', () => {
    const s = createInitialState();
    expect(s.simulatedTime).toBe(0);
  });

  it('starts with fasting blood glucose around 5 g (~90 mg/dL × 5 L blood)', () => {
    // Provenance: metabolic-pathways.md §2 "Blood glucose"
    // Fasting concentration 70-100 mg/dL; in 5 L blood ≈ 4.5 g.
    const s = createInitialState();
    expect(s.substances.glucose.blood).toBeCloseTo(5, 0);
  });

  it('starts with no glucose in the gut (fasted)', () => {
    const s = createInitialState();
    expect(s.substances.glucose.gut).toBe(0);
  });

  it('starts with fasting insulin around 10 µU/mL', () => {
    // Provenance: metabolic-pathways.md §4 "Insulin"
    // Fasting insulin typically 5-15 µU/mL.
    const s = createInitialState();
    expect(s.hormones.insulin).toBeCloseTo(10, 0);
  });
});
