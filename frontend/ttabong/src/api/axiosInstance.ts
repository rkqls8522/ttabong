import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '@/config';
import { toast } from 'sonner';

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
}

const axiosInstance = axios.create({
  baseURL: `${config.baseURL}${config.apiPrefix}`,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message: string }>) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || '서버 오류가 발생했습니다.'
    };

    // 400, 403 에러 처리 (로그인 실패 등)
    if (error.response?.status === 400 || error.response?.status === 403) {
      const errorMessage = error.response.data.message;
      return Promise.reject({
        status: error.response.status,
        message: errorMessage
      });
    }

    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉션
      if (!window.location.pathname.includes('/login')) {
        toast.error('로그인이 필요합니다.', {
          description: error.response.data.message || '로그인 페이지로 이동합니다.'
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      return Promise.reject(apiError);
    }

    // 기타 에러 처리
    toast.error('오류가 발생했습니다.', {
      description: error.response?.data?.message || apiError.message
    });

    throw error.response?.data?.message || apiError.message;
  }
);

export default axiosInstance; 