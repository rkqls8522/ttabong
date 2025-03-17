import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MoreVertical } from 'lucide-react';
import type { Comment } from '@/types/reviewType';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Textarea } from '@/components/ui/textarea';

interface ReviewCommentsProps {
  comments: Comment[];
  commentContent: string;
  userId: number;
  onCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUpdateComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  className?: string;
}

export function ReviewComments({ 
  comments, 
  commentContent, 
  userId, 
  onCommentChange, 
  onSubmit, 
  onUpdateComment, 
  onDeleteComment 
}: ReviewCommentsProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState(''); 
  const { userName } = useUserStore();

  const handleEdit = (commentId: number, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  };

  const handleUpdate = async (commentId: number) => {
    if (editContent.length > 400) return;
    await onUpdateComment(commentId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  return (
    <>
      <Card className="border-0 shadow-none mb-16">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold">댓글 {comments.length}개</h3>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.commentId} className="flex gap-2 items-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{(comment.writerName || userName || '?')[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <strong className="text-sm">{comment.writerName || userName}</strong>
                  {editingId === comment.commentId ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <Textarea
                        value={editContent}
                        onChange={(e) => {
                          if (e.target.value.length <= 400) {
                            setEditContent(e.target.value);
                          }
                        }}
                        className="min-h-[80px] resize-none"
                        maxLength={400}
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => handleUpdate(comment.commentId)}>저장</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>취소</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words overflow-hidden max-w-[calc(100vw-120px)]">
                      {comment.content}
                    </p>
                  )}
                </div>
                {userId === comment.writerId && !editingId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(comment.commentId, comment.content)}>
                        수정하기
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteComment(comment.commentId)} className="text-destructive">
                        삭제하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="fixed bottom-[56px] left-0 right-0 bg-background border-t max-w-[600px] mx-auto">
        <form onSubmit={onSubmit} className="p-2 flex gap-2">
          <Input
            value={commentContent}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                onCommentChange(e);
              }
            }}
            placeholder="댓글을 입력하세요... (최대 400자)"
            className="w-full"
            maxLength={400}
          />
          <Button type="submit" size="icon" variant="ghost">
            <Send className="h-4 w-4" />
            <span className="sr-only">댓글 작성</span>
          </Button>
        </form>
      </div>
    </>
  );
} 