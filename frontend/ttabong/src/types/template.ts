// 템플릿 기본 타입
export interface Template {
  template_id: number;
  group_id: number;
  title: string;
  description: string;
  activity_location: string;
  category_main: string;
  category_sub: string;
  status: 'all' | 'active' | 'inactive';
  images: string[];
  contact_name: string;
  contact_phone: string;
  created_at: string;
  volunteerCount: number;
}

// 그룹 타입
export interface Group {
  group_id: number;
  name: string;
  templates: Template[];
}

// 템플릿 작성/수정 시 사용되는 폼 데이터 타입
export interface TemplateFormData {
  groupId: number | null;
  title: string;
  description: string;
  images: string[];
  volunteerTypes: string[];
  volunteerCount: number;
  locationType: '주소' | '재택' | '';
  address: string;
  detailAddress: string;
  contactName: string;
  contactPhone: {
    areaCode: string;
    middle: string;
    last: string;
  };
  template_id: number;
  created_at: string;
  startDate: Date | null;
  endDate: Date | null;
  volunteerDate: Date | null;
  startTime: string;
  endTime: string;
  volunteerField: string[];
  activityLocation: string;
}

// 각 Step 컴포넌트의 Props 타입
export interface StepProps {
  templateData: TemplateFormData;
  setTemplateData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  imageFiles?: File[];
  setImageFiles?: React.Dispatch<React.SetStateAction<File[]>>;
}

// Daum 우편번호 API 응답 타입 추가
export interface DaumPostcodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  zonecode: string;
}

// API 응답 타입
export interface APITemplate {
  templateId: number;
  groupId: number;
  title: string;
  description: string;
  activityLocation: string;
  categoryId: number;
  status: string;
  images: string[];
  contactName: string;
  contactPhone: string;
  maxVolunteer: number;
  activityStart: number;
  activityEnd: number;
  createdAt: string;
}

export interface APIGroup {
  groupId: number;
  groupName: string;
  templates: APITemplate[];
}

// API 요청 타입
export interface CreateTemplateRequest {
  groupId: number;
  orgId: number;
  categoryId: number;
  title: string;
  activityLocation: string;
  status: string;
  images: string[];
  imageCount: number;
  contactName: string;
  contactPhone: string;
  description: string;
}

// 데이터 변환 유틸리티 함수
export const transformTemplateData = (localData: TemplateFormData): CreateTemplateRequest => {
  return {
    groupId: localData.groupId || 1,
    orgId: 1,
    categoryId: 2,
    title: localData.title,
    activityLocation: localData.locationType === '재택' 
      ? '재택' 
      : `${localData.address} ${localData.detailAddress}`.trim(),
    status: 'ALL',
    images: localData.images,
    imageCount: localData.images.length,
    contactName: localData.contactName,
    contactPhone: `${localData.contactPhone.areaCode}-${localData.contactPhone.middle}-${localData.contactPhone.last}`,
    description: localData.description
  };
};

export interface PresignedUrlResponse {
  message: string;
  templateId: number | null;
  images: string[];
  imageUrl: string | null;
}

export interface CreateTemplateResponse {
  message: string;
  templateId: number;
  images: string[];
  imageUrl: string;
}

