import { 
  LearningCourse, 
  CourseCategory, 
  CourseLevel, 
  CourseStatus,
  LearningFilters,
  SortOptions,
  LearningApiResponse,
  LearningListResponse,
  LearningDetailResponse,
  CreateCourseForm,
  UpdateCourseForm,
  LearningAnalytics
} from '@/types/learning';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_ENDPOINTS = {
  courses: '/learning/courses',
  categories: '/learning/categories',
  instructors: '/learning/instructors',
  analytics: '/learning/analytics',
  enrollments: '/learning/enrollments',
  reviews: '/learning/reviews'
};

// Generic API request helper
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<LearningApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Course Services
export const courseService = {
  // Get all courses with filtering and pagination
  async getCourses(
    filters: LearningFilters = {},
    sort: SortOptions = { field: 'created_at', order: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<LearningListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortField: sort.field,
      sortOrder: sort.order,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    return apiRequest<LearningCourse[]>(`${API_ENDPOINTS.courses}?${params}`);
  },

  // Get course by ID
  async getCourseById(id: string): Promise<LearningDetailResponse> {
    return apiRequest<LearningCourse>(`${API_ENDPOINTS.courses}/${id}`);
  },

  // Get course by slug
  async getCourseBySlug(slug: string): Promise<LearningDetailResponse> {
    return apiRequest<LearningCourse>(`${API_ENDPOINTS.courses}/slug/${slug}`);
  },

  // Create new course
  async createCourse(courseData: CreateCourseForm): Promise<LearningDetailResponse> {
    return apiRequest<LearningCourse>(API_ENDPOINTS.courses, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  // Update course
  async updateCourse(id: string, courseData: UpdateCourseForm): Promise<LearningDetailResponse> {
    return apiRequest<LearningCourse>(`${API_ENDPOINTS.courses}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  // Delete course
  async deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_ENDPOINTS.courses}/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete courses
  async bulkDeleteCourses(ids: string[]): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_ENDPOINTS.courses}/bulk-delete`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  },

  // Update course status
  async updateCourseStatus(id: string, status: CourseStatus): Promise<LearningDetailResponse> {
    return apiRequest<LearningCourse>(`${API_ENDPOINTS.courses}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Upload course thumbnail
  async uploadThumbnail(id: string, file: File): Promise<{ thumbnail_url: string }> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    return apiRequest<{ thumbnail_url: string }>(`${API_ENDPOINTS.courses}/${id}/thumbnail`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  },

  // Get featured courses
  async getFeaturedCourses(limit: number = 6): Promise<LearningListResponse> {
    return apiRequest<LearningCourse[]>(`${API_ENDPOINTS.courses}/featured?limit=${limit}`);
  },

  // Get bestseller courses
  async getBestsellerCourses(limit: number = 6): Promise<LearningListResponse> {
    return apiRequest<LearningCourse[]>(`${API_ENDPOINTS.courses}/bestsellers?limit=${limit}`);
  },

  // Search courses
  async searchCourses(query: string, limit: number = 10): Promise<LearningListResponse> {
    return apiRequest<LearningCourse[]>(`${API_ENDPOINTS.courses}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }
};

// Category Services
export const categoryService = {
  // Get all categories
  async getCategories(): Promise<LearningApiResponse<CourseCategory[]>> {
    return apiRequest<CourseCategory[]>(API_ENDPOINTS.categories);
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<LearningApiResponse<CourseCategory>> {
    return apiRequest<CourseCategory>(`${API_ENDPOINTS.categories}/${id}`);
  },

  // Create category
  async createCategory(categoryData: Partial<CourseCategory>): Promise<LearningApiResponse<CourseCategory>> {
    return apiRequest<CourseCategory>(API_ENDPOINTS.categories, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Update category
  async updateCategory(id: string, categoryData: Partial<CourseCategory>): Promise<LearningApiResponse<CourseCategory>> {
    return apiRequest<CourseCategory>(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete category
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'DELETE',
    });
  }
};

// Instructor Services
export const instructorService = {
  // Get all instructors
  async getInstructors(): Promise<LearningApiResponse<any[]>> {
    return apiRequest<any[]>(API_ENDPOINTS.instructors);
  },

  // Get instructor by ID
  async getInstructorById(id: string): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.instructors}/${id}`);
  },

  // Get instructor courses
  async getInstructorCourses(instructorId: string): Promise<LearningListResponse> {
    return apiRequest<LearningCourse[]>(`${API_ENDPOINTS.instructors}/${instructorId}/courses`);
  },

  // Update instructor profile
  async updateInstructorProfile(id: string, profileData: any): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.instructors}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
};

// Analytics Services
export const analyticsService = {
  // Get learning analytics
  async getAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<LearningAnalytics>> {
    const params = dateRange ? new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    }) : '';
    
    return apiRequest<LearningAnalytics>(`${API_ENDPOINTS.analytics}?${params}`);
  },

  // Get course analytics
  async getCourseAnalytics(courseId: string, dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>> {
    const params = dateRange ? new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    }) : '';
    
    return apiRequest<any>(`${API_ENDPOINTS.analytics}/courses/${courseId}?${params}`);
  },

  // Get instructor analytics
  async getInstructorAnalytics(instructorId: string, dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>> {
    const params = dateRange ? new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    }) : '';
    
    return apiRequest<any>(`${API_ENDPOINTS.analytics}/instructors/${instructorId}?${params}`);
  },

  // Get enrollment analytics
  async getEnrollmentAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>> {
    const params = dateRange ? new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    }) : '';
    
    return apiRequest<any>(`${API_ENDPOINTS.analytics}/enrollments?${params}`);
  },

  // Get revenue analytics
  async getRevenueAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>> {
    const params = dateRange ? new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    }) : '';
    
    return apiRequest<any>(`${API_ENDPOINTS.analytics}/revenue?${params}`);
  }
};

// Enrollment Services
export const enrollmentService = {
  // Get course enrollments
  async getCourseEnrollments(courseId: string, page: number = 1, limit: number = 20): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.enrollments}/course/${courseId}?page=${page}&limit=${limit}`);
  },

  // Get user enrollments
  async getUserEnrollments(userId: string): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.enrollments}/user/${userId}`);
  },

  // Create enrollment
  async createEnrollment(enrollmentData: any): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(API_ENDPOINTS.enrollments, {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  },

  // Update enrollment progress
  async updateEnrollmentProgress(enrollmentId: string, progressData: any): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.enrollments}/${enrollmentId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(progressData),
    });
  },

  // Complete enrollment
  async completeEnrollment(enrollmentId: string): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.enrollments}/${enrollmentId}/complete`, {
      method: 'PATCH',
    });
  }
};

// Review Services
export const reviewService = {
  // Get course reviews
  async getCourseReviews(courseId: string, page: number = 1, limit: number = 10): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.reviews}/course/${courseId}?page=${page}&limit=${limit}`);
  },

  // Create review
  async createReview(reviewData: any): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(API_ENDPOINTS.reviews, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Update review
  async updateReview(reviewId: string, reviewData: any): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.reviews}/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete review
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`${API_ENDPOINTS.reviews}/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Vote on review helpfulness
  async voteReviewHelpful(reviewId: string, isHelpful: boolean): Promise<LearningApiResponse<any>> {
    return apiRequest<any>(`${API_ENDPOINTS.reviews}/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ isHelpful }),
    });
  }
};

// Export all services
export default {
  courseService,
  categoryService,
  instructorService,
  analyticsService,
  enrollmentService,
  reviewService
};
