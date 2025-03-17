import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import indexImage from '@/assets/images/index.jpg';

export const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    // 페이드아웃 애니메이션이 끝난 후 페이지 전환
    setTimeout(() => {
      localStorage.setItem('hasVisited', 'true');
      navigate('/login', { state: { animateEntry: true } });
    }, 500);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <motion.div
      className="h-screen flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-[450px] mx-auto px-4 text-center">
        <motion.img 
          src={indexImage}
          alt="봉사 활동" 
          className="w-full rounded-2xl mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        <div className="text-xl mb-8 text-gray-700 leading-relaxed space-y-2">
          <motion.p {...fadeInUp} transition={{ delay: 0.8, duration: 0.6 }}>
            관심있는 봉사를 찾고,
          </motion.p>
          <motion.p {...fadeInUp} transition={{ delay: 1.4, duration: 0.6 }}>
            보람을 함께 나누고
          </motion.p>
          <motion.p {...fadeInUp} transition={{ delay: 2.0, duration: 0.6 }}>
            세상을 아름답게 만들어가요
          </motion.p>
        </div>

        <h1 className="mb-8 text-gray-800 space-x-1">
          <motion.span {...fadeInUp} transition={{ delay: 2.6, duration: 0.6 }}>
            따뜻한 봉사,
          </motion.span>
          <motion.span 
            className="text-4xl font-bold text-black-500"
            {...fadeInUp} 
            transition={{ delay: 3.2, duration: 0.6 }}
          >
            따봉
          </motion.span>
          <motion.span {...fadeInUp} transition={{ delay: 3.8, duration: 0.6 }}>
            에서
          </motion.span>
        </h1>
        
        <motion.button
          onClick={handleStart}
          className="px-8 py-3 text-lg font-medium bg-black text-white rounded-full
                    hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all
                    shadow-md hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.4, duration: 0.6 }}
        >
          봉사 시작하기
        </motion.button>
      </div>
    </motion.div>
  );
}; 