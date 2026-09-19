import { z } from 'zod';

// 1. AI Generated Workout Validation
export const AIGeneratedWorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string(),
  sets: z.number().int().min(1).max(8),
  repsMin: z.number().int().min(1).max(50),
  repsMax: z.number().int().min(1).max(50),
  restSeconds: z.number().int().min(30).max(300),
});

export const AIGeneratedWorkoutDaySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  name: z.string().min(2),
  isRestDay: z.boolean(),
  exercises: z.array(AIGeneratedWorkoutExerciseSchema),
});

export const AIGeneratedRoutineSchema = z.object({
  routineName: z.string().min(3),
  targetGoal: z.string(),
  reasoning: z.string(),
  days: z.array(AIGeneratedWorkoutDaySchema).length(7),
});

export type AIGeneratedRoutine = z.infer<typeof AIGeneratedRoutineSchema>;

// 2. AI Meal Replacement & Food Alternative Validation
export const AIMealReplacementSchema = z.object({
  originalFoodId: z.string(),
  suggestedFoodId: z.string(),
  suggestedFoodName: z.string(),
  recommendedGrams: z.number().positive(),
  calorieDifference: z.number(),
  proteinDifference: z.number(),
  reasoning: z.string(),
});

export type AIMealReplacement = z.infer<typeof AIMealReplacementSchema>;