# Profile Management Setup Instructions

This document provides step-by-step instructions to set up the profile management functionality with Supabase integration.

## Prerequisites

1. Supabase project set up
2. Next.js application with the required dependencies
3. Environment variables configured

## Environment Variables

Make sure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE=masif-app
```

## Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `docs/PROFILE_DATABASE_SETUP.sql`

This will create:
- `users` table for user profile data (including phone and role fields)
- `user_projects` table for user projects
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

## Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `masif-app`
3. Set the bucket to public
4. Configure the following settings:
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

## Features Implemented

### Profile Management
- ✅ Profile information editing (name, email, company, address, phone, role, skills, etc.)
- ✅ Profile image upload to Supabase storage
- ✅ Real-time form validation
- ✅ Loading states and error handling

### Project Management
- ✅ Create, read, update, and delete user projects
- ✅ Project status management (In Progress, Completed, On Hold, Cancelled)
- ✅ Project date and price tracking
- ✅ Modal-based project editing

### Technical Features
- ✅ Supabase integration with proper authentication
- ✅ Image upload to `masif_app/profile_path` directory
- ✅ Context-based state management
- ✅ TypeScript support with proper interfaces
- ✅ Responsive design with Reactstrap components
- ✅ Toast notifications for user feedback

## File Structure

```
src/pages/admin/profile/
├── index.tsx                           # Main profile page
└── EditProfile/
    ├── ProfileProvider.tsx             # Context provider for state management
    ├── EditMyProfile.tsx               # Profile image and basic info
    ├── EditProfileForm.tsx             # Detailed profile form
    ├── AddProjectsAndUpload.tsx        # Project management component
    └── AddProjectsAndUploadTableBody.tsx # Project table component

utils/supabase/
├── profileService.ts                   # Profile and project API service
└── client.ts                          # Supabase client configuration
```

## Usage

### Profile Editing
1. Navigate to `/admin/profile`
2. Use the left panel to update basic information, phone number, and profile image
3. Use the right panel to update detailed profile information including role and skills
4. All changes are automatically saved to Supabase

### Project Management
1. Click "Add New Project" to create a new project
2. Fill in the project details in the modal
3. Use the edit and delete buttons to manage existing projects
4. Projects are automatically associated with the current user

## API Endpoints

The profile service provides the following methods:

### Profile Management
- `getCurrentUserProfile()` - Get current user's profile
- `updateProfile(data)` - Update profile information
- `uploadProfileImage(file)` - Upload profile image

### Project Management
- `getUserProjects()` - Get user's projects
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update existing project
- `deleteProject(id)` - Delete project

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    username TEXT UNIQUE,
    company TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    about_me TEXT,
    website TEXT,
    avatar TEXT,
    role TEXT,
    phone TEXT,
    skills TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Projects Table
```sql
CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    project_name TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    price TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Features

- Row Level Security (RLS) policies ensure users can only access their own data
- Authentication required for all operations
- File upload restrictions (image files only, 5MB limit)
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Profile not loading**: Check if user is authenticated
2. **Image upload fails**: Verify storage bucket configuration
3. **Database errors**: Ensure RLS policies are properly set up
4. **TypeScript errors**: Check that all interfaces are properly imported

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Check Supabase logs for server-side errors
4. Ensure environment variables are correctly set

## Future Enhancements

- [ ] Profile completion percentage indicator
- [ ] Social media links
- [ ] Profile privacy settings
- [ ] Profile export functionality
- [ ] Advanced project filtering and search
- [ ] Project templates
- [ ] Profile analytics and insights 