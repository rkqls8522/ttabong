import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, ClipboardList, PlusCircle } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { useUserStore } from '@/stores/userStore';
import { useReviewStore } from '@/stores/reviewStore';
import { formatDate } from '@/lib/dateUtils';

const OrgMyPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userName, userEmail} = useUserStore();
  const { myReviews, isLoading,fetchMyReviews } = useReviewStore();

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  if (!userId) return null;

  return (
    <div className="h-screen overflow-y-auto">
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* 프로필 섹션 */}
          <div className="space-y-2 text-center">
            <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg">
              <AvatarImage alt="기관 프로필" />
              <AvatarFallback className="bg-primary/5">
                <Building2 className="h-12 w-12 text-primary/70" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-semibold tracking-tight mt-4">{userName || '기관명'}</h1>
            <p className="text-sm text-muted-foreground">{userEmail || 'email@example.com'}</p>
            <Badge variant="secondary" className="mt-1">기관 회원</Badge>
          </div>

          {/* 봉사 관리 섹션 */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">봉사 관리</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 hover:bg-primary/5"
                  onClick={() => navigate('/main')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">내가 등록한 공고</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-6 hover:bg-primary/5"
                  onClick={() => navigate('/add-recruit')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">공고 작성</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 작성 후기 섹션 */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold tracking-tight">작성 후기</h2>
                {myReviews.length > 0 && (
                  <Badge variant="secondary">{myReviews.length}개</Badge>
                )}
              </div>
              <ScrollArea className="h-[calc(100vh-480px)] min-h-[280px] -mx-2 px-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <p className="text-sm text-muted-foreground">작성된 후기가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {myReviews.map((review) => (
                      <Card 
                        key={review.review.reviewId} 
                        className="overflow-hidden hover:bg-secondary/40 active:bg-secondary/60 transition-colors cursor-pointer"
                        onClick={() => navigate(`/review-find/${review.review.reviewId}`)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            {review.images && (
                              <div className="relative w-[72px] h-[72px] rounded-md overflow-hidden flex-shrink-0">
                                <img 
                                  src={review.images} 
                                  alt={review.review.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 py-0.5">
                              <h3 className="font-medium text-sm line-clamp-2 mb-1.5 leading-snug">
                                {review.review.title}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {review.group.groupName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(review.review.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <LogoutButton className="w-full h-11" />
        </div>
      </div>
    </div>
  );
};

export default OrgMyPage;
