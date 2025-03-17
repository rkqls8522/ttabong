export interface RecruitGroup {
  groupId: number;
  groupName: string;
}

export interface RecruitTemplate {
  templateId: number;
  title: string;
  description: string;
  categoryId: number;
  activityLocation: string;
  contactName: string;
  contactPhone: string;
  images: string[];
}

export interface Recruit {
  recruitId: number;
  status: string;
  maxVolunteer: number;
  participateVolCount: number;
  activityDate: string;
  activityStart: number;
  activityEnd: number;
  deadline: string;
  createdAt?: string;
}

export interface RecruitItem {
  group: RecruitGroup;
  template: RecruitTemplate;
  recruit: Recruit;
}

export interface RecruitResponse {
  recruits: RecruitItem[];
} 