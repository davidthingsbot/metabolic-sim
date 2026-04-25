import type { State } from './state';
import { digestion, insulinResponse, cellularUptake } from './flows';

/**
 * Advance the simulation by a positive number of simulated seconds.
 *
 * Mutates state in place (per design.md §11 — single mutable state object,
 * advanced one step at a time). The Phase 1 step composes three flows in
 * sequence:
 *   1. digestion — gut → blood (first-order from gut contents)
 *   2. insulinResponse — instant insulin level from current blood glucose
 *   3. cellularUptake — blood → cells, gated by insulin
 * Time advances last so the next step sees the post-flow simulatedTime.
 *
 * Backwards motion is a separate read-only mechanism over history
 * (design.md §7); step itself only goes forward. Zero-deltas would let
 * callers ambiguously "tick" without progress, so they are rejected too.
 */
export function step(state: State, dtSeconds: number): void {
  if (dtSeconds <= 0) {
    throw new RangeError(`step requires dtSeconds > 0; got ${dtSeconds}`);
  }
  digestion(state, dtSeconds);
  insulinResponse(state, dtSeconds);
  cellularUptake(state, dtSeconds);
  state.simulatedTime += dtSeconds;
}
