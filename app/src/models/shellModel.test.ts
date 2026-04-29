import { describe, expect, it } from 'vitest';
import { createRun } from '../runs/runFactory';
import { createShellModel } from './shellModel';

function createSampleRun() {
  const run = createRun({ name: 'Lunch Replay' });
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.substances.glucose.gut = 12.4;
  run.individuals[0].state.substances.glucose.cells = 18.6;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

function createStubSession(run = createSampleRun()) {
  let activeRun = structuredClone(run);
  const listeners = new Set<() => void>();

  return {
    getSnapshot() {
      return { activeRun: structuredClone(activeRun) };
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async updateActiveRun(update: (draft: typeof activeRun) => void) {
      const draft = structuredClone(activeRun);
      update(draft);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
  };
}

function createStubShellStateHost() {
  let snapshot: {
    workspace: 'body-status' | 'event-planner';
    selectedSystemId: 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system';
    theme: 'light' | 'dark';
  } = {
    workspace: 'body-status',
    selectedSystemId: 'whole-body',
    theme: 'light',
  };
  const listeners = new Set<() => void>();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot() {
      return { ...snapshot };
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setWorkspace(workspace: 'body-status' | 'event-planner') {
      snapshot = { ...snapshot, workspace };
      emit();
    },
    selectSystem(selectedSystemId: 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system') {
      snapshot = { ...snapshot, selectedSystemId };
      emit();
    },
    setTheme(theme: 'light' | 'dark') {
      snapshot = { ...snapshot, theme };
      emit();
    },
  };
}

describe('createShellModel', () => {
  it('derives the viewer snapshot from the engine host and default shell selections', () => {
    const model = createShellModel({
      engineHost: createStubSession(),
      shellStateHost: createStubShellStateHost(),
    });
    const snapshot = model.getSnapshot();

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.workspace.value).toBe('body-status');
    expect(snapshot.systems.find((system) => system.id === 'whole-body')?.isSelected).toBe(true);
    expect(snapshot.bands.header.viewerStatus).toBe('Viewing Whole Body');
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Whole Body snapshot',
      'Current focus',
      'Next body-status views',
    ]);
  });

  it('reacts to authoritative host updates from both engine and shell state', async () => {
    const engineHost = createStubSession();
    const shellStateHost = createStubShellStateHost();
    const model = createShellModel({ engineHost, shellStateHost });
    const viewerEvents: string[] = [];

    const unsubscribe = model.subscribe(() => {
      viewerEvents.push(model.getSnapshot().bands.header.highLevelStatus);
    });

    shellStateHost.setWorkspace('event-planner');
    shellStateHost.selectSystem('blood-system');
    await model.setPlaybackTime(7200);
    await engineHost.updateActiveRun((draft) => {
      draft.individuals[0].state.substances.glucose.blood = 8.5;
    });

    unsubscribe();

    const snapshot = model.getSnapshot();
    expect(snapshot.workspace.value).toBe('event-planner');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Planner timeline',
      'Selected lane',
      'Next planner actions',
    ]);
    expect(snapshot.bands.footer.playbackTime).toBe(7200);
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 8.5 g');
    expect(viewerEvents).toHaveLength(4);
  });
});