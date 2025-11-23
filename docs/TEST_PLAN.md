# PetLinkID - Release Test Plan

## Test Environment Setup
- **Web**: Use Chrome/Safari in regular and incognito modes
- **iOS**: Test on physical iPhone device (via Xcode or TestFlight)
- **Accounts**: Prepare 2-3 test email addresses for multi-user testing

---

## 1. Authentication Tests

### 1.1 Sign Up Flow
**Steps:**
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter test email (e.g., `testuser1@example.com`)
4. Enter name (e.g., "Test User")
5. Enter password (minimum 6 characters)
6. Click "Sign up"
7. **Expected**: Redirected to dashboard
8. **Expected**: See welcome message or empty pet list
9. Refresh the page
10. **Expected**: Still logged in, session persists

### 1.2 Login Flow
**Steps:**
1. Log out if logged in
2. Navigate to `/auth`
3. Enter existing account email
4. Enter password
5. Click "Sign in"
6. **Expected**: Redirected to dashboard
7. **Expected**: See user's pets (if any exist)

### 1.3 Logout Flow
**Steps:**
1. While logged in, click user menu (top right)
2. Click "Sign out"
3. **Expected**: Redirected to home page or auth page
4. Try to navigate to `/dashboard`
5. **Expected**: Redirected back to auth page

---

## 2. Pet Lifecycle Tests

### 2.1 Create Pet
**Steps:**
1. Log in
2. Go to dashboard
3. Click "Add Pet" card
4. Fill in required fields:
   - Name: "Max"
   - Species: Select "Dog"
   - Breed: "Golden Retriever"
   - Date of Birth: Select a date
5. (Optional) Upload a photo
6. Click "Add Pet"
7. **Expected**: Redirected to dashboard
8. **Expected**: See new pet card with "Max"
9. **Expected**: Pet photo displays (or placeholder if none uploaded)

### 2.2 Edit Pet
**Steps:**
1. From dashboard, click on a pet card
2. Click "Edit" button (pencil icon)
3. Change the pet's name to "Maximus"
4. Add/change breed, weight, or other details
5. Click "Save" or "Update"
6. **Expected**: Changes saved successfully
7. **Expected**: Pet name now shows "Maximus" on card and detail page

### 2.3 Mark Pet as Lost
**Steps:**
1. Go to pet details page
2. Toggle "Lost" switch ON
3. **Expected**: Pet card/status shows as "LOST"
4. **Expected**: Visual indicator (red border, badge, etc.)
5. Toggle "Lost" switch OFF
6. **Expected**: Lost status removed

### 2.4 Delete Pet (if supported)
**Steps:**
1. Go to pet details
2. Look for "Delete" option (if available)
3. Confirm deletion
4. **Expected**: Pet removed from dashboard
5. **Expected**: All related data cleaned up

---

## 3. Health Reminders Tests

### 3.1 Add Vaccination Reminder
**Steps:**
1. Log in and navigate to `/reminders`
2. Click the floating "+" button (bottom right)
3. If you have multiple pets, select the pet from the dialog
4. In the modal:
   - Select "Vaccination" as type
   - Enter title: "Annual Rabies Vaccine"
   - Enter date: Future date (e.g., 30 days from now)
   - (Optional) Add description
   - (Optional) Enable recurrence (yearly)
5. Click "Add Reminder"
6. **Expected**: Modal closes
7. **Expected**: New vaccination reminder appears in the list
8. **Expected**: Shows correct date and pet name

### 3.2 Add General Health Reminder
**Steps:**
1. On `/reminders`, click "+" button
2. Select pet (if multiple)
3. In the modal:
   - Select "Health Check" or general type
   - Enter title: "Vet Checkup"
   - Enter date: Future date
   - Add description: "Annual wellness exam"
4. Click "Add Reminder"
5. **Expected**: Reminder appears in list
6. **Expected**: Distinguishable from vaccination reminders (icon/badge)

### 3.3 Complete a Reminder
**Steps:**
1. From reminders list, find an upcoming reminder
2. Click checkbox or "Mark as Complete" button
3. **Expected**: Reminder marked as completed
4. **Expected**: Moves to "Completed" section or shows checkmark
5. **Expected**: Completion persists after page refresh

### 3.4 Edit Reminder
**Steps:**
1. Click on a reminder to view details
2. Click "Edit" button
3. Change the date or title
4. Save changes
5. **Expected**: Updates reflected in the list

### 3.5 Delete Reminder
**Steps:**
1. Open reminder details or use delete button
2. Confirm deletion
3. **Expected**: Reminder removed from list

---

## 4. Family & Caregivers Tests

### 4.1 Invite Family Member
**Steps:**
1. Log in as User A
2. Go to pet details page
3. Click "Sharing" or "Family" tab
4. Click "Invite Family Member"
5. Enter email: `testuser2@example.com`
6. Select role: "Family" or "Caregiver"
7. Send invite
8. **Expected**: Invitation sent successfully
9. **Expected**: Pending invite shows in list

