import { create } from 'zustand';
import { imageApi } from '@/api/imageApi';

interface ImageState {
  presignedUrls: string[];
  lastFetchedAt: number | null;
  previewImages: { file: File; preview: string }[];
  uploadedUrls: string[];
  fetchPresignedUrls: () => Promise<void>;
  addPreviewImages: (files: File[]) => void;
  removePreviewImage: (index: number) => void;
  uploadImages: () => Promise<string[]>;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  presignedUrls: [],
  lastFetchedAt: null,
  previewImages: [],
  uploadedUrls: [],

  fetchPresignedUrls: async () => {
    const now = Date.now();
    const lastFetched = get().lastFetchedAt;
    
    // 마지막 요청 후 10분이 지났거나, 처음 요청하는 경우
    if (!lastFetched || now - lastFetched > 10 * 60 * 1000) {
      const response = await imageApi.getPresignedUrls();
      set({ 
        presignedUrls: response.imageUrls,
        lastFetchedAt: now
      });
    }
  },

  addPreviewImages: (files: File[]) => {
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    set(state => ({
      previewImages: [...state.previewImages, ...previews]
    }));
  },

  removePreviewImage: (index: number) => {
    set(state => {
      const newPreviewImages = [...state.previewImages];
      URL.revokeObjectURL(newPreviewImages[index].preview);
      newPreviewImages.splice(index, 1);
      return { 
        previewImages: newPreviewImages,
        uploadedUrls: state.uploadedUrls.filter((_, i) => i !== index)
      };
    });
  },

  uploadImages: async () => {
    const { previewImages, presignedUrls } = get();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < previewImages.length; i++) {
      const { file } = previewImages[i];
      const presignedUrl = presignedUrls[i];

      if (!presignedUrl) {
        await get().fetchPresignedUrls();
        continue;
      }

      const imageUrl = await imageApi.uploadToPresignedUrl(presignedUrl, file);
      uploadedUrls.push(imageUrl);
    }

    set({ uploadedUrls });
    return uploadedUrls;
  },

  reset: () => {
    get().previewImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    set({
      presignedUrls: [],
      lastFetchedAt: null,
      previewImages: [],
      uploadedUrls: []
    });
  }
})); 