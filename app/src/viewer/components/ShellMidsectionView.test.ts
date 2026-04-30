import { describe, expect, it } from 'vitest';
import { createRun } from '../../runs/runFactory';
import { createShellSnapshot } from '../../models/shellSnapshot';

describe('ShellMidsection workspace visibility', () => {
  it('exposes systems/subsystems data only for body-status workspace', () => {
    const run = createRun({ name: 'Workspace Visibility' });

    const bodyStatusSnapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'blood-system',
      enabledSubsystemIds: ['arterial-flow', 'storage-signal'],
      theme: 'light',
      isPlaying: false,
    });

    const eventPlannerSnapshot = createShellSnapshot({
      run,
      workspace: 'event-planner',
      selectedSystemId: 'blood-system',
      enabledSubsystemIds: ['arterial-flow', 'storage-signal'],
      theme: 'light',
      isPlaying: false,
    });

    expect(bodyStatusSnapshot.subsystems.map((subsystem) => subsystem.label)).toEqual([
      'Arterial flow',
      'Venous return',
      'Storage signal',
    ]);
    expect(bodyStatusSnapshot.subsystems.filter((subsystem) => subsystem.isEnabled).map((subsystem) => subsystem.label)).toEqual([
      'Arterial flow',
      'Storage signal',
    ]);
    expect(eventPlannerSnapshot.subsystems).toEqual([]);
  });
});
