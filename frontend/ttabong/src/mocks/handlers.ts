import { http, HttpResponse } from 'msw';

// 리뷰 목록 데이터
const reviews = Array.from({ length: 20 }, (_, i) => ({
  review: {
    reviewId: 100 + i,
    recruitId: 55 + i,
    title: i % 2 === 0 ? "환경 정화 활동 후기" : "노인 복지센터 방문 후기",
    content: i % 2 === 0 
      ? "이번 봉사는 정말 뜻깊은 경험이었습니다!" 
      : "어르신들과 함께 시간을 보내며 많은 것을 배웠습니다.",
    isDeleted: false,
    updatedAt: "2025-02-10T14:30:00",
    createdAt: "2025-02-05T12:00:00"
  },
  writer: {
    writerId: 10,
    name: "김봉사"
  },
  group: {
    groupId: i % 2 === 0 ? 5 : 7,
    groupName: i % 2 === 0 ? "환경 보호 단체" : "노인 돌봄 봉사단"
  },
  organization: {
    orgId: i % 2 === 0 ? 3 : 4,
    orgName: i % 2 === 0 ? "서울 환경재단" : "대한 복지재단"
  },
  images: [
    `https://picsum.photos/300/300?random=${i}_1`,
    `https://picsum.photos/300/300?random=${i}_2`
  ]
}));

// 리뷰 상세 데이터 생성 함수
function generateReviewDetail(id: number) {
  const baseReview = {
    reviewId: id,
    title: `후기제목 ${id}`,
    content: "이 봉사활동은 정말 보람찼습니다!",
    isDeleted: false,
    isPublic: true,
    attended: true,
    createdAt: "2024-02-02T12:00:00",
    images: [
      `https://picsum.photos/300/300?random=${id}_1`,
      `https://picsum.photos/300/300?random=${id}_2`
    ],
    recruit: {
      recruitId: 101,
      activityDate: "2024-02-15",
      activityTime: "10:00 ~ 14:00",
      status: "RECRUITING"
    },
    category: {
      categoryId: 5,
      name: "환경 보호"
    },
    writer: {
      writerId: 12,
      writerName: "김봉사",
      writerProfileImage: `https://picsum.photos/100/100?random=${id}_writer`
    },
    template: {
      templateId: 1,
      title: "환경 보호 봉사",
      activityLocation: "서울특별시 강남구 테헤란로 123",
      status: "ALL",
      group: {
        groupId: 10,
        groupName: "환경 봉사팀"
      }
    },
    organization: {
      orgId: 50,
      orgName: "서울 환경 봉사 센터"
    },
    comments: [
      {
        commentId: id * 100 + 1,
        writerId: 14,
        writerName: "이봉사",
        content: "정말 멋진 봉사활동 후기네요!",
        createdAt: "2024-02-03T15:00:00"
      },
      {
        commentId: id * 100 + 2,
        writerId: 20,
        writerName: "박봉사",
        content: "저도 참여하고 싶어요!",
        createdAt: "2024-02-04T18:20:00"
      }
    ]
  };

  // id가 짝수일 때만 orgReviewId 추가
  if (id % 2 === 0) {
    return {
      ...baseReview,
      orgReviewId: 99
    };
  }

  return baseReview;
}

// 봉사활동별 리뷰 목록 데이터 생성 함수
function generateRecruitReviews(recruitId: number) {
  return Array.from({ length: 5 }, (_, i) => ({
    review: {
      reviewId: recruitId * 100 + i,
      recruitId,
      title: `봉사활동 후기 ${i + 1}`,
      content: "이번 봉사는 정말 뜻깊은 경험이었습니다!",
      isDeleted: false,
      updatedAt: "2024-02-10T14:30:00",
      createdAt: "2024-02-05T12:00:00"
    },
    writer: {
      writerId: 10 + i,
      name: `봉사자${i + 1}`
    },
    group: {
      groupId: 5,
      groupName: "환경 보호 단체"
    },
    organization: {
      orgId: 3,
      orgName: "서울 환경재단"
    },
    images: [
      `https://picsum.photos/300/300?random=${recruitId}_${i}_1`,
      `https://picsum.photos/300/300?random=${recruitId}_${i}_2`
    ]
  }));
}

