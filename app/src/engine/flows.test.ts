import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { applyEvent } from './events';
import { digestion, insulinResponse, cellularUptake } from './flows';

const totalGlucose = (s: ReturnType<typeof createInitialState>): number =>
  s.substances.glucose.gut + s.substances.glucose.blood + s.substances.glucose.cells;

describe('digestion', () => {
  it('moves glucose from gut to blood over time', () => {
    const s = createInitialState();
    applyEvent(s, { type: 'meal', carbsGrams: 50 });
    const before = s.substances.glucose.blood;
    digestion(s, 60); // 1 minute
    expect(s.substances.glucose.blood).toBeGreaterThan(before);
    expect(s.substances.glucose.gut).toBeLessThan(50);
  });

  it('does nothing when the gut is empty', () => {
    const s = createInitialState();
    const before = { ...s.substances.glucose };
    digestion(s, 600);
    expect(s.substances.glucose.gut).toBe(before.gut);
    expect(s.substances.glucose.blood).toBe(before.blood);
  });

  it('conserves total glucose', () => {
    const s = createInitialState();
    applyEvent(s, { type: 'meal', carbsGrams: 50 });
    const before = totalGlucose(s);
    digestion(s, 600);
    expect(totalGlucose(s)).toBeCloseTo(before, 6);
  });
});

describe('insulin response', () => {
  it('matches fasting baseline when blood glucose is at fasting level', () => {
    const s = createInitialState();
    insulinResponse(s, 60);
    expect(s.hormones.insulin).toBeCloseTo(10, 1);
  });

  it('rises when blood glucose is elevated', () => {
    const s = createInitialState();
    s.substances.glucose.blood = 7; // 2 g above fasting
    insulinResponse(s, 60);
    expect(s.hormones.insulin).toBeGreaterThan(10);
  });

  it('does not go below baseline if blood glucose is at or below fasting', () => {
    const s = createInitialState();
    s.substances.glucose.blood = 4;
    insulinResponse(s, 60);
    expect(s.hormones.insulin).toBeGreaterThanOrEqual(10);
  });
});

describe('cellular uptake', () => {
  it('moves glucose from blood to cells when insulin is elevated and blood glucose is above fasting', () => {
    const s = createInitialState();
    s.substances.glucose.blood = 7;
    s.hormones.insulin = 70;
    const before = { ...s.substances.glucose };
    cellularUptake(s, 60);
    expect(s.substances.glucose.blood).toBeLessThan(before.blood);
    expect(s.substances.glucose.cells).toBeGreaterThan(before.cells);
  });

  it('does nothing when blood glucose is at fasting', () => {
    const s = createInitialState();
    s.hormones.insulin = 70;
    const before = { ...s.substances.glucose };
    cellularUptake(s, 60);
    expect(s.substances.glucose.blood).toBeCloseTo(before.blood, 6);
  });

  it('does nothing when insulin is at baseline (insulin gates the flow per metabolic-pathways §4)', () => {
    const s = createInitialState();
    s.substances.glucose.blood = 7;
    s.hormones.insulin = 10;
    const before = { ...s.substances.glucose };
    cellularUptake(s, 60);
    expect(s.substances.glucose.blood).toBeCloseTo(before.blood, 6);
  });

  it('conserves total glucose (blood loss = cells gain)', () => {
    const s = createInitialState();
    s.substances.glucose.blood = 7;
    s.hormones.insulin = 70;
    const before = totalGlucose(s);
    cellularUptake(s, 60);
    expect(totalGlucose(s)).toBeCloseTo(before, 6);
  });
});
