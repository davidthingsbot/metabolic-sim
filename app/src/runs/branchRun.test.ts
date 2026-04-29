import { describe, it, expect } from 'vitest';
import { createRun } from './runFactory';
import { branchRunFromSnapshot } from './branchRun';

describe('branchRunFromSnapshot', () => {
  it('creates a new run from a historical snapshot time', () => {
    const source = createRun({ name: 'Source Run' });
    source.individuals[0].state.simulatedTime = 3600;

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Alternate Future',
      snapshotTime: 1800,
    });

    expect(branched.id).not.toBe(source.id);
    expect(branched.name).toBe('Alternate Future');
    expect(branched.activePlaybackTime).toBe(1800);
  });

  it('clones individuals instead of sharing references with the source run', () => {
    const source = createRun({ name: 'Shared Ref Test' });

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Branch',
      snapshotTime: 0,
    });

    branched.individuals[0].state.simulatedTime = 42;

    expect(source.individuals[0].state.simulatedTime).toBe(0);
  });

  it('preserves the schedule-lane structure in the branched run', () => {
    const source = createRun({ name: 'Schedule Preservation Test' });

    const branched = branchRunFromSnapshot({
      sourceRun: source,
      branchedName: 'Branch',
      snapshotTime: 0,
    });

    expect(branched.scheduleLanes.map((lane) => lane.kind)).toEqual(
      source.scheduleLanes.map((lane) => lane.kind),
    );
  });
});
