// Learning Course Types
export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    expertise: string[];
  };
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  price: number;
  originalPrice?: number;
  status: CourseStatus;
  enrollment: number;
  maxEnrollment?: number;
  rating: number;
  totalRatings: number;
  completionRate: number;
  lastUpdated: string;
  createdAt: string;
  thumbnail: string;
  tags: string[];
  prerequisites?: string[];
  learningOutcomes: string[];
  certificate?: boolean;
  language: string;
  subtitles?: string[];
  sections: CourseSection[];
  reviews?: CourseReview[];
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
  duration: string;
  order: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'download';
  duration?: string;
  content?: string;
  videoUrl?: string;
  attachments?: LessonAttachment[];
  isPreview: boolean;
  order: number;
}

export interface LessonAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'zip' | 'image' | 'video';
  url: string;
  size: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

// Enums
export type CourseCategory = 
  | 'Development'
  | 'Design'
  | 'Data Science'
  | 'Business'
  | 'Marketing'
  | 'Finance'
  | 'Health & Fitness'
  | 'Music'
  | 'Photography'
  | 'Personal Development';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export type CourseStatus = 'Active' | 'Draft' | 'Archived' | 'Scheduled';

// Learning Progress Types
export interface UserLearningProgress {
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  currentLesson?: string;
  startedAt: string;
  lastAccessed: string;
  completedAt?: string;
  certificate?: Certificate;
}

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  certificateUrl: string;
  certificateNumber: string;
}

// Learning Analytics Types
export interface LearningAnalytics {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  popularCategories: CategoryStats[];
  topInstructors: InstructorStats[];
  monthlyEnrollments: MonthlyStats[];
}

export interface CategoryStats {
  category: CourseCategory;
  courseCount: number;
  enrollmentCount: number;
  averageRating: number;
  revenue: number;
}

export interface InstructorStats {
  instructorId: string;
  instructorName: string;
  courseCount: number;
  totalEnrollments: number;
  averageRating: number;
  totalRevenue: number;
}

export interface MonthlyStats {
  month: string;
  enrollments: number;
  revenue: number;
  newCourses: number;
}

// Filter and Search Types
export interface LearningFilters {
  search?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  status?: CourseStatus;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string;
  rating?: number;
  instructor?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: keyof LearningCourse;
  order: 'asc' | 'desc';
}

// API Response Types
export interface LearningApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LearningListResponse extends LearningApiResponse<LearningCourse[]> {}

export interface LearningDetailResponse extends LearningApiResponse<LearningCourse> {}

export interface LearningAnalyticsResponse extends LearningApiResponse<LearningAnalytics> {}

// Form Types
export interface CreateCourseForm {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number;
  language: string;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  certificate: boolean;
  thumbnail: File | null;
}

export interface UpdateCourseForm extends Partial<CreateCourseForm> {
  id: string;
  status?: CourseStatus;
}
