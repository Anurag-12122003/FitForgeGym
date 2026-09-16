import { apiClient } from './client';
import type { FoodItem } from './foodApi';

export interface MealFood {
  id: string;
  mealId: string;
  foodId: string;
  quantityAmount: number;
  food: FoodItem;
}

export interface Meal {
  id: string;
  dietPlanId: string;
  name: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  order: number;
  foods: MealFood[];
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  goal?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isActive: boolean;
  meals: Meal[];
}

export const dietApi = {
  getPlans: async (): Promise<DietPlan[]> => {
    const res = await apiClient.get('/diet-plans');
    return res.data;
  },
  createPlan: async (payload: {
    name: string;
    goal?: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  }): Promise<DietPlan> => {
    const res = await apiClient.post('/diet-plans', payload);
    return res.data;
  },
  addMeal: async (planId: string, payload: { name: string; type: string; order: number }): Promise<Meal> => {
    const res = await apiClient.post(`/diet-plans/${planId}/meals`, payload);
    return res.data;
  },
  addFoodToMeal: async (mealId: string, payload: { foodId: string; quantityAmount: number }): Promise<MealFood> => {
    const res = await apiClient.post(`/diet-plans/meals/${mealId}/foods`, payload);
    return res.data;
  },
  removeFoodFromMeal: async (mealFoodId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/diet-plans/meal-foods/${mealFoodId}`);
    return res.data;
  },
};