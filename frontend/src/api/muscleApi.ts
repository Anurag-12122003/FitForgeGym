import { apiClient } from "./client";

export const muscleApi = {
    getAll: async () => {
        const response = await apiClient.get('/muscles');
        return response.data;
    },
};
