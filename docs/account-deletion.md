# Account Deletion Guide

## User Self-Service Data Purge

Users can initiate account deletion through the Settings > Privacy page. The process involves:

1. **Data Purge**: All user's application data is deleted from the database
2. **Auth Deletion**: The Supabase auth record is removed
3. **Sign Out**: User is automatically signed out
4. **Confirmation**: User sees a goodbye screen

## What Gets Deleted

### Application Tables
- `pets` - All pets owned by the user
- `vaccinations` - All vaccination records
- `health_reminders` - All health reminders
- `pet_documents` - All document records (files in storage also deleted)
- `notifications` - All notifications
- `pet_memberships` - All membership records
- `pet_invites` - All invitations sent by the user
- `profiles` - User profile data

### Supabase Auth
- User authentication record
- Email and identity information

## Implementation

### Edge Function

The deletion is handled by the `delete-account` edge function which uses the service role key to bypass RLS and perform administrative operations.

**Location**: `supabase/functions/delete-account/index.ts`

### Process Flow

1. User clicks "Delete Account" in Settings
2. User must type "DELETE" to confirm
3. Frontend calls `delete-account` edge function
4. Edge function:
   - Verifies user authentication
   - Deletes data from all application tables
   - Deletes user profile
   - Deletes auth user record using admin API
5. User is signed out
6. User is redirected to home page

### Security

- Requires active user session
- CORS restricted to allowed origins
- Uses Supabase admin client with service role key
- All operations are logged

## Data Cascade

Due to foreign key relationships, deleting a user automatically cascades to:
- All pets owned by the user
- All records associated with those pets
- All memberships
- All invitations

## No Recovery

⚠️ **This action is permanent and cannot be undone.**

Once deleted:
- Data cannot be recovered
- Email address can be reused for new account
- No backup or archive is created

## For Administrators

### Manual Deletion (if needed)

If the edge function fails or manual intervention is required:

```sql
-- Delete all user data (replace USER_ID with actual UUID)
DELETE FROM pets WHERE user_id = 'USER_ID';
DELETE FROM pet_documents WHERE user_id = 'USER_ID';
DELETE FROM health_reminders WHERE user_id = 'USER_ID';
DELETE FROM vaccinations WHERE user_id = 'USER_ID';
DELETE FROM notifications WHERE user_id = 'USER_ID';
DELETE FROM pet_memberships WHERE user_id = 'USER_ID';
DELETE FROM pet_invites WHERE invited_by = 'USER_ID';
DELETE FROM profiles WHERE id = 'USER_ID';

-- Delete auth user (requires service role or dashboard)
-- Use Supabase Dashboard > Authentication > Users > Delete User
```

### Monitoring

Check edge function logs:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/logs/edge-functions
```

Filter for `delete-account` function.

## Edge Cases

### Shared Pets
If a user is a member of pets owned by others:
- Their membership is deleted
- The pet itself remains (owned by original owner)
- Other members retain access

### Pending Invites
- Invites sent by the deleted user are cancelled
- Invites sent to the deleted user become invalid

### Storage Files
Pet documents in Supabase Storage should be deleted via storage policies or manually:
```sql
-- Storage deletion (if not handled by policies)
SELECT storage.delete_bucket('pet-documents', 'USER_ID/');
```

## Testing

Before deploying to production:

1. Create test account
2. Add test data (pets, vaccinations, etc.)
3. Perform deletion
4. Verify all data is removed
5. Verify auth user is deleted
6. Attempt to sign in (should fail)
7. Check storage for orphaned files

## Compliance

This deletion process helps comply with:
- **GDPR**: Right to erasure (Article 17)
- **Australian Privacy Act**: APP 11 (Security of personal information)
- **CCPA**: Right to deletion

## Future Enhancements

Consider implementing:
- [ ] 30-day grace period before permanent deletion
- [ ] Export data before deletion (automatic)
- [ ] Email confirmation before deletion
- [ ] Admin review for suspicious deletions
- [ ] Audit trail of deletions
