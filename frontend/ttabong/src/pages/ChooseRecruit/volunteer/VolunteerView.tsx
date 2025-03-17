import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecruitList } from './VolRecruitList';
import type { Application } from '@/types/recruitType';
import { useRecruitStore } from '@/stores/recruitStore';

export const VolunteerView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    myRecruits, 
    isLoading, 
    error, 
    fetchMyRecruits, 
    cancelApplication,
    setSelectedRecruitId 
  } = useRecruitStore();

  React.useEffect(() => {
    fetchMyRecruits();
  }, [fetchMyRecruits]);

  const handleReviewWrite = async (application: Application) => {
    try {
      await setSelectedRecruitId(application.recruit.recruitId);
      navigate('/review-write', { 
        state: { 
          isEdit: false,
          recruitId: application.recruit.recruitId
        } 
      });
    } catch (error) {
      console.error('후기 작성 페이지 이동 실패:', error);
    }
  };

  const handleCancelClick = async (applicationId: number) => {
    if (window.confirm('봉사 신청을 취소하시겠습니까?')) {
      await cancelApplication(applicationId);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-[50vh] text-destructive">{error}</div>;
  if (!myRecruits?.length) return <div className="flex justify-center items-center h-[50vh]">봉사 내역이 없습니다.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">나의 봉사내역</h1>
      <p className="text-muted-foreground mb-4">
        완료된 봉사활동을 클릭하여 후기를 작성할 수 있습니다.
      </p>
      <RecruitList 
        recruits={myRecruits}
        onReviewWrite={handleReviewWrite}
        onCancelClick={handleCancelClick}
      />
    </div>
  );
}; 