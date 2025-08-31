# Learning Management System - Complete CRUD Implementation

## Overview
This document provides a complete implementation guide for the Learning Management System with full CRUD (Create, Read, Update, Delete) operations, including database schema, backend services, and frontend components.

## 🗄️ Database Schema

### Complete SQL Files
The complete database schema is available in two versions:

**PostgreSQL Version**: `database/learning_postgresql.sql` (Recommended)
**MySQL Version**: `database/learning_complete.sql`

Both files contain:
- **15+ tables** for complete learning management
- **Sample data** for testing and development
- **Performance indexes** for fast queries
- **Triggers** for data integrity
- **Views** for common queries
- **Functions/Stored procedures** for analytics
- **Comprehensive foreign key relationships**

### Installation Instructions

**For PostgreSQL:**
```bash
# 1. Create a new database
CREATE DATABASE learning_management;

# 2. Connect to the database
\c learning_management;

# 3. Run the PostgreSQL SQL file
\i database/learning_postgresql.sql;

# 4. Verify the setup
\dt;

# 5. Check sample data
SELECT * FROM course_summary LIMIT 5;
```

**For MySQL:**
```bash
# 1. Create a new database
CREATE DATABASE learning_management;

# 2. Use the database
USE learning_management;

# 3. Run the MySQL SQL file
source database/learning_complete.sql;

# 4. Verify the setup
SHOW TABLES;

# 5. Check sample data
SELECT * FROM course_summary LIMIT 5;
```

### Core Tables Structure

#### 1. Users & Instructors
```sql
-- Users table (extends existing user system)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Instructors table (extends users)
CREATE TABLE instructors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    bio TEXT,
    expertise JSON,
    social_links JSON,
    total_courses INT DEFAULT 0,
    total_students INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. Courses & Content
```sql
-- Categories table
CREATE TABLE course_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced', 'All Levels') DEFAULT 'Beginner',
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 0.00,
    original_price DECIMAL(10,2),
    status ENUM('Draft', 'Active', 'Archived', 'Scheduled') DEFAULT 'Draft',
    language VARCHAR(50) DEFAULT 'English',
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    certificate_available BOOLEAN DEFAULT FALSE,
    max_enrollment INT,
    current_enrollment INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    tags JSON,
    prerequisites JSON,
    learning_outcomes JSON,
    subtitles JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT
);
```

#### 3. Course Content Structure
```sql
-- Course sections table
CREATE TABLE course_sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    sort_order INT DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Course lessons table
CREATE TABLE course_lessons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    section_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type ENUM('video', 'text', 'quiz', 'assignment', 'download') DEFAULT 'video',
    duration_minutes INT DEFAULT 0,
    content TEXT,
    video_url VARCHAR(500),
    video_duration INT,
    is_preview BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);
```

#### 4. Enrollment & Progress Tracking
```sql
-- Course enrollments table
CREATE TABLE course_enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    certificate_issued_at TIMESTAMP NULL,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Lesson progress table
CREATE TABLE lesson_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    watch_time_seconds INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lesson_progress (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);
```

#### 5. Reviews & Analytics
```sql
-- Course reviews table
CREATE TABLE course_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);

-- Course analytics table
CREATE TABLE course_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    enrollments INT DEFAULT 0,
    completions INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    avg_watch_time_minutes DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_date (course_id, date),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

## 🔧 Backend Services

### API Service Structure

#### 1. Course Service (`src/services/learningService.ts`)
```typescript
export const courseService = {
  // Get all courses with filtering and pagination
  async getCourses(
    filters: LearningFilters = {},
    sort: SortOptions = { field: 'created_at', order: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<LearningListResponse>,

  // Get course by ID
  async getCourseById(id: string): Promise<LearningDetailResponse>,

  // Create new course
  async createCourse(courseData: CreateCourseForm): Promise<LearningDetailResponse>,

  // Update course
  async updateCourse(id: string, courseData: UpdateCourseForm): Promise<LearningDetailResponse>,

  // Delete course
  async deleteCourse(id: string): Promise<{ success: boolean; message: string }>,

  // Bulk delete courses
  async bulkDeleteCourses(ids: string[]): Promise<{ success: boolean; message: string }>,

  // Update course status
  async updateCourseStatus(id: string, status: CourseStatus): Promise<LearningDetailResponse>,

  // Upload course thumbnail
  async uploadThumbnail(id: string, file: File): Promise<{ thumbnail_url: string }>,

  // Get featured courses
  async getFeaturedCourses(limit: number = 6): Promise<LearningListResponse>,

  // Search courses
  async searchCourses(query: string, limit: number = 10): Promise<LearningListResponse>
};
```

