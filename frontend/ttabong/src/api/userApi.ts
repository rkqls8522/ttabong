import axiosInstance from './axiosInstance';
import type { 
  LoginRequest, 
  LoginResponse,
  VolunteerRegisterRequest,
  OrganizationRegisterRequest,
  GetLikedTemplatesParams,
  GetLikedTemplatesResponse
} from '@/types/userType';

export const userApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/user/login', data);
    return response.data;
  },

  registerVolunteer: async (data: VolunteerRegisterRequest): Promise<void> => {
    await axiosInstance.post('/volunteer/register', data);
  },

  logout: async () => {
    localStorage.removeItem('access_token');
  },

  registerOrganization: async (data: OrganizationRegisterRequest): Promise<void> => {
    await axiosInstance.post('/org/register', data);
  },

  getLikedTemplates: async (params?: GetLikedTemplatesParams): Promise<GetLikedTemplatesResponse> => {
    const { cursor = 0, limit = 10 } = params || {};
    const queryParams = new URLSearchParams();
    
    queryParams.append('cursor', cursor.toString());
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/vol/volunteer-reactions/likes?${queryString}`;
    
    const response = await axiosInstance.get(url);
    return {
      likedTemplates: response.data
    };
  },

  cancelLikedTemplates: async (reactionIds: number[]): Promise<void> => {
    await axiosInstance.patch('/vol/volunteer-reactions/cancel', {
      reactionIds
    });
  }
}; 