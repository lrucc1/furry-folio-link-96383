/**
 * RBAC Model for PetLinkID
 * Defines roles and their permissions
 */

export type Role = 'owner' | 'family' | 'caregiver' | 'vet';

/**
 * Role meanings:
 * - owner: Full read/write access to pets and can invite others
 * - family: Read/write access to pets and their records
 * - caregiver: Read-only access to pets and their records
 * - vet: Read-only access to medical records via VetShare
 */

export const RoleDescriptions: Record<Role, string> = {
  owner: 'Full access - can view, edit, and invite others',
  family: 'Family member - can view and edit pet records',
  caregiver: 'Caregiver - read-only access to pet records',
  vet: 'Veterinarian - read-only access to medical records via VetShare'
};
