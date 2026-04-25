import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { applyEvent } from './events';

describe('meal event', () => {
  it('places carbohydrate in the gut', () => {
    const s = createInitialState();
    applyEvent(s, { type: 'meal', carbsGrams: 50 });
    expect(s.substances.glucose.gut).toBe(50);
  });

  it('adds to whatever was already there', () => {
    const s = createInitialState();
    applyEvent(s, { type: 'meal', carbsGrams: 30 });
    applyEvent(s, { type: 'meal', carbsGrams: 20 });
    expect(s.substances.glucose.gut).toBe(50);
  });

  it('does not change blood glucose immediately (digestion takes time)', () => {
    const s = createInitialState();
    const before = s.substances.glucose.blood;
    applyEvent(s, { type: 'meal', carbsGrams: 50 });
    expect(s.substances.glucose.blood).toBe(before);
  });
});
