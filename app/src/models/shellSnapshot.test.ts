import { describe, expect, it } from 'vitest';
import { createRun } from '../runs/runFactory';
import { createShellSnapshot } from './shellSnapshot';

function createSampleRun() {
  const run = createRun({ name: 'Lunch Replay' });
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

describe('createShellSnapshot', () => {
  it('builds body-status placeholders around the chosen run and system', () => {
    const snapshot = createShellSnapshot({
      run: createSampleRun(),
      workspace: 'body-status',
      selectedSystemId: 'blood-system',
      theme: 'light',
    });

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 6.2 g');
    expect(snapshot.bands.header.highLevelStatus).toContain('signal 18.0 µU/mL');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Blood System snapshot',
      'Current focus',
      'Next body-status views',
    ]);
  });

  it('switches the detail placeholders for the event-planner workspace', () => {
    const snapshot = createShellSnapshot({
      run: createSampleRun(),
      workspace: 'event-planner',
      selectedSystemId: 'whole-body',
      theme: 'dark',
    });

    expect(snapshot.workspace.label).toBe('Event Planner');
    expect(snapshot.bands.header.themeToggleLabel).toBe('Light mode');
    expect(snapshot.theme).toBe('dark');
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Planner timeline',
      'Selected lane',
      'Next planner actions',
    ]);
  });
});
