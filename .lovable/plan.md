

# Phase 4: Remove Dead Imports, Unused Components, and Orphaned Utilities

## What We Found

After Phases 1-3 cleaned up routing and layout branches, several files are now completely unreferenced -- they were only used by deleted pages or are legacy code that was never cleaned up.

## Files to Delete (8 files)

### Orphaned Components (3 files)

| File | Why It's Dead |
|------|--------------|
| `src/components/PendingInvitesModal.tsx` | Only references itself; was used by the deleted Account/Dashboard pages |
| `src/components/ReminderNotifications.tsx` | Wait -- actually used by Reminders.tsx. Keeping. |

Let me correct that -- ReminderNotifications IS used. Updated list:

| File | Why It's Dead |
|------|--------------|
| `src/components/PendingInvitesModal.tsx` | Zero imports from any other file; was used by the deleted Dashboard/Account pages |

### Orphaned Hooks (1 file)

| File | Why It's Dead |
|------|--------------|
| `src/hooks/useEntitlement.ts` | Zero imports anywhere; superseded by `useEntitlementCheck.ts` + `EntitlementServiceV2` |

### Orphaned Services (1 file)

| File | Why It's Dead |
|------|--------------|
| `src/services/EntitlementService.ts` | Zero imports anywhere; superseded by `EntitlementServiceV2.ts` |

### Orphaned Feature Modules (3 files)

| File | Why It's Dead |
|------|--------------|
| `src/features/export/download.ts` | Zero imports; was used by deleted ExportData settings page |
| `src/features/export/exporter.ts` | Zero imports; was used by deleted ExportData settings page |
| `src/features/export/formatters.ts` | Zero imports; was used by deleted ExportData settings page |

## Total: 6 files to delete

| # | File | Approx Lines |
|---|------|-------------|
| 1 | `src/components/PendingInvitesModal.tsx` | ~120 |
| 2 | `src/hooks/useEntitlement.ts` | ~60 |
| 3 | `src/services/EntitlementService.ts` | ~80 |
| 4 | `src/features/export/download.ts` | ~50 |
| 5 | `src/features/export/exporter.ts` | ~100 |
| 6 | `src/features/export/formatters.ts` | ~80 |

## No Code Modifications Needed

All 6 files have zero references from any other file. Deleting them requires no import updates anywhere.

## What Stays (Verified Still Referenced)

These were investigated but confirmed still in use:
- `DevModeToggle` -- used in App.tsx
- `FeatureGuard` / `FeaturePreview` -- used by PetDocuments
- `ImageCropDialog` -- used by 5 files (IOSAddPet, IOSEditPet, IOSEditProfile, PetPhotoGallery, PetDocuments)
- `RegionAwareSelect` -- used by IOSAddPet, IOSEditPet
- `InstagramShareCard` / `LostPetPosterModal` -- used by PetDetails
- `PaidPlanInfoSheet` -- used by UpgradeInline
- `PaywallModal` -- used by IOSAddPet
- `useScrollDirection` / `useSignedUrl` / `useUserCountry` / `useAutoTimezone` -- all still referenced
- `EntitlementServiceV2` -- used by 3 files
- `useEntitlementCheck` -- used by HealthReminderModal, VaccinationModal

## Estimated Impact
- ~490 lines of dead code removed
- 6 files deleted, 0 files modified
- No backend, database, or edge function changes
