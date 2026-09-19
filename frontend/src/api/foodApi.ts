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
  // foodApi object ke andar add karo:
createUserFood: async (data: {
  name: string;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  file?: File;
}): Promise<FoodItem> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('servingAmount', String(data.servingAmount));
  formData.append('servingUnit', data.servingUnit);
  formData.append('calories', String(data.calories));
  formData.append('protein', String(data.protein));
  formData.append('carbs', String(data.carbs));
  formData.append('fat', String(data.fat));
  formData.append('fiber', String(data.fiber));

  if (data.file) {
    formData.append('file', data.file);
  }

  const res = await apiClient.post('/foods/user-custom', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.food;
},
};