import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Eye, User } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center justify-center h-full flex-1
        ${isActive ? 'text-primary' : 'text-muted-foreground'}
      `}
    >
      <Icon className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-medium leading-none">
        {label}
      </span>
    </NavLink>
  );
};

interface NavBarProps {
  className?: string;
}

export const NavBar = ({ className }: NavBarProps) => {
  const location = useLocation();
  const { userType } = useUserStore();
  const isLoginPage = location.pathname === '/login';
  
  if (isLoginPage) return null;

  const recruitPath = userType === 'volunteer' ? '/recruit' : '/add-recruit';
  const recruitLabel = userType === 'volunteer' ? '후기 작성' : '공고 등록';

  return (
    <nav className={`
      fixed bottom-0 left-1/2 -translate-x-1/2 
      w-full max-w-[600px] min-w-[320px] 
      bg-background border-t border-border
      h-14
      z-50
      ${className || ''}
    `}>
      <div className="flex justify-around h-full py-2">
        <NavItem to="/main" icon={Home} label="홈" />
        <NavItem to="/recruit-find" icon={Search} label="공고 검색" />
        <NavItem to={recruitPath} icon={PlusCircle} label={recruitLabel} />
        <NavItem to="/review-find" icon={Eye} label="후기 탐색" />
        <NavItem to="/mypage" icon={User} label="마이페이지" />
      </div>
    </nav>
  );
};

export default NavBar;
