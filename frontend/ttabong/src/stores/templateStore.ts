import { create } from 'zustand';
import { templateApi } from '@/api/templateApi';
import type { APIGroup, CreateTemplateRequest, APITemplate } from '@/types/template';
import { toast } from 'react-hot-toast';

interface TemplateStore {
  groups: APIGroup[] | null;
  templateDetail: APITemplate | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: (cursor?: number) => Promise<void>;
  fetchTemplateDetail: (templateId: number) => Promise<void>;
  createTemplate: (data: CreateTemplateRequest) => Promise<{ templateId: number }>;
  createGroup: (groupName: string) => Promise<{ groupId: number; groupName: string }>;
  deleteTemplate: (templateId: number) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;
  deleteTemplates: (templateIds: number[]) => Promise<void>;
  updateTemplate: (templateId: number, data: CreateTemplateRequest) => Promise<{ templateId: number }>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  groups: null,
  templateDetail: null,
  isLoading: false,
  error: null,

  fetchTemplates: async (cursor) => {
    set({ isLoading: true });
    try {
      const response = await templateApi.getTemplates(cursor);
      set({ groups: response.groups, error: null });
    } catch (error) {
      console.error('템플릿 목록 로드 실패:', error);
      set({ error: '템플릿 목록을 불러오는데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplateDetail: async (templateId: number) => {
    set({ isLoading: true });
    try {
      const response = await templateApi.getTemplateDetail(templateId);
      set({ templateDetail: response, error: null });
    } catch (error) {
      console.error('템플릿 상세 조회 실패:', error);
      set({ error: '템플릿 상세 정보를 불러오는데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (templateData: CreateTemplateRequest) => {
    set({ isLoading: true });
    try {
      const response = await templateApi.createTemplate(templateData);
      return response;
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      set({ error: '템플릿 생성에 실패했습니다.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async (groupName: string) => {
    try {
      const response = await templateApi.createGroup(groupName);
      get().fetchTemplates(); // 그룹 목록 새로고침
      return {
        groupId: response.groupId,
        groupName
      };
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      toast.error('그룹 생성에 실패했습니다.');
      throw error;
    }
  },

  deleteTemplate: async (templateId: number) => {
    try {
      await templateApi.deleteTemplates([templateId]);
      const response = await templateApi.getTemplates();
      set({ groups: response.groups, error: null });
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
      set({ error: '템플릿 삭제에 실패했습니다.' });
    }
  },

  deleteGroup: async (groupId: number) => {
    try {
      await templateApi.deleteGroup(groupId, 5);
      toast.success('그룹이 삭제되었습니다.');
      // 서버에서 새로운 데이터를 받아와서 한 번에 갱신
      const response = await templateApi.getTemplates();
      set({ groups: response.groups, error: null });
    } catch (error) {
      console.error('그룹 삭제 실패:', error);
      toast.error('그룹 삭제에 실패했습니다.');
      throw error;
    }
  },

  deleteTemplates: async (templateIds: number[]) => {
    try {
      // 1. API 호출을 먼저 수행
      await templateApi.deleteTemplates(templateIds);

      // 2. API 호출이 성공한 후에 로컬 상태 업데이트
      set(state => ({
        groups: state.groups?.map(group => ({
          ...group,
          templates: group.templates.filter(
            template => !templateIds.includes(template.templateId)
          )
        })) || []
      }));
    } catch (error) {
      // 실패 시 서버에서 최신 데이터 가져오기
      const response = await templateApi.getTemplates();
      set({ groups: response.groups });
      throw error;
    }
  },

  updateTemplate: async (templateId: number, data: CreateTemplateRequest) => {
    try {
      const response = await templateApi.updateTemplate(templateId, data);
      // 성공 시 목록 새로고침
      const templates = await templateApi.getTemplates();
      set({ groups: templates.groups });
      return response;
    } catch (error) {
      console.error('Template update error:', error);
      throw error;
    }
  }
})); 