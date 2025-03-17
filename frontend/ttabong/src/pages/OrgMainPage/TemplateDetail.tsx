import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTemplateStore } from '@/stores/templateStore';
import { PageLayout } from '@/layout/PageLayout';
import { PageLoading } from '@/components/Loading';

const TemplateDetail: React.FC = () => {
  const { templateId } = useParams();
  const { templateDetail, isLoading, error, fetchTemplateDetail } = useTemplateStore();

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetail(parseInt(templateId));
    }
  }, [templateId, fetchTemplateDetail]);

  if (isLoading) return <PageLoading />;
  if (error) return <div className="text-destructive text-center">{error}</div>;
  if (!templateDetail) return null;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 템플릿 상세 내용 */}
      </div>
    </PageLayout>
  );
};

export default TemplateDetail; 