import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Application } from '@/types/recruitType';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/dateUtils';
import { useNavigate } from 'react-router-dom';

const STATUS_MAP = {
  PENDING: { label: '대기', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '승인', className: 'bg-green-100 text-green-700' },
  COMPLETED: { label: '완료', className: 'bg-blue-100 text-blue-700' },
  REJECTED: { label: '거절', className: 'bg-red-100 text-red-700' },
  AUTO_CANCEL: { label: '취소', className: 'bg-gray-100 text-gray-700' },
  NO_SHOW: { label: '불참', className: 'bg-red-100 text-red-700' }
} as const;

interface RecruitCardProps {
  application: Application;
  onReviewWrite: (application: Application) => void;
  onCancelClick: (applicationId: number) => void;
}

function formatTime(time: number): string {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const RecruitCard: React.FC<RecruitCardProps> = ({ 
  application, 
  onReviewWrite, 
  onCancelClick 
}) => {
  const navigate = useNavigate();
  const isCompletedActivity = application.status === 'COMPLETED';
  const isPendingActivity = application.status === 'PENDING';

  const handleCardClick = () => {
    navigate(`/recruits/${application.recruit.recruitId}`);
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReviewWrite(application);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancelClick(application.applicationId);
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{application.group.groupName}</p>
            <h3 className="font-semibold">{application.template.title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              {formatDate(application.recruit.activityDate)} {formatTime(application.recruit.activityStart)}~{formatTime(application.recruit.activityEnd)}
            </p>
            <p className="text-sm text-muted-foreground">{application.template.activityLocation}</p>
          </div>
        </div>
        <Badge 
          variant="secondary"
          className={cn(
            "ml-2",
            STATUS_MAP[application.status].className
          )}
        >
          {STATUS_MAP[application.status].label}
        </Badge>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {isPendingActivity && (
          <Button 
            variant="destructive" 
            onClick={handleCancelClick}
          >
            신청 취소
          </Button>
        )}
        {isCompletedActivity && application.reviewId === null && (
          <Button 
            variant="default"
            onClick={handleReviewClick}
          >
            후기 작성하기
          </Button>
        )}
      </div>
    </Card>
  );
}; 