### 4.2 Accept Invite
**Steps:**
1. Check email for `testuser2@example.com` (or copy invite link from DB/logs)
2. Open invite link in new browser/incognito window
3. If not logged in, sign up/login as User B
4. Click "Accept Invite"
5. **Expected**: Success message
6. Go to dashboard as User B
7. **Expected**: Shared pet appears in User B's dashboard
8. **Expected**: Role badge shows "Family" or "Caregiver"

### 4.3 View Shared Pet
**Steps:**
1. As User B (invited member), click on the shared pet
2. **Expected**: Can view pet details
3. **Expected**: Can view health records, documents (based on role)
4. Try to edit pet details
5. **Expected**: Edit allowed if role is "Family", restricted if "Caregiver"

### 4.4 Remove Access
**Steps:**
1. Log in as User A (pet owner)
2. Go to pet details → Sharing tab
3. Find User B in the members list
4. Click "Remove" or "Revoke Access"
5. Confirm removal
6. **Expected**: User B removed from list
7. Log in as User B
8. **Expected**: Shared pet no longer appears in dashboard

---

## 5. Documents Tests

### 5.1 Upload Document
**Steps:**
1. Log in
2. Go to pet details page
3. Navigate to "Documents" tab
4. Click "Upload" or "Add Document"
5. Select a PDF file (e.g., vaccination certificate)
6. Enter document name: "Rabies Certificate 2025"
7. Upload
8. **Expected**: Document appears in list
9. **Expected**: File name and size displayed

### 5.2 View Document
**Steps:**
1. Click on the uploaded document
2. **Expected**: PDF viewer opens
3. **Expected**: Can scroll through pages (if multi-page)
4. **Expected**: Can zoom in/out
5. Close viewer
6. **Expected**: Returns to documents list

### 5.3 Upload Image Document
**Steps:**
1. Upload a JPG/PNG image
2. View the image
3. **Expected**: Image displays correctly
4. **Expected**: No errors or broken viewer

### 5.4 Delete Document
**Steps:**
1. Find a document in the list
2. Click "Delete" icon/button
3. Confirm deletion
4. **Expected**: Document removed from list
5. **Expected**: Storage recalculated (if storage quota shown)

---

## 6. Billing & Subscription Tests (Stripe Test Mode)

### 6.1 View Pricing Page
**Steps:**
1. Log out or use free account
2. Navigate to `/pricing`
3. **Expected**: See Free and Pro plan options
4. **Expected**: Pricing displayed correctly (monthly/yearly)
5. **Expected**: Feature comparison visible

### 6.2 Start Checkout
**Steps:**
1. Click "Upgrade to Pro" or "Subscribe" button
2. **Expected**: Redirected to Stripe Checkout
3. **Expected**: Correct plan and price shown
4. **Expected**: Test mode indicator visible (Stripe test environment)

### 6.3 Complete Test Payment
**Steps:**
1. In Stripe Checkout, use test card: `4242 4242 4242 4242`
2. Enter any future expiry date (e.g., 12/28)
3. Enter any 3-digit CVC (e.g., 123)
4. Enter name and postal code
5. Click "Pay"
6. **Expected**: Payment succeeds
7. **Expected**: Redirected to success page
8. **Expected**: Success message displayed

### 6.4 Verify Plan Update
**Steps:**
1. Go to `/account` or user settings
2. **Expected**: Current plan shows as "Pro"
3. **Expected**: Next billing date displayed
4. Go to dashboard
5. **Expected**: Pro features unlocked (e.g., unlimited pets, documents)
6. Try creating multiple pets
7. **Expected**: No paywall blocking

### 6.5 Manage Subscription (Customer Portal)
**Steps:**
1. From account settings, click "Manage Subscription"
2. **Expected**: Redirected to Stripe Customer Portal
3. **Expected**: Can see subscription details
4. **Expected**: Can update payment method
5. **Expected**: Can cancel subscription (test mode)
6. Cancel the subscription
7. Return to app
8. Refresh account page
9. **Expected**: Subscription status updates to "Canceled" or "Expiring on [date]"

---

## 7. Legal & Settings Tests

### 7.1 Account Deletion
**Steps:**
1. Log in with a test account
2. Go to `/settings/delete-account`
3. Read deletion warning
4. Enter confirmation text (if required)
5. Click "Delete Account"
6. **Expected**: Account marked for deletion
7. **Expected**: 30-day grace period message shown
8. Log out
9. Try to log in again
10. **Expected**: Login succeeds (account not hard-deleted yet)
11. Check if data is soft-deleted or hidden

### 7.2 Data Export
**Steps:**
1. Go to `/settings/export-data`
2. Click "Export My Data"
3. **Expected**: Export process starts
4. **Expected**: Download link provided or email sent
5. Download the export file
6. Open the ZIP/JSON file
7. **Expected**: Contains pets, reminders, documents metadata
8. **Expected**: Data is complete and readable