#### 2. Category Service
```typescript
export const categoryService = {
  async getCategories(): Promise<LearningApiResponse<CourseCategory[]>>,
  async getCategoryById(id: string): Promise<LearningApiResponse<CourseCategory>>,
  async createCategory(categoryData: Partial<CourseCategory>): Promise<LearningApiResponse<CourseCategory>>,
  async updateCategory(id: string, categoryData: Partial<CourseCategory>): Promise<LearningApiResponse<CourseCategory>>,
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }>
};
```

#### 3. Analytics Service
```typescript
export const analyticsService = {
  async getAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<LearningAnalytics>>,
  async getCourseAnalytics(courseId: string, dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>>,
  async getInstructorAnalytics(instructorId: string, dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>>,
  async getEnrollmentAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>>,
  async getRevenueAnalytics(dateRange?: { start: string; end: string }): Promise<LearningApiResponse<any>>
};
```

## 🎨 Frontend Components

### 1. Learning Table Component (`src/components/Learning/LearningTable/index.tsx`)

**Features:**
- Comprehensive table view with all course information
- Advanced filtering (search, category, status, level)
- Multi-column sorting with toggle order
- Visual enhancements (status badges, progress bars, thumbnails)
- Action dropdown (View, Edit, Delete, Export)
- Summary statistics cards
- Responsive design

**Key Functions:**
```typescript
const LearningTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtering and sorting logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    // Sorting logic implementation
  });
};
```

### 2. Course Form Component (`src/components/Learning/CourseForm/index.tsx`)

**Features:**
- Comprehensive form for creating and editing courses
- Real-time validation
- File upload for thumbnails
- Dynamic tag management
- Prerequisites and learning outcomes management
- Preview functionality
- Responsive layout

**Form Fields:**
- Basic Information (Title, Description, Category, Level, Price, Language)
- Thumbnail Upload
- Certificate Option
- Tags Management
- Prerequisites List
- Learning Outcomes List

**Validation:**
```typescript
const validateForm = (): boolean => {
  if (!formData.title.trim()) {
    setError('Course title is required');
    return false;
  }
  if (!formData.description.trim()) {
    setError('Course description is required');
    return false;
  }
  if (formData.price < 0) {
    setError('Price cannot be negative');
    return false;
  }
  return true;
};
```

### 3. Course Management Page (`src/pages/admin/learning/courses/index.tsx`)

**Features:**
- Integration of table and form components
- CRUD operations management
- Bulk operations (delete, export)
- Analytics display
- Error handling and loading states
- Modal-based form editing

**Key Functions:**
```typescript
const CourseManagementPage = () => {
  // State management
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LearningCourse | null>(null);

  // CRUD operations
  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course: LearningCourse) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSaveCourse = async (course: LearningCourse) => {
    await loadData(); // Refresh the data
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const result = await courseService.deleteCourse(courseId);
    if (result.success) {
      await loadData(); // Refresh the data
    }
  };

  const handleBulkDelete = async () => {
    const result = await courseService.bulkDeleteCourses(selectedCourses);
    if (result.success) {
      setSelectedCourses([]);
      await loadData();
    }
  };
};
```

## 📊 TypeScript Types

### Core Types (`src/types/learning.ts`)

```typescript
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
```

## 🚀 API Endpoints

### Course Management Endpoints

```typescript
const API_ENDPOINTS = {
  courses: '/learning/courses',
  categories: '/learning/categories',
  instructors: '/learning/instructors',
  analytics: '/learning/analytics',
  enrollments: '/learning/enrollments',
  reviews: '/learning/reviews'
};
```

