import { describe, it, expect } from 'vitest';

describe('Comma-Separated Values Extraction Logic', () => {
  const sampleColumnValues = ['CUST-1001', 'CUST-1002', 'CUST-1001', '  CUST-1003  ', '', null, 'CUST-1004'];
  const sampleNumericValues = ['1001', '1002', '$1,500', '250.75', 'INVALID_TEXT', '1001', ''];

  it('should extract deduplicated quoted strings', () => {
    const cleaned = sampleColumnValues
      .filter((v): v is string => Boolean(v && String(v).trim().length > 0))
      .map((v) => String(v).trim());

    const unique = Array.from(new Set(cleaned));
    const singleQuoted = unique.map((v) => `'${v}'`).join(', ');

    expect(unique).toHaveLength(4);
    expect(singleQuoted).toBe("'CUST-1001', 'CUST-1002', 'CUST-1003', 'CUST-1004'");
  });

  it('should extract and sanitize comma-separated numbers only', () => {
    const numericOnly: string[] = [];
    sampleNumericValues.forEach((raw) => {
      if (!raw) return;
      const stripped = String(raw).replace(/[$,]/g, '').trim();
      const num = Number(stripped);
      if (!isNaN(num) && stripped !== '') {
        numericOnly.push(stripped);
      }
    });

    const uniqueNumbers = Array.from(new Set(numericOnly));
    const commaSeparated = uniqueNumbers.join(', ');

    expect(uniqueNumbers).toEqual(['1001', '1002', '1500', '250.75']);
    expect(commaSeparated).toBe('1001, 1002, 1500, 250.75');
  });

  it('should wrap comma-separated values in SQL parentheses or JSON brackets', () => {
    const items = ['101', '102', '103'];
    const sqlInClause = `(${items.map((i) => `'${i}'`).join(', ')})`;
    const jsonArray = `[${items.join(', ')}]`;

    expect(sqlInClause).toBe("('101', '102', '103')");
    expect(jsonArray).toBe('[101, 102, 103]');
  });
});