### 7.3 Legal Pages
**Steps:**
1. Navigate to `/privacy-policy`
2. **Expected**: Privacy policy loads
3. **Expected**: Responsive on mobile width
4. Scroll through content
5. Repeat for:
   - `/terms`
   - `/refunds-policy`
   - `/subscription-terms`
6. **Expected**: All pages load without errors
7. **Expected**: Text is readable, properly formatted

---

## 8. iOS Device Tests

### 8.1 Build & Install
**Steps:**
1. Connect iPhone to Mac
2. Open project in Xcode
3. Select your device as target
4. Set bundle identifier: `com.petlinkid.app`
5. Configure signing (automatic or manual)
6. Click "Run" or build for device
7. **Expected**: App installs successfully
8. **Expected**: App icon appears on home screen

### 8.2 Cold Launch
**Steps:**
1. Force quit the app completely
2. Launch from home screen
3. **Expected**: App loads without crash
4. **Expected**: Splash screen displays (if configured)
5. **Expected**: Lands on auth page or dashboard (if logged in)

### 8.3 Core Flows on Device
**Steps:**
1. Log in on device
2. Create a pet with photo (use camera or photo library)
3. **Expected**: Photo picker works
4. **Expected**: Pet created successfully
5. Navigate to reminders
6. Add a reminder
7. **Expected**: Date picker works on iOS
8. **Expected**: Reminder saved
9. Go to pet details
10. Upload a document from Files app
11. **Expected**: File picker works
12. **Expected**: Document uploads and displays

### 8.4 Rotation & Multitasking
**Steps:**
1. While viewing a pet detail page, rotate device
2. **Expected**: Layout adapts to landscape/portrait
3. **Expected**: No UI breaks or cut-off content
4. Swipe up to multitasking
5. Switch to another app
6. Return to PetLinkID
7. **Expected**: App resumes where you left off
8. **Expected**: Session persists

### 8.5 Background & Notifications (if implemented)
**Steps:**
1. Enable notifications in Settings (if prompted)
2. Create a reminder due tomorrow
3. Background the app overnight
4. **Expected**: Notification received at appropriate time
5. Tap notification
6. **Expected**: Opens app to reminder details

---

## 9. Edge Cases & Error Handling

### 9.1 Network Offline
**Steps:**
1. Enable airplane mode
2. Try to create a pet
3. **Expected**: Error message displayed
4. **Expected**: App doesn't crash
5. Disable airplane mode
6. Retry action
7. **Expected**: Works when online

### 9.2 Invalid Input
**Steps:**
1. Try to create pet with empty name
2. **Expected**: Validation error shown
3. Try to sign up with invalid email
4. **Expected**: Email validation error
5. Try to upload a 500MB file (if size limits exist)
6. **Expected**: File size error message

### 9.3 Session Expiry
**Steps:**
1. Log in
2. In browser dev tools, clear localStorage or invalidate token
3. Try to perform an action (e.g., create pet)
4. **Expected**: Redirected to login or session refresh attempted
5. **Expected**: No data loss

---

## 10. Final Checklist

### Pre-Submission Checks
- [ ] All authentication flows work (sign up, login, logout)
- [ ] Pet CRUD operations complete successfully
- [ ] Health reminders can be created, edited, completed, deleted
- [ ] Family sharing invites work end-to-end
- [ ] Documents upload, view, and delete without errors
- [ ] Stripe test checkout completes and plan updates
- [ ] Account deletion and data export function correctly
- [ ] All legal pages load and display properly
- [ ] iOS build installs and runs on physical device
- [ ] No critical crashes or data loss scenarios
- [ ] App handles offline/error states gracefully

### Known Issues to Document
*(List any minor bugs or issues found during testing that are acceptable for v1)*

---

## Test Results Template

```
Test Date: _______________
Tester: _______________
Environment: Web / iOS Device

| Test Section | Status | Notes |
|--------------|--------|-------|
| 1. Authentication | ✅ / ❌ |  |
| 2. Pet Lifecycle | ✅ / ❌ |  |
| 3. Health Reminders | ✅ / ❌ |  |
| 4. Family & Caregivers | ✅ / ❌ |  |
| 5. Documents | ✅ / ❌ |  |
| 6. Billing | ✅ / ❌ |  |
| 7. Legal & Settings | ✅ / ❌ |  |
| 8. iOS Device | ✅ / ❌ |  |
| 9. Edge Cases | ✅ / ❌ |  |

**Overall Status**: PASS / FAIL / CONDITIONAL PASS

**Critical Blockers**: 
(List any issues that prevent release)

**Minor Issues** (can fix post-launch):
(List non-critical bugs)
```

---

## Go/No-Go Decision

**Proceed to App Store if:**
- All critical flows (auth, pet management, reminders, sharing) work
- No data loss or corruption scenarios
- iOS build stable on device
- Stripe billing functional (if enabled)

**Fix before release if:**
- Authentication completely broken
- Core pet features crash the app
- Data corruption or permanent data loss possible
- App crashes immediately on iOS device

**Can defer to post-launch:**
- Minor UI glitches
- Edge case error messages
- Optional feature polish
- Backend security warnings (already assessed as non-critical)
