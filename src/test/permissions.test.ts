import { describe, it, expect } from 'vitest';
import {
  hasCapability,
  isStaffRole,
  isAdminOrOwnerRole,
  CAPABILITY_DEFINITIONS,
  ROLE_DEFINITIONS,
  ROLE_PERMISSIONS
} from '../lib/permissions';

describe('Permissions & Role-Based Access Control (RBAC)', () => {
  it('denies all privileged capabilities to anonymous visitors with empty roles', () => {
    expect(hasCapability([], 'content.read')).toBe(true);
    expect(hasCapability([], 'content.create')).toBe(false);
    expect(hasCapability([], 'content.publish')).toBe(false);
    expect(hasCapability([], 'media.upload')).toBe(false);
    expect(hasCapability([], 'roles.manage')).toBe(false);
    expect(hasCapability([], 'audit.read')).toBe(false);
  });

  it('allows learners only content.read capability', () => {
    expect(hasCapability(['learner'], 'content.read')).toBe(true);
    expect(hasCapability(['learner'], 'content.create')).toBe(false);
    expect(hasCapability(['learner'], 'content.publish')).toBe(false);
    expect(hasCapability(['learner'], 'media.upload')).toBe(false);
    expect(hasCapability(['learner'], 'roles.manage')).toBe(false);
    expect(isStaffRole(['learner'])).toBe(false);
    expect(isAdminOrOwnerRole(['learner'])).toBe(false);
  });

  it('allows contributors to create drafts and upload media, but not publish or manage roles', () => {
    expect(hasCapability(['contributor'], 'content.create')).toBe(true);
    expect(hasCapability(['contributor'], 'content.edit.own')).toBe(true);
    expect(hasCapability(['contributor'], 'media.upload')).toBe(true);
    expect(hasCapability(['contributor'], 'content.publish')).toBe(false);
    expect(hasCapability(['contributor'], 'roles.manage')).toBe(false);
    expect(isStaffRole(['contributor'])).toBe(true);
    expect(isAdminOrOwnerRole(['contributor'])).toBe(false);
  });

  it('allows editors to publish content and moderate comments, but not manage roles or integrations', () => {
    expect(hasCapability(['editor'], 'content.publish')).toBe(true);
    expect(hasCapability(['editor'], 'comments.moderate')).toBe(true);
    expect(hasCapability(['editor'], 'courses.manage')).toBe(true);
    expect(hasCapability(['editor'], 'roles.manage')).toBe(false);
    expect(hasCapability(['editor'], 'integrations.manage')).toBe(false);
    expect(isStaffRole(['editor'])).toBe(true);
  });

  it('allows administrators and owners full management capabilities', () => {
    expect(hasCapability(['admin'], 'roles.manage')).toBe(true);
    expect(hasCapability(['admin'], 'audit.read')).toBe(true);
    expect(hasCapability(['owner'], 'integrations.manage')).toBe(true);
    expect(hasCapability(['owner'], 'roles.manage')).toBe(true);
    expect(isAdminOrOwnerRole(['admin'])).toBe(true);
    expect(isAdminOrOwnerRole(['owner'])).toBe(true);
  });

  it('allows super_admin full institutional authority and verifies helper predicates', () => {
    expect(hasCapability(['super_admin'], 'roles.manage')).toBe(true);
    expect(hasCapability(['super_admin'], 'audit.read')).toBe(true);
    expect(hasCapability(['super_admin'], 'integrations.manage')).toBe(true);
    expect(isStaffRole(['super_admin'])).toBe(true);
    expect(isAdminOrOwnerRole(['super_admin'])).toBe(true);
    expect(isAdminOrOwnerRole(['learner'])).toBe(false);
  });

  it('exposes well-formed CAPABILITY_DEFINITIONS across all 4 operational domains', () => {
    expect(CAPABILITY_DEFINITIONS.length).toBeGreaterThan(10);
    const domains = new Set(CAPABILITY_DEFINITIONS.map((c) => c.domain));
    expect(domains.has('content')).toBe(true);
    expect(domains.has('media')).toBe(true);
    expect(domains.has('curriculum')).toBe(true);
    expect(domains.has('system')).toBe(true);

    CAPABILITY_DEFINITIONS.forEach((cap) => {
      expect(cap.key).toBeDefined();
      expect(cap.label.length).toBeGreaterThan(0);
      expect(cap.description.length).toBeGreaterThan(0);
      expect(['content', 'media', 'curriculum', 'system']).toContain(cap.domain);
    });
  });

  it('exposes ROLE_DEFINITIONS with strict hierarchy tiers and protection markers', () => {
    const roleKeys = Object.keys(ROLE_DEFINITIONS);
    expect(roleKeys.length).toBe(6);

    const superAdminDef = ROLE_DEFINITIONS['super_admin'];
    const ownerDef = ROLE_DEFINITIONS['owner'];
    const learnerDef = ROLE_DEFINITIONS['learner'];

    expect(superAdminDef).toBeDefined();
    expect(superAdminDef.isProtected).toBe(true);
    expect(superAdminDef.level).toBe(5);

    expect(ownerDef).toBeDefined();
    expect(ownerDef.isProtected).toBe(true);
    expect(ownerDef.level).toBe(5);

    expect(learnerDef).toBeDefined();
    expect(learnerDef.isProtected).toBeFalsy();
    expect(learnerDef.level).toBe(1);
  });

  it('guarantees Super Admin and Owner have all defined capabilities in ROLE_PERMISSIONS', () => {
    const allCapabilityKeys = CAPABILITY_DEFINITIONS.map((c) => c.key);
    const superAdminCaps = ROLE_PERMISSIONS['super_admin'];
    const ownerCaps = ROLE_PERMISSIONS['owner'];

    allCapabilityKeys.forEach((capKey) => {
      expect(superAdminCaps).toContain(capKey);
      expect(ownerCaps).toContain(capKey);
    });
  });
});

