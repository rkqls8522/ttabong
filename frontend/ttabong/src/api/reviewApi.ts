import axiosInstance from './axiosInstance';
import type { ReviewDetail, Comment, ReviewEditResponse, VisibilityResponse, RecruitReview, UpdateReviewRequest, CommentDeleteResponse, MyReview, ReviewsResponse, CreateReviewRequest, PresignedUrlResponse } from '@/types/reviewType';

const REVIEWS_PER_PAGE = 500; // 한 번에 불러올 리뷰 수

export const reviewApi = {
  getReviews: async (cursor: number = 0): Promise<ReviewsResponse> => {
    const response = await axiosInstance.get(`/reviews?cursor=${cursor}&limit=${REVIEWS_PER_PAGE}`);
    const reviews = response.data;
    
    return {
      reviews,
      hasMore: reviews.length === REVIEWS_PER_PAGE,
      nextCursor: reviews.length ? reviews[reviews.length - 1].review.reviewId : null
    };
  },
  
  getReviewDetail: async (id: number): Promise<ReviewDetail> => {
    const response = await axiosInstance.get(`/reviews/${id}`);
    return response.data;
  },
  
  addComment: async (reviewId: number, content: string): Promise<Comment> => {
    const response = await axiosInstance.post(`/reviews/comments/${reviewId}`, { content });
    return response.data;
  },
  
  getRecruitReviews: async (recruitId: number): Promise<RecruitReview[]> => {
    const response = await axiosInstance.get(`/reviews/recruits/${recruitId}`);
    return response.data;
  },
  
  updateReview: async (reviewId: number, data: UpdateReviewRequest): Promise<ReviewEditResponse> => {
    const response = await axiosInstance.patch(`/reviews/${reviewId}/edit`, data);
    return response.data;
  },
  
  deleteReview: async (reviewId: number): Promise<void> => {
    await axiosInstance.patch(`/reviews/${reviewId}/delete`);
  },
  
  uploadReviewImage: async (file: File, presignedUrl: string): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
  },
  
  updateVisibility: async (reviewId: number, isPublic: boolean): Promise<VisibilityResponse> => {
    const response = await axiosInstance.patch(`/reviews/${reviewId}/visibility`, { isPublic });
    return response.data;
  },
  
  updateComment: async (commentId: number, content: string): Promise<Comment> => {
    const response = await axiosInstance.patch(`/reviews/comments/${commentId}`, { content });
    return response.data;
  },
  
  deleteComment: async (commentId: number): Promise<CommentDeleteResponse> => {
    const response = await axiosInstance.patch(`/reviews/comments/${commentId}/delete`);
    return response.data;
  },
  
  getMyReviews: async (): Promise<MyReview[]> => {
    try {
      const response = await axiosInstance.get('/reviews/mine');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
  
  createReview: async (data: CreateReviewRequest): Promise<void> => {
    await axiosInstance.post('/reviews/write', data);
  },
  
  getPresignedUrls: async (): Promise<PresignedUrlResponse> => {
    const response = await axiosInstance.get('/reviews/write');
    return response.data.data;
  },
  
  getReviewEditDetail: async (id: number): Promise<ReviewEditResponse> => {
    const response = await axiosInstance.get(`/reviews/${id}/edit`);
    return response.data;
  }
}; 