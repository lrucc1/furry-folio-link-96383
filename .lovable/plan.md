
# App Store Connect Submission -- Complete Fill-in Guide

Below is every field you need to paste into App Store Connect, plus a detailed screenshot plan.

---

## 1. New App Record

| Field | Value |
|-------|-------|
| Platform | iOS |
| Name | PetLinkID |
| Primary Language | English (Australia) |
| Bundle ID | com.petlinkid.app |
| SKU | petlinkid-ios-001 |

---

## 2. App Information Tab

| Field | Value |
|-------|-------|
| Name | PetLinkID |
| Subtitle | Your Pet's Digital Licence |
| Category | Lifestyle |
| Secondary Category | Utilities |
| Content Rights | Does not contain third-party content |
| Age Rating | 4+ (no objectionable content) |

---

## 3. Pricing and Availability

| Field | Value |
|-------|-------|
| Price | Free |
| Availability | All territories (or Australia only for soft launch) |
| Pre-Orders | No |

---

## 4. In-App Purchases (create before submission)

| Product ID | Type | Display Name | Price (AUD) |
|------------|------|--------------|-------------|
| com.petlinkid.pro.monthly | Auto-Renewable Subscription | Pro Monthly | A$3.99 |
| com.petlinkid.pro.yearly | Auto-Renewable Subscription | Pro Yearly | A$39.99 |

Subscription Group Name: **PetLinkID Pro**

---

## 5. App Store Listing -- Version Information

### Description (paste exactly)

```
PetLinkID is your pet's digital licence -- store profiles, track vaccinations, manage health reminders, and instantly share essential information with family and caregivers.

KEY FEATURES

- Pet Profiles: Store your pet's name, breed, microchip number, vet details, insurance, and more in one secure place.

- Vaccination Records: Log vaccinations with dates, batch numbers, and set reminders so you never miss a booster.

- Health Reminders: Schedule reminders for flea treatments, worming, vet check-ups, and medications with push notifications.

- Weight Tracker: Monitor your pet's weight over time with a visual chart to spot trends early.

- Document Storage: Upload and organise vet records, registration certificates, and insurance documents.

- QR Recovery Tags: Generate a unique QR code for your pet. If your pet goes missing, anyone who scans the tag can contact you instantly -- no app required.

- Lost Pet Mode: Mark your pet as lost to activate recovery features including a shareable lost pet poster and public contact page.

- Family Sharing: Invite family members and caregivers to view or manage your pet's profile with role-based access.

- Data Export: Download all your pet data and documents as a complete archive at any time.

- Privacy First: Built in Australia, compliant with Australian Privacy Principles. Your data is encrypted, never sold, and you can delete your account at any time.

FREE PLAN
- 1 pet profile
- 2 active reminders
- 50 MB document storage
- Data export

PRO PLAN (A$3.99/month or A$39.99/year)
- Unlimited pet profiles
- Unlimited reminders
- 200 MB document storage
- Family sharing with read/write access
- Priority support

Download PetLinkID today and give your furry family the care they deserve.
```

### Promotional Text (170 chars max, can change without review)

```
Store pet profiles, track vaccinations, and never lose your furry friend with smart QR recovery tags. Start free today!
```

### Keywords (100 chars max, comma-separated)

```
pet,dog,cat,vaccination,microchip,lost pet,QR code,pet health,pet profile,Australia
```

### What's New (for version 1.0.0)

```
Welcome to PetLinkID! Your pet's digital licence is here. Create pet profiles, track vaccinations, set health reminders, and generate QR recovery tags -- all in one app.
```

### Support URL

```
https://petlinkid.io/support
```

### Marketing URL

```
https://petlinkid.io
```

### Privacy Policy URL

```
https://petlinkid.io/privacy-policy
```

---

## 6. App Review Information

### Contact Information

| Field | Value |
|-------|-------|
| First Name | (Your first name) |
| Last Name | (Your last name) |
| Phone Number | (Your Australian phone number) |
| Email Address | support@petlinkid.io |

### Demo Account (provide a test account for Apple reviewers)

| Field | Value |
|-------|-------|
| Username | review@petlinkid.io |
| Password | (Create a test account with this email and provide the password) |

### Notes for Reviewer

```
PetLinkID is a pet profile management app for Australian pet owners. The app allows users to:

1. Create and manage pet profiles with health information
2. Track vaccinations and set health reminders
3. Upload vet documents and certificates
4. Generate QR recovery tags for lost pets
5. Share pet profiles with family members

SUBSCRIPTION INFO:
The app offers a Free tier (1 pet, 2 reminders) and a Pro tier via auto-renewable subscription (unlimited pets, unlimited reminders, family sharing). Subscriptions are managed entirely through Apple In-App Purchase.

ACCOUNT DELETION:
Account deletion is available at Settings > Delete Account. This removes all user data within 30 days per our privacy policy.

PUSH NOTIFICATIONS:
Push notifications are used for health reminders (vaccination due dates, medication schedules) and account updates. They are opt-in and can be disabled in Settings.

The demo account has one pet profile pre-configured for testing.
```

