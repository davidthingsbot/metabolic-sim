import type { State } from './state';

/**
 * A meal event. Phase 1 models a single carb-only macronutrient flow;
 * subsequent phases extend MealEvent to the full food-library composition
 * (per `background/foods-library.md`).
 */
export interface MealEvent {
  type: 'meal';
  carbsGrams: number;
}

export type Event = MealEvent;

/**
 * Apply a calendar event to the state. Mutates in place.
 * Phase 1 supports only the meal event; the engine step's event queue
 * handling lands in Phase 5 (save/load/history).
 */
export function applyEvent(state: State, event: Event): void {
  if (event.type === 'meal') {
    state.substances.glucose.gut += event.carbsGrams;
  }
}
