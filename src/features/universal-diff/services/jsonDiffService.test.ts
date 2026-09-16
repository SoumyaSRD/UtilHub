import { describe, it, expect } from 'vitest';
import { computeJsonDiff } from './jsonDiffService';

describe('jsonDiffService', () => {
  it('should identify identical JSON objects even if keys are unordered when sortKeys is true', () => {
    const jsonA = JSON.stringify({ b: 2, a: 1 });
    const jsonB = JSON.stringify({ a: 1, b: 2 });
    const result = computeJsonDiff(jsonA, jsonB, true);
    expect(result.isIdentical).toBe(true);
    expect(result.entries.length).toBe(0);
  });

  it('should detect added, removed, and modified values in nested objects', () => {
    const jsonA = JSON.stringify({
      user: { name: 'Alice', age: 30, role: 'admin' },
      tags: ['a', 'b'],
    });
    const jsonB = JSON.stringify({
      user: { name: 'Alice', age: 31, city: 'London' }, // age modified, role removed, city added
      tags: ['a', 'b', 'c'], // 'c' added
    });

    const result = computeJsonDiff(jsonA, jsonB, true);
    expect(result.isIdentical).toBe(false);

    const added = result.entries.filter((e) => e.type === 'ADDED');
    const removed = result.entries.filter((e) => e.type === 'REMOVED');
    const modified = result.entries.filter((e) => e.type === 'MODIFIED');

    expect(added.some((e) => e.path === 'user.city')).toBe(true);
    expect(added.some((e) => e.path === 'tags[2]')).toBe(true);
    expect(removed.some((e) => e.path === 'user.role')).toBe(true);
    expect(modified.some((e) => e.path === 'user.age')).toBe(true);
  });
});
