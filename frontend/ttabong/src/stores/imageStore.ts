import { create } from 'zustand';
import { imageApi } from '@/api/imageApi';
import { devtools } from 'zustand/middleware';

interface ImageState {
  presignedUrls: string[];
  previewImages: { file: File; preview: string }[];
  uploadedUrls: string[];
  fetchPresignedUrls: () => Promise<void>;
  addPreviewImages: (files: File[]) => void;
  removePreviewImage: (index: number) => void;
  uploadImages: () => Promise<string[]>;
  reset: () => void;
}

export const useImageStore = create<ImageState>()(
  devtools(
    (set, get) => ({
      presignedUrls: [],
      previewImages: [],
      uploadedUrls: [],

      fetchPresignedUrls: async () => {
        try {
          const response = await imageApi.getPresignedUrls();
          set({ presignedUrls: response.imageUrls });
        } catch (error) {
          console.error('Presigned URLs 발급 실패:', error);
          throw error;
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
          
          const newUploadedUrls = [...state.uploadedUrls];
          newUploadedUrls.splice(index, 1);
          
          return { 
            previewImages: newPreviewImages,
            uploadedUrls: newUploadedUrls
          };
        });
      },

      uploadImages: async () => {
        const { previewImages, presignedUrls } = get();
        const uploadedUrls: string[] = [];

        for (let i = 0; i < previewImages.length; i++) {
          const { file } = previewImages[i];
          let presignedUrl = presignedUrls[i];

          if (!presignedUrl) {
            await get().fetchPresignedUrls();
            presignedUrl = get().presignedUrls[i];
            if (!presignedUrl) {
              throw new Error('Presigned URL 발급 실패');
            }
          }

          try {
            const imageUrl = await imageApi.uploadToPresignedUrl(presignedUrl, file);
            uploadedUrls.push(imageUrl);
          } catch (error) {
            console.error('이미지 업로드 실패:', error);
            continue;
          }
        }

        set({ uploadedUrls });
        return uploadedUrls;
      },

      reset: () => {
        get().previewImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
        set({
          presignedUrls: [],
          previewImages: [],
          uploadedUrls: []
        });
      }
    }),
    {
      name: 'Image Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
); 