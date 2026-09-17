import { describe, it, expect } from 'vitest';
import { transpileTsToJs, executeCodeInSandbox } from './tsCompiler';

describe('tsCompiler', () => {
  it('should transpile TypeScript code into executable JavaScript', async () => {
    const tsCode = `
      interface Person { name: string; age: number; }
      const p: Person = { name: 'Alice', age: 30 };
      console.log(\`Hello \${p.name}\`);
    `;

    const res = await transpileTsToJs(tsCode);
    expect(res.error).toBeUndefined();
    expect(res.js).toContain('const p = { name: \'Alice\', age: 30 };');
    expect(res.js).not.toContain('interface Person');
  });

  it('should execute JavaScript in sandbox and capture console logs and return values', async () => {
    const jsCode = `
      console.log('Log message 1');
      console.warn('Warning test');
      const doubled = [1, 2, 3].map(n => n * 2);
      console.log('Doubled:', doubled);
      return doubled.reduce((a, b) => a + b, 0);
    `;

    const res = await executeCodeInSandbox(jsCode);
    expect(res.success).toBe(true);
    expect(res.logs.length).toBeGreaterThanOrEqual(3);
    expect(res.logs[0].message).toBe('Log message 1');
    expect(res.logs[1].type).toBe('warn');
    expect(res.returnValue).toBe('12');
  });

  it('should handle runtime errors cleanly with stack or error message', async () => {
    const brokenCode = `
      const obj = null;
      obj.invalidProperty();
    `;

    const res = await executeCodeInSandbox(brokenCode);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.logs.some((l) => l.type === 'error')).toBe(true);
  });
});
