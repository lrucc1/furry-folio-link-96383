# PetLinkID Native Architecture (Phase 1)

## Proposed folder structure

```
PetLinkIDNative/
├── PetLinkIDApp.swift
├── README.md
├── Docs/
│   ├── ARCHITECTURE_PHASE1.md
│   └── DATA_MODEL_PHASE1.md
├── App/
│   ├── AppEnvironment.swift
│   └── Root/
│       ├── RootView.swift
│       └── RootViewModel.swift
├── Features/
│   ├── Auth/
│   │   └── SignInWithAppleCard.swift
│   ├── Onboarding/
│   │   └── OnboardingView.swift
│   ├── Pets/
│   │   └── MyPetsView.swift
│   ├── Shared/
│   │   └── SharedWithMeView.swift
│   └── Settings/
│       └── SettingsView.swift
├── Persistence/
│   ├── PersistenceController.swift
│   ├── CoreDataModelBuilder.swift
│   ├── CloudKitSyncMonitor.swift
│   ├── SampleDataSeeder.swift
│   └── Entities/
│       └── ManagedEntities.swift
└── Shared/
    └── AppLogger.swift
```

## Core architectural decisions

1. **SwiftUI + MVVM shell**
   - Root flow is state-driven by `RootViewModel`.
   - Onboarding/sign-in completion gates entry to the main app tabs.

2. **Core Data + CloudKit source of truth**
   - `NSPersistentCloudKitContainer` drives local + cloud sync.
   - Private database scope for owned data.
   - CloudKit sharing enabled through store options and per-pet share metadata.

3. **Simple share boundaries for stability**
   - Entire `Pet` object graph is the share unit.
   - Child entities reference one parent pet.
   - No cross-pet relationships in v1.

4. **App sections**
   - My Pets = owned records
   - Shared With Me = accepted/shared records
   - Settings = account/sync diagnostics/privacy/version

5. **CloudKit observability**
   - Notification hooks surface import/export events and persistent history changes.
   - User-facing sync status + diagnostics exposed in Settings.

## CloudKit sharing architecture (v1)

- Owner creates a `Pet` record and related child records.
- Share is initiated for the whole pet object graph (rooted on `Pet`).
- Recipient accepts CKShare and sees profile in **Shared With Me**.
- Permission model is coarse:
  - read-only
  - read-write
- No field-level ACLs.
- Local predicates separate owned vs shared data:
  - owned: `ownerAppleUserID == currentUser`
  - shared: `isShared == true` and not owned

## Conflict-aware approach
- All entities include `updatedAt` and stable UUIDs.
- Save policy defaults to merge-by-property object trump locally, while CloudKit merges at record level.
- UI avoids complex concurrent edit workflows in phase 1.

