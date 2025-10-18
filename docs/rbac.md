# Role-Based Access Control (RBAC)

## Overview

PetLinkID implements a three-tier role-based access control system for pet management. Each user can have different levels of access to a pet based on their relationship.

## Roles

### Owner
- **Full Access**: Complete control over the pet's records
- **Permissions**:
  - View all pet information
  - Edit all pet information
  - Delete the pet
  - Invite family members and caregivers
  - Manage memberships
  - View and manage all invitations

### Family
- **Read/Write Access**: Can view and edit pet records
- **Permissions**:
  - View all pet information
  - Edit pet information
  - Add/edit/delete health records
  - Add/edit/delete vaccinations
  - Upload/delete documents
- **Restrictions**:
  - Cannot delete the pet
  - Cannot invite others
  - Cannot remove other members

### Caregiver
- **Read-Only Access**: Can view pet information but not modify
- **Permissions**:
  - View pet information
  - View health records
  - View vaccinations
  - View documents
- **Restrictions**:
  - Cannot edit any information
  - Cannot add or delete records
  - Cannot invite others

## Implementation

### Guards

The system uses permission guards defined in `src/rbac/guards.ts`:

```typescript
canReadPets(role: Role): boolean
canEditPets(role: Role): boolean
canInvite(role: Role): boolean
isReadOnly(role: Role): boolean
canDeletePets(role: Role): boolean
canManageMembers(role: Role): boolean
```

### Hooks

Use the `useRole` hook to get the current user's role for a pet:

```typescript
const { role, loading } = useRole(petId);
```

### UI Components

Use the `<Readonly>` component to make sections read-only:

```typescript
<Readonly when={!canEditPets(role)}>
  <input ... />
</Readonly>
```

## Database Schema

### Tables

**pet_memberships**
- `id`: UUID
- `pet_id`: UUID (FK to pets)
- `user_id`: UUID (FK to auth.users)
- `role`: TEXT ('owner' | 'family' | 'caregiver')
- `created_at`: TIMESTAMP

**pet_invites**
- `id`: UUID
- `pet_id`: UUID (FK to pets)
- `email`: TEXT
- `role`: TEXT ('family' | 'caregiver')
- `token`: TEXT (unique)
- `status`: TEXT ('pending' | 'accepted' | 'declined' | 'revoked')
- `expires_at`: TIMESTAMP
- `invited_by`: UUID (FK to auth.users)

## Row Level Security (RLS) Policies

### Pets Table

```sql
-- Users can view pets they have access to
CREATE POLICY "Users can view pets they have access to"
ON pets FOR SELECT
USING (has_pet_access(id, auth.uid()));

-- Users can update pets they can edit
CREATE POLICY "Users can update pets they can edit"
ON pets FOR UPDATE
USING (can_edit_pet(id, auth.uid()));

-- Users can delete pets they own
CREATE POLICY "Users can delete pets they own"
ON pets FOR DELETE
USING (auth.uid() = user_id);
```

### Vaccinations Table

```sql
-- Users can view vaccinations for accessible pets
CREATE POLICY "Users can view vaccinations for accessible pets"
ON vaccinations FOR SELECT
USING (has_pet_access(pet_id, auth.uid()));

-- Users can insert vaccinations for editable pets
CREATE POLICY "Users can insert vaccinations for editable pets"
ON vaccinations FOR INSERT
WITH CHECK (can_edit_pet(pet_id, auth.uid()));

-- Users can update vaccinations for editable pets
CREATE POLICY "Users can update vaccinations for editable pets"
ON vaccinations FOR UPDATE
USING (can_edit_pet(pet_id, auth.uid()));

-- Users can delete vaccinations for editable pets
CREATE POLICY "Users can delete vaccinations for editable pets"
ON vaccinations FOR DELETE
USING (can_edit_pet(pet_id, auth.uid()));
```

### Health Reminders Table

Same pattern as vaccinations table.

### Pet Documents Table

Same pattern as vaccinations table.

### Pet Invites Table

```sql
-- Users can view invites for their pets or sent to them
CREATE POLICY "Users can view invites for their pets"
ON pet_invites FOR SELECT
USING (
  invited_by = auth.uid() OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Pet owners can create invites
CREATE POLICY "Pet owners can create invites"
ON pet_invites FOR INSERT
WITH CHECK (invited_by = auth.uid());

-- Pet owners can update/delete their invites
CREATE POLICY "Pet owners can update their invites"
ON pet_invites FOR UPDATE
USING (invited_by = auth.uid());

CREATE POLICY "Pet owners can delete their invites"
ON pet_invites FOR DELETE
USING (invited_by = auth.uid());
```

### Pet Memberships Table

```sql
-- Users can view memberships for their pets
CREATE POLICY "Users can view memberships for their pets"
ON pet_memberships FOR SELECT
USING (
  user_id = auth.uid() OR 
  pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
);

-- Pet owners can create memberships
CREATE POLICY "Pet owners can create memberships"
ON pet_memberships FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pets 
    WHERE id = pet_memberships.pet_id 
    AND user_id = auth.uid()
  )
);

-- Pet owners can delete memberships
CREATE POLICY "Pet owners can delete memberships"
ON pet_memberships FOR DELETE
USING (
  pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
);
```

## Usage Examples

### Invite Flow

1. Owner clicks "Invite family member"
2. Enters email and selects role (family or caregiver)
3. Invite link is generated and copied
4. Invitee clicks link and signs in
5. System validates token and creates membership
6. Invitee now has access based on their role

### Editing with RBAC

```typescript
const { role } = useRole(petId);

return (
  <Readonly when={!canEditPets(role)}>
    {isReadOnly(role) && (
      <Alert>
        You have read-only access as a caregiver
      </Alert>
    )}
    
    <PetForm petId={petId} />
    
    {canEditPets(role) && (
      <Button>Save Changes</Button>
    )}
  </Readonly>
);
```
