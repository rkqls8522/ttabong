import React from 'react';
import { Button } from '@/components/ui/button';

interface UserTypeSelectProps {
  onSelect: (type: 'org' | 'volunteer') => void;
}

export const UserTypeSelect: React.FC<UserTypeSelectProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold mb-6">사용자 유형을 선택해주세요</h2>
      <div className="space-x-4">
        <Button 
          size="lg"
          onClick={() => onSelect('org')}
        >
          봉사 기관
        </Button>
        <Button 
          size="lg"
          onClick={() => onSelect('volunteer')}
        >
          봉사자
        </Button>
      </div>
    </div>
  );
}; 