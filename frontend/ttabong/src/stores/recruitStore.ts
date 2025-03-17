import { create } from 'zustand';
import { recruitApi } from '@/api/recruitApi';
import type { 
  OrgRecruit, 
  Application, 
  RecruitDetail,
  OrgRecruitStatus,
  VolunteerApplicationStatus,
  SearchTemplate
} from '@/types/recruitType';
import { AxiosError } from 'axios';
import { RecruitItem } from '@/types/recruit';  // 기존 타입 사용

interface RecruitListItem {  // 목록용 간단한 타입
  recruit: {
    recruitId: number;
    status: string;
    deadline: string;
    maxVolunteer: number;
    participateVolCount: number;
  };
  template: {
    title: string;
  };
}

interface SearchTemplatesParams {
  cursor?: number;
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

interface RecruitState {
  recruits: RecruitItem[];  // 여기서 RecruitItem 타입 사용
  myRecruits: Application[] | null;
  orgRecruits: OrgRecruit[] | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  recruitDetail: RecruitDetail | null;
  selectedRecruitId: number | null;
  recruitList: RecruitListItem[] | null;
  nextCursor: number | null;
  searchResults: SearchTemplate[];
  searchNextCursor: number | null;
  searchHasMore: boolean;
  fetchMyRecruits: (params?: { cursor?: number; limit?: number }) => Promise<void>;
  fetchOrgRecruits: () => Promise<void>;
  cancelApplication: (applicationId: number) => Promise<void>;
  fetchRecruitList: (cursor?: number) => Promise<void>;
  fetchRecruitDetail: (recruitId: number, userType?: string) => Promise<void>;
  setSelectedRecruitId: (id: number) => Promise<void>;
  resetSelectedRecruitId: () => void;
  fetchRecruits: () => Promise<void>;
  applyRecruit: (recruitId: number) => Promise<void>;
  updateRecruitStatus: (recruitId: number, newStatus: string) => Promise<void>;
  updateLocalRecruitStatus: (recruitId: number, newStatus: string) => void;
  searchTemplates: (params: SearchTemplatesParams) => Promise<void>;
  clearSearchResults: () => void;
}

export const useRecruitStore = create<RecruitState>((set) => ({
  recruits: [],
  myRecruits: null,
  orgRecruits: null,
  isLoading: false,
  error: null,
  hasMore: true,
  recruitDetail: null,
  selectedRecruitId: null,
  recruitList: null,
  nextCursor: null,
  searchResults: [],
  searchNextCursor: null,
  searchHasMore: true,

  fetchMyRecruits: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await recruitApi.getMyApplications(params);
      
      if (params?.cursor) {
        set((state) => ({ 
          myRecruits: [...(state.myRecruits || []), ...response],
          hasMore: response.length === (params.limit || 500)
        }));
      } else {
        set({ 
          myRecruits: response,
          hasMore: response.length === (params?.limit || 500)
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('봉사내역 조회 실패:', error);
        set({ error: error.response?.data?.message || '봉사내역을 불러오는데 실패했습니다.' });
      } else {
        console.error('봉사내역 조회 실패:', error);
        set({ error: '봉사내역을 불러오는데 실패했습니다.' });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  fetchOrgRecruits: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await recruitApi.getOrgRecruits();
      set({ orgRecruits: response.recruits });
    } catch (error) {
      console.error('공고 목록을 불러오는데 실패했습니다:', error);
      set({ error: '공고 목록을 불러오는데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },
  cancelApplication: async (applicationId: number) => {
    try {
      set({ isLoading: true, error: null });
      await recruitApi.cancelApplication(applicationId);
      const response = await recruitApi.getMyApplications();
      set({ 
        myRecruits: response.map(application => ({
          ...application,
          status: application.applicationId === applicationId 
            ? 'AUTO_CANCEL' as VolunteerApplicationStatus
            : application.status
        })),
        recruitDetail: null 
      });
    } catch (error) {
      console.error('봉사 신청 취소 실패:', error);
      set({ error: '봉사 신청 취소에 실패했습니다.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchRecruitList: async (cursor) => {
    set({ isLoading: true });
    try {
      const response = await recruitApi.getRecruitList(cursor);
      
      if (cursor) {
        // 기존 목록에 추가
        set((state) => ({
          recruitList: [...(state.recruitList || []), ...response.recruits],
          hasMore: response.hasMore,
          nextCursor: response.nextCursor,
          error: null
        }));
      } else {
        // 새로운 목록으로 설정
        set({
          recruitList: response.recruits,
          hasMore: response.hasMore,
          nextCursor: response.nextCursor,
          error: null
        });
      }
    } catch (error) {
      console.error('공고 목록 조회 실패:', error);
      set({ error: '공고 목록을 불러오는데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchRecruitDetail: async (recruitId: number, userType = 'volunteer') => {
    set({ isLoading: true });
    try {
      const response = await recruitApi.getRecruitDetail(recruitId, userType);
      set({ recruitDetail: response, error: null });
    } catch (error: unknown) {
      console.error('공고 상세 조회 실패:', error);
      set({ error: error instanceof AxiosError ? error.response?.data?.message || '공고를 불러오는데 실패했습니다.' : '공고를 불러오는데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },
  setSelectedRecruitId: (id: number) => {
    set({ selectedRecruitId: id });
    return Promise.resolve();
  },
  resetSelectedRecruitId: () => set({ selectedRecruitId: null }),
  fetchRecruits: async () => {
    try {
      const response = await recruitApi.getOrgRecruits();
      set({ recruits: response.recruits });
    } catch (error) {
      console.error('공고 목록 조회 실패:', error);
      set({ error: error instanceof AxiosError ? error.response?.data?.message || '공고 목록을 불러오는데 실패했습니다.' : '공고 목록을 불러오는데 실패했습니다.' });
    }
  },
  applyRecruit: async (recruitId: number) => {
    try {
      set({ isLoading: true, error: null });
      await recruitApi.applyRecruit(recruitId);
      const response = await recruitApi.getRecruitDetail(recruitId, 'volunteer');
      
      const transformedData: RecruitDetail = {
        ...response,
        recruit: {
          ...response.recruit,
          status: response.recruit.status as OrgRecruitStatus
        },
        application: response.application ? {
          applicationId: response.application.applicationId,
          name: response.application.name,
          status: response.application.status as VolunteerApplicationStatus
        } : undefined
      };
      
      set({ recruitDetail: transformedData });
    } catch (error: unknown) {
      console.error('봉사 신청 실패:', error);
      throw error instanceof AxiosError ? error.response?.data?.message || '봉사 신청에 실패했습니다.' : '봉사 신청에 실패했습니다.';
    } finally {
      set({ isLoading: false });
    }
  },
  updateRecruitStatus: async (recruitId: number, newStatus: string) => {
    try {
      // 간단한 상태 변경 API 사용
      await recruitApi.updateRecruitStatus(recruitId, newStatus);

      // 로컬 상태 업데이트
      set(state => ({
        recruits: state.recruits.map(item => 
          item.recruit.recruitId === recruitId 
            ? { ...item, recruit: { ...item.recruit, status: newStatus as OrgRecruitStatus } }
            : item
        )
      }));
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      throw error;
    }
  },
  updateLocalRecruitStatus: (recruitId: number, newStatus: string) => {
    set(state => ({
      recruits: state.recruits.map(item => 
        item.recruit.recruitId === recruitId 
          ? { ...item, recruit: { ...item.recruit, status: newStatus as OrgRecruitStatus } }
          : item
      )
    }));
  },
  searchTemplates: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await recruitApi.searchTemplates(params);
      
      if (params.cursor) {
        set((state) => ({
          searchResults: [...state.searchResults, ...response.templates],
          searchNextCursor: response.nextCursor,
          searchHasMore: response.templates.length === (params.limit || 500)
        }));
      } else {
        set({
          searchResults: response.templates,
          searchNextCursor: response.nextCursor,
          searchHasMore: response.templates.length === (params.limit || 500)
        });
      }
    } catch (error) {
      console.error('템플릿 검색 실패:', error);
      set({ error: '검색에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },
  clearSearchResults: () => {
    set({
      searchResults: [],
      searchNextCursor: null,
      searchHasMore: true
    });
  }
})); 