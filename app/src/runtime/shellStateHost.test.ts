import { describe, expect, it } from 'vitest';
import { createShellStateHost } from './shellStateHost';

describe('createShellStateHost', () => {
  it('exposes authoritative shell state snapshots and notifies subscribers on updates', () => {
    const host = createShellStateHost({ initialTheme: 'dark' });
    const events: string[] = [];

    const unsubscribe = host.subscribe(() => {
      const snapshot = host.getSnapshot();
      events.push(`${snapshot.workspace}:${snapshot.selectedSystemId}:${snapshot.theme}`);
    });

    host.setWorkspace('event-planner');
    host.selectSystem('blood-system');
    host.setTheme('light');
    host.setPlaying(true);
    unsubscribe();

    expect(host.getSnapshot()).toEqual({
      workspace: 'event-planner',
      selectedSystemId: 'blood-system',
      theme: 'light',
      isPlaying: true,
    });
    expect(events).toEqual([
      'event-planner:whole-body:dark',
      'event-planner:blood-system:dark',
      'event-planner:blood-system:light',
      'event-planner:blood-system:light',
    ]);
  });
});
