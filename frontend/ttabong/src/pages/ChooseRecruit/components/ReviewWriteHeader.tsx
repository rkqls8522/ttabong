import { ReviewHeader } from '@/pages/ReviewFind/components/ReviewHeader';
import type { ReviewDetail } from '@/types/reviewType';

interface ReviewWriteHeaderProps {
  writer: ReviewDetail['writer'];
  organization: ReviewDetail['organization'];
}

export function ReviewWriteHeader({ writer, organization }: ReviewWriteHeaderProps) {
  return <ReviewHeader writer={writer} organization={organization} />;
} 