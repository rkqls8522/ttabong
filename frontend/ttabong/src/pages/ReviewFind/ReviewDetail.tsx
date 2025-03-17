import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviewStore } from '@/stores/reviewStore';
import { useUserStore } from '@/stores/userStore';
import { ReviewHeader } from './components/ReviewHeader';
import { ReviewGallery } from './components/ReviewGallery';
import { ReviewContent } from './components/ReviewContent';
import { ReviewComments } from './components/ReviewComments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

export default function ReviewDetail() {
  const { reviewId } = useParams();
  const { 
    reviewDetail, 
    isLoading, 
    error, 
    fetchReviewDetail, 
    addComment, 
    deleteReview,
    updateComment,
    deleteComment 
  } = useReviewStore();
  const { userId, userName } = useUserStore();

  const [commentContent, setCommentContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (reviewId) fetchReviewDetail(Number(reviewId));
  }, [reviewId, fetchReviewDetail]);

  if (isLoading) return <div className="flex justify-center items-center h-[50vh]">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-[50vh] text-destructive">{error}</div>;
  if (!reviewDetail) return null;

  const isOrganization = !reviewDetail.orgReviewId && Boolean(reviewDetail.recruit?.recruitId);

  const isOwner = Number(userId) === reviewDetail.writer.writerId;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !reviewId || !userId) return;
    
    try {
      await addComment(Number(reviewId), {
        content: commentContent,
        writerId: Number(userId),
        writerName: userName || '익명'
      });
      setCommentContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/review-write`, { 
      state: { 
        reviewId: reviewDetail.reviewId,
        recruitId: reviewDetail.recruit.recruitId,
        orgId: reviewDetail.organization.orgId,
        isEdit: true
      } 
    });
  };

  const handleDelete = async () => {
    if (!reviewDetail?.reviewId) return;
    
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteReview(reviewDetail.reviewId);
      navigate(-1);
    }
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    await updateComment(commentId, content);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      await deleteComment(commentId);
    }
  };

  return (
    <div className="pb-32">
      <div className="flex justify-between items-center p-4">
        <ReviewHeader writer={reviewDetail.writer} organization={reviewDetail.organization} />
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">더보기 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                수정하기
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <ReviewGallery 
        images={reviewDetail.images} 
        isOrganization={isOrganization}
      />
      <ReviewContent
        reviewId={reviewDetail.reviewId}
        title={reviewDetail.title}
        content={reviewDetail.content}
        category={reviewDetail.category}
        isOrganization={isOrganization}
        orgReviewId={reviewDetail.orgReviewId}
      />
      
      <div className="px-4 mt-4 flex gap-2">
        {reviewDetail.recruit?.recruitId && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/recruits/${reviewDetail.recruit.recruitId}`)}
          >
            봉사 공고 보러가기
          </Button>
        )}
        
        {isOrganization ? (
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/review-find/${reviewDetail.recruit.recruitId}/reviews`)}
          >
            다른 후기 보기
          </Button>
        ) : reviewDetail.orgReviewId && (
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/review-find/${reviewDetail.orgReviewId}`)}
          >
            기관 후기 보기
          </Button>
        )}
      </div>

      <ReviewComments
        comments={reviewDetail.comments}
        commentContent={commentContent}
        userId={Number(userId)}
        onCommentChange={(e) => setCommentContent(e.target.value)}
        onSubmit={handleSubmitComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        className="max-w-full break-words whitespace-pre-wrap"
      />
    </div>
  );
}
