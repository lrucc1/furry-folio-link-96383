# Account Deletion Cleanup - Updated Implementation

## Overview
The account deletion process now implements a 30-day grace period with soft deletion, allowing users to restore their accounts within this period.

## Implementation Details

### Issue 1: Stripe Customer Cleanup ✅
**Fixed**: Stripe customer records are now completely deleted (not just canceled)
- Subscriptions are immediately canceled (not at period end)
- Customer record is deleted from Stripe
- This archives all subscription history and prevents webhook orphaning

### Issue 3: Confirmation Email ⚠️
**Pending**: Email confirmation requires Resend setup
- To implement: Add `RESEND_API_KEY` secret
- Email will include: deletion date, 30-day restoration window, subscription cancellation details

### Issue 4: Webhook Orphaning ✅
**Fixed**: Stripe webhooks now gracefully handle deleted users
- Uses `maybeSingle()` instead of `single()` to avoid errors
- Checks `deletion_scheduled` flag before processing
- Skips webhook processing for deleted/scheduled users

### Issue 5: Grace Period ✅
**Fixed**: Implemented 30-day soft delete with grace period
- New columns: `deleted_at`, `deletion_scheduled` on `profiles` table
- Account marked for deletion (not immediately deleted)
- Data remains intact for 30 days
- New cleanup function: `cleanup-deleted-accounts`

## Account Deletion Flow

### When User Clicks "Delete Account"

1. **Stripe Processing**
   - All active/trialing subscriptions are immediately canceled
   - Stripe customer record is completely deleted
   - All billing history is archived in Stripe

2. **Soft Delete**
   - Profile marked with `deletion_scheduled = true`
   - `deleted_at` timestamp recorded
   - User data remains in database (not deleted yet)

3. **User Impact**
   - User is signed out
   - Account is inaccessible
   - 30-day grace period begins

### Cleanup Process (After 30 Days)

The `cleanup-deleted-accounts` edge function should be run periodically (e.g., daily via cron) to hard delete accounts after the grace period.

**Manual Execution**:
```bash
# Call the edge function to cleanup accounts
curl -X POST https://pnlsootdnywbkqnxsqya.supabase.co/functions/v1/cleanup-deleted-accounts
```

**Automated via Cron** (recommended):
Set up a cron job or scheduled task to call this function daily:
```
0 2 * * * curl -X POST https://pnlsootdnywbkqnxsqya.supabase.co/functions/v1/cleanup-deleted-accounts
```

### What Gets Deleted (After 30 Days)

- All pets owned by the user
- All health reminders and vaccinations
- All pet documents (+ storage files)
- All notifications
- All pet memberships and invitations
- User profile
- Auth user record

### Account Restoration

To restore an account within 30 days:

```sql
-- Find the user
SELECT id, email, deleted_at, deletion_scheduled 
FROM profiles 
WHERE email = 'user@example.com' 
AND deletion_scheduled = true;

-- Restore the account
UPDATE profiles 
SET deleted_at = NULL, 
    deletion_scheduled = false
WHERE id = 'USER_ID';
```

## Security Considerations

1. **Webhook Safety**: Webhooks arriving after deletion are safely ignored
2. **Data Integrity**: Foreign key cascades ensure complete data removal
3. **Grace Period**: Prevents accidental permanent deletion
4. **Audit Trail**: `deleted_at` timestamp provides deletion history

## Future Enhancements

- [ ] Email confirmation (requires Resend setup)
- [ ] Admin dashboard for restoration requests
- [ ] Automated cron job for cleanup function
- [ ] Export data before deletion (automatic)
- [ ] Audit log of deletions

## Database Schema

```sql
-- New columns added to profiles
ALTER TABLE public.profiles 
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deletion_scheduled BOOLEAN DEFAULT false;

-- Index for efficient cleanup queries
CREATE INDEX idx_profiles_deletion_scheduled 
ON public.profiles(deletion_scheduled, deleted_at) 
WHERE deletion_scheduled = true;
```

## Compliance

This implementation supports:
- **GDPR Article 17**: Right to erasure (with 30-day processing period)
- **Australian Privacy Act**: APP 11 requirements
- **CCPA**: Right to deletion (with reasonable timeframe)

The 30-day grace period is considered reasonable for:
- System integrity checks
- Backup cycles
- User restoration requests
- Business record retention
