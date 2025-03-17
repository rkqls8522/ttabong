import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ReviewWriteFormProps {
  title: string;
  content: string;
  isPublic: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPublicChange: (checked: boolean) => void;
}

const reviewSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자를 초과할 수 없습니다"),
  content: z.string().min(1, "내용을 입력해주세요").max(2000, "내용은 2000자를 초과할 수 없습니다"),
  isPublic: z.boolean()
});

export function ReviewWriteForm({
  title,
  content,
  isPublic, 
  onTitleChange,
  onContentChange,
  onPublicChange,
}: ReviewWriteFormProps) {
  const { formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title,
      content,
      isPublic
    }
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 100) {
      onTitleChange(e);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 2000) {
      onContentChange(e);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          maxLength={100}
          placeholder="제목을 입력하세요"
          className={errors.title ? "border-destructive" : ""}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-destructive">{errors.title?.message}</p>
          <p className="text-sm text-muted-foreground">{title.length}/100</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          maxLength={2000}
          placeholder="내용을 입력하세요"
          className="min-h-[200px]"
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-destructive">{errors.content?.message}</p>
          <p className="text-sm text-muted-foreground">{content.length}/2000</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="public" className="text-base">공개 설정</Label>
            <p className="text-sm text-muted-foreground">
              {isPublic ? '모든 사용자가 볼 수 있습니다' : '나만 볼 수 있습니다'}
            </p>
          </div>
          <Switch
            id="public"
            checked={isPublic}
            onCheckedChange={onPublicChange}
          />
        </div>
      </Card>
    </div>
  );
} 