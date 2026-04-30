import { describe, expect, it } from 'vitest';
import { createRun } from '../../runs/runFactory';
import { createShellSnapshot } from '../../models/shellSnapshot';

describe('ShellMidsection workspace visibility', () => {
  it('exposes systems/subsystems data only for body-status workspace', () => {
    const run = createRun({ name: 'Workspace Visibility' });

    const bodyStatusSnapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'whole-body',
      enabledSubsystemIds: ['blood-system', 'digestive-system', 'lymph-system', 'arterial-flow', 'storage-signal', 'stomach-processing', 'gut-absorption', 'liver-hand-off', 'lymph-return', 'tissue-drainage', 'gut-lacteals'],
      labelMode: 'plain',
      theme: 'light',
      isPlaying: false,
    });

    const eventPlannerSnapshot = createShellSnapshot({
      run,
      workspace: 'event-planner',
      selectedSystemId: 'blood-system',
      enabledSubsystemIds: ['arterial-flow', 'storage-signal'],
      labelMode: 'plain',
      theme: 'light',
      isPlaying: false,
    });

    expect(bodyStatusSnapshot.subsystems.map((subsystem) => subsystem.label)).toEqual([
      'Arterial flow',
      'Venous return',
      'Storage signal',
      'Stomach processing',
      'Gut absorption',
      'Liver hand-off',
      'Lymph return',
      'Tissue drainage',
      'Gut lacteals',
    ]);
    expect(bodyStatusSnapshot.subsystems.filter((subsystem) => subsystem.isEnabled).map((subsystem) => subsystem.label)).toEqual([
      'Arterial flow',
      'Storage signal',
      'Stomach processing',
      'Gut absorption',
      'Liver hand-off',
      'Lymph return',
      'Tissue drainage',
      'Gut lacteals',
    ]);
    expect(bodyStatusSnapshot.bands.midsection.overviewMetrics.map((metric) => metric.label)).toEqual([
      'Body age',
      'Blood sugar',
      'Gut sugar',
      'Cell sugar',
      'Storage signal',
    ]);
    expect(bodyStatusSnapshot.bands.midsection.monitorCards.map((card) => card.title)).toEqual([
      'Blood System',
      'Digestive System',
      'Lymph System',
    ]);
    expect(eventPlannerSnapshot.subsystems).toEqual([]);
    expect(eventPlannerSnapshot.planner.laneOptions.map((lane) => lane.label)).toEqual(['One-Off', 'Daily']);
    expect(eventPlannerSnapshot.bands.midsection.detailCards).toEqual([]);
  });
});
