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

export interface CapabilityDefinition {
  key: Capability;
  label: string;
  description: string;
  domain: 'content' | 'media' | 'curriculum' | 'system';
}

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  badgeColor: string;
  badgeBg: string;
  level: number;
  description: string;
  isProtected?: boolean;
}

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  // Content & Editorial
  { key: 'content.read', label: 'View Public Content', description: 'Browse published courses, articles, and workshops', domain: 'content' },
  { key: 'content.create', label: 'Draft Articles', description: 'Author new educational articles and blog drafts', domain: 'content' },
  { key: 'content.edit.own', label: 'Edit Own Drafts', description: 'Modify and update articles created by oneself', domain: 'content' },
  { key: 'content.edit.any', label: 'Edit Any Content', description: 'Review, edit, and proofread articles created by any team member', domain: 'content' },
  { key: 'content.publish', label: 'Publish to Production', description: 'Transition drafts to published status on the live platform', domain: 'content' },
  
  // Media & Assets
  { key: 'media.upload', label: 'Upload Media Assets', description: 'Upload flyers, banner graphics, and lesson materials', domain: 'media' },
  { key: 'media.delete', label: 'Delete Media Assets', description: 'Permanently remove images and files from cloud storage', domain: 'media' },
  
  // Curriculum & Learning
  { key: 'courses.manage', label: 'Manage Curriculum', description: 'Create courses, modules, and video lesson embeds', domain: 'curriculum' },
  { key: 'events.manage', label: 'Schedule Workshops', description: 'Create and publish upcoming seminars and workshops', domain: 'curriculum' },
  { key: 'comments.moderate', label: 'Moderate Discussions', description: 'Review, approve, or remove learner comments', domain: 'curriculum' },
  
  // System Governance & Security
  { key: 'users.manage', label: 'Manage Accounts', description: 'Invite staff members, suspend, or reactivate accounts', domain: 'system' },
  { key: 'roles.manage', label: 'Delegate Roles', description: 'Assign or revoke staff roles and administrative tiers', domain: 'system' },
  { key: 'integrations.manage', label: 'API Integrations', description: 'Configure Gemini API keys, Cloudflare, and webhooks', domain: 'system' },
  { key: 'settings.manage', label: 'Global Customizer', description: 'Modify homepage blocks, design tokens, and branding', domain: 'system' },
  { key: 'audit.read', label: 'Inspect Audit Logs', description: 'Access tamper-evident security and activity event logs', domain: 'system' }
];

export const ROLE_DEFINITIONS: Record<RoleKey, RoleDefinition> = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    level: 5,
    description: 'Highest institutional tier. Protected from accidental deletion. Full governance across data, roles, and server policies.',
    isProtected: true
  },
  owner: {
    key: 'owner',
    label: 'Owner / Founder',
    badgeColor: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    level: 5,
    description: 'Executive stakeholder. Protected institutional access with complete control over branding, roles, and financial settings.',
    isProtected: true
  },
  admin: {
    key: 'admin',
    label: 'Administrator',
    badgeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    level: 4,
    description: 'Academic and operations leader. Can publish content, manage course curricula, assign staff roles, and audit security events.'
  },
  editor: {
    key: 'editor',
    label: 'Senior Editor',
    badgeColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.15)',
    level: 3,
    description: 'Editorial reviewer. Can author, review, edit any article, publish content, manage courses, and moderate discussions.'
  },
  contributor: {
    key: 'contributor',
    label: 'Contributor',
    badgeColor: '#2dd4bf',
    badgeBg: 'rgba(45, 212, 191, 0.15)',
    level: 2,
    description: 'Educator and author. Can create drafts and upload teaching media, but cannot publish directly to the live site.'
  },
  learner: {
    key: 'learner',
    label: 'Learner',
    badgeColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    level: 1,
    description: 'Student or public user. Can browse published courses, watch lessons, bookmark articles, and submit comments.'
  }
};

/**
 * Deny-by-default permission matrix
 */
export const ROLE_PERMISSIONS: Record<RoleKey, Capability[]> = {
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
  super_admin: [
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
 * Check if the user has staff access (contributor, editor, admin, owner, or super_admin)
 */
export function isStaffRole(roles: RoleKey[]): boolean {
  return roles.some((r) => ['contributor', 'editor', 'admin', 'owner', 'super_admin'].includes(r));
}

/**
 * Check if user is administrator, owner, or super_admin
 */
export function isAdminOrOwnerRole(roles: RoleKey[]): boolean {
  return roles.some((r) => ['admin', 'owner', 'super_admin'].includes(r));
}

/**
 * Check if user is specifically a super admin or owner
 */
export function isSuperAdminOrOwnerRole(roles: RoleKey[]): boolean {
  return roles.some((r) => ['owner', 'super_admin'].includes(r));
}

