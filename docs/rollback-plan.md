# PetLinkID Production Rollback Plan

**Version:** 1.0.0  
**Last Updated:** 2025-10-26  
**Purpose:** Emergency rollback procedures for production issues

---

## 🚨 When to Rollback

Execute this plan if:
- **Critical security vulnerability** discovered in production
- **Database corruption** or data loss occurring
- **Payment processing failures** affecting multiple users
- **Authentication system** completely broken
- **App crashes** on launch for majority of users
- **Data privacy breach** or unauthorized access detected

**Do NOT rollback for:**
- Minor UI bugs that don't affect functionality
- Single-user issues
- Performance slowdowns (unless critical)
- Feature requests

---

## 🎯 Rollback Decision Tree

```
Issue Detected
    |
    ├─ Affects < 5% of users? → Monitor and hotfix
    |
    ├─ UI/UX only? → Monitor and hotfix
    |
    ├─ Security breach? → IMMEDIATE ROLLBACK
    |
    ├─ Data loss? → IMMEDIATE ROLLBACK
    |
    ├─ Payment failures? → IMMEDIATE ROLLBACK
    |
    └─ Auth broken? → IMMEDIATE ROLLBACK
```

---

## 🔄 Rollback Procedures

### 1️⃣ Application Code Rollback (Lovable)

**Time Required:** 2-5 minutes  
**Risk Level:** Low

#### Steps:

1. **Access Lovable Project**
   - Go to your PetLinkID project in Lovable
   - Click the version history icon

2. **Identify Last Known Good Version**
   - Review version history
   - Find the last deployment before the issue
   - Confirm timestamp matches pre-issue timeframe

3. **Revert**
   - Click "Revert to this version" on the good version
   - Confirm revert action
   - Wait for automatic redeployment (2-3 minutes)

4. **Verify**
   - Test critical paths: auth, pet creation, checkout
   - Check error rates in logs
   - Verify production URL loads correctly

**Rollback Command (if using GitHub):**
```bash
git revert <commit-hash>
git push origin main
```

---

### 2️⃣ Database Migration Rollback (Supabase)

**Time Required:** 5-15 minutes  
**Risk Level:** HIGH - Requires careful execution

#### ⚠️ WARNING
Database rollbacks can cause data loss. Only execute if:
- Migration caused corruption
- Data integrity compromised
- No alternative fix available

#### Steps:

1. **Identify Migration to Rollback**
   ```sql
   -- Check applied migrations
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC 
   LIMIT 10;
   ```

2. **Create Backup (CRITICAL)**
   - Go to Lovable Cloud → Backend → Database
   - Create manual backup: "pre-rollback-[timestamp]"
   - Wait for backup completion confirmation

3. **Execute Down Migration**
   
   **For RLS Policy Changes:**
   ```sql
   -- Example: Rollback policy change
   DROP POLICY IF EXISTS "new_policy_name" ON public.table_name;
   
   -- Recreate old policy
   CREATE POLICY "old_policy_name" 
   ON public.table_name 
   FOR SELECT 
   USING (auth.uid() = user_id);
   ```

   **For Table Structure Changes:**
   ```sql
   -- Example: Rollback column addition
   ALTER TABLE public.table_name 
   DROP COLUMN IF EXISTS new_column_name;
   ```

   **For New Table Creation:**
   ```sql
   -- Drop table and all dependencies
   DROP TABLE IF EXISTS public.new_table_name CASCADE;
   ```

4. **Verify Database State**
   ```sql
   -- Check table structure
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'affected_table';
   
   -- Check RLS policies
   SELECT policyname, tablename, cmd 
   FROM pg_policies 
   WHERE tablename = 'affected_table';
   ```

5. **Test Data Access**
   - Attempt to read/write from affected tables
   - Verify RLS policies work correctly
   - Check edge functions still function

#### Common Rollback Scenarios:

**Scenario A: Broke RLS Policy**
```sql
-- Rollback steps
DROP POLICY IF EXISTS "broken_policy" ON public.pets;
CREATE POLICY "original_policy" 
ON public.pets 
FOR ALL 
USING (auth.uid() = user_id);
```

**Scenario B: Added Column Causing Issues**
```sql
-- Rollback steps
ALTER TABLE public.pets 
DROP COLUMN IF EXISTS problematic_column;
```

