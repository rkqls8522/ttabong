import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useReviewStore } from '@/stores/reviewStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MyReviews() {
  const navigate = useNavigate();
  const { myReviews, isLoading, fetchMyReviews } = useReviewStore();

  React.useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh] px-4">
      로딩 중...
    </div>
  );
  
  if (!myReviews?.length) return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] p-4 text-center">
      <div className="space-y-3 max-w-[300px] mx-auto">
        <p className="text-lg text-muted-foreground break-keep">
          아직 작성한 봉사후기가 없습니다.
        </p>
        <p className="text-sm text-muted-foreground break-keep">
          봉사활동 후기를 작성하고 다른 사람들과 경험을 나눠보세요!
        </p>
        <button
          onClick={() => navigate('/review-write')}
          className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          후기 작성하기
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">나의 봉사후기</h1>
      <div className="space-y-4">
        {myReviews.map((item) => (
          <Card 
            key={item.review.reviewId}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/review-find/${item.review.reviewId}`)}
          >
            <CardContent className="p-4">
              <div className="flex gap-3 items-start">
                {item.images && (
                  <div className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.images} 
                      alt={item.review.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 truncate">
                    {item.review.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 truncate">
                    {item.group.groupName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.review.createdAt), 'PPP', { locale: ko })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 