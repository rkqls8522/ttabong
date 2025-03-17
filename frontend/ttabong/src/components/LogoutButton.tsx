import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
}

export const LogoutButton = ({ className, variant = "ghost" }: LogoutButtonProps) => {
  const navigate = useNavigate();
  const { logout } = useUserStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "로그아웃",
        description: "로그아웃되었습니다",
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다",
      });
    }
  };

  return (
    <Button 
      variant={variant}
      size="sm"
      className={className}
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      로그아웃
    </Button>
  );
}; 