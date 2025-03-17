import axiosInstance, { ApiResponse } from './axiosInstance';

interface PresignedUrlResponse {
  imageUrls: string[];
}

export const imageApi = {
  getPresignedUrls: async (): Promise<PresignedUrlResponse> => {
    const response = await axiosInstance.get<ApiResponse<PresignedUrlResponse>>('/reviews/write');
    const data = response.data.data || response.data;
    if (!data.imageUrls) {
      throw new Error('Invalid presigned URLs response');
    }
    return data;
  },

  uploadToPresignedUrl: async (url: string, file: File): Promise<string> => {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return url;
  }
}; 