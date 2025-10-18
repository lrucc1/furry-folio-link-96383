# PetLinkID iOS Free - Xcode Setup & Submission Guide

## Prerequisites

✅ macOS with Xcode 15+ installed
✅ Active Apple Developer account ($99/year)
✅ Git installed
✅ Node.js & npm installed

---

## Step 1: Clone and Setup Project

```bash
# 1. Clone your project from GitHub
git clone <your-repo-url>
cd <your-project>

# 2. Install dependencies
npm install

# 3. Add iOS platform (if not already added)
npx cap add ios

# 4. Build the web assets
npm run build

# 5. Sync Capacitor
npx cap sync ios
```

---

## Step 2: Configure Environment for iOS Free Build

Create a `.env.ios_free` file in your project root:

```env
VITE_BUILD_PROFILE=ios_free
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
VITE_GOOGLE_MAPS_API_KEY=<your-maps-key>
```

Build with iOS free profile:
```bash
VITE_BUILD_PROFILE=ios_free npm run build
npx cap sync ios
```

---

## Step 3: Open Project in Xcode

```bash
npx cap open ios
```

---

## Step 4: Configure Signing & Capabilities

### 4.1 General Tab
1. **Bundle Identifier**: `com.betametrics.petlinkid.free`
2. **Version**: `1.0.0` (update for each release)
3. **Build**: `1` (increment for each TestFlight upload)
4. **Team**: Select your Apple Developer team
5. **Deployment Target**: iOS 15.0 or higher

### 4.2 Signing & Capabilities Tab
1. **Automatically manage signing**: ✅ Enabled
2. **Team**: Your Apple Developer account
3. **Provisioning Profile**: Automatic

### 4.3 Capabilities (if needed)
Only add capabilities you actually use:
- ✅ **Associated Domains** (only if using Universal Links)
- ✅ **Push Notifications** (only if using APNs)
- ❌ **In-App Purchase** (NOT needed for ios_free build)

---

## Step 5: App Store Connect Setup

### 5.1 Create App Listing
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: PetLinkID
   - **Primary Language**: English (Australia)
   - **Bundle ID**: `com.betametrics.petlinkid.free`
   - **SKU**: `petlinkid-ios-free-001`
   - **User Access**: Full Access

### 5.2 App Information
- **Category**: Lifestyle
- **Secondary Category**: Health & Fitness (optional)
- **Content Rights**: No (unless you own exclusive rights)

### 5.3 Pricing & Availability
- **Price**: Free
- **Availability**: All territories (or select specific countries)

---

## Step 6: Prepare App Metadata

### 6.1 App Store Description

**Subtitle** (30 chars):
```
Secure pet profiles on the go
```

**Description** (4000 chars max):
```
PetLinkID is your secure, all-in-one pet management app. Keep your pet's essential information safe and accessible anywhere.

FEATURES:
• Digital pet profiles with photos and details
• Vaccination records and health tracking
• Vet clinic information and medical notes
• Lost pet alerts and recovery tools
• Smart QR code sharing
• Family sharing for multi-household pets

SECURITY & PRIVACY:
Your pet's data is encrypted and securely stored. Access your information anytime, from any device.

SUBSCRIPTION:
PetLinkID offers Free and Premium plans. Create and manage your subscription at petlinkid.io. This iOS app lets you access your existing PetLinkID account on the go.

Premium features include:
• Up to 5 pets (Free: 1 pet)
• Family sharing (up to 5 members)
• Document storage (50MB)
• Advanced health tracking
• Priority support

Account required. Manage subscriptions at petlinkid.io.
```

**Keywords** (100 chars):
```
pet,dog,cat,health,vet,medical,records,lost,found,qr,tag,microchip,vaccination,family
```

**Support URL**: `https://petlinkid.io/support`
**Marketing URL**: `https://petlinkid.io`
**Privacy Policy URL**: `https://petlinkid.io/privacy`

### 6.2 Screenshots (Required Sizes)

You need screenshots for:
- **iPhone 6.9" Display** (e.g., iPhone 16 Pro Max): 1320x2868 px
- **iPhone 6.7" Display** (e.g., iPhone 15 Pro Max): 1290x2796 px
- **iPhone 6.5" Display** (e.g., iPhone 14 Plus): 1284x2778 px
- **iPad Pro 13" Display**: 2048x2732 px (optional but recommended)

**Recommended Screenshots** (3-5 per device):
1. Login/Onboarding screen
2. Pet profile view
3. Health records/vaccinations
4. QR code sharing
5. Dashboard with multiple pets

