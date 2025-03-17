import axiosInstance from './axiosInstance';
import type { ApplicationsResponse, UpdateApplicationStatusRequest, UpdateApplicationStatusResponse } from '@/types/application';

export const applicationApi = {
  getRecruitApplications: async (recruitId: number): Promise<ApplicationsResponse> => {
    const response = await axiosInstance.get(`/org/recruits/${recruitId}/applications`);
    return response.data;
  },
  updateApplicationStatus: async (data: UpdateApplicationStatusRequest): Promise<UpdateApplicationStatusResponse> => {
    const response = await axiosInstance.patch(`/org/applications/status`, data);
    return response.data;
  },
}; 