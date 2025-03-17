import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import type { ReviewListItem, ReviewDetail, UpdateReviewRequest, ReviewEditResponse, MyReview, CreateReviewRequest } from '@/types/reviewType';
import { reviewApi } from '@/api/reviewApi';
import { toast } from "@/hooks/use-toast";

interface ReviewStore {
  reviews: ReviewListItem[];
  hasMore: boolean;
  nextCursor: number | null;
  reviewDetail: ReviewDetail | null;
  myReviews: MyReview[];
  isLoading: boolean;
  error: string | null;
  recruitReviews: ReviewListItem[];
  recruitId: number | null;
  orgId: number | null;
  fetchReviews: (cursor?: number) => Promise<void>;
  fetchMoreReviews: () => Promise<void>;
  fetchReviewDetail: (id: number) => Promise<void>;
  addComment: (reviewId: number, commentData: { 
    content: string;
    writerId: number;
    writerName: string;
  }) => Promise<void>;
  fetchRecruitReviews: (recruitId: number) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>;
  updateReview: (reviewId: number, data: UpdateReviewRequest) => Promise<ReviewEditResponse>;
  setReviewInfo: (recruitId: number, orgId: number) => void;
  resetReviewInfo: () => void;
  updateVisibility: (reviewId: number, isPublic: boolean) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  setReviews: (reviews: ReviewListItem[]) => void;
  createReview: (data: CreateReviewRequest) => Promise<void>;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    devtools(
      (set, get) => ({
        reviews: [],
        hasMore: true,
        nextCursor: null,
        reviewDetail: null,
        myReviews: [],
        isLoading: false,
        error: null,
        recruitReviews: [],
        recruitId: null,
        orgId: null,

        setReviewInfo: (recruitId, orgId) => set({ recruitId, orgId }),
        resetReviewInfo: () => set({ recruitId: null, orgId: null }),

        fetchReviews: async (cursor = 0) => {
          set({ isLoading: true });
          try {
            const response = await reviewApi.getReviews(cursor);
            set({ 
              reviews: response.reviews,
              hasMore: response.hasMore,
              nextCursor: response.nextCursor,
              error: null 
            });
          } catch (error) {
            console.error('리뷰 불러오기 실패:', error);
            set({ error: '리뷰를 불러오는데 실패했습니다.' });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchMoreReviews: async () => {
          const { hasMore, nextCursor, isLoading } = get();
          
          if (!hasMore || isLoading || nextCursor === null) return;
          
          set({ isLoading: true });
          try {
            const response = await reviewApi.getReviews(nextCursor);
            set((state) => ({ 
              reviews: [...state.reviews, ...response.reviews],
              hasMore: response.hasMore,
              nextCursor: response.nextCursor,
              error: null 
            }));
          } catch (error) {
            console.error('추가 리뷰 불러오기 실패:', error);
            set({ error: '추가 리뷰를 불러오는데 실패했습니다.' });
          } finally {
            set({ isLoading: false });
          }
        },

        fetchReviewDetail: async (id: number) => {
          set({ isLoading: true });
          try {
            const reviewDetail = await reviewApi.getReviewDetail(id);
            set({ reviewDetail, error: null });
          } catch (error) {
            console.error('리뷰 상세 정보 불러오기 실패:', error);
            set({ error: '리뷰 상세 정보를 불러오는데 실패했습니다.' });
          } finally {
            set({ isLoading: false });
          }
        },

        addComment: async (reviewId: number, commentData: { 
          content: string;
          writerId: number;
          writerName: string;
        }) => {
          try {
            const newComment = await reviewApi.addComment(reviewId, commentData.content);
            set((state) => ({
              reviewDetail: state.reviewDetail ? {
                ...state.reviewDetail,
                comments: [...state.reviewDetail.comments, {
                  ...newComment,
                  writerId: commentData.writerId,
                  writerName: commentData.writerName
                }]
              } : null
            }));
          } catch (error) {
            console.error('댓글 작성 실패:', error);
            throw error;
          }
        },

        fetchRecruitReviews: async (recruitId: number) => {
          set({ isLoading: true });
          try {
            const response = await reviewApi.getRecruitReviews(recruitId);
            set({ recruitReviews: response, error: null });
          } catch (error) {
            console.error('리뷰 목록 불러오기 실패:', error);
            set({ error: '리뷰 목록을 불러오는데 실패했습니다.' });
          } finally {
            set({ isLoading: false });
          }
        },

        deleteReview: async (reviewId: number) => {
          try {
            await reviewApi.deleteReview(reviewId);
            set((state) => ({
              reviews: state.reviews.filter(review => review.review.reviewId !== reviewId)
            }));
          } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            throw error;
          }
        },

        updateReview: async (reviewId: number, data: UpdateReviewRequest) => {
          try {
            const response = await reviewApi.updateReview(reviewId, data);
            set((state) => ({
              reviews: state.reviews.map(review => 
                review.review.reviewId === reviewId 
                  ? { 
                      ...review,
                      review: { 
                        ...review.review,
                        title: data.title,
                        content: data.content
                      }
                    }
                  : review
              ),
              reviewDetail: state.reviewDetail?.reviewId === reviewId 
                ? {
                    ...state.reviewDetail,
                    title: data.title,
                    content: data.content,
                    isPublic: data.isPublic,
                    images: data.images
                  }
                : state.reviewDetail
            }));
            return response;
          } catch (error) {
            console.error('리뷰 수정 실패:', error);
            throw error;
          }
        },

        updateVisibility: async (reviewId: number, isPublic: boolean) => {
          try {
            const response = await reviewApi.updateVisibility(reviewId, isPublic);
            set((state) => ({
              reviewDetail: state.reviewDetail?.reviewId === reviewId 
                ? { ...state.reviewDetail, isPublic: response.isPublic }
                : state.reviewDetail
            }));
          } catch (error) {
            console.error('공개 여부 수정 실패:', error);
            throw error;
          }
        },

        updateComment: async (commentId: number, content: string) => {
          try {
            const updatedComment = await reviewApi.updateComment(commentId, content);
            set((state) => ({
              reviewDetail: state.reviewDetail ? {
                ...state.reviewDetail,
                comments: state.reviewDetail.comments.map(comment =>
                  comment.commentId === commentId 
                    ? { 
                        ...updatedComment,
                        writerId: comment.writerId,
                        writerName: comment.writerName
                      } 
                    : comment
                )
              } : null
            }));
          } catch (error) {
            console.error('댓글 수정 실패:', error);
            throw error;
          }
        },

        deleteComment: async (commentId: number) => {
          try {
            await reviewApi.deleteComment(commentId);
            set((state) => ({
              reviewDetail: state.reviewDetail ? {
                ...state.reviewDetail,
                comments: state.reviewDetail.comments.filter(
                  comment => comment.commentId !== commentId
                )
              } : null
            }));
          } catch (error) {
            console.error('댓글 삭제 실패:', error);
            throw error;
          }
        },

        fetchMyReviews: async () => {
          set({ isLoading: true });
          try {
            const reviews = await reviewApi.getMyReviews();
            set({ myReviews: reviews, error: null });
          } catch (error: any) {
            if (error.response?.status === 404) {
              set({ myReviews: [], error: null });
              toast({
                title: "알림",
                description: "아직 작성한 봉사후기가 없습니다."
              });
            } else {
              set({ myReviews: [], error: '리뷰 목록을 불러오는데 실패했습니다.' });
              toast({
                variant: "destructive",
                title: "오류",
                description: "리뷰 목록을 불러오는데 실패했습니다."
              });
            }
          } finally {
            set({ isLoading: false });
          }
        },

        setReviews: (reviews) => set({ reviews }),

        createReview: async (data: CreateReviewRequest) => {
          try {
            await reviewApi.createReview(data);
            // 성공 후 필요한 상태 업데이트
          } catch (error) {
            console.error('리뷰 생성 실패:', error);
            throw error;
          }
        },
      }),
      {
        name: 'Review Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    ),
    {
      name: 'review-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);