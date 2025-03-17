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
import { TopBar } from '@/components/TopBar';

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1 items-center">
      {children}
      <span className="text-destructive">*</span>
    </div>
  );
}

const orgSignUpSchema = z.object({
  email: z.string()
    .email('유효한 이메일을 입력해주세요')
    .max(50, '이메일은 50자 이하여야 합니다'),
  name: z.string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름에는 한글과 영문만 입력 가능합니다'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(20, '비밀번호는 20자 이하여야 합니다'),
  phone: z.string()
    .regex(/^\d{3}-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'),
  businessRegNumber: z.string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)'),
  orgName: z.string()
    .min(2, '기관명은 2자 이상이어야 합니다')
    .max(100, '기관명은 100자 이하여야 합니다')
    .regex(/^(?!\d+$)[가-힣a-zA-Z0-9\s]+$/, '기관명에는 한글, 영문, 숫자를 포함할 수 있으나 숫자로만 이루어질 수 없습니다'),
  representativeName: z.string()
    .min(2, '대표자명은 2자 이상이어야 합니다')
    .max(50, '대표자명은 50자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '대표자명에는 한글과 영문만 입력 가능합니다'),
  orgAddress: z.string()
    .min(5, '주소는 5자 이상이어야 합니다')
    .max(200, '주소는 200자 이하여야 합니다'),
});

type OrgSignUpValues = z.infer<typeof orgSignUpSchema>;

export default function OrgSignUp() {
  const navigate = useNavigate();
  const { registerOrganization, isLoading, error } = useUserStore();
  
  const form = useForm<OrgSignUpValues>({
    resolver: zodResolver(orgSignUpSchema),
    mode: "onChange",
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      businessRegNumber: '',
      orgName: '',
      representativeName: '',
      orgAddress: '',
    }
  });

  const onSubmit = async (values: OrgSignUpValues) => {
    try {
      await registerOrganization(values);
      navigate('/login', { state: { userType: 'organization' } });
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
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">기관 회원가입</h1>
              <p className="text-sm text-muted-foreground">
                봉사활동 기관으로 등록하고 봉사자를 모집해보세요
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
                        <RequiredLabel>담당자 이름</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="담당자 이름을 입력하세요" 
                          {...field} 
                          maxLength={20}
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

                <FormField
                  control={form.control}
                  name="businessRegNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <RequiredLabel>사업자등록번호</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123-45-67890" 
                          {...field} 
                          maxLength={12}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orgName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <RequiredLabel>기관명</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="기관명을 입력하세요" 
                          {...field} 
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="representativeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <RequiredLabel>대표자명</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="대표자명을 입력하세요" 
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
                  name="orgAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <RequiredLabel>기관 주소</RequiredLabel>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="기관 주소를 입력하세요" 
                          {...field} 
                          maxLength={200}
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
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '가입 중...' : '기관 회원가입'}
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
      </div>
    </>
  );
} 