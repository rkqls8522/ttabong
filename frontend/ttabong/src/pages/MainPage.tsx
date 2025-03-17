import React, { useEffect, useState } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import axiosInstance from '@/api/axiosInstance';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { recruitApi } from "@/api/recruitApi";
import { ImageOff } from 'lucide-react';

// API 응답 데이터 타입 정의
type RecruitData = {
  template: {
    templateId: number;
    title: string;
    activityLocation: string;
    status: string;
    imageId?: string;
    description: string;
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
};

// 카드에 표시할 데이터 타입 
type VolunteerPost = {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
  image?: string | null;
};

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: 0,
  delay: i * 10,
});

const from = () => ({ x: 0, rot: 0, scale: 1.2, y: 1000 });

const MainPage: React.FC = () => {
  const [volunteerPosts, setVolunteerPosts] = useState<VolunteerPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [gone] = useState(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecruits = async () => {
      try {
        const response = await axiosInstance.get('/vol/templates', {
          params: { cursor: 0, limit: 20 }
        });
        
        const formattedData: VolunteerPost[] = response.data.templates.map((item: RecruitData) => ({
          id: item.template.templateId,
          title: item.template.title,
          location: item.group.groupName,
          date: item.template.createdAt.split('T')[0],
          description: `${item.organization.orgName} | ${item.template.description}`,
          image: item.template.imageId || null,
        }));
 
        setVolunteerPosts(formattedData);
        setCurrentIndex(formattedData.length - 1);
      } catch (error) {
        console.error("Error fetching recruit data:", error);
      }
    };

    fetchRecruits();
  }, []);

  const [springs, api] = useSprings(volunteerPosts.length, (i) => ({
    ...to(i),
    from: from(),
  }));

  const handleSwipe = async (index: number, direction: number) => {
    const isLike = direction > 0;  // 오른쪽 스와이프면 좋아요
    const templateId = volunteerPosts[index]?.id;

    try {
      await recruitApi.reactToTemplate(templateId, isLike);
      toast({
        title: isLike ? "관심 봉사 등록" : "봉사 거절",
        description: isLike ? "관심 봉사에 등록되었습니다." : "봉사를 거절했습니다."
      });
    } catch (error) {
      console.error('Template reaction failed:', error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "처리 중 오류가 발생했습니다."
      });
    }
  };

  const bind = useDrag(({ args: [index], down, movement: [mx], velocity }) => {
    if (index !== currentIndex) return;

    const trigger = velocity > 0.2;
    if (!down && trigger) {
      gone.add(index);
      setCurrentIndex(prev => prev !== null ? prev - 1 : null);
      handleSwipe(index, mx);  // 스와이프 방향에 따라 API 호출
    }

    api.start((i) => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (mx > 0 ? 1000 : -1000) : down ? mx : 0;
      const rot = mx / 100;
      const scale = down ? 1.1 : 1;
      return {
        x,
        rot,
        scale,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 }
      };
    });

    if (!down && gone.size === volunteerPosts.length) {
      setTimeout(() => {
        gone.clear();
        setCurrentIndex(volunteerPosts.length - 1);
        api.start((i) => to(i));
      }, 600);
    }
  });

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-112px)] bg-background relative pt-14">
      <div className="w-full max-w-[600px] h-full relative">
        {springs.map(({ x, y, rot, scale }, i) => (
          <animated.div
            key={volunteerPosts[i]?.id}
            className={`absolute w-[90vw] max-w-[400px] h-[calc(100%-2rem)] bg-white shadow-xl rounded-2xl overflow-hidden
              ${i === currentIndex ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            style={{
              left: "50%",
              top: "50%",
              transform: interpolate(
                [x, y, rot, scale],
                (x, y, rot, scale) =>
                  `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0) rotate(${rot}deg) scale(${scale})`
              ),
            }}
            {...bind(i)}
          >
            {volunteerPosts[i]?.image ? (
              <img
                src={volunteerPosts[i].image}
                alt={volunteerPosts[i].title}
                className="w-full h-[50%] object-cover"
              />
            ) : (
              <div className="w-full h-[50%] bg-muted flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="w-12 h-12" />
                  <span className="text-sm">이미지가 없습니다</span>
                </div>
              </div>
            )}
            <div className="p-6 flex flex-col h-[50%]">
              <h2 className="text-xl font-bold mb-2">{volunteerPosts[i]?.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {volunteerPosts[i]?.location} | {volunteerPosts[i]?.date}
              </p>
              <p className="text-sm text-foreground mb-4 flex-1 overflow-y-auto">
                {volunteerPosts[i]?.description}
              </p>
              <Button 
                variant="outline"
                className="w-full mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/templates/${volunteerPosts[i]?.id}`);
                }}
              >
                공고 상세보기
              </Button>
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
