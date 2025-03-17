interface Review {
  review: {
    reviewId: number;
    recruitId: number;
    title: string;
    content: string;
    isDeleted: boolean;
    updatedAt: string;
    createdAt: string;
  };
  group: {
    groupId: number;
    groupName: string;
  };
  organization: {
    orgId: number;
    orgName: string;
  };
  images: string;  
}

interface Comment {
  commentId: number;
  content: string;
  writerId: number;
  writerName: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewDetail {
  reviewId: number;
  title: string;
  content: string;
  isDeleted: boolean;
  isPublic: boolean;
  attended: boolean;
  createdAt: string;
  images: string[];
  recruit: {
    recruitId: number;
    activityDate: string;
    activityTime: string;
    status: string;
  };
  category: {
    categoryId: number;
    name: string;
  };
  writer: {
    writerId: number;
    writerName: string;
    writerProfileImage: string;
  };
  template: {
    templateId: number;
    title: string;
    activityLocation: string;
    status: string;
    group: {
      groupId: number;
      groupName: string;
    };
  };
  organization: {
    orgId: number;
    orgName: string;
  };
  orgReviewId?: number;
  comments: Comment[];
}

interface UpdateReviewRequest {
  cacheId: number;
  title: string;
  content: string;
  isPublic: boolean;
  presignedUrl: string[];  // 새로 업로드할 이미지의 presignedUrl
  images: string[];        // 기존 이미지 URL
}

interface ReviewEditResponse {
  cacheId: number;
  writerId: number;
  title: string;
  content: string;
  isPublic: boolean;
  getImages: string[];      // 기존 이미지 URL (다운로드용)
  presignedUrl: string[];   // 새 이미지 업로드용 URL
}

interface VisibilityResponse {
  message: string;
  reviewId: number;
  isPublic: boolean;
  updatedAt: string;
}

interface RecruitReview {
  review: {
    reviewId: number;
    recruitId: number;
    title: string;
    content: string;
    isDeleted: boolean;
    updatedAt: string;
    createdAt: string;
  };
  writer: {
    writerId: number;
    name: string;
  };
  group: {
    groupId: number;
    groupName: string;
  };
  organization: {
    orgId: number;
    orgName: string;
  };
  images: string;
}

interface CommentDeleteResponse {
  message: string;
  commentId: number;
}

interface MyReview {
  review: {
    reviewId: number;
    recruitId: number;
    title: string;
    content: string;
    isDeleted: boolean;
    updatedAt: string;
    createdAt: string;
  };
  group: {
    groupId: number;
    groupName: string;
  };
  organization: {
    orgId: number;
    orgName: string;
  };
  images?: string;
}

interface ReviewListItem {
  review: {
    reviewId: number;
    recruitId: number;
    title: string;
    content: string;
    isDeleted: boolean;
    updatedAt: string;
    createdAt: string;
  };
  group: {
    groupId: number;
    groupName: string;
  };
  organization: {
    orgId: number;
    orgName: string;
  };
  images: string | null; // null일 경우 이미지 없음을 의미
}

interface ReviewsResponse {
  reviews: ReviewListItem[];
  hasMore: boolean;
  nextCursor: number | null;
}

interface ReviewEditRequest {
  title: string;
  content: string;
  isPublic: boolean;
  images: string[];  
}

interface PresignedUrlResponse {
  imageUrls: string[];
}

interface CreateReviewRequest {
  recruitId: number;
  orgId: number;
  title: string;
  content: string;
  isPublic: boolean;
  uploadedImages: string[];
  imageCount: number;
}

export type { 
  Review, 
  ReviewDetail, 
  Comment, 
  UpdateReviewRequest, 
  ReviewEditResponse, 
  VisibilityResponse, 
  RecruitReview,
  CommentDeleteResponse,
  MyReview,
  ReviewsResponse,
  ReviewListItem,
  ReviewEditRequest,
  PresignedUrlResponse,
  CreateReviewRequest
};