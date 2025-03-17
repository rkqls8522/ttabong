import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ReviewWriteHeader } from './components/ReviewWriteHeader';
import { ReviewWriteImages } from './components/ReviewWriteImages';
import { ReviewWriteForm } from './components/ReviewWriteForm';
import { RecruitDetailCard } from './components/RecruitDetailCard';
import { useReviewStore } from '@/stores/reviewStore';
import { useRecruitStore } from '@/stores/recruitStore';
import { useImageStore } from '@/stores/imageStore';
import { reviewApi } from '@/api/reviewApi';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/userStore';


export default function ReviewWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userType } = useUserStore();
  
  const { recruitDetail, fetchRecruitDetail, resetSelectedRecruitId, setSelectedRecruitId } = useRecruitStore();
  const { updateReview, createReview } = useReviewStore();
  const { fetchPresignedUrls, reset: resetImageStore } = useImageStore();
  
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const isEdit = Boolean(location.state?.isEdit);
  const editReviewId = location.state?.reviewId;

  useEffect(() => {
    const recruitId = location.state?.recruitId;
    
    if (!recruitId) {
      navigate('/volunteer-history');
      return;
    }

    const init = async () => {
      try {
        await fetchRecruitDetail(recruitId, userType || 'volunteer');
        await setSelectedRecruitId(recruitId);
        await fetchPresignedUrls();
      } catch (error) {
        console.error('초기화 실패:', error);
        toast({
          variant: "destructive",
          title: "오류",
          description: "초기화에 실패했습니다. 다시 시도해주세요."
        });
        navigate('/volunteer-history');
      }
    };

    init();

    // cleanup
    return () => {
      resetSelectedRecruitId();
      resetImageStore();
    };
  }, []);

  useEffect(() => {
    if (isEdit && editReviewId) {
      const loadReview = async () => {
        try {
          const review = await reviewApi.getReviewEditDetail(Number(editReviewId));
          setTitle(review.title);
          setContent(review.content);
          setImages(review.getImages || []);
          setIsPublic(review.isPublic);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "오류",
            description: "리뷰 정보를 불러오는데 실패했습니다."
          });
          navigate(-1);
        }
      };
      loadReview();
    }
  }, [editReviewId, isEdit, navigate, toast]);

  const handleImageUploadComplete = async (uploadedUrls: string[]) => {
    try {
      setImages(uploadedUrls);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이미지 업로드에 실패했습니다."
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "제목과 내용을 입력해주세요."
      });
      return;
    }

    if (!recruitDetail) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "봉사 모집 정보를 찾을 수 없습니다."
      });
      return;
    }

    try {
      if (isEdit && editReviewId) {
        const review = await reviewApi.getReviewEditDetail(Number(editReviewId));
        await updateReview(Number(editReviewId), {
          cacheId: review.cacheId,
          title,
          content,
          isPublic,
          presignedUrl: [],
          images,
        });
        
        toast({
          title: "성공",
          description: "리뷰가 수정되었습니다."
        });
      } else {
        await createReview({
          recruitId: recruitDetail.recruit.recruitId,
          orgId: recruitDetail.organization.orgId,
          title,
          content,
          isPublic,
          uploadedImages: images,
          imageCount: images.length
        });

        toast({
          title: "성공",
          description: "후기가 등록되었습니다."
        });
      }
      
      navigate(-1);
    } catch (error: any) {
      console.error('Error:', error); // 에러 객체 확인용 로그
      
      const axiosMessage = error.message || '';
      const serverMessage = error.response?.data?.message;
      const errorMessage = serverMessage 
        ? `${axiosMessage}\n${serverMessage}`
        : axiosMessage || (isEdit ? "리뷰 수정에 실패했습니다." : "리뷰 등록에 실패했습니다.");

      toast({
        variant: "destructive",
        title: `오류 (${error.response?.status || 500})`,
        description: errorMessage
      });
    }
  };

  return (
    <div className="pb-[calc(56px+56px)]">
      {recruitDetail && <RecruitDetailCard recruitDetail={recruitDetail} />}
      
      <ReviewWriteHeader
        writer={{
          writerId: 1,
          writerName: "김봉사",
          writerProfileImage: "https://picsum.photos/100/100"
        }}
        organization={{
          orgId: recruitDetail?.organization.orgId!,
          orgName: recruitDetail?.organization.name!
        }}
      />
            <div className="space-y-6 p-4">
      <ReviewWriteImages
        onImageUploadComplete={handleImageUploadComplete}
        existingImages={isEdit ? images : []}
        isEdit={isEdit}
      />
      </div>

      <ReviewWriteForm
        title={title}
        content={content}
        isPublic={isPublic}
        onTitleChange={(e) => setTitle(e.target.value)}
        onContentChange={(e) => setContent(e.target.value)}
        onPublicChange={setIsPublic}
      />

      <div className="fixed bottom-[56px] left-0 right-0 p-4 bg-background border-t max-w-[600px] mx-auto">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {isEdit ? '수정' : '등록'}
          </Button>
        </div>
      </div>
    </div>
  );
}
