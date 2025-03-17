import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type APITemplate, type Group } from '@/types/recruitType';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTemplateStore } from '@/stores/templateStore';
import { toast } from "sonner";

// const tempGroupName1 = config.name[7];
// const tempGroupName2 = config.name[2];

interface GroupEditState {
  isEditing: boolean;
  groupId: number | null;
  selectedTemplates: number[];
}

const OrgMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { groups, isLoading, error, fetchTemplates, deleteGroup, deleteTemplates } = useTemplateStore();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'group' | 'template';
    groupId: number;
    templateId?: number;
  }>({
    isOpen: false,
    type: 'group',
    groupId: 0,
    templateId: undefined
  });
  const [groupEdit, setGroupEdit] = useState<GroupEditState>({
    isEditing: false,
    groupId: null,
    selectedTemplates: []
  });

  const location = useLocation();
  
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (location.state?.newTemplate) {
      fetchTemplates();
    }
  }, [location, fetchTemplates]);

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (type: 'group' | 'template', groupId: number, templateId?: number) => {
    setDeleteDialog({
      isOpen: true,
      type,
      groupId,
      templateId
    });
  };

  // 삭제 확인
  const confirmDelete = async () => {
    try {
      if (deleteDialog.type === 'group') {
        await deleteGroup(deleteDialog.groupId);
        toast.success('그룹이 삭제되었습니다.');
      } else if (deleteDialog.type === 'template' && deleteDialog.templateId) {
        await deleteTemplates([deleteDialog.templateId]);
        toast.success('템플릿이 삭제되었습니다.');
      }
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
      fetchTemplates();
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 편집 모드 토글
  const toggleEditMode = (groupId: number) => {
    setGroupEdit(prev => ({
      isEditing: prev.groupId === groupId ? !prev.isEditing : true,
      groupId: groupId,
      selectedTemplates: []
    }));
  };

  // 템플릿 선택/해제
  const toggleTemplateSelection = (templateId: number) => {
    setGroupEdit(prev => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(templateId)
        ? prev.selectedTemplates.filter(id => id !== templateId)
        : [...prev.selectedTemplates, templateId]
    }));
  };

  // 선택된 템플릿 삭제
  const deleteSelectedTemplates = async () => {
    if (groupEdit.selectedTemplates.length === 0) {
      setTimeout(() => {
        toast.error('삭제할 템플릿을 선택해주세요.');
      }, 0);
      return;
    }

    try {
      // 1. 편집 모드 종료
      setGroupEdit({
        isEditing: false,
        groupId: null,
        selectedTemplates: []
      });

      // 2. 템플릿 삭제 요청
      await deleteTemplates(groupEdit.selectedTemplates);

      // 4. 성공 메시지
      setTimeout(() => {
        toast.success('선택한 템플릿이 삭제되었습니다.');
      }, 0);
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
      setTimeout(() => {
        toast.error('템플릿 삭제에 실패했습니다.');
      }, 0);
      
      setGroupEdit(prev => ({
        ...prev,
        isEditing: true
      }));
    }
  };

  const handleUseTemplate = async (template: APITemplate, group: Group) => {
    console.log('서버에서 받은 템플릿 데이터:', template);
    navigate('/template-and-group-write', {
      state: { 
        isTemplateUse: true,
        templateId: template.templateId,
        template: {
          ...template,
          groupId: group.groupId,
        }
      }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-[50vh] text-destructive">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-gray-50 p-4 space-y-6 mb-24">
        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1200px] mx-auto">
            {groups.map((group) => (
              <div key={group.groupId} className="w-full">
                <div className="p-4 bg-white shadow-md rounded-lg h-full">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-lg font-semibold flex items-center">
                      <span className="truncate max-w-[200px]" title={group.groupName}>
                        {group.groupName}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">(그룹)</span>
                    </h2>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => toggleEditMode(group.groupId)}
                      >
                        {groupEdit.isEditing && groupEdit.groupId === group.groupId 
                          ? "완료" 
                          : "편집"}
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => openDeleteDialog('group', group.groupId)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.templates.length > 0 ? (
                      group.templates.map((template: APITemplate) => (
                        <div
                          key={template.templateId}
                        >
                          <div className="p-3 bg-gray-50 rounded-lg border hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                {groupEdit.isEditing && groupEdit.groupId === group.groupId && (
                                  <input
                                    type="checkbox"
                                    checked={groupEdit.selectedTemplates.includes(template.templateId)}
                                    onChange={() => toggleTemplateSelection(template.templateId)}
                                    className="w-4 h-4"
                                  />
                                )}
                                <div onClick={() => handleUseTemplate(template, group)}>
                                  <p className="font-medium text-gray-900">{template.title}</p>
                                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                </div>
                              </div>
                              {!groupEdit.isEditing && (
                                <button
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleUseTemplate(template, group)}
                                >
                                  사용
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        아직 템플릿이 없습니다
                      </p>
                    )}
                  </div>
                  
                  {groupEdit.isEditing && groupEdit.groupId === group.groupId && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={deleteSelectedTemplates}
                        disabled={groupEdit.selectedTemplates.length === 0}
                      >
                        선택한 템플릿 삭제
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            아직 그룹이 없습니다
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed inset-x-0 bottom-[72px] mx-4">
        <div className="max-w-[400px] mx-auto w-full bg-white p-4 border rounded-lg shadow-md">
          <button 
            className="w-full bg-black text-white hover:bg-zinc-800 active:bg-zinc-900 
                       focus:ring-2 focus:ring-black focus:ring-offset-2 
                       py-4 rounded-lg font-medium transition-colors text-lg"
            onClick={() => navigate("/template-and-group-write")}
          >
            새로운 템플릿으로 공고 작성
          </button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제 확인</DialogTitle>
            <DialogDescription>
              {deleteDialog.type === 'group' 
                ? "정말 이 그룹을 삭제하시겠습니까?"
                : "정말 이 템플릿을 삭제하시겠습니까?"
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
            >
              아니오
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              네
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrgMainPage;