**Course Endpoints:**
- `GET /api/learning/courses` - Get all courses with filtering
- `GET /api/learning/courses/:id` - Get course by ID
- `GET /api/learning/courses/slug/:slug` - Get course by slug
- `POST /api/learning/courses` - Create new course
- `PUT /api/learning/courses/:id` - Update course
- `DELETE /api/learning/courses/:id` - Delete course
- `DELETE /api/learning/courses/bulk-delete` - Bulk delete courses
- `PATCH /api/learning/courses/:id/status` - Update course status
- `POST /api/learning/courses/:id/thumbnail` - Upload thumbnail
- `GET /api/learning/courses/featured` - Get featured courses
- `GET /api/learning/courses/bestsellers` - Get bestseller courses
- `GET /api/learning/courses/search` - Search courses

## 🔄 CRUD Operations Flow

### 1. Create Operation
```typescript
// 1. User clicks "Create Course" button
const handleCreateCourse = () => {
  setEditingCourse(null);
  setShowForm(true);
};

// 2. User fills form and submits
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  const result = await courseService.createCourse(formData);
  
  if (result.success) {
    setSuccess('Course created successfully!');
    onSave(result.data);
  }
};

// 3. Form closes and table refreshes
const handleSaveCourse = async (course: LearningCourse) => {
  await loadData(); // Refresh the data
  setShowForm(false);
  setEditingCourse(null);
};
```

### 2. Read Operation
```typescript
// 1. Load courses on component mount
useEffect(() => {
  loadData();
}, [filters, sort, currentPage]);

// 2. Fetch data from API
const loadData = async () => {
  const [coursesRes, analyticsRes] = await Promise.all([
    courseService.getCourses(filters, sort, currentPage, 10),
    analyticsService.getAnalytics()
  ]);

  if (coursesRes.success) {
    setCourses(coursesRes.data);
    setTotalPages(coursesRes.pagination?.totalPages || 1);
  }
};
```

### 3. Update Operation
```typescript
// 1. User clicks edit button
const handleEditCourse = (course: LearningCourse) => {
  setEditingCourse(course);
  setShowForm(true);
};

// 2. Form loads with existing data
useEffect(() => {
  if (course && isEdit) {
    setFormData({
      title: course.title,
      description: course.description,
      // ... other fields
    });
  }
}, [course, isEdit]);

// 3. User submits updated data
const handleSubmit = async (e: React.FormEvent) => {
  if (isEdit && course) {
    const updateData: UpdateCourseForm = {
      id: course.id,
      ...formData
    };
    result = await courseService.updateCourse(course.id, updateData);
  }
};
```

### 4. Delete Operation
```typescript
// 1. Single course deletion
const handleDeleteCourse = async (courseId: string) => {
  if (!confirm('Are you sure you want to delete this course?')) return;

  const result = await courseService.deleteCourse(courseId);
  if (result.success) {
    await loadData(); // Refresh the data
  }
};

// 2. Bulk deletion
const handleBulkDelete = async () => {
  if (selectedCourses.length === 0) return;

  if (!confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) return;

  const result = await courseService.bulkDeleteCourses(selectedCourses);
  if (result.success) {
    setSelectedCourses([]);
    await loadData();
  }
};
```

## 📈 Analytics & Reporting

### Analytics Dashboard
```typescript
// Analytics data structure
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

// Display analytics in summary cards
{analytics && (
  <small className="text-muted">
    {analytics.totalCourses} total courses • {analytics.activeCourses} active • {analytics.totalEnrollments} enrollments
  </small>
)}
```

### Export Functionality
```typescript
const handleExportCourses = () => {
  const csvContent = generateCSV(courses);
  downloadCSV(csvContent, 'courses-export.csv');
};

const generateCSV = (data: LearningCourse[]): string => {
  const headers = ['Title', 'Instructor', 'Category', 'Level', 'Price', 'Status', 'Enrollment', 'Rating', 'Created At'];
  const rows = data.map(course => [
    course.title,
    course.instructor.name,
    course.category,
    course.level,
    course.price,
    course.status,
    course.enrollment,
    course.rating,
    new Date(course.createdAt).toLocaleDateString()
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};
```

