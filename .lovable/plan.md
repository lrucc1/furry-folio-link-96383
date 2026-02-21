

# PetLinkID: Step-by-Step Launch Instructions

Everything below is in the order you need to do it. Each step builds on the previous one.

---

## Phase 1: Backend Configuration (15 minutes)

### Step 1: Enable Leaked Password Protection
1. Open your project in Lovable
2. Go to **Cloud view** (the cloud icon above the preview)
3. Navigate to **Users** then click the **gear icon** (Auth Settings)
4. Go to the **Email settings** section
5. Find **"Password HIBP Check"** and toggle it **ON**
6. This prevents users from signing up with passwords that have appeared in known data breaches -- required under Australian Privacy best practices

### Step 2: Verify Your Secrets Are Set
Your backend already has the following secrets configured -- no action needed unless values are wrong:
- RESEND_API_KEY (for transactional emails)
- APPLE_IAP_SHARED_SECRET (for receipt validation)
- APPLE_IAP_BUNDLE_ID (com.petlinkid.app)
- VITE_APPLE_PRO_MONTHLY_PRODUCT_ID
- VITE_APPLE_PRO_YEARLY_PRODUCT_ID
- VITE_GOOGLE_MAPS_API_KEY

If any of these need updating, go to **Cloud view** then **Secrets**.

---

## Phase 2: Apple Developer Setup (30-60 minutes)

### Step 3: Create In-App Purchase Products
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** and select (or create) the PetLinkID app record
   - Bundle ID: `com.petlinkid.app`
   - SKU: `petlinkid-ios-001`
   - Primary Language: English (Australia)
3. Go to **Monetization** then **Subscriptions**
4. Create a **Subscription Group** called "PetLinkID Pro"
5. Add two products:

| Product ID | Type | Price |
|-----------|------|-------|
| `com.petlinkid.pro.monthly` | Auto-Renewable | A$3.99/month |
| `com.petlinkid.pro.yearly` | Auto-Renewable | A$39.99/year |

6. Fill in display names, descriptions, and review screenshots for each
7. Submit the products for review (they review alongside your app)

### Step 4: Create Sandbox Test Accounts
1. In App Store Connect, go to **Users and Access** then **Sandbox** then **Test Accounts**
2. Create 2-3 sandbox accounts (use fake emails you control)
3. You will use these to test purchases on TestFlight builds

---

## Phase 3: Build and Upload (30-45 minutes)

### Step 5: Prepare the Production Build
On your Mac, open Terminal and run:

```text
git pull origin main
npm install
npm run build
npx cap sync ios
npx cap open ios
```

### Step 6: Configure Xcode
1. Xcode opens the `ios/App/App.xcworkspace` file
2. Select the **App** target in the left sidebar
3. Go to **Signing & Capabilities**:
   - Check "Automatically manage signing"
   - Select your Apple Developer Team
   - Bundle Identifier should be `com.petlinkid.app`
4. Go to **General**:
   - Version: `1.0.0`
   - Build: `1`
5. Verify capabilities are listed:
   - Push Notifications
   - Sign in with Apple
   - In-App Purchase

### Step 7: Archive and Upload
1. In the top bar, select **Any iOS Device (arm64)** as the build target
2. Go to **Product** menu then **Archive**
3. Wait for the build to complete (2-5 minutes)
4. The **Organizer** window opens automatically
5. Select your archive and click **Distribute App**
6. Choose **App Store Connect** then **Upload**
7. Follow the prompts to complete the upload

---

## Phase 4: TestFlight Testing (1-2 days)

### Step 8: Set Up TestFlight
1. After uploading, wait 5-30 minutes for Apple to process the build
2. In App Store Connect, go to the **TestFlight** tab
3. You may need to answer an **Export Compliance** question -- select "No" (the app does not use non-standard encryption)
4. Add yourself and any team members as **Internal Testers** (up to 100 people)
5. Testers receive an email with a link to install via the TestFlight app

### Step 9: Test Critical Flows
On the TestFlight build, verify these work:

- [ ] Sign up with email and verify the confirmation email arrives
- [ ] Log in and create a pet profile
- [ ] Upload a pet photo
- [ ] Add a vaccination record and health reminder
- [ ] View the QR code for a pet
- [ ] Test the public pet profile link (scan the QR code)
- [ ] Go to Settings and test **Delete Account**
- [ ] Go to Settings and test **Export My Data**
- [ ] Purchase a Pro subscription using a sandbox test account
- [ ] Verify Pro features unlock after purchase
- [ ] Test **Restore Purchases**

---

## Phase 5: App Store Submission (30 minutes)

### Step 10: Complete App Store Listing
In App Store Connect, fill in:

| Field | Value |
|-------|-------|
| App Name | PetLinkID |
| Subtitle | Your Pet's Digital Companion |
| Keywords | pet,dog,cat,vaccination,microchip,lost pet,QR code,pet health,pet profile,Australia |
| Support URL | https://petlinkid.io/support |
| Marketing URL | https://petlinkid.io |
| Privacy Policy URL | https://petlinkid.io/privacy-policy |

### Step 11: Upload Screenshots
You need screenshots for at least:
- iPhone 6.7" (1290 x 2796) -- iPhone 15 Pro Max
- iPhone 6.5" (1284 x 2778) -- iPhone 14 Plus

Capture these from your TestFlight build or Xcode Simulator showing:
1. The home/dashboard screen with pet cards
2. A pet profile with health details
3. The QR code feature
4. The settings screen

### Step 12: Fill in App Privacy
Go to **App Privacy** in App Store Connect and enter the data types from `docs/app_privacy.json`:
- Email, Name, Phone Number, Photos, User ID -- collected and linked to user
- Purchase History -- collected and linked to user
- Crash Data, Performance Data -- collected but not linked

### Step 13: Submit for Review
1. Select your uploaded build
2. Add any review notes (e.g., provide sandbox test account credentials for the reviewer)
3. Click **Submit for Review**
4. Apple typically reviews within 24-48 hours

---

## Phase 6: Launch Day

### Step 14: Publish the Web Frontend
1. In Lovable, click the **Publish** button (top right on desktop)
2. Click **Update** to push your latest landing page changes live

### Step 15: Monitor
- Check the Lovable Cloud logs for any backend errors
- Watch for App Store review feedback
- Monitor push notification delivery
- Keep an eye on IAP transaction logs

---

## Quick Reference: What's Already Done

| Item | Status |
|------|--------|
| RLS on all database tables | Done |
| Account deletion (Apple 5.1.1) | Done |
| Data export (Australian Privacy Act) | Done |
| Privacy policy page | Done |
| Terms of service | Done |
| Support page | Done |
| Landing page (honest copy, no fake stats) | Done |
| Security headers file created | Done |
| Apple IAP code integration | Done |
| Receipt validation backend function | Done |
| Push notification setup | Done |
| Capacitor production config | Done |

