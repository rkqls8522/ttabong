import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RecruitItem } from '@/types/recruit';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Clock, Users, FileEdit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatTimeRange } from '@/lib/dateUtils';

const STATUS_MAP = {
  'RECRUITING': { label: '모집중', className: 'bg-green-100 text-green-700' },
  'RECRUITMENT_CLOSED': { label: '모집마감', className: 'bg-yellow-100 text-yellow-700' },
  'ACTIVITY_COMPLETED': { label: '활동완료', className: 'bg-blue-100 text-blue-700' }
} as const;

interface RecruitCardProps {
  recruit: RecruitItem;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (status: string) => Promise<void>;
  onNavigate: () => void;
}

export const RecruitCard: React.FC<RecruitCardProps> = ({ 
  recruit, 
  isEditing,
  isSelected,
  onSelect,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const { group, template, recruit: recruitData } = recruit;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/org/recruits/${recruitData.recruitId}`, { 
      state: { 
        isEditing: true,
        recruitData: {
          group,
          template,
          recruit: recruitData
        }
      } 
    });
  };

  const handleManageVolunteers = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recruit-manage/${recruitData.recruitId}`);
  };

  const handleWriteReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/review-write', {
      state: { 
        recruitId: recruitData.recruitId,
        isOrgReview: true
      }
    });
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/org/recruits/${recruitData.recruitId}`);
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-shadow cursor-pointer",
        isSelected && "border-primary"
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{group.groupName}</p>
            <h3 className="font-semibold line-clamp-2">{template.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={cn(
                STATUS_MAP[recruitData.status as keyof typeof STATUS_MAP]?.className
              )}
            >
              {STATUS_MAP[recruitData.status as keyof typeof STATUS_MAP]?.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  공고 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('RECRUITMENT_CLOSED');
                }}>
                  <Clock className="mr-2 h-4 w-4" />
                  모집 마감
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">활동일시</span>
            <p>{formatDate(recruitData.activityDate)}</p>
            <p>{formatTimeRange(recruitData.activityStart, recruitData.activityEnd)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">신청현황</span>
            <p>{recruitData.participateVolCount}/{recruitData.maxVolunteer}명</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleManageVolunteers(e);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                지원자 관리
              </Button>

              {recruitData.status === 'ACTIVITY_COMPLETED' && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWriteReview(e);
                  }}
                >
                  <FileEdit className="mr-2 h-4 w-4" />
                  후기 작성
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}; 