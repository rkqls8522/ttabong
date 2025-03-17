import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { applicationApi } from '@/api/applicationApi';
import type { ApplicationItem } from '@/types/application';
import { toast } from 'react-hot-toast';
import { useRecruitStore } from '@/stores/recruitStore';
import { AxiosError } from 'axios';

const STATUS_MAP = {
  'PENDING': '승인 대기',
  'APPROVED': '승인 완료',
  'REJECTED': '승인 거절'
} as const;

const RecruitManageVolunteers: React.FC = () => {
  const { recruitId } = useParams();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchRecruits } = useRecruitStore();  // 공고 목록 새로고침을 위해 추가

  const handleStatusUpdate = async (application: ApplicationItem, accept: boolean) => {
    try {
      const requestData = {
        recruitId: Number(recruitId),
        volunteerId: application.volunteer.volunteerId,
        applicationId: application.application.applicationId,
        accept
      };
      
      console.log('Request Data:', requestData);  // 요청 데이터 로깅
      
      const response = await applicationApi.updateApplicationStatus(requestData);
      console.log('Response:', response);  // 응답 데이터 로깅

      // 로컬 상태 업데이트
      setApplications(prev => prev.map(item => 
        item.application.applicationId === application.application.applicationId
          ? { ...item, application: response.application }
          : item
      ));

      // 공고 목록 새로고침 (지원자 수 업데이트를 위해)
      fetchRecruits();

      toast.success(accept ? '지원자를 승인했습니다.' : '지원을 거절했습니다.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('상태 변경 실패:', error);
        const axiosError = error as AxiosError;  // axios 에러 처리를 위한 타입 변환
        console.log('Error details:', axiosError.response?.data);
        toast.error('상태 변경에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await applicationApi.getRecruitApplications(Number(recruitId));
        setApplications(response.applications);
      } catch (error) {
        console.error('지원자 목록 조회 실패:', error);
        toast.error('지원자 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (recruitId) {
      fetchApplications();
    }
  }, [recruitId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-6">지원자 관리</h1>
      
      {applications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>아직 지원자가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((item) => (
            <Card key={item.application.applicationId} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.user.profileImage} alt={item.user.name} />
                  <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.user.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.user.email}</p>
                    </div>
                    <Badge variant={item.application.status === 'PENDING' ? 'outline' : 'default'}>
                      {STATUS_MAP[item.application.status as keyof typeof STATUS_MAP]}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>추천수: {item.volunteer.recommendedCount}</p>
                    <p>총 봉사시간: {item.volunteer.totalVolunteerHours}시간</p>
                    <p>신청일: {new Date(item.application.createdAt).toLocaleDateString()}</p>
                  </div>

                  {item.application.status === 'PENDING' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(item, false)}
                      >
                        거절
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(item, true)}
                      >
                        승인
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruitManageVolunteers;
