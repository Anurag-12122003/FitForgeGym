export interface RoutineExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface DayRoutine {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  focusName: string;
  isRestDay: boolean;
  exercises: RoutineExerciseItem[];
}

export interface PredefinedPlan {
  id: string;
  title: string;
  goal: string;
  level: string;
  daysPerWeek: number;
  description: string;
  scheduleSummary: { day: string; focus: string }[];
}