import type { LifetimeStats, MeasurementRecord, WeightLogEntry } from "../types/progress.types";

export const WEIGHT_HISTORY: WeightLogEntry[] = [
  { date: 'May 01', weightKg: 74.5 },
  { date: 'May 08', weightKg: 74.0 },
  { date: 'May 15', weightKg: 73.6 },
  { date: 'May 22', weightKg: 73.1 },
  { date: 'May 29', weightKg: 72.8 },
  { date: 'Jun 05', weightKg: 72.4 },
];

export const MEASUREMENT_HISTORY: MeasurementRecord[] = [
  { id: 'm_1', date: '2026-05-01', weightKg: 74.5, chestCm: 102, waistCm: 84, armsCm: 37, thighsCm: 58 },
  { id: 'm_2', date: '2026-05-15', weightKg: 73.6, chestCm: 102.5, waistCm: 82, armsCm: 37.5, thighsCm: 58.5 },
  { id: 'm_3', date: '2026-06-01', weightKg: 72.4, chestCm: 103, waistCm: 80.5, armsCm: 38, thighsCm: 59 },
];

export const LIFETIME_STATS: LifetimeStats = {
  totalWorkouts: 42,
  totalVolumeKg: 184500,
  currentStreakDays: 5,
  avgWeeklyCalories: 2380,
};