import { describe, it, expect } from 'vitest';
import {
  analyzeColumns,
  stripNullColumnsFromRows,
  isCellEmpty,
} from '@shared/services/file/excelService';
import * as XLSX from 'xlsx';

describe('Excel Tabular Viewer & Null Column Remover', () => {
  const sampleRows: Record<string, unknown>[] = [
    { ID: 1, Name: 'Alpha', Age: 30, EmptyCol: null, WhitespaceCol: '   ', MixedCol: 'val1' },
    { ID: 2, Name: 'Beta', Age: 25, EmptyCol: '', WhitespaceCol: '', MixedCol: null },
    { ID: 3, Name: 'Gamma', Age: 42, EmptyCol: undefined, WhitespaceCol: '  ', MixedCol: '' },
    { ID: 4, Name: 'Delta', Age: 38, EmptyCol: null, WhitespaceCol: null, MixedCol: 'val4' },
  ];

  const columns = ['ID', 'Name', 'Age', 'EmptyCol', 'WhitespaceCol', 'MixedCol'];

  it('should accurately test isCellEmpty for null, undefined, and whitespace', () => {
    expect(isCellEmpty(null)).toBe(true);
    expect(isCellEmpty(undefined)).toBe(true);
    expect(isCellEmpty('')).toBe(true);
    expect(isCellEmpty('   ')).toBe(true);
    expect(isCellEmpty(0)).toBe(false);
    expect(isCellEmpty(false)).toBe(false);
    expect(isCellEmpty('Hello')).toBe(false);
  });

  it('should detect 100% null/empty columns and infer column types', () => {
    const { columnStats, nullColumns } = analyzeColumns(sampleRows, columns);

    expect(nullColumns).toContain('EmptyCol');
    expect(nullColumns).toContain('WhitespaceCol');
    expect(nullColumns).not.toContain('MixedCol');
    expect(nullColumns).not.toContain('ID');
    expect(nullColumns).not.toContain('Name');

    expect(columnStats['ID'].inferredType).toBe('number');
    expect(columnStats['Name'].inferredType).toBe('string');
    expect(columnStats['EmptyCol'].isNullColumn).toBe(true);
    expect(columnStats['EmptyCol'].fillPercentage).toBe(0);
    expect(columnStats['MixedCol'].isNullColumn).toBe(false);
    expect(columnStats['MixedCol'].fillPercentage).toBe(50); // 2 of 4 filled
  });

  it('should strip null columns cleanly from rows and column definitions', () => {
    const { nullColumns } = analyzeColumns(sampleRows, columns);
    const { cleanedColumns, cleanedRows } = stripNullColumnsFromRows(sampleRows, columns, nullColumns);

    expect(cleanedColumns).toEqual(['ID', 'Name', 'Age', 'MixedCol']);
    expect(cleanedRows).toHaveLength(4);

    cleanedRows.forEach((row) => {
      expect(row).not.toHaveProperty('EmptyCol');
      expect(row).not.toHaveProperty('WhitespaceCol');
      expect(row).toHaveProperty('ID');
      expect(row).toHaveProperty('Name');
      expect(row).toHaveProperty('Age');
      expect(row).toHaveProperty('MixedCol');
    });
  });

  it('should calculate virtual scroll window indices accurately for 100,000 records', () => {
    const totalRows = 100000;
    const rowHeight = 38;
    const viewportHeight = 560;
    const overscan = 15;

    // Test at top (scrollTop = 0)
    const scrollTopTop = 0;
    const startIndexTop = Math.max(0, Math.floor(scrollTopTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 2 * overscan;
    const endIndexTop = Math.min(totalRows, startIndexTop + visibleCount);

    expect(startIndexTop).toBe(0);
    expect(endIndexTop).toBe(45); // 15 visible + 30 overscan buffer

    // Test at middle (e.g. Row 50,000, scrollTop = 50000 * 38 = 1,900,000px)
    const scrollTopMid = 50000 * rowHeight;
    const startIndexMid = Math.max(0, Math.floor(scrollTopMid / rowHeight) - overscan);
    const endIndexMid = Math.min(totalRows, startIndexMid + visibleCount);

    expect(startIndexMid).toBe(50000 - 15);
    expect(endIndexMid).toBe(50000 - 15 + visibleCount);
    expect(endIndexMid - startIndexMid).toBe(visibleCount); // Keeps constant lightweight DOM count
  });

  it('should parse multi-sheet Excel workbook and maintain sheet tabs data', () => {
    const workbook = XLSX.utils.book_new();

    const sheet1Data = [{ SKU: 'A1', Price: 10 }, { SKU: 'A2', Price: 20 }];
    const sheet2Data = [{ Customer: 'Acme', Country: 'US' }, { Customer: 'Beta', Country: 'DE' }];

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);

    XLSX.utils.book_append_sheet(workbook, ws1, 'Products');
    XLSX.utils.book_append_sheet(workbook, ws2, 'Customers');

    expect(workbook.SheetNames).toEqual(['Products', 'Customers']);

    const parsedSheet1 = XLSX.utils.sheet_to_json(workbook.Sheets['Products']);
    const parsedSheet2 = XLSX.utils.sheet_to_json(workbook.Sheets['Customers']);

    expect(parsedSheet1).toHaveLength(2);
    expect(parsedSheet2).toHaveLength(2);
  });
});