Use `xcrun simctl` or manual device capture:
```bash
# Launch iOS Simulator
open -a Simulator

# Take screenshots: Cmd+S
# Screenshots save to ~/Desktop
```

### 6.3 App Preview Video (Optional)
- Max 30 seconds
- Same dimensions as screenshots
- Show key features: login, add pet, view health records

---

## Step 7: Build Archive for TestFlight

### 7.1 Select Target Device
1. In Xcode, select **Product** → **Destination** → **Any iOS Device (arm64)**

### 7.2 Archive the App
1. **Product** → **Archive**
2. Wait for build to complete (2-5 minutes)
3. **Organizer** window opens automatically

### 7.3 Validate Archive
1. Select your archive
2. Click **Validate App**
3. Choose your distribution certificate and provisioning profile
4. Wait for validation (checks for errors)
5. Fix any warnings/errors

### 7.4 Distribute to App Store Connect
1. Click **Distribute App**
2. Select **App Store Connect**
3. Choose **Upload**
4. Select automatic signing
5. Click **Upload**

Processing time: 5-30 minutes

---

## Step 8: TestFlight Setup

### 8.1 Internal Testing
1. Go to App Store Connect → **TestFlight**
2. Wait for "Processing" to complete
3. Add internal testers (Apple Developer team members)
4. Click **+ Add Testers** → Enter emails
5. Testers receive email with TestFlight link

### 8.2 External Testing (Public Beta)
1. **TestFlight** → **External Testing**
2. Create test group (e.g., "Public Beta")
3. Add beta testers or use public link
4. Submit for Beta App Review (1-2 days)

### 8.3 TestFlight App Information
- **Beta App Description**: Short summary for testers
- **Feedback Email**: Your support email
- **What to Test**: Specific features you want feedback on

---

## Step 9: App Store Submission

### 9.1 App Review Information
Fill in App Store Connect:
- **Contact Information**: Your email & phone
- **Demo Account**: Provide test login credentials
  - Email: `test@petlinkid.io`
  - Password: `TestPass123!`
  - Note: "Free account with sample pet data"
- **Notes**: "Premium features require subscription managed at petlinkid.io. No in-app purchases in this build."

### 9.2 Age Rating
- **Age Rating**: 4+
- No objectionable content

### 9.3 Submit for Review
1. **App Store** tab → **iOS App** → **[Your Version]**
2. Fill all required fields
3. Add screenshots, description, keywords
4. Click **Add for Review**
5. Click **Submit for Review**

**Review Time**: 1-3 days typically

---

## Step 10: Post-Submission

### Monitor Review Status
- **In Review**: Apple is actively reviewing
- **Pending Developer Release**: Approved! You control release
- **Rejected**: Check Resolution Center for feedback

### After Approval
1. **Manual Release**: Click **Release this Version**
2. **Automatic Release**: Set in **App Store** → **Version Release**

### App Goes Live
- Users can download within 24 hours
- Monitor **Ratings & Reviews**
- Check **App Analytics** for downloads

---

## Troubleshooting

### Common Issues

**Build Failed**
- Clean build folder: **Product** → **Clean Build Folder**
- Delete `DerivedData`: `~/Library/Developer/Xcode/DerivedData`
- Restart Xcode

**Signing Errors**
- Revoke and recreate certificates in Apple Developer portal
- Use Automatic signing instead of Manual

**App Store Rejection - Guideline 2.1 (App Completeness)**
- Ensure test account works
- Verify all features are accessible
- Check that external links work

**App Store Rejection - Guideline 3.1.1 (In-App Purchase)**
- Verify no IAP code is present in ios_free build
- Ensure `ENV_CONFIG.useInAppPurchases = false`
- Confirm subscription management links point to petlinkid.io

**TestFlight Upload Failed**
- Increment build number
- Verify bundle ID matches App Store Connect
- Check Xcode version compatibility

---

## Version Updates

### Update Process
1. Increment version/build in Xcode
2. Rebuild: `npm run build && npx cap sync ios`
3. Archive and upload
4. Submit for review

### Versioning Convention
- **Major**: `1.0.0` → `2.0.0` (breaking changes)
- **Minor**: `1.0.0` → `1.1.0` (new features)
- **Patch**: `1.0.0` → `1.0.1` (bug fixes)

---

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [TestFlight Best Practices](https://developer.apple.com/testflight/)

---

## Support

For issues or questions:
- **Email**: support@petlinkid.io
- **Documentation**: https://petlinkid.io/docs
- **Capacitor Community**: https://ionic.io/community