---

## 7. App Privacy (App Store Connect Privacy Tab)

### Data Linked to You

| Data Type | Purpose |
|-----------|---------|
| Name | App Functionality |
| Email Address | App Functionality, Customer Support |
| Phone Number | App Functionality, Customer Support |
| Photos or Videos | App Functionality |
| Other User Content | App Functionality |
| User ID | App Functionality, Analytics |
| Purchase History | App Functionality |

### Data Not Linked to You

| Data Type | Purpose |
|-----------|---------|
| Crash Data | App Functionality |
| Performance Data | App Functionality |

### Tracking

- **Does this app track users?** No
- **Does this app use third-party tracking SDKs?** No

---

## 8. Export Compliance

| Question | Answer |
|----------|--------|
| Does your app use encryption? | Yes |
| Does your app qualify for any encryption exemptions? | Yes |
| Is it limited to standard HTTPS/TLS? | Yes |
| Does it contain proprietary encryption? | No |

Select: **"Yes, the app qualifies for an exemption"** -- uses standard iOS TLS only.

---

## 9. Screenshot Plan (6 screens, 2 device sizes)

You need screenshots for **iPhone 6.7" (1290 x 2796)** and **iPhone 6.5" (1284 x 2778)**. You can use the 6.7" set for both if needed.

Use Xcode Simulator or a real device. For each screenshot, add a short marketing headline at the top using a tool like [screenshots.pro](https://screenshots.pro), Figma, or Canva.

### Screenshot 1: Home Screen (Pet Dashboard)

- **What to show:** The IOSHome screen with at least one pet card visible, the welcome banner, and the Quick Actions grid.
- **How to set up:** Log in with a test account that has 1-2 pets with photos. Ensure the welcome card is visible.
- **Headline overlay:** "Your Pet's Digital Licence"
- **Background colour:** Use the app's teal/green gradient

### Screenshot 2: Pet Profile Detail

- **What to show:** The PetDetails page for a dog or cat, showing the pet photo at top, basic info (breed, age, microchip number), and the tabs (Profile, Health, Documents, Sharing).
- **How to set up:** Navigate to a pet with a good photo and filled-in details.
- **Headline overlay:** "Everything About Your Pet in One Place"

### Screenshot 3: Health & Vaccinations

- **What to show:** The Health tab on the Pet Details page, showing vaccination records and health reminders list with dates and status badges.
- **How to set up:** Add 2-3 vaccinations and 1-2 reminders to the test pet.
- **Headline overlay:** "Track Vaccinations & Health Reminders"

### Screenshot 4: QR Recovery Tag

- **What to show:** The QR code modal or the Smart Tags page showing a generated QR code for a pet.
- **How to set up:** Open the QR code for a test pet.
- **Headline overlay:** "Instant Lost Pet Recovery with QR Tags"

### Screenshot 5: Settings & Plans

- **What to show:** The IOSSettings page showing the profile header, account settings groups, and the Pro badge (or the IOSPlans page showing the Free vs Pro comparison table).
- **How to set up:** Navigate to Settings.
- **Headline overlay:** "Free & Pro Plans for Every Pet Family"

### Screenshot 6: Family Sharing

- **What to show:** The Sharing tab on a pet profile showing the invite flow or an existing shared member with their role.
- **How to set up:** Navigate to a pet's Sharing tab. If possible, show an invited family member.
- **Headline overlay:** "Share with Family & Caregivers"

### Screenshot Tips

- Capture on iPhone 15 Pro Max simulator (6.7") for the largest size
- Use Xcode Simulator (Device > Screenshot) or Cmd+S
- Add headline text overlays using Figma, Canva, or screenshots.pro
- Use the app's teal (#2DD4BF) as the frame/background colour
- Keep status bar visible (Apple requires it)
- Submit at least 3 screenshots; 6 is recommended

---

## 10. Pre-Submission Checklist

- [ ] Create the app record in App Store Connect with the details above
- [ ] Create a demo/review account (review@petlinkid.io) with a pre-configured pet
- [ ] Create the two IAP subscription products in App Store Connect
- [ ] Capture and upload 6 screenshots for iPhone 6.7" display
- [ ] Optionally capture 6 screenshots for iPhone 6.5" display
- [ ] Fill in all App Privacy fields as listed above
- [ ] Answer Export Compliance questions
- [ ] Upload the archived build from Xcode
- [ ] Submit for review

---

## 11. Seller / Company Details

| Field | Value |
|-------|-------|
| Seller | BETAMETRICS PTY LTD |
| Copyright | 2025 BETAMETRICS PTY LTD |

Update the copyright line in the App Store listing to:
```
© 2025 BETAMETRICS PTY LTD
```
