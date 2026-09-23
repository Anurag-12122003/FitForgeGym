import { apiClient } from './client';
export interface CreateUserExercisePayload {
  name: string;
  description?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  equipmentId?: string;
  primaryMuscleId?: string;
  secondaryMuscleIds?: string[];
  defaultSets?: number;
  repsMin?: number;
  repsMax?: number;
  restSeconds?: number;
  targetWeightKg?: number;
  instructions?: string[];
  commonMistakes?: string[];
  image?: File;
}

export const uploadApi = {
  /**
   * =====================================================
   * ADMIN
   * Upload catalog asset
   *
   * Backend:
   * POST /assets/admin
   * =====================================================
   */
  adminUpload: async (
    file: File,
    resource: 'exercise' | 'food',
    resourceId: string
  ): Promise<{
    url: string;
    type: 'image' | 'video';
  }> => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('resource', resource);
    formData.append('resourceId', resourceId);

    const res = await apiClient.post(
      '/assets/admin',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      url: res.data.url,
      type: res.data.type,
    };
  },

  /**
   * =====================================================
   * USER
   * Create custom exercise with image/video
   *
   * Backend:
   * POST /assets/user/exercises
   * =====================================================
   */
  createUserExercise: async (data: FormData | CreateUserExercisePayload): Promise<any> => {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            payload.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            payload.append(key, value);
          } else {
            payload.append(key, String(value));
          }
        }
      });
    }

    const res = await apiClient.post('/upload/user/exercises', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
