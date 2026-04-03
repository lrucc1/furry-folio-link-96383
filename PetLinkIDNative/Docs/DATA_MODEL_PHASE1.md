# Core Data Entity Design (Phase 1)

## Entity list
- UserProfile (local app-state only, optional)
- Pet
- Vaccination
- Medication
- Allergy
- VetContact
- EmergencyContact
- InsurancePolicy
- RegistrationRecord
- Reminder
- Attachment

## Modeling principles
1. Pet is the aggregate root.
2. All child entities belong to exactly one pet.
3. No cross-pet relationships.
4. Cascade delete from Pet to children.
5. Stable UUID + createdAt + updatedAt on all critical entities.
6. Keep attachments metadata-focused for sync reliability.

## Key fields

### Pet
- id (UUID)
- name (String)
- profilePhotoData (Binary, optional)
- species (String)
- breed (String, optional)
- sex (String, optional)
- dateOfBirth (Date, optional)
- approximateAgeYears (Int16, optional representation)
- microchipNumber (String, optional)
- isDesexed (Bool)
- identifyingMarks (String, optional)
- weightKg (Double, optional)
- notes (String, optional)
- ownerInternalNotes (String, optional)
- ownerAppleUserID (String, optional)
- isShared (Bool)
- sharePermissionRaw (Int16) // 0=view, 1=edit
- createdAt (Date)
- updatedAt (Date)

### Reminder
- id, title, dueDate, type, notes, isCompleted, createdAt, updatedAt

### Attachment
- id
- fileName
- utiType
- fileSizeBytes
- createdAt
- updatedAt
- cloudAssetIdentifier (String, optional)
- localBookmarkData (Binary, optional)

## Sharing boundary
Share at Pet level only. All related child rows move with the pet graph and avoid mixed ownership joins.

## Future-safe notes
- If large binary data causes sync pressure, move media bytes to file-backed storage and keep only metadata + references in Core Data.
- Keep relationship fan-out reasonable for CK sync performance.
