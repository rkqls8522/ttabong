export interface User {
  userId: number;
  email: string;
  name: string;
  password: string;
  phone: string;
  profileImage: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
  profileImage?: string;
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  phone?: string;
  profileImage?: string;
}

export interface UserResponse {
  userId: number;
  email: string;
  name: string;
  phone: string;
  profileImage: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface Volunteer {
  volunteerId: number;
  userId: number;
  preferredTime: string;
  interestTheme: string;
  durationTime: string;
  region: string;
  birthDate: string;
  gender: string;
  recommendedCount: number;
  notRecommendedCount: number;
}

export interface CreateVolunteerRequest {
  preferredTime?: string;
  interestTheme?: string;
  durationTime?: string;
  region?: string;
  birthDate?: string;
  gender?: string;
}

export interface UpdateVolunteerRequest {
  preferredTime?: string;
  interestTheme?: string;
  durationTime?: string;
  region?: string;
}

export interface UserWithVolunteer extends UserResponse {
  volunteer: Volunteer;
} 

export interface Organization {
  orgId: number;
  userId: number;
  businessRegNumber: string;
  orgName: string;
  representativeName: string;
  orgAddress: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  businessRegNumber: string;
  orgName: string;
  representativeName: string;
  orgAddress: string;
}

export interface UpdateOrganizationRequest {
  orgName?: string;
  representativeName?: string;
  orgAddress?: string;
}

export interface UserWithOrganization extends UserResponse {
  organization: Organization;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: 'volunteer' | 'organization';
}

export interface LoginResponse {
  status: number;
  message: string;
  accessToken: string;
  name: string;
  email: string;
}

export interface JwtPayload {
  sub: string;  // userId
  userType: 'volunteer' | 'organization';
  iat: number;
  exp: number;
}

export interface VolunteerRegisterRequest extends CreateUserRequest {
  preferredTime?: string;
  interestTheme?: string;
  durationTime?: string;
  region?: string;
  birthDate?: string;
  gender?: string;
}

export interface OrganizationRegisterRequest extends CreateUserRequest, CreateOrganizationRequest {}

interface LikedRecruit {
  recruitId: number;
  templateId: number;
  deadline: string;
  activityDate: string;
  activityStart: number;
  activityEnd: number;
  maxVolunteer: number;
  participateVolCount: number;
  status: string;
}

export interface LikedTemplate {
  reactionId: number;
  reactionCreatedAt: string;
  recruit: LikedRecruit;
}

export interface GetLikedTemplatesResponse {
  likedTemplates: LikedTemplate[];
}

export interface GetLikedTemplatesParams {
  cursor?: number;
  limit?: number;
}