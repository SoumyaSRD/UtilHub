import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ColumnStat {
  name: string;
  totalCount: number;
  filledCount: number;
  nullCount: number;
  fillPercentage: number;
  isNullColumn: boolean; // true if 100% of cells are null, undefined, or whitespace
  inferredType: 'string' | 'number' | 'boolean' | 'date' | 'empty';
  sampleValues: string[];
}

export interface ParsedSheetData {
  fileName: string;
  sheetNames: string[];
  activeSheet: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRowCount: number;
  nullColumns?: string[];
  columnStats?: Record<string, ColumnStat>;
}

export interface SheetDetail {
  sheetName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalRowCount: number;
  nullColumns: string[];
  columnStats: Record<string, ColumnStat>;
}

export interface ParsedWorkbookData {
  fileName: string;
  sheetNames: string[];
  sheets: Record<string, SheetDetail>;
}

/**
 * Check if a cell value is strictly empty or null
 */
export const isCellEmpty = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  return false;
};

/**
 * Analyze columns to detect null percentages, data types, and identify 100% null/empty columns
 */
export const analyzeColumns = (
  rows: Record<string, unknown>[],
  columns: string[]
): { columnStats: Record<string, ColumnStat>; nullColumns: string[] } => {
  const columnStats: Record<string, ColumnStat> = {};
  const nullColumns: string[] = [];
  const totalRows = rows.length;

  columns.forEach((col) => {
    let filledCount = 0;
    let typeNumber = 0;
    let typeBoolean = 0;
    let typeDate = 0;
    let typeString = 0;
    const samples: string[] = [];

    // Analyze up to 10,000 samples for high-speed stats, or all if smaller
    const sampleLimit = Math.min(totalRows, 10000);

    for (let i = 0; i < sampleLimit; i++) {
      const val = rows[i]?.[col];
      if (!isCellEmpty(val)) {
        filledCount++;
        if (samples.length < 5) {
          samples.push(String(val));
        }

        if (typeof val === 'number') {
          typeNumber++;
        } else if (typeof val === 'boolean') {
          typeBoolean++;
        } else if (val instanceof Date) {
          typeDate++;
        } else {
          typeString++;
        }
      }
    }

    // If dataset is larger than sampleLimit, check if any row beyond sampleLimit has data
    if (filledCount === 0 && totalRows > sampleLimit) {
      for (let i = sampleLimit; i < totalRows; i++) {
        const val = rows[i]?.[col];
        if (!isCellEmpty(val)) {
          filledCount++;
          if (samples.length < 5) samples.push(String(val));
          break;
        }
      }
    }

    const nullCount = totalRows - filledCount;
    const isNullCol = totalRows === 0 || filledCount === 0;
    const fillPercentage = totalRows > 0 ? Math.round((filledCount / totalRows) * 100) : 0;

    let inferredType: ColumnStat['inferredType'] = 'empty';
    if (filledCount > 0) {
      if (typeNumber >= filledCount * 0.8) inferredType = 'number';
      else if (typeBoolean >= filledCount * 0.8) inferredType = 'boolean';
      else if (typeDate >= filledCount * 0.8) inferredType = 'date';
      else inferredType = 'string';
    }

    columnStats[col] = {
      name: col,
      totalCount: totalRows,
      filledCount,
      nullCount,
      fillPercentage,
      isNullColumn: isNullCol,
      inferredType,
      sampleValues: samples,
    };

    if (isNullCol) {
      nullColumns.push(col);
    }
  });

  return { columnStats, nullColumns };
};

/**
 * Strips all columns that are identified as null columns
 */
export const stripNullColumnsFromRows = (
  rows: Record<string, unknown>[],
  columns: string[],
  nullColumns: string[]
): { cleanedColumns: string[]; cleanedRows: Record<string, unknown>[] } => {
  const nullSet = new Set(nullColumns);
  const cleanedColumns = columns.filter((col) => !nullSet.has(col));

  const cleanedRows = rows.map((row) => {
    const cleanRow: Record<string, unknown> = {};
    cleanedColumns.forEach((col) => {
      cleanRow[col] = row[col] ?? '';
    });
    return cleanRow;
  });

  return { cleanedColumns, cleanedRows };
};

