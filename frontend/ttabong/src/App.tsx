import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/hooks/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useUserStore } from '@/stores/userStore';
import { Layout } from "@/layout/Layout";
import TemplateAndGroupWrite from '@/pages/Me/TemplateAndGroupWrite';
import RecruitDetail from '@/pages/ChooseRecruit/org/RecruitDetail';

// Pages
import Login from '@/pages/Login';
import MainPage from '@/pages/MainPage';
import OrgMainPage from '@/pages/OrgMainPage';
import RecruitFind from '@/pages/RecruitFind_new'
import ReviewFind from '@/pages/ReviewFind';
import ReviewDetail from '@/pages/ReviewFind/ReviewDetail';
import ReviewDetailList from '@/pages/ReviewFind/ReviewDetailList';
import MyPage from '@/pages/MyPage';
import OrgMyPage from '@/pages/OrgMyPage';
import ReviewWrite from '@/pages/ChooseRecruit/ReviewWrite';
import SignUp from '@/pages/SignUp';
import OrgSignUp from '@/pages/OrgSignUp';
import AddRecruit from '@/pages/AddRecruit';
import ChooseRecruit from './pages/ChooseRecruit';
import OrgDetailPage from '@/pages/OrgDetailPage';
import MyReviews from '@/pages/MyReviews';
import RecruitManageVolunteers from '@/pages/MainPage/RecruitManageVolunteers';
import TemplateDetail from '@/pages/ChooseRecruit/volunteer/VolTemplateDetail';
import { IndexPage } from "@/pages/IndexPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userId } = useUserStore();
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function UserTypeRoute({ 
  volunteerComponent: VolunteerComponent,
  orgComponent: OrgComponent 
}: {
  volunteerComponent: React.ComponentType;
  orgComponent: React.ComponentType;
}) {
  const { userType } = useUserStore();
  return userType === 'volunteer' ? <VolunteerComponent /> : <OrgComponent />;
}

const App: React.FC = () => {
  const hasVisited = localStorage.getItem('hasVisited');

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster />
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <div className="mx-auto max-w-[600px] min-w-[320px] h-screen bg-background">
          <Routes>
            <Route path="/" element={
              hasVisited ? <Navigate to="/login" replace /> : <IndexPage />
            } />
            {/* 인증이 필요없는 라우트 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/org-signup" element={<OrgSignUp />} />
            
            {/* 인증이 필요한 라우트 */}
            <Route element={<Layout />}>
              <Route path="/add-recruit" element={
                <ProtectedRoute>
                  <UserTypeRoute 
                    volunteerComponent={MainPage}
                    orgComponent={OrgMainPage}
                  />
                </ProtectedRoute>
              } />
              
              <Route path="/recruit" element={
                <ProtectedRoute>
                  <UserTypeRoute 
                    volunteerComponent={ChooseRecruit}
                    orgComponent={AddRecruit}
                  />
                </ProtectedRoute>
              } />
              
              <Route path="/recruit-find" element={
                <ProtectedRoute>
                  <RecruitFind />
                </ProtectedRoute>
              } />
              
              <Route path="/recruits/:recruitId" element={
                <ProtectedRoute>
                  <RecruitDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/review-find" element={
                <ProtectedRoute>
                  <ReviewFind />
                </ProtectedRoute>
              } />
              
              <Route path="/review-find/:reviewId" element={
                <ProtectedRoute>
                  <ReviewDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/review-find/:reviewId/reviews" element={
                <ProtectedRoute>
                  <ReviewDetailList />
                </ProtectedRoute>
              } />
              
              <Route path="/review-write" element={
                <ProtectedRoute>
                  <ReviewWrite />
                </ProtectedRoute>
              } />
              
              <Route path="/mypage" element={
                <ProtectedRoute>
                  <UserTypeRoute 
                    volunteerComponent={MyPage}
                    orgComponent={OrgMyPage}
                  />
                </ProtectedRoute>
              } />

              <Route path="/main" element={
                <ProtectedRoute>
                  <UserTypeRoute 
                    volunteerComponent={MainPage}
                    orgComponent={AddRecruit}
                  />
                </ProtectedRoute>
              } />

              <Route path="/template-and-group-write" element={
                <ProtectedRoute>
                  <TemplateAndGroupWrite />
                </ProtectedRoute>
              } />

              <Route path="/org-detail" element={
                <ProtectedRoute>
                  <OrgDetailPage />
                </ProtectedRoute>
              } />

              <Route path="/volunteer-history" element={
                <ProtectedRoute>
                  <ChooseRecruit />
                </ProtectedRoute>
              } />

              <Route path="/my-reviews" element={
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              } />

              <Route 
                path="/org/recruits/:recruitId" 
                element={
                  <ProtectedRoute>
                    <RecruitDetail />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/recruit-manage/:recruitId" 
                element={
                  <ProtectedRoute>
                    <RecruitManageVolunteers />
                  </ProtectedRoute>
                }
              />

              <Route path="/templates/:templateId" element={<TemplateDetail />} />
            </Route>
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
