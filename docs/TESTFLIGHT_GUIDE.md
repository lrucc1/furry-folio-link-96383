# TestFlight Distribution Guide

This guide covers how to distribute PetLinkID via TestFlight for beta testing.

## Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Xcode** (latest version recommended)
3. **App Store Connect** access
4. **Valid signing certificates and provisioning profiles**

## Step 1: Prepare Your App

### 1.1 Update Version Numbers

In Xcode, update your app's version:
- **Version** (CFBundleShortVersionString): e.g., `1.0.0`
- **Build** (CFBundleVersion): Increment for each upload, e.g., `1`, `2`, `3`

Location: Target → General → Identity

### 1.2 Configure Signing

1. Go to **Target → Signing & Capabilities**
2. Select your **Team** (Apple Developer account)
3. Ensure **Automatically manage signing** is checked
4. Bundle Identifier: `com.petlinkid.app`

### 1.3 Add Required Capabilities

Ensure these capabilities are added:
- ✅ **Sign in with Apple**
- ✅ **Push Notifications**
- ✅ **Associated Domains** (if using universal links)

## Step 2: Create App in App Store Connect

### 2.1 Navigate to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**

### 2.2 Fill in App Details

| Field | Value |
|-------|-------|
| Platform | iOS |
| Name | PetLinkID |
| Primary Language | English (Australia) |
| Bundle ID | com.petlinkid.app |
| SKU | petlinkid-ios |
| User Access | Full Access |

## Step 3: Configure Push Notifications

### 3.1 Create APNs Key

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Keys** → **+**
4. Name: `PetLinkID Push Key`
5. Enable **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the .p8 file** (only available once!)
8. Note the **Key ID** and **Team ID**

### 3.2 Store APNs Key Securely

Store these values securely for backend configuration:
- Key ID
- Team ID
- .p8 file contents

### 3.3 Enable Push for App ID

1. In Developer Portal → **Identifiers**
2. Select your App ID (`com.petlinkid.app`)
3. Enable **Push Notifications**
4. Save changes

## Step 4: Build and Archive

### 4.1 Sync Capacitor

Before building, sync your web app:

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Build web app
npm run build

# Sync to iOS
npx cap sync ios
```

### 4.2 Open in Xcode

```bash
npx cap open ios
```

Or open `ios/App/App.xcworkspace` directly.

### 4.3 Select Destination

1. In Xcode, select **Any iOS Device (arm64)** as build destination
2. Do NOT select a simulator

### 4.4 Archive

1. Go to **Product → Archive**
2. Wait for the build to complete
3. The Organizer window will open automatically

## Step 5: Upload to App Store Connect

### 5.1 From Organizer

1. Select your archive in the Organizer
2. Click **Distribute App**
3. Select **App Store Connect** → **Next**
4. Select **Upload** → **Next**
5. Keep default options → **Next**
6. Select your signing certificate → **Next**
7. Click **Upload**

### 5.2 Wait for Processing

- Upload typically takes 5-15 minutes
- Processing can take 15-30 minutes
- You'll receive an email when ready

## Step 6: Configure TestFlight

### 6.1 Add Build to Testing

1. In App Store Connect, go to **TestFlight** tab
2. Select your uploaded build
3. Add **Export Compliance** information:
   - Does this app use encryption? **Yes** (HTTPS)
   - Does it use standard encryption? **Yes**
   - Is it available outside the US? **Yes**

### 6.2 Test Information

Fill in the **Test Information**:
- **Beta App Description**: Brief description for testers
- **Feedback Email**: support@petlinkid.io
- **Privacy Policy URL**: Your privacy policy URL
- **Marketing URL** (optional)

### 6.3 Create Test Groups

#### Internal Testing (up to 100 Apple Developer team members)
1. Go to **Internal Testing** → **+**
2. Add testers from your Apple Developer team
3. They receive access immediately

#### External Testing (up to 10,000 testers)
1. Go to **External Testing** → **+**
2. Create a group name (e.g., "Beta Testers")
3. Add tester emails
4. Submit for **Beta App Review** (usually 24-48 hours)

## Step 7: Invite Testers

### 7.1 Via Email

1. Add tester emails in TestFlight
2. They receive an invitation email
3. Link opens TestFlight app
4. Tester installs your app

### 7.2 Via Public Link

1. In External Testing group, enable **Public Link**
2. Share the link (anyone with link can join)
3. Limit: 10,000 testers per public link

## Step 8: Monitor Testing

### 8.1 View Feedback

- **Crashes**: Automatic crash reports in App Store Connect
- **Feedback**: Testers can send screenshots and comments
- **Screenshots**: View tester-submitted screenshots

### 8.2 Update Builds

To push updates:
1. Increment **Build number** in Xcode
2. Archive and upload new build
3. Add build to existing test groups
4. Testers receive automatic update notification

## Common Issues & Solutions

### "No accounts with App Store Connect access"
- Ensure your Apple ID has App Store Connect role
- Go to Users and Access to verify permissions

### "Invalid provisioning profile"
- In Xcode: Product → Clean Build Folder
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Re-download provisioning profiles

### "Missing push notification entitlement"
- Add Push Notifications capability in Xcode
- Ensure App ID has Push enabled in Developer Portal

### "App rejected in beta review"
- Check rejection reason in App Store Connect
- Common reasons: crashes, placeholder content, privacy issues
- Fix and resubmit

### Build Processing Stuck
- Processing can take up to 24 hours for first build
- Check for emails about issues
- Try uploading again if stuck over 24 hours

## Push Notification Testing

### Test on Device

1. Install app via TestFlight
2. Open app and grant notification permission
3. Trigger a test notification from your backend

### Verify Token Registration

Check your backend logs to ensure device tokens are being saved when users enable notifications.

## Xcode Cloud (CI/CD)

For automated builds, consider Xcode Cloud:

1. In App Store Connect → **Xcode Cloud** → **Get Started**
2. Connect your GitHub repository
3. Configure workflows for:
   - Building on push to main
   - Running tests
   - Deploying to TestFlight

### Basic Workflow

```yaml
# Triggered on push to main
# Builds for iOS
# Uploads to TestFlight automatically
```

## Checklist Before Submission

- [ ] App version and build number updated
- [ ] All capabilities added (Sign in with Apple, Push Notifications)
- [ ] Signing configured correctly
- [ ] npm run build completed
- [ ] npx cap sync ios completed
- [ ] Archive builds without errors
- [ ] Export compliance answered
- [ ] Test information filled in
- [ ] Privacy policy URL added
- [ ] At least one tester added

## Resources

- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [APNs Configuration](https://developer.apple.com/documentation/usernotifications)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
