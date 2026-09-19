import { apiClient } from './client';

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
  createUserExercise: async (data: {
    name: string;
    description?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    equipmentId?: string;
    image?: File;
    video?: File;
    instructions?: string[];
    commonMistakes?: string[];
    defaultSets?: number;
    repsMin?: number;
    repsMax?: number;
    targetWeightKg?:number;
    restSeconds?: number;
  }) => {
    const formData = new FormData();

    formData.append('name', data.name);

    if (data.description) {
      formData.append(
        'description',
        data.description
      );
    }

    if (data.difficulty) {
      formData.append(
        'difficulty',
        data.difficulty
      );
    }

    if (data.equipmentId) {
      formData.append(
        'equipmentId',
        data.equipmentId
      );
    }

    if (data.image) {
      formData.append(
        'image',
        data.image
      );
    }

    if (data.video) {
      formData.append(
        'video',
        data.video
      );
    }

    if (data.instructions) {
      formData.append(
        'instructions',
        JSON.stringify(data.instructions)
      );
    }

    if (data.commonMistakes) {
      formData.append(
        'commonMistakes',
        JSON.stringify(data.commonMistakes)
      );
    }

    if (data.defaultSets !== undefined) {
      formData.append(
        'defaultSets',
        String(data.defaultSets)
      );
    }

    if (data.repsMin !== undefined) {
      formData.append(
        'repsMin',
        String(data.repsMin)
      );
    }

    if (data.repsMax !== undefined) {
      formData.append(
        'repsMax',
        String(data.repsMax)
      );
    }

    if (data.restSeconds !== undefined) {
      formData.append(
        'restSeconds',
        String(data.restSeconds)
      );
    }
    if (data.targetWeightKg !== undefined) {
      formData.append(
        'targetWeightKg',
        String(data.targetWeightKg)
      );
    }

    const res = await apiClient.post(
      '/upload/user/exercises',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data;
  },
};
