export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  profilePicture?: string;
  resumeUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  logoUrl?: string;
  coverImageUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullAddress: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  experienceLevel: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'EXECUTIVE';
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  isRemote: boolean;
  isActive: boolean;
  applicationDeadline?: string;
  requirements?: string;
  benefits?: string;
  applicationInstructions?: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  postedBy: UserSummary;
  company?: CompanySummary;
  category?: CategorySummary;
  requiredSkills: SkillSummary[];
}

export interface JobApplication {
  id: number;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  reviewedAt?: string;
  interviewScheduledAt?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
  job: JobSummary;
}

export interface SavedJob {
  id: number;
  savedAt: string;
  job: Job;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'JOB_APPLICATION' | 'JOB_MATCH' | 'INTERVIEW_SCHEDULED' | 'APPLICATION_STATUS_UPDATE' | 'NEW_JOB_POSTED' | 'SYSTEM_NOTIFICATION' | 'REMINDER';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
  category: 'PROGRAMMING_LANGUAGES' | 'FRAMEWORKS' | 'DATABASES' | 'TOOLS' | 'SOFT_SKILLS' | 'LANGUAGES' | 'CERTIFICATIONS' | 'OTHER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Summary types for nested objects
export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface CompanySummary {
  id: number;
  name: string;
  logoUrl?: string;
  industry?: string;
  location: string;
}

export interface CategorySummary {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface SkillSummary {
  id: number;
  name: string;
  category: string;
}

export interface JobSummary {
  id: number;
  title: string;
  location: string;
  companyName?: string;
  companyLogo?: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
}

export interface JobRequest {
  title: string;
  description: string;
  location: string;
  jobType: Job['jobType'];
  experienceLevel: Job['experienceLevel'];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  isRemote?: boolean;
  applicationDeadline?: string;
  requirements?: string;
  benefits?: string;
  applicationInstructions?: string;
  companyId?: number;
  categoryId?: number;
  requiredSkillIds?: number[];
}

export interface ApplicationRequest {
  jobId: number;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Search and filter types
export interface JobSearchFilters {
  keyword?: string;
  location?: string;
  jobType?: Job['jobType'];
  experienceLevel?: Job['experienceLevel'];
  isRemote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  companyId?: number;
  categoryId?: number;
  skillIds?: number[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
