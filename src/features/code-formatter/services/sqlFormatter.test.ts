import { describe, it, expect } from 'vitest';
import { formatSql, minifySql } from './sqlFormatter';

describe('sqlFormatter', () => {
  it('should uppercase SQL keywords and break major clauses', () => {
    const rawSql = 'select id, name from users where active = 1 order by name desc limit 10;';
    const formatted = formatSql(rawSql, { keywordCase: 'upper', indentSpaces: 2 });
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('\nFROM');
    expect(formatted).toContain('\nWHERE');
    expect(formatted).toContain('\nORDER BY');
    expect(formatted).toContain('\nLIMIT');
  });

  it('should minify SQL query into a single line without comments', () => {
    const multiLineSql = `
      -- Query users
      SELECT u.id, u.name
      FROM users u /* multi
      line comment */
      WHERE u.status = 'ACTIVE';
    `;
    const minified = minifySql(multiLineSql);
    expect(minified).toBe("SELECT u.id, u.name FROM users u WHERE u.status = 'ACTIVE';");
    expect(minified).not.toContain('--');
    expect(minified).not.toContain('/*');
  });
});
