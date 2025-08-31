# Users Without Company Feature

This document describes the new feature that allows administrators to view and manage users who are not assigned to any company.

## Overview

The "Users Without Company" feature provides a comprehensive way to identify, view, and manage users who don't have a company assignment. This is useful for:

- Identifying orphaned users
- Managing freelancers or independent contractors
- Ensuring all users are properly assigned to companies
- Administrative oversight of user assignments

## Features

### 1. Dedicated Page
- **URL**: `/admin/users/without-company`
- **Purpose**: View all users without company assignments
- **Features**:
  - Search functionality
  - User management (view, edit, delete)
  - Statistics display
  - Responsive table layout

### 2. Enhanced User Statistics
- Added "Users Without Company" count to the main users dashboard
- Updated statistics to show:
  - Total users
  - Users without company
  - Users with company
  - Different roles count
  - Companies count

### 3. Navigation Integration
- Added "Users Without Company" button on the main users page
- Added filter dropdown to quickly navigate to users without company
- Breadcrumb navigation for easy navigation

### 4. Reusable Components
- `UsersWithoutCompany` component for displaying users in card format
- `UsersWithoutCompanyWidget` component for dashboard integration

## Database Changes

### New Service Method
Added `getUsersWithoutCompany()` method to `UserService`:

```typescript
static async getUsersWithoutCompany(): Promise<ProfileData[]> {
  try {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .is('company_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(user => ({
      ...user,
      company: null
    }));
  } catch (error) {
    console.error('Error fetching users without company:', error);
    throw error;
  }
}
```

### Updated Statistics
Enhanced `getUserStats()` method to include users without company count:

```typescript
static async getUserStats(): Promise<{
  total: number;
  withoutCompany: number;
  byRole: Record<string, number>;
  byCompany: Record<string, number>;
}>
```

## Usage

### 1. Accessing the Feature

#### From Main Users Page
1. Navigate to `/admin/users`
2. Click the "Users Without Company" button in the header
3. Or use the filter dropdown and select "Users Without Company"

#### Direct Access
- Navigate directly to `/admin/users/without-company`

### 2. Using the Page

#### Viewing Users
- The page displays all users without company assignments
- Users are shown in a table format with:
  - Avatar
  - Name and username
  - Email
  - Role
  - Phone number
  - Company status (shows "No Company" badge)
  - Action buttons

#### Searching Users
- Use the search box to filter users by:
  - First name
  - Last name
  - Email
  - Role

#### Managing Users
- **View**: Click the eye icon to view user details
- **Edit**: Click the edit icon to modify user information
- **Delete**: Click the trash icon to remove the user

### 3. Using Components

#### UsersWithoutCompany Component
```tsx
import UsersWithoutCompany from 'components/app/users/UsersWithoutCompany';

// Basic usage
<UsersWithoutCompany />

// With custom props
<UsersWithoutCompany 
  limit={10} 
  showViewAll={false} 
  title="Freelancers" 
/>
```

#### UsersWithoutCompanyWidget Component
```tsx
import UsersWithoutCompanyWidget from 'components/dashboard/UsersWithoutCompanyWidget';

// Add to dashboard
<UsersWithoutCompanyWidget />
```

## File Structure

```
src/
├── pages/admin/users/
│   ├── without-company.tsx          # Main page for users without company
│   ├── index.tsx                    # Updated main users page
│   └── UserStats.tsx                # Updated statistics component
├── components/
│   ├── app/users/UsersWithoutCompany/
│   │   └── index.tsx                # Reusable users component
│   └── dashboard/UsersWithoutCompanyWidget/
│       └── index.tsx                # Dashboard widget
└── utils/supabase/
    └── userService.ts               # Updated with new methods
```

## API Endpoints

The feature uses existing API endpoints:
- User CRUD operations via existing `/api/users/*` endpoints
- Database queries through Supabase client

## Security

- All operations require authentication
- Row Level Security (RLS) policies apply
- Users can only access data they're authorized to view

## Future Enhancements

Potential improvements for the feature:

1. **Bulk Operations**
   - Bulk assign users to companies
   - Bulk delete users without company
   - Export users without company to CSV

2. **Advanced Filtering**
   - Filter by registration date
   - Filter by last activity
   - Filter by role

3. **Notifications**
   - Email notifications for users without company
   - Dashboard alerts for administrators

4. **Analytics**
   - Time-based analysis of users without company
   - Trends and patterns
   - Conversion rates (users getting assigned to companies)

## Troubleshooting

### Common Issues

1. **No users showing up**
   - Check if users actually have `company_id` set to `null`
   - Verify database permissions
   - Check authentication status

2. **Statistics not updating**
   - Refresh the page
   - Check browser console for errors
   - Verify Supabase connection

3. **Search not working**
   - Ensure search term is entered correctly
   - Check for case sensitivity
   - Verify user data exists

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection in Network tab
3. Check database directly for user records
4. Ensure all required environment variables are set

## Support

For issues or questions about this feature:
1. Check the troubleshooting section above
2. Review the database schema in `docs/COMPANY_DATABASE_SETUP.sql`
3. Check the user management documentation in `docs/USER_MANAGEMENT_SYSTEM.md`
