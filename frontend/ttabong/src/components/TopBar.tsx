import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  showNav?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ showNav = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackDialog, setShowBackDialog] = useState(false);

  // 메인 네비게이션 경로 목록
  const mainNavPaths = [
    '/main',
    '/recruit-find',
    '/recruit',
    '/add-recruit',
    '/review-find',
    '/mypage'
  ];

  const isMainNavPath = mainNavPaths.includes(location.pathname);
  const handleBackClick = () => {
    if (location.pathname === "/template-and-group-write") {
      setShowBackDialog(true);
    } else {
      navigate(-1);
    }
  };

  if (!showNav) {
    return (
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-center px-4">
          <img 
            src="/assets/logo_color_only.svg" 
            alt="로고" 
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate('/main')}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {!isMainNavPath && (
              <button onClick={handleBackClick} className="p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}
          </div>

          <img 
            src="/assets/logo_color_only.svg" 
            alt="로고" 
            className="h-8 w-auto absolute left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={() => navigate('/main')}
          />

          <div className="w-14" /> {/* 레이아웃 균형을 위한 빈 공간 */}
        </div>
      </div>

      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>작성 취소</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            작성 중인 내용이 저장되지 않습니다.
            초기 목록 화면으로 돌아가시겠습니까?
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBackDialog(false)}
            >
              아니오
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowBackDialog(false);
                navigate('/add-recruit');
              }}
            >
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 