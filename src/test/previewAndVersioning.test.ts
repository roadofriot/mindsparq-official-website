import { describe, it, expect, beforeEach } from 'vitest';
import {
  createContentVersion,
  getContentVersions,
  restoreContentVersion,
  generatePreviewToken,
  verifyPreviewToken
} from '../services/versionService';
import { ContentVersion } from '../types/database';

describe('Content Versioning & Snapshotting Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates initial version 1 for a blog post snapshot', async () => {
    const postSnapshot = {
      id: 'test-post-1',
      title: 'Intro to Mental Arithmetic',
      slug: 'intro-to-mental-arithmetic',
      content: 'Sample content for mental arithmetic',
      status: 'draft'
    };

    const res = await createContentVersion(
      'blog_post',
      'test-post-1',
      'Intro to Mental Arithmetic',
      postSnapshot,
      'Initial author draft',
      'Faculty Member'
    );

    expect(res.error).toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data?.version_number).toBe(1);
    expect(res.data?.content_id).toBe('test-post-1');
    expect(res.data?.title).toBe('Intro to Mental Arithmetic');
    expect(res.data?.created_by_name).toBe('Faculty Member');
  });

  it('increments version numbers chronologically on subsequent updates', async () => {
    const postSnapshotV1 = { id: 'post-multi', title: 'V1 Title', content: 'V1 Content' };
    const postSnapshotV2 = { id: 'post-multi', title: 'V2 Title Updated', content: 'V2 Content Expanded' };

    await createContentVersion('blog_post', 'post-multi', 'V1 Title', postSnapshotV1, 'First draft');
    const v2Res = await createContentVersion('blog_post', 'post-multi', 'V2 Title Updated', postSnapshotV2, 'Second revision');

    expect(v2Res.data?.version_number).toBe(2);

    const history = await getContentVersions('blog_post', 'post-multi');
    expect(history.length).toBe(2);
    expect(history[0].version_number).toBe(2);
    expect(history[1].version_number).toBe(1);
    expect(history[0].title).toBe('V2 Title Updated');
  });

  it('restores historical snapshot creating a restore trace revision', async () => {
    const postSnapshotV1 = { id: 'post-restore', title: 'Original Baseline', status: 'draft' };
    const postSnapshotV2 = { id: 'post-restore', title: 'Accidental Mutation', status: 'review' };

    const v1 = await createContentVersion('blog_post', 'post-restore', 'Original Baseline', postSnapshotV1, 'Original draft');
    await createContentVersion('blog_post', 'post-restore', 'Accidental Mutation', postSnapshotV2, 'Mistake revision');

    expect(v1.data).not.toBeNull();

    const restoreRes = await restoreContentVersion(v1.data as ContentVersion);
    expect(restoreRes.success).toBe(true);
    expect(restoreRes.error).toBeNull();

    const updatedHistory = await getContentVersions('blog_post', 'post-restore');
    expect(updatedHistory.length).toBe(3); // v1, v2, v3 (restoration)
    expect(updatedHistory[0].version_number).toBe(3);
    expect(updatedHistory[0].change_summary).toContain('Restored from Version 1');
  });
});

describe('Cryptographic Preview Token Generator & Verifier', () => {
  it('generates a valid, verifiable preview token for authorized draft sharing', () => {
    const token = generatePreviewToken('blog', 'post-xyz-123', 24);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    const isValid = verifyPreviewToken(token, 'blog', 'post-xyz-123');
    expect(isValid).toBe(true);
  });

  it('rejects preview tokens when content ID does not match target', () => {
    const token = generatePreviewToken('blog', 'post-xyz-123', 24);
    const isValid = verifyPreviewToken(token, 'blog', 'different-post-id');
    expect(isValid).toBe(false);
  });

  it('rejects preview tokens when content type does not match', () => {
    const token = generatePreviewToken('blog', 'post-xyz-123', 24);
    const isValid = verifyPreviewToken(token, 'course', 'post-xyz-123');
    expect(isValid).toBe(false);
  });

  it('rejects expired tokens safely', () => {
    // Generate token with negative expiration (-1 hour)
    const expiredToken = generatePreviewToken('blog', 'post-xyz-123', -1);
    const isValid = verifyPreviewToken(expiredToken, 'blog', 'post-xyz-123');
    expect(isValid).toBe(false);
  });

  it('rejects corrupted or forged tokens gracefully without throwing', () => {
    expect(verifyPreviewToken('invalid-gibberish-token', 'blog', '123')).toBe(false);
    expect(verifyPreviewToken('', 'blog', '123')).toBe(false);
    expect(verifyPreviewToken(null, 'blog', '123')).toBe(false);
  });
});
