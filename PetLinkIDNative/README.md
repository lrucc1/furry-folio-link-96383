# PetLinkID Native (Phase 1)

This folder contains the SwiftUI-first Apple-native rewrite foundation for PetLinkID.

## Scope (Phase 1)
- App shell (iPhone + macOS SwiftUI)
- Core Data + CloudKit persistence stack (`NSPersistentCloudKitContainer`)
- Initial CloudKit sync state monitoring hooks
- Sign in with Apple onboarding shell
- Root navigation sections:
  - My Pets
  - Shared With Me
  - Settings
- Seed/sample preview data

## Xcode Capabilities to enable
1. **iCloud**
   - iCloud Documents (optional)
   - CloudKit (required)
   - Container: `iCloud.com.petlinkid.app` (or your final container)
2. **Sign In with Apple**
3. **Background Modes** (optional in v1, recommended for fetch/sync polish)
4. **Push Notifications** (optional if using push-based CloudKit subscriptions later)

## Notes
- This phase intentionally avoids external backend dependencies.
- Core Data model is generated in code for portability in this initial scaffold.
- For production, you can migrate this model to `.xcdatamodeld` while preserving entity names/fields.
