import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewGalleryGrid } from '@/pages/ReviewFind/components/ReviewGalleryGrid';
import { PageLayout } from '@/layout/PageLayout';
import { PageLoading } from '@/components/Loading';

const ReviewFind: React.FC = () => {
  const navigate = useNavigate();
  const { reviews, isLoading, error, fetchReviews } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewClick = (reviewId: number) => {
    navigate(`/review-find/${reviewId}`);
  };

  if (isLoading) return <PageLoading />;
  if (error) return <div className="flex justify-center items-center h-[calc(100vh-112px)] text-destructive">{error}</div>;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 pt-6">
        <ReviewGalleryGrid 
          reviews={reviews} 
          onReviewClick={handleReviewClick}
        />
      </div>
    </PageLayout>
  );
};

export default ReviewFind;
