export type MuscleGroup =
  | 'All'
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Abs'
  | 'Calves';

export type Difficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED';

export type MuscleRole = 'PRIMARY' | 'SECONDARY';

export interface Muscle {
  id: string;
  name: string;
  slug: string;
  muscleGroupId: string;
  createdAt: string;
}

export interface ExerciseMuscle {
  id: string;
  exerciseId: string;
  muscleId: string;
  role: MuscleRole;
  muscle: Muscle;
}

export interface Equipment {
  id: string;
  name: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  difficulty: Difficulty;

  equipmentId: string | null;
  equipment: Equipment | null;

  videoUrl: string | null;
  imageUrl: string | null;

  instructions: string[];
  commonMistakes: string[];

  defaultSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;

  createdAt: string;
  updatedAt: string;

  userId: string | null;

  muscles: ExerciseMuscle[];
}