## 🎯 Key Features Implemented

### 1. Advanced Filtering & Search
- Global search across course titles and instructors
- Category, status, level, and price range filters
- Date range filtering
- Rating-based filtering

### 2. Sorting & Organization
- Multi-column sorting with toggle order
- Default sorting by relevance/date/rating
- Real-time sorting updates

### 3. Visual Enhancements
- Status badges with icons
- Level badges with color coding
- Progress bars for completion rates
- Thumbnail previews
- Tag management with overflow handling

### 4. Bulk Operations
- Multi-select functionality
- Bulk delete operations
- Export to CSV functionality
- Batch status updates

### 5. Form Management
- Comprehensive course creation/editing form
- Real-time validation
- File upload handling
- Dynamic field management (tags, prerequisites, outcomes)
- Preview functionality

### 6. Analytics Integration
- Real-time analytics display
- Performance metrics
- Summary statistics
- Trend analysis

## 🔧 Installation & Setup

### 1. Database Setup
```bash
# Run the SQL schema
mysql -u username -p database_name < database/learning_schema.sql
```

### 2. Dependencies Installation
```bash
npm install lucide-react reactstrap
```

### 3. Environment Configuration
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Component Integration
```typescript
// Import and use the components
import LearningTable from '@/components/Learning/LearningTable';
import CourseForm from '@/components/Learning/CourseForm';
import { courseService } from '@/services/learningService';
```

## 🚀 Usage Examples

### 1. Basic Table Implementation
```typescript
import LearningTable from '@/components/Learning/LearningTable';

const MyPage = () => {
  return (
    <div>
      <h1>Learning Management</h1>
      <LearningTable />
    </div>
  );
};
```

### 2. Course Form Implementation
```typescript
import CourseForm from '@/components/Learning/CourseForm';

const MyForm = () => {
  const handleSave = (course) => {
    console.log('Course saved:', course);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <CourseForm
      onSave={handleSave}
      onCancel={handleCancel}
      isEdit={false}
    />
  );
};
```

### 3. Service Usage
```typescript
import { courseService } from '@/services/learningService';

// Get all courses
const courses = await courseService.getCourses();

// Create a new course
const newCourse = await courseService.createCourse({
  title: 'My Course',
  description: 'Course description',
  category: 'Development',
  level: 'Beginner',
  price: 99.99,
  language: 'English',
  tags: ['JavaScript', 'React'],
  prerequisites: ['Basic HTML'],
  learningOutcomes: ['Build web applications'],
  certificate: true,
  thumbnail: null
});

// Update a course
const updatedCourse = await courseService.updateCourse(courseId, {
  title: 'Updated Course Title',
  price: 89.99
});

// Delete a course
const result = await courseService.deleteCourse(courseId);
```

## 📋 Best Practices

### 1. Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Graceful fallbacks for failed operations

### 2. Performance Optimization
- Debounced search inputs
- Lazy loading for large datasets
- Memoization of expensive operations
- Efficient filtering and sorting algorithms

### 3. User Experience
- Loading states for all async operations
- Success/error feedback
- Confirmation dialogs for destructive actions
- Responsive design for all screen sizes

### 4. Code Organization
- Separation of concerns (services, components, types)
- Reusable components
- Type safety with TypeScript
- Consistent naming conventions

## 🔮 Future Enhancements

### Phase 2 Features
1. **Pagination**: Handle large datasets efficiently
2. **Advanced Analytics**: Charts and graphs
3. **Real-time Updates**: WebSocket integration
4. **Mobile Optimization**: Touch-friendly interactions
5. **Advanced Search**: Full-text search with filters

### Phase 3 Features
1. **AI-powered Recommendations**: Course suggestions
2. **Course Templates**: Pre-built course structures
3. **Automated Workflows**: Course approval processes
4. **Integration APIs**: Connect with external platforms
5. **Advanced Reporting**: Custom report generation

This comprehensive CRUD implementation provides a solid foundation for a modern learning management system with all necessary features for course administration, user management, and analytics tracking.
