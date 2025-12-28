# Admin Centre User Manual - Plan Tiers

## Overview
The Admin Centre allows administrators to manually assign and manage user plan tiers. This is useful for promotional access, customer support, or testing purposes.

## Plan Tiers (2025 Pricing)

### Free Plan
- **Price:** A$0/month
- **Features:**
  - 1 pet profile maximum
  - Basic pet profiles and lost pet alerts
  - QR tag linking & lost/found contact
  - Unlimited health reminders
  - 0MB document storage
  - No data export
  - No priority support

### Premium Plan
- **Monthly:** A$4.49/month
- **Annual:** A$48.44/year (10% discount)
- **Stripe Product ID:** `prod_TGGcRtzlK6vz7A`
- **Monthly Price ID:** `price_1SJk4yEhyEZfSSpN8x8KqTGY`
- **Annual Price ID:** `price_1SJk5EEhyEZfSSpNpADhN5AQ`
- **Features:**
  - Up to 5 pet profiles
  - Family sharing (up to 5 members with full access)
  - VetShare - Share medical records with vets via QR code
  - Unlimited custom lost pet posters
  - Unlimited health reminders
  - 50MB document storage
  - Data export enabled
  - Priority support

### Family Plan
- **Monthly:** A$7.99/month
- **Annual:** A$86.29/year (10% discount)
- **Stripe Product ID:** `prod_TGGcY3nKNalPuA`
- **Monthly Price ID:** `price_1SJk5TEhyEZfSSpNKpDL6ZyO`
- **Annual Price ID:** `price_1SJk9JEhyEZfSSpNFATW8hkx`
- **Features:**
  - Unlimited pet profiles
  - Family sharing (up to 10 members with full access)
  - Multi-household sharing
  - VetShare - Share medical records with vets via QR code
  - Unlimited custom lost pet posters
  - Unlimited health reminders
  - 200MB document storage
  - Data export enabled
  - Priority support

## How to Change a User's Plan Tier

### Step 1: Access the Admin Dashboard
1. Navigate to `/admin` (requires admin role)
2. Click on the "Users" tab

### Step 2: Find the User
1. Use the search bar to find the user by:
   - Email address
   - Display name
   - User ID
2. Click on the user row to select them

### Step 3: Change Plan Tier
1. Click the "Edit" button (pencil icon) next to the user's current plan tier
2. A dialog will appear with the following options:
   - **Plan Tier:** Select from Free, Premium, or Family
   - **Expires At (optional):** Set an expiration date for temporary access
   - **Note (optional):** Add a reason for the tier change (for audit purposes)

### Step 4: Confirm Changes
1. Select the new tier from the dropdown
2. (Optional) Set an expiration date if this is temporary access
3. (Optional) Add a note explaining why the tier was changed
4. Click "Update Tier"
5. A confirmation dialog will appear - click "Confirm" to proceed

### Step 5: Verify Changes
- The user's plan tier will update immediately in the database
- Users will see the changes within 60 seconds or on their next page refresh
- The change will be logged in the `plan_audit` table for tracking

## Manual Tier Assignment vs Stripe Subscription

### Manual Assignment
- Set via the Admin Centre
- Bypasses Stripe payment processing
- Useful for:
  - Promotional access (e.g., influencers, partners)
  - Customer support (e.g., resolving billing issues)
  - Internal testing
  - Grandfathered pricing
- Can set expiration dates
- Tracked in `user_subscriptions` table with `manual=true` flag

### Stripe Subscription
- User subscribes through the normal checkout flow
- Payment is processed by Stripe
- Managed via Stripe Customer Portal
- Auto-renews unless cancelled
- Tracked in `user_subscriptions` table with Stripe subscription ID

### Important Notes
1. **Manual assignments override Stripe subscriptions** - If you manually set a user to a specific tier, it takes precedence over their Stripe subscription status
2. **Expiration handling** - When a manual assignment expires, the system checks for an active Stripe subscription. If none exists, the user downgrades to Free
3. **Audit trail** - All tier changes are logged in the `plan_audit` table with:
   - Who made the change (admin user ID)
   - What changed (old tier → new tier)
   - When it changed (timestamp)
   - Why it changed (optional note)

## Viewing Plan Change History

### Via Admin Dashboard
1. Select a user from the Users tab
2. View the "Plan History" section
3. See all tier changes with timestamps and notes

### Via Database Query
```sql
SELECT * FROM plan_audit 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC;
```

## Common Use Cases

### Promotional Access
**Scenario:** Give a social media influencer Premium access for 30 days
1. Find the user in Admin Dashboard
2. Set tier to "Premium"
3. Set expires at: 30 days from now
4. Note: "Promotional access for @influencer - Social media campaign Q1 2025"

### Billing Issue Resolution
**Scenario:** Customer's payment failed but they're a loyal user
1. Find the user in Admin Dashboard
2. Set tier to their previous tier (Premium or Family)
3. Set expires at: 7 days from now (grace period)
4. Note: "Payment issue grace period - User contacted"

### Grandfathered Pricing
**Scenario:** Early adopter should keep old pricing
1. Find the user in Admin Dashboard
2. Set tier to appropriate level
3. Leave expires at blank (permanent)
4. Note: "Grandfathered - Early adopter discount"

### Internal Testing
**Scenario:** QA team needs to test Family features
1. Find the test user account
2. Set tier to "Family"
3. Set expires at: End of testing period
4. Note: "QA testing - Feature X validation"

## Troubleshooting

### User Not Seeing Tier Change
1. Verify the change in the database:
   ```sql
   SELECT plan_tier FROM profiles WHERE id = '<user_id>';
   ```
2. Check if there's an active Stripe subscription conflicting
3. Ask user to refresh the page or log out and back in
4. Check the `plan_audit` table for any errors

### Tier Reverted to Free
- Check if the expiration date has passed
- Verify no Stripe subscription cancellation webhook was received
- Review `plan_audit` for automatic system changes

### Cannot Change Tier
- Verify you have admin role in `user_roles` table
- Check for database errors in Admin Dashboard console
- Ensure the user account exists and is not deleted

## Best Practices

1. **Always add notes** - Document why you're changing a user's tier
2. **Use expiration dates** - For temporary access, always set an expiry
3. **Communicate with users** - Email users when you manually change their tier
4. **Review regularly** - Check for expiring manual assignments weekly
5. **Audit changes** - Review the `plan_audit` table monthly
6. **Test first** - Use test accounts before changing real user tiers

## Security & Compliance

- Only users with the `admin` role can change plan tiers
- All changes are logged with admin user ID and timestamp
- Manual tier assignments are marked in the database
- GDPR: Plan change data is included in user data exports
- Refunds: Manual downgrades do not trigger automatic refunds (handle via Stripe Dashboard)

## Support Contacts

For questions about plan tier management:
- Support: support@petlinkid.io

---

**Last Updated:** January 2025  
**Version:** 2.0 (2025 Pricing Structure)
