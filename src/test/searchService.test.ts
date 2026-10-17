import { describe, it, expect } from 'vitest';
import { searchAdminContent } from '../services/searchService';

describe('Admin Universal Deep Search Service', () => {
  it('returns empty array when query is empty or whitespace', async () => {
    const res1 = await searchAdminContent('');
    const res2 = await searchAdminContent('   ');
    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
  });

  it('finds navigation routes when searching for admin pages', async () => {
    const res = await searchAdminContent('carousel');
    expect(res.length).toBeGreaterThan(0);
    const navMatch = res.find((r) => r.category === 'navigation');
    expect(navMatch).toBeDefined();
    expect(navMatch?.title).toContain('Carousel');
    expect(navMatch?.targetRoute).toBe('/admin/carousel');
  });

  it('finds default homepage sections by keyword', async () => {
    const res = await searchAdminContent('Pillars');
    expect(res.length).toBeGreaterThan(0);
    const sectionMatch = res.find((r) => r.category === 'section');
    expect(sectionMatch).toBeDefined();
    expect(sectionMatch?.locationPath).toContain('Homepage');
    expect(sectionMatch?.targetRoute).toContain('/admin/sections');
  });

  it('finds faculty team members by name or subjects', async () => {
    const res = await searchAdminContent('Samay');
    expect(res.length).toBeGreaterThan(0);
    const teamMatch = res.find((r) => r.category === 'team');
    expect(teamMatch).toBeDefined();
    expect(teamMatch?.title).toContain('Samay');
    expect(teamMatch?.targetRoute).toContain('/admin/team');
  });

  it('supports category filtering', async () => {
    const onlyTeam = await searchAdminContent('Samay', 'team');
    expect(onlyTeam.every((r) => r.category === 'team')).toBe(true);

    const onlyNav = await searchAdminContent('Settings', 'navigation');
    expect(onlyNav.every((r) => r.category === 'navigation')).toBe(true);
  });
});
