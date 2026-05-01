import { describe, it, expect } from 'vitest';
import { createRun } from './runFactory';
import { branchRunFromSnapshot } from './branchRun';

const TWENTY_FIVE_YEARS_SECONDS = 788_400_000;

describe('branchRunFromSnapshot', () => {
  it('creates a new run from an existing recorded checkpoint and captures lineage metadata', () => {
    const source = createRun({ name: 'Source Run' });
    source.individuals[0].state.simulatedTime = 3600;
    source.individuals[0].state.substances.glucose.blood = 8.4;
    source.history.checkpoints.push({
      playbackTime: 1800,
      individuals: [
        {
          ...structuredClone(source.individuals[0]),
          state: {
            ...structuredClone(source.individuals[0].state),
            simulatedTime: 1800,
            substances: {
              glucose: {
                gut: 2.1,
                blood: 6.7,
                cells: 10.2,
              },
            },
          },
        },
      ],
    });

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Alternate Future',
      snapshotTime: 1800,
    });

    expect(branched.id).not.toBe(source.id);
    expect(branched.name).toBe('Alternate Future');
    expect(branched.activePlaybackTime).toBe(1800);
    expect(branched.lineage).toEqual({
      parentRunId: source.id,
      parentCheckpointTime: 1800,
      branchedAtPlaybackTime: 1800,
    });
    expect(branched.individuals[0].state.simulatedTime).toBe(1800);
    expect(branched.individuals[0].state.substances.glucose.blood).toBe(6.7);
    expect(branched.history.checkpoints).toEqual([
      {
        playbackTime: 1800,
        individuals: branched.individuals,
      },
    ]);
  });

  it('clones individuals instead of sharing references with the source run', () => {
    const source = createRun({ name: 'Shared Ref Test' });

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Branch',
      snapshotTime: source.activePlaybackTime,
    });

    branched.individuals[0].state.simulatedTime = 42;

    expect(source.individuals[0].state.simulatedTime).toBe(TWENTY_FIVE_YEARS_SECONDS);
  });

  it('preserves the schedule-lane structure in the branched run', () => {
    const source = createRun({ name: 'Schedule Preservation Test' });

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Branch',
      snapshotTime: source.activePlaybackTime,
    });

    expect(branched.scheduleLanes.map((lane) => lane.kind)).toEqual(
      source.scheduleLanes.map((lane) => lane.kind),
    );
  });

  it('preserves the original run unchanged after branching', () => {
    const source = createRun({ name: 'Immutable Source' });
    source.history.checkpoints.push({
      playbackTime: 900,
      individuals: [
        {
          ...structuredClone(source.individuals[0]),
          state: {
            ...structuredClone(source.individuals[0].state),
            simulatedTime: 900,
            substances: {
              glucose: {
                gut: 1.2,
                blood: 5.5,
                cells: 7.7,
              },
            },
          },
        },
      ],
    });

    const original = structuredClone(source);

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Branch',
      snapshotTime: 900,
    });

    branched.individuals[0].state.substances.glucose.blood = 9.9;

    expect(source).toEqual(original);
  });

  it('fails when the requested branch point is not a recorded checkpoint', () => {
    const source = createRun({ name: 'Missing Checkpoint' });

    expect(() =>
      branchRunFromSnapshot({
        sourceRun: source,
        branchedName: 'Branch',
        snapshotTime: 123,
      }),
    ).toThrow('Cannot branch run from missing checkpoint at playback time 123');
  });
});
