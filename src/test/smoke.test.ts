import { describe, it, expect } from 'vitest';

describe('Smoke test', () => {
  it('runs vitest correctly in jsdom environment', () => {
    expect(1 + 1).toBe(2);
  });
});
