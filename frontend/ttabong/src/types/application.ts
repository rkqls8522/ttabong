export interface ApplicationUser {
  userId: number;
  email: string;
  name: string;
  profileImage: string;
}

export interface ApplicationVolunteer {
  volunteerId: number;
  recommendedCount: number;
  totalVolunteerHours: number;
}

export interface ApplicationDetail {
  applicationId: number;
  recruitId: number;
  status: string;
  createdAt: string;
}

export interface ApplicationItem {
  user: ApplicationUser;
  volunteer: ApplicationVolunteer;
  application: ApplicationDetail;
}

export interface ApplicationsResponse {
  recruitId: number;
  applications: ApplicationItem[];
}

export interface UpdateApplicationStatusRequest {
  recruitId: number;
  volunteerId: number;
  applicationId: number;
  accept: boolean;
}

export interface UpdateApplicationStatusResponse {
  message: string;
  application: ApplicationDetail;
} 