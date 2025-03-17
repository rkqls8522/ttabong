import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, PenSquare, User, Calendar, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { Checkbox } from "@/components/ui/checkbox";

export default function MyPage() {
  const navigate = useNavigate();
  const { 
    userId, 
    userName,
    userEmail,
    userType,
    likedTemplates, 
    isLoadingLikes, 
    fetchLikedTemplates,
    isEditMode,
    selectedReactions,
    setEditMode,
    toggleReactionSelection,
    cancelSelectedReactions
  } = useUserStore();

  useEffect(() => {
    fetchLikedTemplates({ limit: 10 });
  }, [fetchLikedTemplates]);

  if (!userId) return null;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg">
            <AvatarImage src="/images/profile.jpg" alt="프로필 이미지" />
            <AvatarFallback className="bg-primary/5">
              <User className="h-12 w-12 text-primary/70" />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold tracking-tight mt-4">
            {userName || '사용자'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {userEmail || 'email@example.com'}
          </p>
          <Badge variant="secondary" className="mt-1">
            {userType === 'organization' ? '기관 회원' : '개인 회원'}
          </Badge>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">활동 관리</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-6 hover:bg-primary/5"
                onClick={() => navigate('/volunteer-history')}
              >
                <div className="flex flex-col items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">봉사 내역</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 hover:bg-primary/5"
                onClick={() => navigate('/my-reviews')}
              >
                <div className="flex flex-col items-center gap-2">
                  <PenSquare className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">봉사후기</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold tracking-tight">관심있는 봉사</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{likedTemplates.length}개</Badge>
                {likedTemplates.length > 0 && (
                  isEditMode ? (
                    <div className="flex gap-2">
                      {selectedReactions.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={cancelSelectedReactions}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(false)}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      편집
                    </Button>
                  )
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {isLoadingLikes && likedTemplates.length === 0 ? (
                <div className="flex justify-center items-center h-[200px]">
                  <p className="text-sm text-muted-foreground">로딩 중...</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20">
                  {likedTemplates.map((item) => (
                    <Card 
                      key={item.reactionId}
                      className="overflow-hidden hover:bg-secondary/40 active:bg-secondary/60 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {isEditMode && (
                            <Checkbox
                              checked={selectedReactions.includes(item.reactionId)}
                              onCheckedChange={() => toggleReactionSelection(item.reactionId)}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="space-y-1">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                <p className="text-xs">
                                  {new Date(item.recruit.deadline).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric'
                                  })} 마감
                                </p>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <p className="text-xs">
                                  활동일시: {new Date(item.recruit.activityDate).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric'
                                  })} {Math.floor(item.recruit.activityStart)}시~{Math.floor(item.recruit.activityEnd)}시
                                </p>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <p className="text-xs">
                                  모집인원: {item.recruit.participateVolCount}/{item.recruit.maxVolunteer}명
                                </p>
                              </div>
                              {!isEditMode && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full mt-2 text-xs h-8 justify-between"
                                  onClick={() => navigate(`/templates/${item.recruit.templateId}`)}
                                >
                                  자세히 보기
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {isLoadingLikes && likedTemplates.length > 0 && (
                    <div className="flex justify-center py-3">
                      <p className="text-xs text-muted-foreground">더 불러오는 중...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <LogoutButton className="w-full h-11" />
      </div>
    </div>
  );
}
