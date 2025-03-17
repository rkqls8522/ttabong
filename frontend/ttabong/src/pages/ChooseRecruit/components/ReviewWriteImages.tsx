import { useCallback } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useImageStore } from '@/stores/imageStore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from '@/components/ui/card';

interface ReviewWriteImagesProps {
  onImageUploadComplete: (urls: string[]) => void;
  existingImages?: string[];
  isEdit?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;

export function ReviewWriteImages({ onImageUploadComplete, existingImages = [], isEdit = false }: ReviewWriteImagesProps) {
  const { toast } = useToast();
  const { 
    previewImages, 
    addPreviewImages, 
    removePreviewImage,
    uploadImages,
  } = useImageStore();

  const validateImage = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "지원되지 않는 파일 형식",
          description: "PNG, JPG, JPEG, WebP 형식만 지원됩니다."
        });
        resolve(false);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "파일 크기 초과",
          description: "이미지 크기는 10MB 이하여야 합니다."
        });
        resolve(false);
        return;
      }

      resolve(true);
    });
  }, [toast]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;
    
    if (previewImages.length + files.length > MAX_IMAGES) {
      toast({
        variant: "destructive",
        title: "이미지 개수 초과",
        description: `이미지는 최대 ${MAX_IMAGES}개까지 첨부 가능합니다.`
      });
      e.target.value = '';
      return;
    }

    const imagePromises = files.map(file => {
      return new Promise<{ data: string; name: string; file: File }>(async (resolve, reject) => {
        const isValid = await validateImage(file);
        if (!isValid) {
          reject(new Error('이미지 검증 실패'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve({
              data: e.target.result as string,
              name: file.name,
              file
            });
          } else {
            reject(new Error('이미지 로드 실패'));
          }
        };
        reader.onerror = () => reject(new Error('이미지 로드 실패'));
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(imagePromises);
      const duplicates: string[] = [];
      const validFiles: File[] = [];

      results.forEach(({ data, name, file }) => {
        if (previewImages.some(img => img.preview === data)) {
          duplicates.push(name);
        } else {
          validFiles.push(file);
        }
      });

      if (duplicates.length > 0) {
        toast({
          variant: "destructive",
          title: "중복된 이미지",
          description: `다음 이미지는 이미 추가되어 있습니다: ${duplicates.join(', ')}`
        });
      }

      if (validFiles.length > 0) {
        addPreviewImages(validFiles);
        const urls = await uploadImages();
        onImageUploadComplete(urls);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이미지 업로드에 실패했습니다."
      });
    }

    e.target.value = '';
  }, [previewImages, addPreviewImages, validateImage, toast, uploadImages, onImageUploadComplete]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          이미지 첨부 ({previewImages.length + existingImages.length}/{MAX_IMAGES})
        </span>
        {!isEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={previewImages.length + existingImages.length >= MAX_IMAGES}
          >
            <ImagePlus className="h-4 w-4" />
            <label className={`cursor-pointer ${previewImages.length + existingImages.length >= MAX_IMAGES ? 'cursor-not-allowed' : ''}`}>
              이미지 추가
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={handleImageUpload}
                disabled={previewImages.length + existingImages.length >= MAX_IMAGES}
              />
            </label>
          </Button>
        )}
      </div>
      
      {isEdit && (
        <p className="text-xs text-red-500">
          • 이미지는 수정 및 삭제가 불가능합니다.
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        • PNG, JPG, JPEG, WebP 형식만 지원 (최대 10MB)
      </p>
      
      {(existingImages.length > 0 || previewImages.length > 0) && (
        <div className="relative">
          <Carousel 
            className="w-full" 
            opts={{ 
              startIndex: (existingImages.length + previewImages.length) - 1,
              align: "end"
            }}
          >
            <CarouselContent className="-ml-4">
              {existingImages.map((imageUrl, index) => (
                <CarouselItem key={`existing-${index}`} className="pl-4 basis-1/3">
                  <div className="relative aspect-square">
                    <img
                      src={imageUrl}
                      alt={`기존 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded-md opacity-80"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                      {index + 1}/{existingImages.length + previewImages.length}
                    </div>
                  </div>
                </CarouselItem>
              ))}
              {!isEdit && previewImages.map((image, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/3">
                  <div className="relative aspect-square">
                    <img
                      src={image.preview}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/fallback-image.png';
                        toast({
                          variant: "destructive",
                          title: "이미지 로드 실패",
                          description: "이미지를 표시할 수 없습니다."
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removePreviewImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                      {index + 1}/{previewImages.length}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {(existingImages.length + previewImages.length) > 3 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </Card>
  );
} 