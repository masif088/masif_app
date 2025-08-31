# LearningTable Component

A comprehensive learning course management table component with filtering, sorting, and CRUD operations.

## Features

- **Course Management**: View, create, edit, and delete courses
- **Advanced Filtering**: Filter by search term, category, and status
- **Sorting**: Sort by title, instructor, enrollment, rating, or date
- **Responsive Design**: Works on all screen sizes
- **Modal Forms**: Integrated course creation and editing forms
- **Loading States**: Visual feedback during operations
- **Callback Support**: Notify parent components of changes

## Usage

### Basic Usage

```tsx
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

### With Callbacks

```tsx
import LearningTable from '@/components/Learning/LearningTable';
import { LearningCourse } from '@/types/learning';

const MyPage = () => {
  const handleCourseSaved = (course: LearningCourse) => {
    console.log('Course saved:', course);
    // Refresh your data or show success message
  };

  const handleCourseDeleted = (courseId: string) => {
    console.log('Course deleted:', courseId);
    // Refresh your data or show success message
  };

  return (
    <LearningTable 
      onCourseSaved={handleCourseSaved}
      onCourseDeleted={handleCourseDeleted}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onCourseSaved` | `(course: LearningCourse) => void` | No | Callback when a course is saved |
| `onCourseDeleted` | `(courseId: string) => void` | No | Callback when a course is deleted |

## Features

### 1. Course Table
- Displays course information in a sortable table
- Shows course thumbnail, title, instructor, category, level, duration, price, status, enrollment, rating, and completion rate
- Responsive design with proper mobile support

### 2. Filtering
- **Search**: Search by course title or instructor name
- **Category Filter**: Filter by course category (Development, Design, Data Science, Business)
- **Status Filter**: Filter by course status (Active, Draft, Archived)

### 3. Sorting
- Sort by title, instructor, enrollment, rating, or last updated date
- Toggle between ascending and descending order

### 4. Actions
- **Add New Course**: Opens modal with course creation form
- **Edit Course**: Opens modal with pre-filled course editing form
- **Delete Course**: Removes course with confirmation
- **View Course**: View course details (placeholder)
- **Export Course**: Export course data (placeholder)

### 5. Statistics
- Total courses count
- Active courses count
- Total enrollments
- Average rating

## Dependencies

- React
- Reactstrap (for UI components)
- Lucide React (for icons)
- Next.js Image component
- TypeScript

## Data Structure

The component expects courses to follow the `LearningCourse` interface:

```typescript
interface LearningCourse {
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
  status: CourseStatus;
  enrollment: number;
  rating: number;
  completionRate: number;
  lastUpdated: string;
  thumbnail: string;
  tags: string[];
  // ... other fields
}
```

## Integration with CourseForm

The component integrates with the `CourseForm` component for creating and editing courses. The form includes:

- Basic course information (title, description, category, level, price)
- Instructor selection
- Thumbnail upload
- Tags management
- Prerequisites and learning outcomes
- Certificate options

## API Integration

To integrate with a real API:

1. Replace the mock data with API calls
2. Update the `handleSaveCourse` function to call your API
3. Update the `handleDeleteCourse` function to call your API
4. Add proper error handling and loading states

Example API integration:

```tsx
const handleSaveCourse = async (course: LearningCourse) => {
  try {
    setIsLoading(true);
    
    if (editingCourse) {
      await courseService.updateCourse(course.id, course);
    } else {
      await courseService.createCourse(course);
    }
    
    setShowAddModal(false);
    setEditingCourse(null);
    
    if (onCourseSaved) {
      onCourseSaved(course);
    }
  } catch (error) {
    console.error('Error saving course:', error);
    // Show error message to user
  } finally {
    setIsLoading(false);
  }
};
```

## Styling

The component uses Bootstrap classes and custom CSS. To customize the styling:

1. Override Bootstrap classes
2. Add custom CSS classes
3. Modify the component's JSX structure

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers
