import type { IndividualRunState, Run } from './types';

export interface BranchRunFromSnapshotOptions {
  sourceRun: Run;
  branchedName: string;
  snapshotTime: number;
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createCheckpointIndividuals(run: Run, snapshotTime: number): IndividualRunState[] {
  const checkpoint = run.history.checkpoints.find((entry) => entry.playbackTime === snapshotTime);

  if (!checkpoint) {
    throw new Error(`Cannot branch run from missing checkpoint at playback time ${snapshotTime}`);
  }

  return structuredClone(checkpoint.individuals);
}

export function branchRunFromSnapshot(options: BranchRunFromSnapshotOptions): Run {
  const individuals = createCheckpointIndividuals(options.sourceRun, options.snapshotTime);

  return {
    ...structuredClone(options.sourceRun),
    id: createId('run'),
    name: options.branchedName,
    activePlaybackTime: options.snapshotTime,
    individuals,
    history: {
      checkpoints: [
        {
          playbackTime: options.snapshotTime,
          individuals: structuredClone(individuals),
        },
      ],
    },
    lineage: {
      parentRunId: options.sourceRun.id,
      parentCheckpointTime: options.snapshotTime,
      branchedAtPlaybackTime: options.snapshotTime,
    },
  };
}
