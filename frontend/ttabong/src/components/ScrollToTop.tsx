import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 일반 window 스크롤 초기화
    window.scrollTo(0, 0);
    
    // ScrollArea 스크롤 초기화
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
    }
  }, [pathname]);

  return null;
} 