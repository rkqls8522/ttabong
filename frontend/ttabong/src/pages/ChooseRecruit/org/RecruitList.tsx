import React from 'react';
import { RecruitCard } from './RecruitCard';
import type { RecruitItem } from '@/types/recruit';

interface RecruitListProps {
  recruits: RecruitItem[] | undefined;
  isEditing: boolean;
  selectedRecruits: number[];
  onSelectRecruit: (recruitId: number) => void;
  onStatusChange: (recruitId: number, newStatus: string) => Promise<void>;
  statusOptions: { value: string; label: string; }[];
  onNavigate: (path: string) => void;
}

export const RecruitList: React.FC<RecruitListProps> = ({
  recruits, 
  isEditing,
  selectedRecruits,
  onSelectRecruit,
  onStatusChange,
  onNavigate
}) => {
  if (!recruits) return null;

  if (recruits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        해당하는 공고가 없습니다
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {recruits.map((item) => (
        <RecruitCard
          key={item.recruit.recruitId}
          recruit={item}
          isEditing={isEditing}
          isSelected={selectedRecruits.includes(item.recruit.recruitId)}
          onSelect={() => onSelectRecruit(item.recruit.recruitId)}
          onStatusChange={(status) => onStatusChange(item.recruit.recruitId, status)}
          onNavigate={() => onNavigate(`/org/recruits/${item.recruit.recruitId}`)}
        />
      ))}
    </div>
  );
};