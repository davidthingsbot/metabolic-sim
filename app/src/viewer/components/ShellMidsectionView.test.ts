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

  it('maps a vertical timeline click to a minute-accurate planner draft', () => {
    expect(createPlannerDraftFromTimelinePosition(2, 150, 240)).toEqual({
      day: 2,
      timeOfDay: '15:00',
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

  it('anchors the planner timeline to the top and stretches day tracks to the full available height', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const timeAxisRule = stylesheet.match(/\.planner-time-axis\s*\{[\s\S]*?margin-top:\s*([^;]+);[\s\S]*?\}/);
    const dayTrackRule = stylesheet.match(/\.planner-day-track\s*\{[\s\S]*?height:\s*([^;]+);[\s\S]*?\}/);

    expect(timeAxisRule?.[1]?.trim()).toBe('0');
    expect(dayTrackRule?.[1]?.trim()).toBe('100%');
  });

  it('renders planner events as slimmer bars so they do not dominate the track width', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const eventRule = stylesheet.match(/\.planner-track-event\s*\{[\s\S]*?left:\s*([^;]+);[\s\S]*?width:\s*([^;]+);[\s\S]*?\}/);

    expect(eventRule?.[1]?.trim()).toBe('30%');
    expect(eventRule?.[2]?.trim()).toBe('40%');
  });

});
