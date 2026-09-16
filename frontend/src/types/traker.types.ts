export interface TrackedSet {
  id: string;
  setNumber: number;
  prevWeightKg: number;
  prevReps: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
}

export interface TrackedExercise {
  id: string;
  name: string;
  muscle: string;
  targetRestSeconds: number;
  sets: TrackedSet[];
}