export const excelService = {
  /**
   * Parse an uploaded File (XLSX, XLS, or CSV) into JSON rows and column definitions (Single sheet compatibility)
   */
  async parseFile(file: File): Promise<ParsedSheetData> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });

    const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to json with headers
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false,
    });

    // Detect all column keys
    const columnSet = new Set<string>();
    // First check header row if available
    const headerMatrix = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    if (headerMatrix.length > 0 && Array.isArray(headerMatrix[0])) {
      headerMatrix[0].forEach((h) => {
        if (h !== undefined && h !== null && String(h).trim() !== '') {
          columnSet.add(String(h).trim());
        }
      });
    }

    rawRows.slice(0, 500).forEach((row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
    });

    const columns = Array.from(columnSet);
    const { columnStats, nullColumns } = analyzeColumns(rawRows, columns);

    return {
      fileName: file.name,
      sheetNames: workbook.SheetNames,
      activeSheet: firstSheetName,
      columns,
      rows: rawRows,
      totalRowCount: rawRows.length,
      nullColumns,
      columnStats,
    };
  },

  /**
   * Parse entire workbook including ALL sheets dynamically with null column detection
   */
  async parseWorkbookAllSheets(file: File): Promise<ParsedWorkbookData> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });

    const sheets: Record<string, SheetDetail> = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return;

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
        raw: false,
      });

      // Extract column headers accurately
      const columnSet = new Set<string>();
      const headerMatrix = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      if (headerMatrix.length > 0 && Array.isArray(headerMatrix[0])) {
        headerMatrix[0].forEach((h, idx) => {
          const colName = (h !== undefined && h !== null && String(h).trim() !== '')
            ? String(h).trim()
            : `Column_${idx + 1}`;
          columnSet.add(colName);
        });
      }

      // Check row object keys for any extra properties
      const scanLimit = Math.min(rawRows.length, 500);
      for (let i = 0; i < scanLimit; i++) {
        Object.keys(rawRows[i]).forEach((k) => columnSet.add(k));
      }

      const columns = Array.from(columnSet);
      const { columnStats, nullColumns } = analyzeColumns(rawRows, columns);

      sheets[sheetName] = {
        sheetName,
        columns,
        rows: rawRows,
        totalRowCount: rawRows.length,
        nullColumns,
        columnStats,
      };
    });

    return {
      fileName: file.name,
      sheetNames: workbook.SheetNames,
      sheets,
    };
  },

  /**
   * Export an array of objects to Excel (.xlsx) file
   */
  exportToExcel(data: Record<string, unknown>[], fileName = 'extracted_data.xlsx', sheetName = 'Data') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  },

  /**
   * Export single sheet with Null Columns Removed
   */
  exportCleanedExcel(
    rows: Record<string, unknown>[],
    columns: string[],
    nullColumns: string[],
    fileName = 'cleaned_data.xlsx',
    sheetName = 'Cleaned'
  ) {
    const { cleanedRows } = stripNullColumnsFromRows(rows, columns, nullColumns);
    this.exportToExcel(cleanedRows, fileName, sheetName);
  },

  /**
   * Export entire workbook with multiple sheets, stripping null columns from each sheet
   */
  exportMultiSheetCleanedWorkbook(
    sheets: { sheetName: string; rows: Record<string, unknown>[]; columns: string[]; nullColumns: string[] }[],
    fileName = 'cleaned_workbook.xlsx'
  ) {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, rows, columns, nullColumns }) => {
      const { cleanedRows } = stripNullColumnsFromRows(rows, columns, nullColumns);
      const worksheet = XLSX.utils.json_to_sheet(cleanedRows);
      // Valid Excel sheet names max length is 31 chars
      const safeName = sheetName.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(blob, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  },

  /**
   * Export an array of objects to CSV file
   */
  exportToCsv(data: Record<string, unknown>[], fileName = 'extracted_data.csv') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  },

  /**
   * Export CSV with Null Columns Removed
   */
  exportCleanedCsv(
    rows: Record<string, unknown>[],
    columns: string[],
    nullColumns: string[],
    fileName = 'cleaned_data.csv'
  ) {
    const { cleanedRows } = stripNullColumnsFromRows(rows, columns, nullColumns);
    this.exportToCsv(cleanedRows, fileName);
  },

  /**
   * Export JSON array of records with Null Columns Removed
   */
  exportCleanedJson(
    rows: Record<string, unknown>[],
    columns: string[],
    nullColumns: string[],
    fileName = 'cleaned_data.json'
  ) {
    const { cleanedRows } = stripNullColumnsFromRows(rows, columns, nullColumns);
    const jsonStr = JSON.stringify(cleanedRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, fileName.endsWith('.json') ? fileName : `${fileName}.json`);
  },
};
