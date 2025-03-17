export interface Group {
  groupId: number;
  groupName: string;
}

export interface Template {
  templateId: number;
  title: string;
  activityLocation: string;
  status: 'ALL' | 'YOUTH';
  imageId: string;
  contactName: string;
  contactPhone: string;
  description: string;
  isDeleted: boolean;
  createdAt: string;
  group: Group;
  images?: string[];
  volunteerTypes?: string[];
  volunteerField?: string[];
}

export type OrgRecruitStatus = 'RECRUITING' | 'RECRUITMENT_CLOSED' | 'ACTIVITY_COMPLETED';
export type VolunteerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'AUTO_CANCEL' | 'NO_SHOW';

export interface Recruit {
  recruitId: number;
  templateId: number;
  deadline: string;
  activityDate: string;
  activityTime: string;
  activityStart: number;
  activityEnd: number;
  maxVolunteer: number;
  participateVolCount: number;
  status: OrgRecruitStatus;
  isDeleted: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Application {
  applicationId: number;
  status: VolunteerApplicationStatus;
  evaluationDone: boolean;
  createdAt: string;
  reviewId: number | null;
  template: {
    templateId: number;
    title: string;
    activityLocation: string;
    status: 'ALL' | 'YOUTH';
    imageId: string;
    contactName: string;
    contactPhone: string;
    description: string;
    createdAt: string;
  };
  group: {
    groupId: number;
    groupName: string;
  };
  recruit: {
    recruitId: number;
    deadline: string;
    activityDate: string;
    activityStart: number;
    activityEnd: number;
    maxVolunteer: number;
    participateVolCount: number;
    status: OrgRecruitStatus;
    createdAt: string;
  };
}

export interface CreateRecruitRequest {
  templateId: number;
  deadline: string;
  activityDate: string;
  activityStart: number;
  activityEnd: number;
  maxVolunteer: number;
}

export interface UpdateRecruitRequest {
  recruitId: number;
  deadline: string;
  activityDate: string;
  activityStart: number;
  activityEnd: number;
  maxVolunteer: number;
  images: string[];
  imageCount: number;
  status?: string;
}

export interface OrgRecruit {
  group: Group;
  template: Template;
  recruit: Recruit;
  application?: {
    applicationId: number;
    status: VolunteerApplicationStatus;
  };
  organization: {
    orgId: number;
    name: string;
  };
}

export interface OrgRecruitsResponse {
  recruits: OrgRecruit[];
}

export interface GetApplicationsParams {
  cursor?: number;
  limit?: number;
}

export interface RecruitDetail {
  group: Group;
  template: {
    templateId: number;
    categoryId: number;
    title: string;
    activityLocation: string;
    status: 'ALL' | 'YOUTH';
    images: string[];
    imageId: string;
    contactName: string;
    contactPhone: string;
    description: string;
    createdAt: string;
    volunteerTypes: string[];
    volunteerField: string[];
  };
  recruit: {
    recruitId: number;
    deadline: string;
    activityDate: string;
    activityStart: number;
    activityEnd: number;
    maxVolunteer: number;
    participateVolCount: number;
    status: OrgRecruitStatus;
    updatedAt: string;
    createdAt: string;
  };
  organization: {
    orgId: number;
    name: string;
  };
  application?: {
    applicationId: number;
    name: string;
    status: VolunteerApplicationStatus;
  };
}

export interface APITemplate {
  templateId: number;
  groupId: number;
  title: string;
  description: string;
  activityLocation: string;
  categoryId: number;
  status: string;
  images: string[];
  contactName: string;
  contactPhone: string;
  maxVolunteer: number;
  createdAt: string;
}

export interface TemplateDetail {
  template: {
    templateId: number;
    title: string;
    activityLocation: string;
    status: 'ALL' | 'YOUTH';
    imageId: string;
    contactName: string;
    contactPhone: string;
    description: string;
    createdAt: string;
  };
  group: Group;
  category: {
    categoryId: number;
    name: string;
  };
  organization: {
    orgId: number;
    userId: number | null;
    businessRegNumber: string | null;
    orgName: string;
    representativeName: string | null;
    orgAddress: string | null;
  };
  recruits: {
    recruitId: number;
    deadline: string;
    activityDate: string;
    activityStart: number;
    activityEnd: number;
    maxVolunteer: number;
    participateVolCount: number;
    status: OrgRecruitStatus;
    createdAt: string;
  }[];
}

// 검색 결과용 타입들
export interface SearchTemplateRecruit {
  recruitId: number;
  activityDate: string;
  deadline: string;
  activityStart: number;
  activityEnd: number;
  maxVolunteer: number;
  participateVolCount: number;
  status: OrgRecruitStatus;
  updatedAt: string;
  createdAt: string;
}

export interface SearchTemplateOrganization {
  orgId: number;
  orgName: string;
}

export interface SearchTemplate {
  templateId: number;
  categoryId: number;
  title: string;
  activityLocation: string;
  status: string;
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  description: string;
  createdAt: string;
  organization: SearchTemplateOrganization;
  group: Group;
  recruits: SearchTemplateRecruit[];
}

export interface SearchTemplatesResponse {
  templates: SearchTemplate[];
  nextCursor: number | null;
} 