# User Management and Email Verification System

## Issues Fixed

### 1. Email Verification Check
- **Problem**: Middleware was checking `user.email_confirmed_at` but database had `email_verified` field
- **Solution**: Updated middleware to check `profile.email_verified` from database instead
- **Result**: Email verification now works correctly

### 2. Default User Roles
- **Problem**: New users were defaulting to 'parent' role
- **Solution**: 
  - New users now get `site_role: null` by default
  - Admin must assign roles manually
  - First user still automatically becomes admin
- **Result**: Better role management and security

### 3. Admin Role Assignment
- **Problem**: No way for admins to assign roles to new users
- **Solution**: Added role assignment interface in admin users page
- **Result**: Admins can now assign roles to users who don't have them

## User Flow

### 1. New User Registration (Direct)
1. User registers via `/register`
2. Profile created with:
   - `site_role: null` (admin will assign later)
   - `active_status: true`
   - `email_verified: true` (after Supabase email confirmation)
3. User redirected to "Role Assignment Pending" page
4. Admin assigns role via admin users interface
5. User can now access appropriate dashboard

### 2. Invited User Registration
1. Admin invites user via admin users page
2. Profile created with:
   - `site_role: [assigned role]` (pre-selected by admin)
   - `active_status: false`
   - `email_verified: false`
3. User receives invitation email
4. User completes registration
5. Profile updated with:
   - `active_status: true`
   - `email_verified: true`
6. User can immediately access appropriate dashboard

### 3. First User (Admin Setup)
1. First user to register automatically becomes admin
2. Profile created with:
   - `site_role: 'admin'`
   - `active_status: true`
   - `email_verified: true`

## Access Control

### Middleware Checks (in order)
1. **Email Verification**: `profile.email_verified === true`
2. **Account Activation**: `profile.active_status === true`
3. **Role Assignment**: `profile.site_role !== null`
4. **Route Access**: Role-based permissions

### Error Pages
- `/access-denied?reason=email-not-verified`: Email not verified
- `/access-denied?reason=account-not-activated`: Invited user hasn't completed registration
- `/access-denied?reason=role-not-assigned`: No role assigned by admin
- `/access-denied`: General access denied (wrong role for page)

## Admin Features

### User Management (`/dashboard/admin/users`)
- View all users with status indicators
- Invite new users with pre-assigned roles
- Resend invitations to unverified users
- Assign roles to users without roles
- View user verification and activation status

### Status Indicators
- **Active**: Email verified AND account active AND has role
- **Pending Verification**: Email not verified
- **Pending Activation**: Email verified but account not active (invited users)
- **Role Assignment Pending**: Active but no role assigned

## Database Schema

### Profiles Table
```sql
email_verified BOOLEAN DEFAULT false NOT NULL
active_status BOOLEAN DEFAULT true NOT NULL
site_role TEXT NULL -- 'admin', 'teacher', 'parent', or NULL
```

### Migration Required
Run `migrations/003_add_email_verification.sql` to add email_verified column.

## Security Features

1. **Email Verification Enforced**: Users cannot access app until email is verified
2. **Role-Based Access**: Different dashboard sections based on role
3. **Account Activation**: Invited users must complete signup to activate
4. **Admin Role Assignment**: Only admins can assign roles to new users
5. **First User Protection**: First user automatically becomes admin
