import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { step } from './step';

describe('step', () => {
  it('advances simulated time by the requested delta', () => {
    const s = createInitialState();
    step(s, 60);
    expect(s.simulatedTime).toBe(60);
  });

  it('accumulates across multiple steps', () => {
    const s = createInitialState();
    step(s, 60);
    step(s, 30);
    step(s, 10);
    expect(s.simulatedTime).toBe(100);
  });

  it('handles fractional seconds', () => {
    const s = createInitialState();
    step(s, 0.5);
    step(s, 0.25);
    expect(s.simulatedTime).toBeCloseTo(0.75, 5);
  });

  it('rejects non-positive deltas (engine never moves backwards mid-step)', () => {
    // Backwards play is a separate read-from-history mechanism (design.md §7),
    // not a feature of step itself.
    const s = createInitialState();
    expect(() => step(s, 0)).toThrow();
    expect(() => step(s, -1)).toThrow();
  });
});
