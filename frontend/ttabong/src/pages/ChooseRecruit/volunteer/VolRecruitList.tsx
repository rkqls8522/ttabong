import React from 'react';
import { RecruitCard } from './VolRecruitCard';
import type { Application } from '@/types/recruitType';

interface RecruitListProps {
  recruits: Application[];
  onReviewWrite: (application: Application) => void;
  onCancelClick: (applicationId: number) => void;
}

export const RecruitList: React.FC<RecruitListProps> = ({ recruits, onReviewWrite, onCancelClick }) => {
  return (
    <div className="space-y-4">
      {recruits.map((application) => (
        <RecruitCard
          key={application.applicationId}
          application={application}
          onReviewWrite={onReviewWrite}
          onCancelClick={onCancelClick}
        />
      ))}
    </div>
  );
}; 