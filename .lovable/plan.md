
# Phase 2: Remove Redundant Web-Only Pages

## What We're Doing
Deleting web-only app pages that are no longer reachable now that routing is split, and updating `NativeAppRoutes.tsx` to import iOS pages directly instead of going through `isNative` wrapper components.

## Files to Delete (6 files)

| File | Reason |
|------|--------|
| `src/pages/Dashboard.tsx` | Replaced by IOSHome; no longer imported anywhere |
| `src/pages/Account.tsx` | Replaced by IOSSettings + sub-pages; no longer imported anywhere |
| `src/pages/settings/DeleteAccount.tsx` | Only used by Account.tsx (being deleted); iOS settings handles this |
| `src/pages/settings/ExportData.tsx` | Only used by Account.tsx (being deleted); iOS settings handles this |
| `src/components/AddPetCard.tsx` | Only used by Dashboard.tsx (being deleted) |

## Files to Modify (1 file)

**`src/routes/NativeAppRoutes.tsx`** -- Update two routes to import iOS pages directly instead of the wrapper components:

- Change `import AddPet from "@/pages/AddPet"` to `import IOSAddPet from "@/pages/ios/IOSAddPet"`
- Change `import EditPet from "@/pages/EditPet"` to `import IOSEditPet from "@/pages/ios/IOSEditPet"`
- Update the route elements from `<AddPet />` to `<IOSAddPet />` and `<EditPet />` to `<IOSEditPet />`

After this, `src/pages/AddPet.tsx` and `src/pages/EditPet.tsx` (the wrapper files containing ~750 lines of web-only form code each) become dead code and can also be deleted.

## Additional Dead Files to Delete (2 files)

| File | Reason |
|------|--------|
| `src/pages/AddPet.tsx` | Was a wrapper; NativeAppRoutes now imports IOSAddPet directly |
| `src/pages/EditPet.tsx` | Was a wrapper; NativeAppRoutes now imports IOSEditPet directly |

## Total Impact
- **7 files deleted** (~2,500+ lines of dead web-portal code removed)
- **1 file modified** (NativeAppRoutes.tsx -- 4 line changes)
- No backend, database, or edge function changes
