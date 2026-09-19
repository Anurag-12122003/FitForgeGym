import { apiClient } from './client';

export interface EquipmentItem {
  id: string;
  name: string;
}

export const equipmentApi = {
  getAll: async (): Promise<EquipmentItem[]> => {
    const res = await apiClient.get('/equipment');
    return res.data;
  },
};