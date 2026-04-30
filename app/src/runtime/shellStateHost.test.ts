import { describe, expect, it } from 'vitest';
import { createShellStateHost } from './shellStateHost';

describe('createShellStateHost', () => {
  it('exposes authoritative shell state snapshots and notifies subscribers on updates', () => {
    const host = createShellStateHost({ initialTheme: 'dark' });
    const events: string[] = [];

    const unsubscribe = host.subscribe(() => {
      const snapshot = host.getSnapshot();
      events.push(`${snapshot.workspace}:${snapshot.selectedSystemId}:${snapshot.enabledSubsystemIds.length}:${snapshot.theme}:${snapshot.labelMode}`);
    });

    host.setWorkspace('event-planner');
    host.selectSystem('lymph-system');
    host.setTheme('light');
    host.setLabelMode('scientific');
    host.setPlaying(true);
    unsubscribe();

    const snapshot = host.getSnapshot();
    expect(snapshot.selectedSystemId).toBe('whole-body');
    expect(snapshot.enabledSubsystemIds).not.toContain('lymph-system');
    expect(snapshot.enabledSubsystemIds).not.toContain('lymph-return');
    expect(snapshot.enabledSubsystemIds).toContain('venous-return');
    expect(snapshot.enabledSubsystemIds).toHaveLength(8);
    expect(events).toEqual([
      'event-planner:whole-body:12:dark:plain',
      'event-planner:whole-body:8:dark:plain',
      'event-planner:whole-body:8:light:plain',
      'event-planner:whole-body:8:light:scientific',
      'event-planner:whole-body:8:light:scientific',
    ]);
  });
});
