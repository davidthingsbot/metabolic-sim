// Engine state types and initial state construction.
//
// Phase 1 scope: glucose substance across two locations (gut, blood) plus
// insulin as a single bloodstream hormone level. Subsequent phases extend
// this to the full set in design.md §11.

/** Substances tracked by the engine. v1 starts with glucose; full set in glossary.md. */
export type Substance = 'glucose';

/** Locations substances can be in. v1 minimal; full anatomy in design.md §4. */
export type Location = 'gut' | 'blood' | 'cells';

/** Hormones tracked by the engine. v1 starts with insulin; full set in glossary.md. */
export type Hormone = 'insulin';

/** Single mutable state object the engine advances one step at a time. */
export interface State {
  /** Seconds since scenario start. */
  simulatedTime: number;
  /** Grams of each substance in each location. */
  substances: Record<Substance, Record<Location, number>>;
  /** Bloodstream level of each hormone in its native physiological unit. */
  hormones: Record<Hormone, number>;
}

/**
 * @provenance background/metabolic-pathways.md §2 "Blood glucose"
 * Fasting blood glucose 70-100 mg/dL × 5 L blood volume ≈ 4.5 g.
 * Phase 3 will calibrate against the per-substance reference curves;
 * this value is "the right shape" not clinical precision.
 */
const FASTING_BLOOD_GLUCOSE_G = 5;

/**
 * @provenance background/metabolic-pathways.md §4 "Insulin"
 * Fasting insulin typically 5-15 µU/mL.
 */
const FASTING_INSULIN_UU_PER_ML = 10;

export function createInitialState(): State {
  return {
    simulatedTime: 0,
    substances: {
      glucose: {
        gut: 0,
        blood: FASTING_BLOOD_GLUCOSE_G,
        cells: 0,
      },
    },
    hormones: {
      insulin: FASTING_INSULIN_UU_PER_ML,
    },
  };
}
