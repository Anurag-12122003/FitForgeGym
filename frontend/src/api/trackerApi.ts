import { apiClient } from './client';

export interface LiveSetRecord {
  id: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
}

export const trackerApi = {
  startSession: async (name: string, routineId?: string) => {
    const res = await apiClient.post('/tracker/start', { name, routineId });
    return res.data;
  },
  logSet: async (sessionId: string, payload: { exerciseId: string; setNumber: number; weightKg: number; reps: number; isCompleted?: boolean }) => {
    const res = await apiClient.post(`/tracker/${sessionId}/sets`, payload);
    return res.data;
  },
  finishSession: async (sessionId: string, payload: { durationSeconds: number; notes?: string }) => {
    const res = await apiClient.put(`/tracker/${sessionId}/finish`, payload);
    return res.data;
  },
  getPreviousBest: async (exerciseId: string): Promise<LiveSetRecord[]> => {
    const res = await apiClient.get(`/tracker/previous-best/${exerciseId}`);
    return res.data;
  },
};