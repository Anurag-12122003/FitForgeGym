import { apiClient } from './client';

export interface ProgressMetricRecord {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  shouldersCm?: number | null;
  notes?: string | null;
}

export interface LifetimeSummary {
  completedSessions: number;
  totalTonnageKg: number;
}

export const progressApi = {
  getLogs: async (): Promise<ProgressMetricRecord[]> => {
    const res = await apiClient.get('/progress');
    return res.data;
  },
  logMetrics: async (payload: {
    weightKg: number;
    bodyFatPct?: number;
    chestCm?: number;
    waistCm?: number;
    armsCm?: number;
    thighsCm?: number;
  }): Promise<ProgressMetricRecord> => {
    const res = await apiClient.post('/progress', payload);
    return res.data;
  },
  getSummary: async (): Promise<LifetimeSummary> => {
    const res = await apiClient.get('/progress/summary');
    return res.data;
  },
};