import { apiClient } from './client';

export interface UserProfile {
  id: string;
  gender?: string | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  primaryGoal?: string | null;
}

export interface User {
  id: string;
  email: string;
  fullName:string;
  role: 'USER' | 'ADMIN';
  profile?: UserProfile | null;
}

export interface AuthResponse {
  user: User;
}

export const authApi = {
  register: async (payload: { email: string; password: string; fullName: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },

  getMe: async (): Promise<AuthResponse> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  completeProfile: async (payload:{gender:string,age:number | string,heightCm:number,weightKg:number,fitnessLevel:string,primaryGoal:string}): Promise<AuthResponse> => {
    const res = await apiClient.put('/auth/profile',payload);
    return res.data;
  },


  logout: async (): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getAllUser:async (): Promise<AuthResponse> => {
    const res = await apiClient.get('/auth/all');
    return res.data;
  }, 
};