import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const OrgDetailPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">기관 상세 정보</h1>
      </div>
      
      <div className="space-y-4 bg-white p-4 rounded-md shadow-sm">
        <div>
          <h2 className="text-sm text-gray-500">이메일</h2>
          <p>contact@volunteer-center.org</p>
        </div>
        <div>
          <h2 className="text-sm text-gray-500">사업자등록번호</h2>
          <p>123-45-67890</p>
        </div>
        <div>
          <h2 className="text-sm text-gray-500">전화번호</h2>
          <p>02-1234-5678</p>
        </div>
        <div>
          <h2 className="text-sm text-gray-500">가입일</h2>
          <p>2023년 5월 10일</p>
        </div>
      </div>
    </div>
  );
};

export default OrgDetailPage; 