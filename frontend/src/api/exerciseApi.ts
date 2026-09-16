import { apiClient } from './client';

export interface ExerciseItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  defaultSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  imageUrl?: string;
  instructions?: string[];
  commonMistakes?: string[];
  muscles?: {
    role: 'PRIMARY' | 'SECONDARY';
    muscle: { id: string; name: string };
  }[];
  equipment?: { id: string; name: string } | null;
}

export const exerciseApi = {
  getAll: async (): Promise<ExerciseItem[]> => {
    const res = await apiClient.get('/exercises');
    return res.data;
  },

  createAdmin: async (payload: any): Promise<ExerciseItem> => {
    const res = await apiClient.post('/exercises/admin', payload);
    return res.data;
  },

  deleteAdmin: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/exercises/admin/${id}`);
    return res.data;
  },
};