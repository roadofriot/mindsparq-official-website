import { RoleKey } from '../types/database';

export type Capability =
  | 'content.read'
  | 'content.create'
  | 'content.edit.own'
  | 'content.edit.any'
  | 'content.publish'
  | 'media.upload'
  | 'media.delete'
  | 'courses.manage'
  | 'events.manage'
  | 'comments.moderate'
  | 'users.manage'
  | 'roles.manage'
  | 'integrations.manage'
  | 'settings.manage'
  | 'audit.read';

/**
 * Deny-by-default permission matrix
 */
const ROLE_PERMISSIONS: Record<RoleKey, Capability[]> = {
  learner: [
    'content.read'
  ],
  contributor: [
    'content.read',
    'content.create',
    'content.edit.own',
    'media.upload'
  ],
  editor: [
    'content.read',
    'content.create',
    'content.edit.own',
    'content.edit.any',
    'content.publish',
    'media.upload',
    'courses.manage',
    'events.manage',
    'comments.moderate'
  ],
  admin: [
    'content.read',
    'content.create',
    'content.edit.own',
    'content.edit.any',
    'content.publish',
    'media.upload',
    'media.delete',
    'courses.manage',
    'events.manage',
    'comments.moderate',
    'users.manage',
    'roles.manage',
    'settings.manage',
    'audit.read'
  ],
  owner: [
    'content.read',
    'content.create',
    'content.edit.own',
    'content.edit.any',
    'content.publish',
    'media.upload',
    'media.delete',
    'courses.manage',
    'events.manage',
    'comments.moderate',
    'users.manage',
    'roles.manage',
    'integrations.manage',
    'settings.manage',
    'audit.read'
  ]
};

/**
 * Checks if a given list of user roles grants a specific capability
 */
export function hasCapability(roles: RoleKey[], capability: Capability): boolean {
  if (!roles || roles.length === 0) {
    return capability === 'content.read';
  }

  return roles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(capability) : false;
  });
}

/**
 * Check if the user has staff access (contributor, editor, admin, or owner)
 */
export function isStaffRole(roles: RoleKey[]): boolean {
  return roles.some((r) => ['contributor', 'editor', 'admin', 'owner'].includes(r));
}

/**
 * Check if user is administrator or owner
 */
export function isAdminOrOwnerRole(roles: RoleKey[]): boolean {
  return roles.some((r) => ['admin', 'owner'].includes(r));
}
