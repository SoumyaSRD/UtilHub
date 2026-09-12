import { describe, it, expect } from 'vitest';
import {
  analyzeColumns,
  stripNullColumnsFromRows,
  isCellEmpty,
  detectCsvDelimiter,
} from '@shared/services/file/excelService';
import * as XLSX from 'xlsx';

describe('Excel & CSV Tabular Viewer & Null Column Remover', () => {
  const sampleRows: Record<string, unknown>[] = [
    { ID: 1, Name: 'Alpha', Age: 30, EmptyCol: null, WhitespaceCol: '   ', CsvNullCol: 'NULL', MixedCol: 'val1' },
    { ID: 2, Name: 'Beta', Age: 25, EmptyCol: '', WhitespaceCol: '', CsvNullCol: 'NA', MixedCol: null },
    { ID: 3, Name: 'Gamma', Age: 42, EmptyCol: undefined, WhitespaceCol: '  ', CsvNullCol: '-', MixedCol: '' },
    { ID: 4, Name: 'Delta', Age: 38, EmptyCol: null, WhitespaceCol: null, CsvNullCol: 'None', MixedCol: 'val4' },
  ];

  const columns = ['ID', 'Name', 'Age', 'EmptyCol', 'WhitespaceCol', 'CsvNullCol', 'MixedCol'];

  it('should accurately test isCellEmpty for null, undefined, whitespace, and CSV null keywords', () => {
    expect(isCellEmpty(null)).toBe(true);
    expect(isCellEmpty(undefined)).toBe(true);
    expect(isCellEmpty('')).toBe(true);
    expect(isCellEmpty('   ')).toBe(true);
    expect(isCellEmpty('NULL')).toBe(true);
    expect(isCellEmpty('null')).toBe(true);
    expect(isCellEmpty('NA')).toBe(true);
    expect(isCellEmpty('N/A')).toBe(true);
    expect(isCellEmpty('None')).toBe(true);
    expect(isCellEmpty('-')).toBe(true);
    expect(isCellEmpty('#N/A')).toBe(true);
    expect(isCellEmpty(0)).toBe(false);
    expect(isCellEmpty(false)).toBe(false);
    expect(isCellEmpty('Hello')).toBe(false);
  });

  it('should auto-detect CSV delimiters accurately', () => {
    expect(detectCsvDelimiter('id,name,email\n1,john,john@test.com')).toBe(',');
    expect(detectCsvDelimiter('id;name;email\n1;john;john@test.com')).toBe(';');
    expect(detectCsvDelimiter('id\tname\temail\n1\tjohn\tjohn@test.com')).toBe('\t');
    expect(detectCsvDelimiter('id|name|email\n1|john|john@test.com')).toBe('|');
  });

  it('should detect 100% null/empty columns in CSV including text nulls', () => {
    const { columnStats, nullColumns } = analyzeColumns(sampleRows, columns, true);

    expect(nullColumns).toContain('EmptyCol');
    expect(nullColumns).toContain('WhitespaceCol');
    expect(nullColumns).toContain('CsvNullCol');
    expect(nullColumns).not.toContain('MixedCol');
    expect(nullColumns).not.toContain('ID');
    expect(nullColumns).not.toContain('Name');

    expect(columnStats['CsvNullCol'].isNullColumn).toBe(true);
    expect(columnStats['CsvNullCol'].fillPercentage).toBe(0);
    expect(columnStats['MixedCol'].isNullColumn).toBe(false);
    expect(columnStats['MixedCol'].fillPercentage).toBe(50);
  });

  it('should strip null columns cleanly from CSV rows and column definitions', () => {
    const { nullColumns } = analyzeColumns(sampleRows, columns, true);
    const { cleanedColumns, cleanedRows } = stripNullColumnsFromRows(sampleRows, columns, nullColumns);

    expect(cleanedColumns).toEqual(['ID', 'Name', 'Age', 'MixedCol']);
    expect(cleanedRows).toHaveLength(4);

    cleanedRows.forEach((row) => {
      expect(row).not.toHaveProperty('EmptyCol');
      expect(row).not.toHaveProperty('WhitespaceCol');
      expect(row).not.toHaveProperty('CsvNullCol');
      expect(row).toHaveProperty('ID');
      expect(row).toHaveProperty('Name');
      expect(row).toHaveProperty('Age');
      expect(row).toHaveProperty('MixedCol');
    });
  });

  it('should export cleaned CSV with custom delimiters', () => {
    const { nullColumns } = analyzeColumns(sampleRows, columns, true);
    const { cleanedRows } = stripNullColumnsFromRows(sampleRows, columns, nullColumns);

    const ws = XLSX.utils.json_to_sheet(cleanedRows);
    const commaCsv = XLSX.utils.sheet_to_csv(ws, { FS: ',' });
    const semiCsv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });

    expect(commaCsv).toContain('Name,Age,MixedCol');
    expect(semiCsv).toContain('Name;Age;MixedCol');
    expect(commaCsv).not.toContain('EmptyCol');
    expect(semiCsv).not.toContain('CsvNullCol');
  });

  it('should calculate virtual scroll window indices accurately for 100,000 records', () => {
    const totalRows = 100000;
    const rowHeight = 38;
    const viewportHeight = 560;
    const overscan = 15;

    const scrollTopTop = 0;
    const startIndexTop = Math.max(0, Math.floor(scrollTopTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 2 * overscan;
    const endIndexTop = Math.min(totalRows, startIndexTop + visibleCount);

    expect(startIndexTop).toBe(0);
    expect(endIndexTop).toBe(45);

    const scrollTopMid = 50000 * rowHeight;
    const startIndexMid = Math.max(0, Math.floor(scrollTopMid / rowHeight) - overscan);
    const endIndexMid = Math.min(totalRows, startIndexMid + visibleCount);

    expect(startIndexMid).toBe(50000 - 15);
    expect(endIndexMid).toBe(50000 - 15 + visibleCount);
    expect(endIndexMid - startIndexMid).toBe(visibleCount);
  });
});
