import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruitApi } from '@/api/recruitApi';
import type { TemplateDetail } from '@/types/recruitType';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function TemplateDetail() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplateDetail = async () => {
      try {
        setIsLoading(true);
        const data = await recruitApi.getTemplateDetail(Number(templateId));
        setTemplateDetail(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "오류",
          description: error.message || "템플릿 정보를 불러오는데 실패했습니다."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchTemplateDetail();
    }
  }, [templateId, toast]);

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  if (!templateDetail) return null;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">{templateDetail.template.title}</h1>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">활동 장소</h2>
            <p className="text-gray-600">{templateDetail.template.activityLocation}</p>
          </div>
          <div>
            <h2 className="font-semibold">활동 내용</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{templateDetail.template.description}</p>
          </div>
          <div>
            <h2 className="font-semibold">담당자 정보</h2>
            <p className="text-gray-600">{templateDetail.template.contactName} / {templateDetail.template.contactPhone}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">모집 일정</h2>
        <div className="space-y-3">
          {templateDetail.recruits.map((recruit) => (
            <Card 
              key={recruit.recruitId}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/recruits/${recruit.recruitId}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    활동일: {new Date(recruit.activityDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    시간: {recruit.activityStart}:00 ~ {recruit.activityEnd}:00
                  </p>
                  <p className="text-sm text-gray-600">
                    모집인원: {recruit.participateVolCount}/{recruit.maxVolunteer}명
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                >
                  자세히 보기
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 