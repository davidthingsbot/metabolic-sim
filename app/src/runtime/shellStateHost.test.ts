import { describe, expect, it } from 'vitest';
import { createShellStateHost } from './shellStateHost';

describe('createShellStateHost', () => {
  it('exposes authoritative shell state snapshots and notifies subscribers on updates', () => {
    const host = createShellStateHost({ initialTheme: 'dark' });
    const events: string[] = [];

    const unsubscribe = host.subscribe(() => {
      const snapshot = host.getSnapshot();
      events.push(`${snapshot.workspace}:${snapshot.selectedSystemId}:${snapshot.enabledSubsystemIds.length}:${snapshot.theme}`);
    });

    host.setWorkspace('event-planner');
    host.selectSystem('blood-system');
    host.toggleSubsystem('arterial-flow');
    host.setTheme('light');
    host.setPlaying(true);
    unsubscribe();

    expect(host.getSnapshot()).toMatchObject({
      workspace: 'event-planner',
      selectedSystemId: 'blood-system',
      theme: 'light',
      isPlaying: true,
    });
    expect(host.getSnapshot().enabledSubsystemIds).not.toContain('arterial-flow');
    expect(host.getSnapshot().enabledSubsystemIds).toContain('venous-return');
    expect(host.getSnapshot().enabledSubsystemIds).toHaveLength(11);
    expect(events).toEqual([
      'event-planner:whole-body:12:dark',
      'event-planner:blood-system:12:dark',
      'event-planner:blood-system:11:dark',
      'event-planner:blood-system:11:light',
      'event-planner:blood-system:11:light',
    ]);
  });
});
