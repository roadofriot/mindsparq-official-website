import { describe, it, expect } from 'vitest';
import { hasCapability, isStaffRole, isAdminOrOwnerRole } from '../lib/permissions';

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
});

