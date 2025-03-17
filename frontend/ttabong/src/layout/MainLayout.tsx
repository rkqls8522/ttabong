import React from "react";
import { TopBar } from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollProvider } from '@/contexts/ScrollContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-screen grid grid-rows-[56px_1fr_56px] pb-safe">
      <TopBar />
      
      <main className="overflow-hidden">
        <ScrollProvider>
          <ScrollArea className="h-full">
            {children}
          </ScrollArea>
        </ScrollProvider>
      </main>

      <NavBar className="pb-safe" />
    </div>
  );
}; 