**Scenario C: Broke Storage Bucket Policy**
```sql
-- Rollback steps
DROP POLICY IF EXISTS "new_storage_policy" ON storage.objects;
CREATE POLICY "old_storage_policy" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

### 3️⃣ Edge Function Rollback (Supabase Functions)

**Time Required:** 3-5 minutes  
**Risk Level:** Medium

#### Steps:

1. **Identify Broken Function**
   - Check edge function logs in Lovable Cloud
   - Identify function causing errors

2. **Revert Function Code**
   - In Lovable, revert to previous version (see step 1️⃣)
   - Functions auto-deploy with code rollback

3. **Manual Function Rollback (if needed)**
   ```bash
   # If using Supabase CLI locally
   git checkout <previous-commit> -- supabase/functions/function-name
   npx supabase functions deploy function-name
   ```

4. **Verify Function**
   - Test function via Lovable Cloud → Backend → Edge Functions
   - Check function logs for errors
   - Test from production app

---

### 4️⃣ Stripe Configuration Rollback

**Time Required:** 2-5 minutes  
**Risk Level:** Medium

#### Scenarios:

**Scenario A: Webhook Issues**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Disable new webhook endpoint
3. Re-enable previous working endpoint
4. Update `STRIPE_WEBHOOK_SECRET` in Lovable secrets

**Scenario B: Wrong Price IDs**
1. Revert environment variables:
   - `VITE_STRIPE_PRICE_PRO_MONTHLY_AUD`
   - `VITE_STRIPE_PRICE_PRO_YEARLY_AUD`
2. Redeploy application
3. Verify checkout creates correct subscriptions

---

### 5️⃣ Feature Flag Emergency Disable

**Time Required:** 30 seconds  
**Risk Level:** Very Low

#### For Quick Disabling of Problematic Features:

1. **If Feature Flags System Exists:**
   ```sql
   UPDATE public.feature_flags 
   SET enabled = false 
   WHERE key = 'problematic_feature_name';
   ```

2. **Verify Feature Disabled:**
   - Refresh app
   - Confirm feature no longer visible/functional

---

## 🔍 Post-Rollback Verification Checklist

After any rollback, verify these critical paths work:

### Authentication
- [ ] New user signup
- [ ] Existing user login
- [ ] Password reset
- [ ] Email verification

### Core Functionality
- [ ] Create new pet
- [ ] Upload pet photo
- [ ] Add health reminder
- [ ] Mark pet as lost
- [ ] Public pet profile loads

### Payments
- [ ] Pricing page loads
- [ ] Checkout creates session
- [ ] Webhook processes events
- [ ] Subscription status updates

### Data Access
- [ ] Dashboard shows user's pets
- [ ] Pet details page loads
- [ ] Documents upload/download
- [ ] Data export works

### iOS App (if applicable)
- [ ] App launches successfully
- [ ] Can authenticate
- [ ] Can view pets
- [ ] All features functional

---

## 📊 Monitoring After Rollback

Monitor these metrics for 24 hours:

1. **Error Rates**
   - Check Lovable Cloud logs
   - Monitor Supabase function errors
   - Watch for Stripe webhook failures

2. **User Activity**
   - Track successful logins
   - Monitor pet creation rate
   - Check subscription conversions

3. **Performance**
   - Page load times
   - API response times
   - Database query performance

---

## 🚦 Rollback Status Codes

Use these codes when communicating rollback status:

- **ROLLBACK-INITIATED** - Rollback process started
- **ROLLBACK-VERIFICATION** - Testing rolled back version
- **ROLLBACK-COMPLETE** - Successfully rolled back
- **ROLLBACK-FAILED** - Rollback unsuccessful, escalate

---

## 📞 Emergency Contacts

**During Rollback:**
1. **Technical Lead:** [Your Name]
2. **Lovable Support:** Via Lovable dashboard
3. **Supabase Support:** https://supabase.com/dashboard/support
4. **Stripe Support:** https://support.stripe.com

---

## 🔄 Recovery Procedures

After rollback is stable:

### 1. Root Cause Analysis
- Identify what caused the issue
- Document the failure mode
- Update this rollback plan if needed

### 2. Fix Development
- Create fix in development environment
- Test thoroughly before re-deploying
- Consider staged rollout

### 3. Re-Deployment Planning
- Plan deployment during low-traffic hours
- Prepare monitoring scripts
- Have rollback plan ready again

### 4. User Communication
- Notify affected users (if applicable)
- Provide status updates
- Apologize for disruption

---

## 📝 Rollback Log Template

Document each rollback:

```markdown
## Rollback [DATE/TIME]

**Issue:** [Brief description]
**Severity:** [Critical/High/Medium]
**Affected Users:** [Number/Percentage]

**Actions Taken:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Rollback Components:**
- [ ] Application Code
- [ ] Database Migrations
- [ ] Edge Functions
- [ ] Configuration

**Verification Results:**
- Auth: [Pass/Fail]
- Core Features: [Pass/Fail]
- Payments: [Pass/Fail]

**Root Cause:** [If known]
**Resolution Plan:** [Next steps]
**Responsible:** [Name]
```

---

## ⏱️ Time-to-Recovery Targets

| Severity | Target Time | Maximum Time |
|----------|-------------|--------------|
| Critical | 15 minutes | 30 minutes |
| High | 1 hour | 2 hours |
| Medium | 4 hours | 8 hours |

---

**Last Tested:** Never (Pre-production)  
**Next Test Date:** 2025-11-26 (Monthly drill recommended)  
**Document Version:** 1.0
