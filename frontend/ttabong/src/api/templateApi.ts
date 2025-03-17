import axiosInstance from './axiosInstance';
import type { CreateTemplateRequest, APITemplate } from '@/types/template';
import axios from 'axios';

// 응답 타입 정의 추가
interface CreateGroupResponse {
  message: string;
  groupId: number;
}

interface PresignedUrlResponse {
  message: string;
  templateId: number | null;
  images: string[];
  imageUrl: string | null;
}

interface CreateTemplateResponse {
  message: string;
  templateId: number;
  images: string[];
  imageUrl: string;
}

export const templateApi = {
  // 템플릿 목록 조회 (이미지 없이)
  getTemplates: async (cursor?: number, limit: number = 10) => {
    try {
      console.log('템플릿 목록 요청 파라미터:', { cursor, limit });  // 요청 로그
      const response = await axiosInstance.get('/org/templates', {
        params: { 
          cursor: cursor || undefined,  // 기본값 1
          limit 
        }
      });
      console.log('템플릿 목록 응답:', response.data);  // 응답 로그
      return response.data;
    } catch (error) {
      console.error('템플릿 목록 조회 실패:', error);
      throw error;
    }
  },

  // 템플릿 상세 조회 (이미지 포함)
  getTemplateDetail: async (templateId: number) => {
    try {
      // 목록 API를 통해 템플릿 정보 가져오기
      const response = await axiosInstance.get('/org/templates');
      
      // groups 배열을 순회하면서 해당 templateId를 가진 템플릿을 찾고, 
      // 찾은 템플릿에 groupId를 추가
      for (const group of response.data.groups) {
        const template = group.templates.find(
          (t: APITemplate) => t.templateId === templateId
        );
        if (template) {
          return {
            ...template,
            groupId: group.groupId  // 그룹 ID 추가
          };
        }
      }
      
      throw new Error('템플릿을 찾을 수 없습니다.');
    } catch (error) {
      console.error('템플릿 상세 조회 실패:', error);
      throw error;
    }
  },

  // Presigned URL 요청
  getPresignedUrls: async (imageCount: number) => {
    try {
      const response = await axiosInstance.get<PresignedUrlResponse>(
        `/org/templates/presigned?count=${imageCount}`
      );
      
      // 응답 데이터 유효성 검사
      if (!response.data || !Array.isArray(response.data.images)) {
        throw new Error('Invalid presigned URLs response format');
      }

      // 필수 필드 확인
      if (response.data.images.length === 0) {
        throw new Error('No presigned URLs received');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Presigned URL request failed:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }
      throw error;
    }
  },

  // 템플릿 생성
  createTemplate: async (data: CreateTemplateRequest) => {
    const requestData = {
      groupId: data.groupId,
      orgId: 1,
      categoryId: 1,
      title: data.title,
      activityLocation: data.activityLocation,
      status: 'ALL',
      images: data.images,
      imageCount: data.images.length,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      description: data.description
    };

    const response = await axiosInstance.post<CreateTemplateResponse>(
      '/org/templates',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );
    return response.data;
  },

  // 그룹 생성
  createGroup: async (groupName: string) => {
    const response = await axiosInstance.post<CreateGroupResponse>('/org/groups', { 
      orgId: 5,  // 고정된 orgId 사용
      groupName
    });
    return response.data;
  },

  // 템플릿 삭제
  deleteTemplates: async (templateIds: number[]) => {
    try {
      const response = await axiosInstance.patch('/org/templates/delete', {
        deletedTemplates: templateIds
      });
      console.log('API 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('API 에러:', error);
      throw error;
    }
  },

  // 그룹 삭제
  deleteGroup: async (groupId: number, orgId: number) => {
    try {
      console.log('그룹 삭제 요청:', { groupId, orgId });  // 요청 데이터 확인
      const response = await axiosInstance.patch('/org/groups/delete', {
        groupId,
        orgId
      });
      console.log('그룹 삭제 응답:', response.data);  // 응답 데이터 확인
      return response.data;
    } catch (error) {
      console.error('그룹 삭제 API 에러:', error);
      throw error;
    }
  },

  // 템플릿 수정
  updateTemplate: async (templateId: number, data: CreateTemplateRequest) => {
    try {
      const response = await axiosInstance.patch<{
        message: string;
        templateId: number;
        orgId: number;
      }>('/org/templates', {
        templateId,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Template update error:', error);
      throw error;
    }
  },

  uploadImage: async (formData: FormData) => {
    const response = await axiosInstance.post('/org/templates/image', formData);
    return response.data;
  },
};