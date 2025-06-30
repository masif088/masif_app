# User Management System

This document describes the comprehensive user management system built for the admin panel, including CRUD operations, user statistics, and detailed user profiles.

## Overview

The user management system provides administrators with a complete interface to manage users in the application. It includes:

- **User Listing**: View all users with search and filtering capabilities
- **User Creation**: Create new users with comprehensive profile information
- **User Editing**: Update existing user information
- **User Deletion**: Remove users from the system
- **User Statistics**: View analytics and metrics about users
- **User Details**: Detailed view of individual user profiles

## File Structure

```
src/pages/admin/users/
├── index.tsx              # Main users listing page
├── [id].tsx              # Individual user detail page
├── UserModal.tsx         # Modal for creating/editing users
└── UserStats.tsx         # User statistics component

utils/supabase/
├── userService.ts        # User management service
└── profileService.ts     # Profile management service
```

## Components

### 1. Users Page (`index.tsx`)

The main users management page that provides:

- **User Statistics Dashboard**: Shows total users, roles, companies, and distribution
- **User Table**: Displays all users with search functionality
- **Action Buttons**: Create, view, edit, and delete users
- **Search Functionality**: Filter users by name, email, company, or role

**Features:**
- Real-time search filtering
- Responsive table design
- User avatar display
- Action buttons for each user
- Loading states and error handling

### 2. User Modal (`UserModal.tsx`)

A comprehensive modal component for creating and editing users with:

- **Profile Image Upload**: Upload and preview user avatars
- **Basic Information**: First name, last name, email, username
- **Professional Information**: Company, role, phone, website
- **Address Information**: Address, city, postal code, country
- **About Me**: User biography
- **Skills Input**: Select2-style skills input with autocomplete
- **Password Management**: Password fields for new users

**Modes:**
- **Create**: Add new users with password
- **Edit**: Update existing user information
- **View**: Read-only display of user information

### 3. User Detail Page (`[id].tsx`)

A detailed view page for individual users showing:

- **Profile Information**: Avatar, name, username, role, company
- **Contact Information**: Email, phone, website, creation date
- **Address Information**: Complete address details
- **Skills**: Display user skills as badges
- **About Me**: User biography
- **Action Buttons**: Edit and delete user

### 4. User Statistics (`UserStats.tsx`)

A dashboard component displaying user analytics:

- **Summary Cards**: Total users, active users, roles count, companies count
- **Top Roles**: Most common user roles
- **Top Companies**: Most common companies
- **Role Distribution**: Visual representation of role distribution

## Services

### UserService (`userService.ts`)

A comprehensive service class providing user management operations:

#### Methods:

- `getAllUsers()`: Fetch all users
- `getUserById(id)`: Get specific user by ID
- `createUser(userData)`: Create new user (auth + profile)
- `updateUser(id, userData)`: Update existing user
- `deleteUser(id)`: Delete user from system
- `searchUsers(searchTerm)`: Search users by various criteria
- `getUsersByRole(role)`: Filter users by role
- `getUsersByCompany(company)`: Filter users by company
- `uploadUserImage(file, userId)`: Upload user profile image
- `getUserStats()`: Get user statistics and analytics

## Database Schema

The system uses the `users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(255),
  postal_code VARCHAR(20),
  country VARCHAR(255),
  about_me TEXT,
  website VARCHAR(255),
  skills TEXT,
  avatar VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features

### 1. User Authentication Integration

- Creates users in Supabase Auth
- Automatically creates profile records
- Handles user metadata

### 2. Image Management

- Upload profile images to Supabase Storage
- Automatic file naming and organization
- Image preview functionality
- Fallback to default avatar

### 3. Skills Management

- Select2-style skills input
- Autocomplete functionality
- Tag-based display
- Keyboard navigation

### 4. Search and Filtering

- Real-time search across multiple fields
- Role-based filtering
- Company-based filtering
- Case-insensitive search

### 5. Statistics and Analytics

- User count metrics
- Role distribution analysis
- Company distribution analysis
- Visual progress bars and charts

### 6. Responsive Design

- Mobile-friendly interface
- Responsive tables
- Adaptive layouts
- Touch-friendly controls

## Usage

### Accessing the User Management System

1. Navigate to `/admin/users` in the application
2. View user statistics and metrics
3. Use the search bar to find specific users
4. Click on user names to view detailed profiles
5. Use action buttons to create, edit, or delete users

### Creating a New User

1. Click the "Add User" button
2. Fill in required fields (first name, last name, email, password)
3. Optionally add profile image, company, role, and other details
4. Add skills using the skills input component
5. Click "Create User" to save

### Editing a User

1. Click the edit button (pencil icon) next to a user
2. Modify the desired fields
3. Upload a new profile image if needed
4. Click "Update User" to save changes

### Viewing User Details

1. Click on a user's name in the table
2. View comprehensive user information
3. See skills displayed as badges
4. Access edit and delete actions

### Deleting a User

1. Click the delete button (trash icon) next to a user
2. Confirm the deletion in the popup
3. User will be removed from the system

## Security Considerations

- **Row Level Security**: Database policies ensure data access control
- **Input Validation**: All user inputs are validated
- **Image Upload Security**: File type and size restrictions
- **Authentication Required**: Admin access required for all operations
- **Confirmation Dialogs**: Delete operations require confirmation

## Error Handling

- **Loading States**: Visual feedback during operations
- **Error Messages**: User-friendly error notifications
- **Fallback Values**: Default values for missing data
- **Graceful Degradation**: System continues to work with partial data

## Future Enhancements

- **Bulk Operations**: Select multiple users for batch actions
- **Advanced Filtering**: Date ranges, status filters
- **Export Functionality**: Export user data to CSV/Excel
- **User Activity Tracking**: Monitor user login and activity
- **Role-based Permissions**: Different access levels for different admin roles
- **Audit Logs**: Track all user management actions
- **Email Notifications**: Notify users of profile changes
- **API Endpoints**: RESTful API for external integrations

## Dependencies

- **React**: UI framework
- **Reactstrap**: Bootstrap components for React
- **Supabase**: Backend and authentication
- **Next.js**: Routing and server-side rendering
- **React-toastify**: Toast notifications
- **TypeScript**: Type safety

## Configuration

Ensure the following environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE=your_storage_bucket_name
```

## Troubleshooting

### Common Issues

1. **Image Upload Fails**: Check storage bucket permissions and CORS settings
2. **User Creation Fails**: Verify Supabase Auth configuration
3. **Search Not Working**: Ensure database indexes are created
4. **Statistics Not Loading**: Check database permissions and RLS policies

### Performance Optimization

- Implement pagination for large user lists
- Add database indexes for search fields
- Optimize image uploads with compression
- Cache frequently accessed data
- Use virtual scrolling for large datasets 