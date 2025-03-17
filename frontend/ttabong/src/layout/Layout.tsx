import { Outlet, useLocation } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollProvider } from '@/contexts/ScrollContext';

export const Layout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/org-signup'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="h-screen">
        <ScrollProvider>
          <ScrollArea className="h-full">
            <Outlet />
          </ScrollArea>
        </ScrollProvider>
      </div>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};