const BASE_URL = 'http://localhost:8080';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'http://localhost:5173', // 프론트엔드 도메인
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handlers = [
  // CORS Preflight 처리
  http.options(`${BASE_URL}/*`, () => {
    return new HttpResponse(null, { headers: corsHeaders });
  }),

  // 리뷰 목록 조회
  http.get(`${BASE_URL}/api/reviews`, () => {
    return new HttpResponse(JSON.stringify(reviews), {
      headers: corsHeaders,
    });
  }),

  // 리뷰 상세 조회
  http.get(`${BASE_URL}/api/reviews/:id`, ({ params }) => {
    const { id } = params;
    return new HttpResponse(JSON.stringify(generateReviewDetail(Number(id))), {
      headers: corsHeaders,
    });
  }),

  // 댓글 작성
  http.post(`${BASE_URL}/api/reviews/:id/comments`, async ({ request }) => {
    const { content } = await request.json() as { content: string };
    return new HttpResponse(JSON.stringify({
      commentId: Math.floor(Math.random() * 1000),
      writerId: 1,
      writerName: "테스트 사용자",
      content,
      createdAt: new Date().toISOString()
    }), {
      status: 201,
      headers: corsHeaders,
    });
  }),

  // 봉사활동별 리뷰 목록 조회
  http.get(`${BASE_URL}/api/recruits/:recruitId/reviews`, ({ params }) => {
    const { recruitId } = params;
    return HttpResponse.json(generateRecruitReviews(Number(recruitId)), { headers: corsHeaders });
  }),

  // 내 봉사활동 목록 조회
  http.get(`${BASE_URL}/api/applications/mine`, () => {
    return HttpResponse.json([
      {
        applicationId: 55,
        status: "PENDING",
        evaluationDone: false,
        isDeleted: false,
        createdAt: "2024-02-02T12:00:00",
        template: {
          templateId: 1,
          title: "환경 보호 봉사",
          activityLocation: "서울특별시 강남구 테헤란로 123",
          status: "ALL",
          imageId: "https://example.com/image.jpg",
          contactName: "김봉사",
          contactPhone: "010-1234-5678",
          description: "환경 보호를 위한 봉사활동입니다.",
          isDeleted: false,
          createdAt: "2024-02-02T12:00:00",
          group: {
            groupId: 10,
            groupName: "환경 봉사팀"
          }
        },
        recruit: {
          recruitId: 101,
          deadline: "2024-02-10T23:59:59",
          activityDate: "2024-02-15",
          activityTime: "10:00 ~ 14:00",
          maxVolunteer: 20,
          participateVolCount: 15,
          status: "RECRUITING",
          isDeleted: false,
          createdAt: "2024-02-02T12:00:00"
        }
      },
      {
        applicationId: 56,
        status: "APPROVED",
        evaluationDone: false,
        isDeleted: false,
        createdAt: "2024-02-04T15:00:00",
        template: {
          templateId: 2,
          title: "노인 돌봄 봉사",
          activityLocation: "서울특별시 종로구",
          status: "YOUTH",
          imageId: "https://example.com/image2.jpg",
          contactName: "이봉사",
          contactPhone: "010-5678-1234",
          description: "어르신들을 위한 봉사활동입니다.",
          isDeleted: false,
          createdAt: "2024-02-04T15:00:00",
          group: {
            groupId: 11,
            groupName: "노인 돌봄 팀"
          }
        },
        recruit: {
          recruitId: 201,
          deadline: "2024-03-05T23:59:59",
          activityDate: "2024-03-10",
          activityTime: "13:00 ~ 17:00",
          maxVolunteer: 30,
          participateVolCount: 25,
          status: "RECRUITING",
          isDeleted: false,
          createdAt: "2024-02-10T16:45:00"
        }
      }
    ], { headers: corsHeaders });
  }),

  // 리뷰 작성 API
  http.post(`${BASE_URL}/api/reviews`, async ({ request }) => {
    const reviewData = await request.json() as Record<string, any>;
    return HttpResponse.json({
      reviewId: Math.random(),
      ...reviewData
    }, { status: 201, headers: corsHeaders });
  }),

  // 로그인 API
  http.post(`${BASE_URL}/api/user/login`, async ({ request }) => {
    const { email, password, userType } = await request.json() as {
      email: string;
      password: string;
      userType: 'volunteer' | 'organization';
    };

    // 간단한 검증
    if (!email || !password) {
      return HttpResponse.json({ 
        message: '이메일과 비밀번호를 입력해주세요.' 
      }, { status: 400, headers: corsHeaders });
    }

    return HttpResponse.json({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      userType,
      message: '로그인에 성공했습니다.'
    }, { 
      status: 200,
      headers: corsHeaders
    });
  }),

  // 봉사자 회원가입 API
  http.post(`${BASE_URL}/api/volunteer/register`, async ({ request }) => {
    const data = await request.json() as { email: string };
    
    if (!data.email) {
      return HttpResponse.json({ 
        message: '필수 정보가 누락되었습니다.' 
      }, { status: 400, headers: corsHeaders });
    }

    return HttpResponse.json({
      message: '회원가입이 완료되었습니다.',
      data: { email: data.email }
    }, { 
      status: 201,
      headers: corsHeaders
    });
  }),

  // 기관 회원가입 API
  http.post(`${BASE_URL}/api/org/register`, async ({ request }) => {
    const data = await request.json() as { email: string; orgName: string };
    
    if (!data.email || !data.orgName) {
      return HttpResponse.json({ 
        message: '필수 정보가 누락되었습니다.' 
      }, { status: 400, headers: corsHeaders });
    }

    return HttpResponse.json({
      message: '기관 회원가입이 완료되었습니다.',
      data: { email: data.email, orgName: data.orgName }
    }, { 
      status: 201,
      headers: corsHeaders
    });
  })
]; 