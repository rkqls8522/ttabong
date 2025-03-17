import React, { ReactNode } from 'react';
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <motion.div
      className="min-h-[calc(100%-56px)] pb-[env(safe-area-inset-bottom,24px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}; 