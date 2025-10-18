import { Role } from './roles';

/**
 * Permission guards for RBAC
 */

export function canReadPets(role: Role): boolean {
  return role === 'owner' || role === 'family' || role === 'caregiver';
}

export function canEditPets(role: Role): boolean {
  return role === 'owner' || role === 'family';
}

export function canInvite(role: Role): boolean {
  return role === 'owner';
}

export function isReadOnly(role: Role): boolean {
  return role === 'caregiver';
}

export function canDeletePets(role: Role): boolean {
  return role === 'owner';
}

export function canManageMembers(role: Role): boolean {
  return role === 'owner';
}
