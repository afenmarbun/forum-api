import { describe, expect, it } from 'vitest';

describe('temporary failed CI proof', () => {
  it('should fail intentionally', () => {
    expect(true).toBe(false);
  });
});
