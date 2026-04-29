import type { Run } from './types';

export interface BranchRunFromSnapshotOptions {
  sourceRun: Run;
  branchedName: string;
  snapshotTime: number;
}

function cloneRun<T>(value: T): T {
  return structuredClone(value);
}

export function branchRunFromSnapshot(
  options: BranchRunFromSnapshotOptions,
): Run {
  const branched = cloneRun(options.sourceRun);
  branched.id = `run-branch-${Math.random().toString(36).slice(2, 10)}`;
  branched.name = options.branchedName;
  branched.activePlaybackTime = options.snapshotTime;
  return branched;
}
