import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopBar } from '@/components/TopBar';

const signUpSchema = z.object({
  email: z.string()
    .email('유효한 이메일을 입력해주세요')
    .max(50, '이메일은 50자 이하여야 합니다'),
  name: z.string()
    .min(2, '이름은 2자 이상, 10자 이하 이어야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름에는 한글과 영문만 입력 가능합니다'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상, 20자 이하여야 합니다'),
    
  phone: z.string()
    .regex(/^\d{3}-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'),
  preferredTime: z.string().optional(),
  interestTheme: z.string().optional(),
  durationTime: z.string().optional(),
  region: z.string().optional(),
  birthDate: z.string()
    .refine((date) => {
      if (!date) return true;
      
      const birthDate = new Date(date);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      
      return birthDate <= today && birthDate >= minDate;
    }, {
      message: '유효한 생년월일을 입력해주세요 (1900-01-01 이후, 오늘 이전)'
    }),
  gender: z.enum(['M', 'F']).optional(),
});

type SignUpValues = z.infer<typeof signUpSchema>;

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1 items-center">
      {children}
      <span className="text-destructive">*</span>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const { registerVolunteer, isLoading, error } = useUserStore();
  
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      preferredTime: '',
      interestTheme: '',
      durationTime: '',
      region: '',
      birthDate: '',
      gender: undefined,
    }
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      await registerVolunteer(values);
      navigate('/login');
    } catch (error) {
      // 에러는 store에서 처리됨
    }
  };

  const preventNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  return (
    <>
      <TopBar showNav={false} />
      <div className="h-[calc(100vh-56px)] overflow-y-auto">
        <div className="container max-w-md mx-auto px-4 py-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
            <p className="text-sm text-muted-foreground">
              봉사활동을 시작하기 위한 첫걸음
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>이메일</RequiredLabel>
                    </FormLabel>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>이름</RequiredLabel>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="이름을 입력하세요" 
                        {...field} 
                        maxLength={10}
                        onKeyPress={preventNumbers}
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
                    <FormLabel>
                      <RequiredLabel>비밀번호</RequiredLabel>
                    </FormLabel>
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <RequiredLabel>전화번호</RequiredLabel>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="010-0000-0000" 
                        {...field} 
                        maxLength={13}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional fields */}
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">선택 정보</p>
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>생년월일</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          min="1900-01-01"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성별</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="성별을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">남성</SelectItem>
                          <SelectItem value="F">여성</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
            >
              이미 계정이 있으신가요? 로그인하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 