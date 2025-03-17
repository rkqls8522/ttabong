import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from '@/stores/userStore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/TopBar';
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string()
    .email('유효한 이메일을 입력해주세요')
    .max(50, '이메일은 50자 이하여야 합니다'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(20, '비밀번호는 20자 이하여야 합니다')
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useUserStore();
  const [activeTab, setActiveTab] = useState<'volunteer' | 'organization'>(
    (location.state?.userType as 'volunteer' | 'organization') || 'volunteer'
  );
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { toast } = useToast();
  const shouldAnimate = location.state?.animateEntry;
  const [isExiting, setIsExiting] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'volunteer' | 'organization');
    clearError();
    form.reset();
  };

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (values: LoginValues) => {
    try {
      const message = await login(values.email, values.password, activeTab);
      
      // 성공 시 페이드아웃 후 페이지 전환
      setIsExiting(true);
      toast({
        title: "로그인 성공",
        description: message,
      });
      
      setTimeout(() => {
        navigate('/main', { state: { animateEntry: true } });
      }, 500);
      
    } catch (error: any) {
      // 400, 403 에러 처리 (로그인 실패)
      if (error.status === 400 || error.status === 403) {
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: error.message
        });
        form.setError('root', { message: error.message });
        return;
      }

      // 리다이렉션이 필요한 경우
      try {
        const redirectData = JSON.parse(error.message);
        if (redirectData.path && redirectData.state) {
          toast({
            variant: "destructive",
            title: "로그인 실패",
            description: redirectData.message,
          });
          navigate(redirectData.path, { state: redirectData.state });
          return;
        }
      } catch {
        // 기타 에러 처리
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: error.message || '로그인에 실패했습니다.',
        });
        form.setError('root', { message: error.message || '로그인에 실패했습니다.' });
      }
    }
  };

  return (
    <div>
      <TopBar showNav={false} />
      <motion.div 
        className="h-[calc(100vh-56px)] overflow-y-auto"
        initial={{ opacity: shouldAnimate ? 0 : 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Tabs 
              defaultValue="volunteer" 
              className="w-full" 
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="volunteer">개인 회원</TabsTrigger>
                <TabsTrigger value="organization">기관 회원</TabsTrigger>
              </TabsList>
              
              <TabsContent value="volunteer" className="space-y-6">
                <LoginForm form={form} onSubmit={onSubmit} isLoading={isLoading} error={error} userType="volunteer" />
              </TabsContent>
              
              <TabsContent value="organization" className="space-y-6">
                <LoginForm form={form} onSubmit={onSubmit} isLoading={isLoading} error={error} userType="organization" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LoginForm({ form, onSubmit, isLoading, error, userType }: any) {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {userType === 'volunteer' ? '개인 회원 로그인' : '기관 회원 로그인'}
        </h1>
        <p className="text-sm text-muted-foreground">
          서비스를 이용하기 위해 로그인해주세요
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    {...field}
                    maxLength={50}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    {...field}
                    maxLength={20}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </Form>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {userType === 'volunteer' ? '아직 계정이 없으신가요?' : '기관 회원 가입을 원하시나요?'}
        </p>
        <Button 
          variant="link" 
          className="text-sm"
          onClick={() => navigate(userType === 'volunteer' ? '/signup' : '/org-signup')}
        >
          {userType === 'volunteer' ? '회원가입하기' : '기관 회원가입'}
        </Button>
      </div>
    </>
  );
} 