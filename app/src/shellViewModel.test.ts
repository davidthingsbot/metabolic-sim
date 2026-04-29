import { describe, expect, it } from 'vitest';
import { createRun } from './runs/runFactory';
import { createShellViewModel } from './shellViewModel';

function createSampleRun() {
  const run = createRun({ name: 'Lunch Replay' });
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

describe('createShellViewModel', () => {
  it('builds body-status placeholders around the chosen run and system', () => {
    const viewModel = createShellViewModel({
      run: createSampleRun(),
      workspace: 'body-status',
      selectedSystemId: 'blood-system',
    });

    expect(viewModel.runName).toBe('Lunch Replay');
    expect(viewModel.highLevelStatus).toContain('Blood sugar 6.2 g');
    expect(viewModel.highLevelStatus).toContain('signal 18.0 µU/mL');
    expect(viewModel.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(viewModel.detailCards.map((card) => card.title)).toEqual([
      'Blood System snapshot',
      'Current focus',
      'Next body-status views',
    ]);
  });

  it('switches the detail placeholders for the event-planner workspace', () => {
    const viewModel = createShellViewModel({
      run: createSampleRun(),
      workspace: 'event-planner',
      selectedSystemId: 'whole-body',
    });

    expect(viewModel.workspaceLabel).toBe('Event Planner');
    expect(viewModel.detailCards.map((card) => card.title)).toEqual([
      'Planner timeline',
      'Selected lane',
      'Next planner actions',
    ]);
  });
});
