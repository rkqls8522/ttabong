import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatTimeRange, formatDate } from '@/lib/dateUtils';

interface RecruitDetailCardProps {
  recruitDetail: {
    template: {
      templateId: number;
      title: string;
      description: string;
      activityLocation: string;
      images: string[];
      contactName: string;
      contactPhone: string;
      volunteerField: string[];
      volunteerTypes: string[];
    };
    recruit: {
      recruitId: number;
      status: string;
      activityDate: string;
      activityStart: number;
      activityEnd: number;
      deadline: string;
      maxVolunteer: number;
      participateVolCount: number;
    };
    organization: {
      orgId: number;
      name: string;
    };
  };
}

export function RecruitDetailCard({ recruitDetail }: RecruitDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mx-4 mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{recruitDetail.organization.name}</p>
            <h2 className="text-lg font-semibold mb-2">{recruitDetail.template.title}</h2>
            <p className="text-sm">📍 {recruitDetail.template.activityLocation}</p>
            <p className="text-sm">⏰ {formatTimeRange(recruitDetail.recruit.activityStart, recruitDetail.recruit.activityEnd)}</p>
            <p className="text-sm">👥 {recruitDetail.recruit.participateVolCount}/{recruitDetail.recruit.maxVolunteer}명</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium">모집 마감일</p>
              <p className="text-sm">{formatDate(recruitDetail.recruit.deadline)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">담당자 연락처</p>
              <p className="text-sm">{recruitDetail.template.contactName} ({recruitDetail.template.contactPhone})</p>
            </div>
            <div>
              <p className="text-sm font-medium">활동 설명</p>
              <p className="text-sm whitespace-pre-line">{recruitDetail.template.description}</p>
            </div>
            {recruitDetail.template.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {recruitDetail.template.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`활동 이미지 ${index + 1}`} 
                    className="rounded-md w-full h-40 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 