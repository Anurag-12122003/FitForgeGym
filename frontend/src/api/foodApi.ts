import { apiClient } from './client';

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  imageUrl?: string;
}

export const foodApi = {
  getAll: async (): Promise<FoodItem[]> => {
    const res = await apiClient.get('/foods');
    return res.data;
  },
  createAdmin: async (payload: Partial<FoodItem>): Promise<FoodItem> => {
    const res = await apiClient.post('/foods/admin', payload);
    return res.data;
  },
  deleteAdmin: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/foods/admin/${id}`);
    return res.data;
  },
};