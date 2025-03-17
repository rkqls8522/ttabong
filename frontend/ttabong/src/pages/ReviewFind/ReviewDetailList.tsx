import React from 'react';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewGalleryGrid } from './components/ReviewGalleryGrid';

const ReviewDetailList: React.FC = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { recruitReviews, isLoading, error, fetchRecruitReviews } = useReviewStore();

  useEffect(() => {
    console.log('ReviewDetailList - reviewId:', reviewId);
    if (reviewId) fetchRecruitReviews(Number(reviewId));
  }, [reviewId, fetchRecruitReviews]);

  const handleReviewClick = (reviewId: number) => {
    navigate(`/review-find/${reviewId}`);
  };

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-[50vh] text-destructive">{error}</div>;

  return (
    <div className="container mx-auto px-4 pt-6">
      <h2 className="text-lg font-bold mb-4">이 봉사활동의 다른 후기들</h2>
      <ReviewGalleryGrid 
        reviews={recruitReviews}
        onReviewClick={handleReviewClick}
      />
    </div>
  );
};

export default ReviewDetailList;
