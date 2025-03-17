import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ReviewDetail } from '@/types/reviewType';

interface ReviewContentProps {
  reviewId: number;
  title: string;
  content: string;
  category: ReviewDetail['category'];
  isOrganization: boolean;
  orgReviewId?: number;
}

export function ReviewContent({ 
  title, 
  content, 
  category, 
}: ReviewContentProps) {

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-4 space-y-4">
        <Badge variant="secondary">{category.name}</Badge>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
} 