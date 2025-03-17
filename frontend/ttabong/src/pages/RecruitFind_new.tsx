import { useRef, useCallback } from 'react';
import { useRecruitStore } from '@/stores/recruitStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import type { SearchTemplate } from '@/types/recruitType';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';

const REGIONS = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const STATUS_OPTIONS = [
  { value: 'RECRUITING', label: '모집중' },
  { value: 'RECRUITMENT_CLOSED', label: '모집마감' },
  { value: 'ACTIVITY_COMPLETED', label: '활동완료' }
];

const ITEMS_PER_PAGE = 500;

const searchSchema = z.object({
  templateTitle: z.string()
    .max(100, '제목은 100자 이하여야 합니다'),
  organizationName: z.string()
    .max(100, '기관명은 100자 이하여야 합니다'),
  status: z.string().optional(),
  region: z.string(),
  activityDateStart: z.string(),
  activityDateEnd: z.string()
    .optional()
}).refine((data) => {
  if (data.activityDateStart && data.activityDateEnd) {
    return new Date(data.activityDateStart) <= new Date(data.activityDateEnd);
  }
  return true;
}, {
  message: "시작일은 종료일보다 이전이어야 합니다",
  path: ["activityDateStart"]
});

type SearchValues = z.infer<typeof searchSchema>;

export default function RecruitFind() {
  const { 
    searchTemplates, 
    searchResults, 
    searchNextCursor,
    searchHasMore,
    isLoading, 
    error,
    clearSearchResults 
  } = useRecruitStore();
  
  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      templateTitle: '',
      organizationName: '',
      status: '',
      region: '전체',
      activityDateStart: '',
      activityDateEnd: ''
    }
  });

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && searchHasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, searchHasMore]);

  const navigate = useNavigate();

  const onSubmit = async (values: SearchValues) => {
    try {
      clearSearchResults();
      await searchTemplates({
        cursor: 0,
        limit: ITEMS_PER_PAGE,
        templateTitle: values.templateTitle || undefined,
        searchConditions: {
          organizationName: values.organizationName || undefined,
          status: values.status || undefined,
          activityDate: values.activityDateStart ? {
            start: values.activityDateStart,
            end: values.activityDateEnd || values.activityDateStart
          } : undefined,
          region: values.region === '전체' ? undefined : values.region
        }
      });
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  const loadMore = async () => {
    if (!searchHasMore || isLoading) return;
    
    try {
      await searchTemplates({
        cursor: searchNextCursor || undefined,
        limit: ITEMS_PER_PAGE,
        templateTitle: form.watch('templateTitle') || undefined,
        searchConditions: {
          organizationName: form.watch('organizationName') || undefined,
          status: form.watch('status') || undefined,
          region: form.watch('region'),
          activityDate: form.watch('activityDateStart') ? {
            start: form.watch('activityDateStart'),
            end: form.watch('activityDateEnd') || form.watch('activityDateStart')
          } : undefined
        }
      });
    } catch (error) {
      console.error('추가 데이터 로드 실패:', error);
    }
  };

  const handleTemplateClick = (templateId: number) => {
    navigate(`/templates/${templateId}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="templateTitle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="공고 제목 검색 (100자 이내)"
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
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="기관명 검색 (100자 이내)"
                    {...field}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="activityDateStart"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // 종료일이 시작일보다 이전인 경우 종료일을 시작일로 설정
                        const endDate = form.watch('activityDateEnd');
                        if (endDate && new Date(endDate) < new Date(e.target.value)) {
                          form.setValue('activityDateEnd', e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityDateEnd"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={form.watch('activityDateStart')}
                      disabled={!form.watch('activityDateStart')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="모집 상태" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={form.watch('region')}
              onValueChange={(value) => form.setValue('region', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '검색중...' : '검색하기'}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground">검색중...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((template: SearchTemplate, index) => (
            <div 
              key={template.templateId} 
              ref={index === searchResults.length - 1 ? lastElementRef : null}
              className="border rounded-lg p-4 space-y-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleTemplateClick(template.templateId)}
            >
              {template.imageUrl && (
                <img 
                  src={template.imageUrl} 
                  alt={template.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <h3 className="font-semibold">{template.title}</h3>
              <p className="text-sm text-muted-foreground">{template.organization.orgName}</p>
              <p className="text-sm">{template.activityLocation}</p>
              {template.recruits.map((recruit) => (
                <div 
                  key={recruit.recruitId}
                  className="bg-muted p-2 rounded-md text-sm space-y-1"
                >
                  <p>활동일: {format(new Date(recruit.activityDate), 'yyyy-MM-dd')}</p>
                  <p>모집인원: {recruit.participateVolCount}/{recruit.maxVolunteer}명</p>
                  <p>상태: {
                    STATUS_OPTIONS.find(option => option.value === recruit.status)?.label
                  }</p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}