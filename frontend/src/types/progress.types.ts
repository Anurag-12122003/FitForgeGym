export interface WeightLogEntry {
  date: string;
  weightKg: number;
}

export interface MeasurementRecord {
  id: string;
  date: string;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  armsCm: number;
  thighsCm: number;
}

export interface LifetimeStats {
  totalWorkouts: number;
  totalVolumeKg: number;
  currentStreakDays: number;
  avgWeeklyCalories: number;
}