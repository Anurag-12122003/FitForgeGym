import { apiClient } from './client';
import type { ExerciseItem } from './exerciseApi';

export interface RoutineExercisePayload {
  exerciseId: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

export interface RoutineDayPayload {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  name: string;
  isRestDay: boolean;
  exercises: RoutineExercisePayload[];
}

export interface RoutinePayload {
  name: string;
  goal?: string;
  days: RoutineDayPayload[];
}

export interface RoutineResponse {
  id: string;
  userId: string;
  name: string;
  goal?: string;
  days: {
    id: string;
    dayOfWeek: RoutineDayPayload['dayOfWeek'];
    name: string;
    isRestDay: boolean;
    exercises: {
      id: string;
      order: number;
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
      exercise: ExerciseItem;
    }[];
  }[];
}

export const routineApi = {
  getMyRoutines: async (): Promise<RoutineResponse[]> => {
    const res = await apiClient.get('/routines');
    return res.data;
  },
  saveRoutine: async (payload: RoutinePayload): Promise<RoutineResponse> => {
    const res = await apiClient.post('/routines', payload);
    return res.data;
  },
  deleteRoutine: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/routines/${id}`);
    return res.data;
  },
};