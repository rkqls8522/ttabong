import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TemplateFormData } from "@/types/template";
import { toast } from "sonner";

interface Step1Props {
  templateData: TemplateFormData;
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const Step1AnnouncementDetails: React.FC<Step1Props> = ({ 
  templateData, 
  setTemplateData,
  imageFiles,
  setImageFiles 
}) => {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      
      // 이미지 파일 형식 체크
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 제한 (각 파일 5MB 이하)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      const newFiles = files.slice(0, 10 - imageFiles.length);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // URL 생성하여 미리보기용으로 사용
      const imageUrls = newFiles.map(file => URL.createObjectURL(file));
      setTemplateData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setTemplateData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 입력 제한 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 연속된 공백 체크
    if (/\s{2,}/.test(value)) {
      toast.error('연속된 공백은 사용할 수 없습니다.');
      return;
    }

    // 30자 이하만 허용
    if (value.length <= 30) {
      setTemplateData(prev => ({
        ...prev,
        title: value
      }));
    } else {
      toast.error('제목은 30자를 초과할 수 없습니다.');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // 연속된 공백 체크
    if (/\s{2,}/.test(value)) {
      toast.error('연속된 공백은 사용할 수 없습니다.');
      return;
    }

    // 100자 이하만 허용
    if (value.length <= 100) {
      setTemplateData(prev => ({
        ...prev,
        description: value
      }));
    } else {
      toast.error('내용은 100자를 초과할 수 없습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">공고 제목</label>
        <Input
          type="text"
          placeholder="공고 제목 입력 (최대 30자)"
          value={templateData.title}
          onChange={handleTitleChange}
          className="w-full"
          maxLength={30}
        />
        <div className="text-sm text-gray-500 mt-1">
          {templateData.title.length}/30
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">공고 내용</label>
        <Textarea
          placeholder="공고 내용 입력 (최대 100자)"
          value={templateData.description}
          onChange={handleDescriptionChange}
          className="min-h-[150px]"
          maxLength={100}
        />
        <div className="text-sm text-gray-500 mt-1">
          {templateData.description.length}/100
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사진 추가 ({templateData.images.length}/10)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={templateData.images.length >= 10}
          />
          <label
            htmlFor="image-upload"
            className={`w-20 h-20 border flex items-center justify-center cursor-pointer
              ${templateData.images.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            📷
          </label>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mt-2">
          {templateData.images.map((image, index) => (
            <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
              <img
                src={image}
                alt={`upload-${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-bl-md"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step1AnnouncementDetails;
