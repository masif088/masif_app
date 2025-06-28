# Activity Form Implementation

This document describes the implementation of the activity creation form and its integration with Supabase.

## Overview

The activity form allows users to create new activities with comprehensive details including title, description, assignee, status, priority, dates, tags, and notes. The implementation includes:

- **Form Component**: `src/pages/admin/activity/create.tsx`
- **Type Definitions**: `Types/ActivityType.tsx`
- **Service Layer**: `utils/supabase/activityService.ts`

## Database Schema

The implementation assumes the following Supabase table structure:

### Activities Table
```sql
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR DEFAULT 'Open',
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    priority VARCHAR,
    type VARCHAR,
    tags TEXT,
    note TEXT,
    link VARCHAR,
    activity_start TIMESTAMP,
    activity_end TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    avatar VARCHAR
);
```

### Activity Priorities Table
```sql
CREATE TABLE activity_priorities (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    description TEXT
);
```

## Features

### 1. Form Fields
- **Title** (Required): Activity title
- **Description** (Required): Detailed description
- **Type**: Activity type/category
- **Assignee** (Required): User assigned to the activity
- **Status**: Current status (Open, InProgress, Testing, Done, Others)
- **Priority**: Priority level (Low, Normal, High, Critical, Release Breaker)
- **Due Date**: When the activity is due
- **Start/End Date**: Activity timeline
- **Tags**: Comma-separated tags for categorization
- **Link**: Related URL
- **Notes**: Additional notes

### 2. Validation
- Required field validation
- Form submission handling with loading states
- Error handling and user feedback

### 3. Integration
- Supabase integration for data persistence
- Real-time form updates
- Automatic page refresh after successful creation

## Usage

### Basic Usage
```tsx
import CreateActivity from 'src/pages/admin/activity/create';

function ActivityPage() {
    return (
        <div>
            <h1>Activities</h1>
            <CreateActivity />
        </div>
    );
}
```

### Using the Service Layer
```tsx
import { ActivityService } from 'utils/supabase/activityService';

// Create an activity
const newActivity = await ActivityService.createActivity({
    title: 'New Task',
    description: 'Task description',
    user_id: 'user-uuid',
    status: 'Open',
    // ... other fields
});

// Get all activities
const activities = await ActivityService.getActivities();

// Get activities with filters
const filteredActivities = await ActivityService.getActivities({
    status: 'Open',
    user_id: 'user-uuid'
});
```

## API Methods

### ActivityService Class

#### `createActivity(data: CreateActivityFormData)`
Creates a new activity in the database.

#### `getActivities(filters?: ActivityFilters)`
Retrieves activities with optional filtering.

#### `getActivityById(id: number)`
Retrieves a single activity by ID.

#### `updateActivity(id: number, updates: Partial<Activity>)`
Updates an existing activity.

#### `deleteActivity(id: number)`
Deletes an activity.

#### `getUsers()`
Retrieves all users for the assignee dropdown.

#### `getActivityPriorities()`
Retrieves all priority options.

#### `getActivitiesByUser(userId: string)`
Retrieves activities for a specific user.

#### `searchActivities(searchTerm: string)`
Searches activities by title or description.

#### `getActivityStats()`
Retrieves activity statistics.

## Type Definitions

### Activity Interface
```typescript
interface Activity {
    id?: number;
    title: string;
    description: string;
    status: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    due_date: string;
    priority: string;
    type: string;
    tags: string;
    note: string;
    link: string;
    activity_start: string;
    activity_end: string;
}
```

### CreateActivityFormData Interface
```typescript
interface CreateActivityFormData {
    title: string;
    description: string;
    status: string;
    user_id: string;
    due_date: string;
    priority: string;
    type: string;
    tags: string;
    note: string;
    link: string;
    activity_start: string;
    activity_end: string;
}
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Form Validation**: Client-side validation for required fields
2. **API Errors**: Proper error handling for Supabase operations
3. **User Feedback**: Toast notifications for success/error states
4. **Loading States**: Visual feedback during form submission

## Styling

The form uses:
- **Reactstrap**: For form components and layout
- **Bootstrap**: For responsive design
- **Custom CSS**: For specific styling needs

## Environment Setup

Ensure the following environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Dependencies

The implementation requires these packages:
- `@supabase/ssr`
- `@supabase/supabase-js`
- `reactstrap`
- `react-toastify`
- `react-feather`

## Future Enhancements

Potential improvements:
1. **File Upload**: Add support for file attachments
2. **Rich Text Editor**: Enhanced description field
3. **Activity Templates**: Pre-defined activity templates
4. **Bulk Operations**: Create multiple activities at once
5. **Advanced Filtering**: More sophisticated search and filter options
6. **Activity History**: Track changes and modifications
7. **Notifications**: Email/SMS notifications for activity updates 