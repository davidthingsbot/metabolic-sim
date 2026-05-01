import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRun } from '../../runs/runFactory';
import { createShellSnapshot } from '../../models/shellSnapshot';
import {
  createPlannerCellMeals,
  createPlannerDraftFromTimelinePosition,
  createPlannerDraftFromTimelineSlot,
  createPlannerEventPlacement,
  formatPlannerDayLabel,
  getVisiblePlannerDays,
} from './ShellMidsectionView';

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
    expect(eventPlannerSnapshot.bands.midsection.title).toBe('');
    expect(eventPlannerSnapshot.bands.midsection.copy).toBe('');
    expect(eventPlannerSnapshot.bands.midsection.detailCards).toEqual([]);
  });

  it('derives visible planner days from the selected lane duration', () => {
    expect(getVisiblePlannerDays({
      id: 'lane-custom-2d',
      label: 'Custom · 2 days',
      placementLabel: 'Cycle placement',
      cycleDurationMinutes: 2880,
    }, [])).toEqual([0, 1]);
  });

  it('maps a blank planner timeline click into a new draft time slot', () => {
    expect(createPlannerDraftFromTimelineSlot(1, 14)).toEqual({
      day: 1,
      timeOfDay: '14:00',
    });
  });

  it('filters planner meals to the clicked lane/day/hour cell', () => {
    expect(createPlannerCellMeals('lane-daily', [
      {
        id: 'meal-1',
        label: 'Daily · day 0 · 08:00 · 30 min · 45 g carbs',
        laneId: 'lane-daily',
        day: 0,
        timeOfDay: '08:00',
        durationMinutes: 30,
        carbsGrams: 45,
      },
      {
        id: 'meal-2',
        label: 'Daily · day 0 · 09:00 · 30 min · 20 g carbs',
        laneId: 'lane-daily',
        day: 0,
        timeOfDay: '09:00',
        durationMinutes: 30,
        carbsGrams: 20,
      },
    ], 0, 8).map((meal) => meal.id)).toEqual(['meal-1']);
  });

  it('labels planner day headings with words instead of D-prefixed indexes', () => {
    expect(formatPlannerDayLabel(0)).toBe('Day zero');
    expect(formatPlannerDayLabel(1)).toBe('Day one');
    expect(formatPlannerDayLabel(7)).toBe('Day seven');
    expect(formatPlannerDayLabel(12)).toBe('Day 12');
  });

  it('rounds vertical timeline clicks to the nearest 15-minute draft time', () => {
    expect(createPlannerDraftFromTimelinePosition(2, 150, 240)).toEqual({
      day: 2,
      timeOfDay: '15:00',
    });
    expect(createPlannerDraftFromTimelinePosition(2, 153, 240)).toEqual({
      day: 2,
      timeOfDay: '15:15',
    });
    expect(createPlannerDraftFromTimelinePosition(2, 154, 240)).toEqual({
      day: 2,
      timeOfDay: '15:30',
    });
  });

  it('computes a narrow vertical timeline event placement from start time and duration', () => {
    expect(createPlannerEventPlacement('08:15', 90)).toEqual({
      topPercent: 34.38,
      heightPercent: 6.25,
    });
  });

  it('keeps planner day tracks with small corner rounding so top and bottom ticks stay visible', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const dayTrackRule = stylesheet.match(/\.planner-day-track\s*\{[\s\S]*?border-radius:\s*([^;]+);[\s\S]*?\}/);

    expect(dayTrackRule?.[1]?.trim()).toBe('0.75rem');
  });

  it('anchors the planner timeline to the top and stretches it to fill the available height', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const detailFieldRule = stylesheet.match(/\.detail-field\s*\{[\s\S]*?height:\s*([^;]+);[\s\S]*?align-content:\s*([^;]+);[\s\S]*?\}/);
    const plannerDetailRule = stylesheet.match(/\.detail-field-planner\s*\{[\s\S]*?align-content:\s*([^;]+);[\s\S]*?grid-template-rows:\s*([^;]+);[\s\S]*?\}/);
    const panelRule = stylesheet.match(/\.planner-panel\s*\{[\s\S]*?grid-template-rows:\s*([^;]+);[\s\S]*?height:\s*([^;]+);[\s\S]*?\}/);
    const timelineRule = stylesheet.match(/\.planner-timeline\s*\{[\s\S]*?height:\s*([^;]+);[\s\S]*?\}/);
    const gridRule = stylesheet.match(/\.planner-timeline-grid\s*\{[\s\S]*?height:\s*([^;]+);[\s\S]*?\}/);
    const dayTrackRule = stylesheet.match(/\.planner-day-track\s*\{[\s\S]*?height:\s*([^;]+);[\s\S]*?\}/);

    expect(detailFieldRule?.[1]?.trim()).toBe('100%');
    expect(detailFieldRule?.[2]?.trim()).toBe('start');
    expect(plannerDetailRule?.[1]?.trim()).toBe('stretch');
    expect(plannerDetailRule?.[2]?.trim()).toBe('minmax(0, 1fr)');
    expect(panelRule?.[1]?.trim()).toBe('minmax(0, 1fr) minmax(0, 1fr)');
    expect(panelRule?.[2]?.trim()).toBe('100%');
    expect(timelineRule?.[1]?.trim()).toBe('100%');
    expect(gridRule?.[1]?.trim()).toBe('100%');
    expect(dayTrackRule?.[1]?.trim()).toBe('100%');
  });

  it('draws each planner day as a 3px black vertical line with checkmarks aligned to hourly labels', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const dayLineRule = stylesheet.match(/\.planner-day-line\s*\{[\s\S]*?top:\s*([^;]+);[\s\S]*?bottom:\s*([^;]+);[\s\S]*?width:\s*([^;]+);[\s\S]*?background:\s*([^;]+);[\s\S]*?\}/);
    const hourRowsRule = stylesheet.match(/\.planner-hour-rows\s*\{[\s\S]*?inset:\s*([^;]+);[\s\S]*?\}/);
    const hourRowRule = stylesheet.match(/\.planner-hour-row\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);
    const hourCheckRule = stylesheet.match(/\.planner-hour-check\s*\{[\s\S]*?width:\s*([^;]+);[\s\S]*?border-top:\s*([^;]+);[\s\S]*?\}/);

    expect(dayLineRule?.[1]?.trim()).toBe('0.5rem');
    expect(dayLineRule?.[2]?.trim()).toBe('0.5rem');
    expect(dayLineRule?.[3]?.trim()).toBe('3px');
    expect(dayLineRule?.[4]?.trim()).toBe('#000');
    expect(hourRowsRule?.[1]?.trim()).toBe('0.5rem 0');
    expect(hourRowRule?.[1]?.trim()).toBe('3rem 1rem');
    expect(hourCheckRule?.[1]?.trim()).toBe('0.55rem');
    expect(hourCheckRule?.[2]?.trim()).toBe('1px solid #000');
  });

  it('renders planner events offset beside the vertical line without covering the hour labels', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const eventRule = stylesheet.match(/\.planner-track-event\s*\{[\s\S]*?left:\s*([^;]+);[\s\S]*?width:\s*([^;]+);[\s\S]*?\}/);

    expect(eventRule?.[1]?.trim()).toBe('4.25rem');
    expect(eventRule?.[2]?.trim()).toBe('1.1rem');
  });

  it('omits the existing-meals picker from the add-event form', () => {
    const source = readFileSync(resolve(__dirname, './ShellMidsectionView.ts'), 'utf8');

    expect(source).not.toContain('Existing meals');
    expect(source).not.toContain('Create new meal');
  });

  it('splits the event editor into settings and detail-selector halves', () => {
    const source = readFileSync(resolve(__dirname, './ShellMidsectionView.ts'), 'utf8');
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const editorBodyRule = stylesheet.match(/\.planner-editor-body\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);
    const mobileEditorBodyRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.planner-editor-body\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);

    expect(source).toContain('planner-editor-settings');
    expect(source).toContain('planner-detail-selector');
    expect(source).toContain('Details');
    expect(editorBodyRule?.[1]?.trim()).toBe('minmax(0, 1fr) minmax(0, 1fr)');
    expect(mobileEditorBodyRule?.[1]?.trim()).toBe('minmax(0, 1fr)');
  });

  it('stacks body-status capsules before they become too narrow', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const overviewRule = stylesheet.match(/\.overview-bar\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);
    const resultsRule = stylesheet.match(/\n\.live-results-grid\s*\{\s*grid-template-columns:\s*([^;]+);[\s\S]*?\}/);

    expect(overviewRule?.[1]?.trim()).toBe('repeat(auto-fit, minmax(9rem, 1fr))');
    expect(resultsRule?.[1]?.trim()).toBe('repeat(auto-fit, minmax(11rem, 1fr))');
  });

  it('stacks the mobile workspace selector vertically when the rail moves above content', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const workspaceToggleRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.workspace-toggle\s*\{[\s\S]*?flex-direction:\s*([^;]+);[\s\S]*?\}/);

    expect(workspaceToggleRule?.[1]?.trim()).toBe('column');
  });

  it('uses a single-column mobile shell so the workspace rail does not squeeze the content', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const mobileRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.shell-split\.shell-midsection\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);
    const mobileDividerRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.shell-divider\.shell-split-divider\s*\{[\s\S]*?display:\s*([^;]+);[\s\S]*?\}/);

    expect(mobileRule?.[1]?.trim()).toBe('minmax(0, 1fr)');
    expect(mobileDividerRule?.[1]?.trim()).toBe('none');
  });

  it('turns the workspace rail into a horizontally scrollable mobile control strip', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const railRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.systems-rail\s*\{[\s\S]*?overflow-x:\s*([^;]+);[\s\S]*?\}/);
    const chipRule = stylesheet.match(/@media \(max-width: 639px\) \{[\s\S]*?\.system-chip\s*\{[\s\S]*?min-width:\s*([^;]+);[\s\S]*?\}/);

    expect(railRule?.[1]?.trim()).toBe('auto');
    expect(chipRule?.[1]?.trim()).toBe('8.5rem');
  });

});
