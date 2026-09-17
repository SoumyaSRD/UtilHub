import { describe, it, expect } from 'vitest';
import { formatJsTs, minifyJsTs } from './jsTsFormatter';

describe('jsTsFormatter', () => {
  it('should format unformatted JavaScript code with proper indentation and semicolons', () => {
    const unformatted = 'function calculate(x,y){return x+y} const res=calculate(2,3);';
    const formatted = formatJsTs(unformatted, { indentSize: 2, insertSemicolons: true });

    expect(formatted).toContain('function calculate(x, y) {');
    expect(formatted).toContain('return x + y;');
    expect(formatted).toContain('const res = calculate(2, 3);');
  });

  it('should preserve strings and template literals without corrupting internal spaces or quotes', () => {
    const code = 'const msg = "  hello world  "; const tpl = `multi\n  line  ${1 + 2}`;';
    const formatted = formatJsTs(code);

    expect(formatted).toContain('"  hello world  "');
    expect(formatted).toContain('`multi\n  line  ${1 + 2}`');
  });

  it('should handle TypeScript interfaces and types', () => {
    const tsCode = 'interface User{id:number;name:string;}type UserId=number;';
    const formatted = formatJsTs(tsCode, { indentSize: 2 });

    expect(formatted).toContain('interface User {');
    expect(formatted).toContain('id: number;');
    expect(formatted).toContain('name: string;');
    expect(formatted).toContain('type UserId = number;');
  });

  it('should minify code by stripping comments and spaces', () => {
    const code = `
      // This is a comment
      /* Multi-line
         comment */
      function add(a, b) {
        return a + b;
      }
    `;
    const minified = minifyJsTs(code);
    expect(minified).not.toContain('This is a comment');
    expect(minified).not.toContain('Multi-line');
    expect(minified).toContain('function add(a,b){return a+b;}');
  });
});
