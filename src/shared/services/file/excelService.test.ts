import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('Excel Data Operations', () => {
  it('should parse CSV string into structured JSON objects', () => {
    const csvContent = 'id,name,role\n1,Alice,Engineer\n2,Bob,Analyst';
    const workbook = XLSX.read(csvContent, { type: 'string' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{ id: number; name: string; role: string }>(sheet);

    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Alice');
    expect(rows[1].role).toBe('Analyst');
  });

  it('should generate workbook and sheets accurately from object records', () => {
    const data = [
      { SKU: 'PROD-1', Qty: 10, Price: 29.99 },
      { SKU: 'PROD-2', Qty: 5, Price: 99.0 },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TestSheet');

    expect(workbook.SheetNames).toContain('TestSheet');
    const exportedCsv = XLSX.utils.sheet_to_csv(worksheet);
    expect(exportedCsv).toContain('PROD-1');
    expect(exportedCsv).toContain('29.99');
  });
});
