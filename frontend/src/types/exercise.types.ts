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

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: Difficulty;
  defaultSets: number | string;
  defaultReps: string | number;
  restSeconds: number | string;
  caloriesBurnEstimate: string;
  imageUrl: string;
  instructions: string[];
  commonMistakes: string[];
}