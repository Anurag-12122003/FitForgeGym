import { apiClient } from './client';

export interface AIGeneratedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

export interface AIGeneratedDay {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  name: string;
  isRestDay: boolean;
  exercises: AIGeneratedExercise[];
}

export interface AIGeneratedRoutineResponse {
  routineName: string;
  targetGoal: string;
  reasoning: string;
  days: AIGeneratedDay[];
}

export const aiApi = {
  generateRoutine: async (payload: {
    goal: string;
    experienceLevel: string;
    daysPerWeek: number;
    durationMinutes: number;
    heightCm:number;
    weightKg:number;
    age:number;
  }): Promise<AIGeneratedRoutineResponse> => {
    const res = await apiClient.post('/ai/generate-routine', payload);
    return res.data;
  },
};