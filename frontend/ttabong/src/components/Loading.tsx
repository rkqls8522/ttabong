import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingProps {
  className?: string;
  text?: string;
}

// 기본 스피너 (작은 인라인 로딩)
export function LoadingSpinner({ className }: LoadingProps) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

// 전체 페이지 로딩
export function PageLoading({ text = "로딩중입니다..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-112px)]">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-muted-foreground mt-4">{text}</p>
    </div>
  );
}

// 컨텐츠 영역 로딩 (카드나 섹션 내부)
export function ContentLoading({ text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}

// 버튼 내부 로딩
export function ButtonLoading() {
  return <Loader2 className="h-4 w-4 animate-spin mr-2" />;
} 

export function FeedLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-112px)]">
      <div className="space-y-8 w-full max-w-[500px] px-4">
        {/* 피드 카드 스켈레톤 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        
        {/* 두 번째 피드 카드 스켈레톤 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
      <p className="text-muted-foreground mt-4">로딩중입니다...</p>
    </div>
  );
}; 