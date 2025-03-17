import axiosInstance from './axiosInstance';
import type { 
  Application, 
  CreateRecruitRequest, 
  UpdateRecruitRequest,
  GetApplicationsParams,
} from '@/types/recruitType';
import axios from 'axios';

const RECRUITS_PER_PAGE = 500;  // 한 페이지당 공고 수

interface SearchTemplatesParams {
  cursor?: number | null;
  limit?: number;
  templateTitle?: string;
  searchConditions?: {
    organizationName?: string;
    status?: string;
    activityDate?: {
      start: string;
      end: string;
    };
    region?: string;
  };
}

export const recruitApi = {
  getMyApplications: async (params?: GetApplicationsParams): Promise<Application[]> => {
    const { cursor = 0, limit = 500 } = params || {};
    const queryParams = new URLSearchParams();
    
    queryParams.append('cursor', cursor.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/vol/applications/recruits?${queryString}`;
    
    const response = await axiosInstance.get(url);
    return response.data; 
  },

  getOrgRecruits: async () => {
    const response = await axiosInstance.get('/org/recruits');
    return response.data;
  },

  createRecruit: async (data: CreateRecruitRequest) => {
    const response = await axiosInstance.post('/org/recruits', data);
    return response.data;
  },

  deleteRecruit: async (recruitIds: number[]) => {
    console.log('Sending delete request:', recruitIds);
    const response = await axiosInstance.patch('/org/recruits/delete', {
      deletedRecruits: recruitIds
    });
    return response.data;
  },

  updateRecruit: async (recruitId: number, data: UpdateRecruitRequest) => {
    const response = await axiosInstance.patch(`/org/recruits/${recruitId}`, data);
    return response.data;
  },

  getRecruitList: async (cursor: number = 0) => {
    const response = await axiosInstance.get(`/org/recruits?cursor=${cursor}&limit=${RECRUITS_PER_PAGE}`);
    const recruits = response.data.recruits;
    
    return {
      recruits,
      hasMore: recruits.length === RECRUITS_PER_PAGE,
      nextCursor: recruits.length ? recruits[recruits.length - 1].recruit.recruitId : null
    };
  },

  getRecruitDetail: async (recruitId: number, userType: string) => {
    try {
      const endpoint = userType === 'volunteer' ? 'vol' : 'org';
      const response = await axiosInstance.get(`/${endpoint}/recruits/${recruitId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || '공고를 불러오는데 실패했습니다.';
    }
  },

  applyRecruit: async (recruitId: number) => {
    const response = await axiosInstance.post('/vol/applications', {
      recruitId
    });
    return response.data;
  },

  cancelApplication: async (applicationId: number) => {
    const response = await axiosInstance.patch(`/vol/applications/${applicationId}`);
    return response.data;
  },

  updateRecruitStatus: async (recruitId: number, status: string) => {
    const response = await axiosInstance.patch(`/org/recruits/${recruitId}/status`, {
      status
    });
    return response.data;
  },

  closeRecruit: async (recruitId: number) => {
    try {
      const response = await axiosInstance.patch(`/org/recruits/close`, {
        recruitId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || '공고 마감에 실패했습니다.';
        throw new Error(message);
      }
      throw error;
    }
  },

  getTemplateDetail: async (templateId: number) => {
    try {
      const response = await axiosInstance.get(`/vol/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || '템플릿 정보를 불러오는데 실패했습니다.';
    }
  },

  searchTemplates: async (params: SearchTemplatesParams) => {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('cursor', (params.cursor || 1).toString());
      queryParams.append('limit', (params.limit || 500).toString());

      const response = await axiosInstance.post(`/search/templates?${queryParams.toString()}`, {
        templateTitle: params.templateTitle || null,
        searchConditions: {
          organizationName: params.searchConditions?.organizationName || null,
          status: params.searchConditions?.status || null,
          activityDate: params.searchConditions?.activityDate || null,
          region: params.searchConditions?.region || null
        }
      });
      return response.data;
    } catch (error) {
      console.error('템플릿 검색 실패:', error);
      throw error;
    }
  },

  reactToTemplate: async (templateId: number, isLike: boolean): Promise<void> => {
    await axiosInstance.post('/vol/volunteer-reactions', {
      templateId,
      isLike
    });
  }
}; 