import * as XLSX from 'xlsx';

export interface WorkerParseExcelRequest {
  type: 'PARSE_EXCEL';
  id: string;
  data: ArrayBuffer;
  fileName: string;
}

export interface WorkerExportExcelRequest {
  type: 'EXPORT_EXCEL';
  id: string;
  sheets: Array<{
    sheetName: string;
    columns: string[];
    rows: Record<string, unknown>[];
  }>;
  format: 'xlsx' | 'csv' | 'json';
  fileName: string;
}

export interface WorkerCleanTextRequest {
  type: 'CLEAN_TEXT';
  id: string;
  text: string;
  action: 'sortAsc' | 'sortDesc' | 'dedupe' | 'trim' | 'removeEmpty' | 'upper' | 'lower';
}

export interface WorkerFilterRowsRequest {
  type: 'FILTER_ROWS';
  id: string;
  rows: Record<string, unknown>[];
  columns: string[];
  query: string;
}

export type WorkerRequest =
  | WorkerParseExcelRequest
  | WorkerExportExcelRequest
  | WorkerCleanTextRequest
  | WorkerFilterRowsRequest;

export interface WorkerSuccessResponse {
  id: string;
  success: true;
  payload: unknown;
}

export interface WorkerErrorResponse {
  id: string;
  success: false;
  error: string;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

// Helper: check empty cell
function isCellEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return true;
    const lower = trimmed.toLowerCase();
    if (
      lower === 'null' ||
      lower === 'none' ||
      lower === 'na' ||
      lower === 'n/a' ||
      lower === 'nan' ||
      lower === '-' ||
      lower === '#n/a' ||
      lower === '#null!'
    ) {
      return true;
    }
  }
  return false;
}

// Helper: analyze columns
function analyzeColumns(rows: Record<string, unknown>[], columns: string[]) {
  const columnStats: Record<string, unknown> = {};
  const nullColumns: string[] = [];
  const totalRows = rows.length;

  columns.forEach((col) => {
    let filledCount = 0;
    let typeNumber = 0;
    let typeBoolean = 0;
    let typeDate = 0;
    let typeString = 0;
    const samples: string[] = [];
    const sampleLimit = Math.min(totalRows, 5000);

    for (let i = 0; i < sampleLimit; i++) {
      const val = rows[i]?.[col];
      if (!isCellEmpty(val)) {
        filledCount++;
        if (samples.length < 5) samples.push(String(val));
        if (typeof val === 'number') typeNumber++;
        else if (typeof val === 'boolean') typeBoolean++;
        else if (val instanceof Date) typeDate++;
        else {
          const trimmed = String(val).trim();
          if (/^-?\d+(\.\d+)?$/.test(trimmed)) typeNumber++;
          else typeString++;
        }
      }
    }

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

    let inferredType = 'empty';
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

    if (isNullCol) nullColumns.push(col);
  });

  return { columnStats, nullColumns };
}

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  const req = e.data;
  if (!req || !req.type) return;

  try {
    switch (req.type) {
      case 'PARSE_EXCEL': {
        const workbook = XLSX.read(req.data, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const firstSheetName = sheetNames[0] || 'Sheet1';
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: '',
          raw: false,
        });

        const columnSet = new Set<string>();
        const headerMatrix = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        if (headerMatrix.length > 0 && Array.isArray(headerMatrix[0])) {
          headerMatrix[0].forEach((h) => {
            if (h !== undefined && h !== null && String(h).trim() !== '') {
              columnSet.add(String(h).trim());
            }
          });
        }
        rawRows.slice(0, 500).forEach((row) => {
          Object.keys(row).forEach((k) => columnSet.add(k));
        });
        const columns = Array.from(columnSet);

        // Analyze all sheets
        const allSheets: Record<string, { sheetName: string; columns: string[]; rows: Record<string, unknown>[] }> = {};
        sheetNames.forEach((sn) => {
          const ws = workbook.Sheets[sn];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
            defval: '',
            raw: false,
          });
          const cols = new Set<string>();
          const hm = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
          if (hm.length > 0 && Array.isArray(hm[0])) {
            hm[0].forEach((h) => {
              if (h !== undefined && h !== null && String(h).trim() !== '') cols.add(String(h).trim());
            });
          }
          rows.slice(0, 200).forEach((r) => Object.keys(r).forEach((k) => cols.add(k)));
          allSheets[sn] = {
            sheetName: sn,
            columns: Array.from(cols),
            rows,
          };
        });

        const { columnStats, nullColumns } = analyzeColumns(rawRows, columns);

        const response: WorkerSuccessResponse = {
          id: req.id,
          success: true,
          payload: {
            fileName: req.fileName,
            sheetNames,
            activeSheet: firstSheetName,
            columns,
            rows: rawRows,
            totalRowCount: rawRows.length,
            nullColumns,
            columnStats,
            sheets: allSheets,
          },
        };
        self.postMessage(response);
        break;
      }

      case 'EXPORT_EXCEL': {
        if (req.format === 'xlsx') {
          const wb = XLSX.utils.book_new();
          req.sheets.forEach((sheet) => {
            const ws = XLSX.utils.json_to_sheet(sheet.rows, { header: sheet.columns });
            XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName.substring(0, 31));
          });
          const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          (self as any).postMessage(
            {
              id: req.id,
              success: true,
              payload: {
                buffer: outBuffer,
                fileName: req.fileName.endsWith('.xlsx') ? req.fileName : `${req.fileName}.xlsx`,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
            } as WorkerSuccessResponse,
            [outBuffer]
          );
        } else if (req.format === 'csv') {
          const primarySheet = req.sheets[0] || { columns: [], rows: [] };
          const ws = XLSX.utils.json_to_sheet(primarySheet.rows, { header: primarySheet.columns });
          const csvText = XLSX.utils.sheet_to_csv(ws);
          self.postMessage({
            id: req.id,
            success: true,
            payload: {
              text: csvText,
              fileName: req.fileName.endsWith('.csv') ? req.fileName : `${req.fileName}.csv`,
              mimeType: 'text/csv;charset=utf-8',
            },
          } as WorkerSuccessResponse);
        } else {
          // json
          const primarySheet = req.sheets[0] || { rows: [] };
          const jsonText = JSON.stringify(primarySheet.rows, null, 2);
          self.postMessage({
            id: req.id,
            success: true,
            payload: {
              text: jsonText,
              fileName: req.fileName.endsWith('.json') ? req.fileName : `${req.fileName}.json`,
              mimeType: 'application/json;charset=utf-8',
            },
          } as WorkerSuccessResponse);
        }
        break;
      }

      case 'CLEAN_TEXT': {
        const lines = req.text.split('\n');
        let result: string[] = [];

        switch (req.action) {
          case 'sortAsc':
            result = [...lines].sort((a, b) => a.localeCompare(b));
            break;
          case 'sortDesc':
            result = [...lines].sort((a, b) => b.localeCompare(a));
            break;
          case 'dedupe':
            result = Array.from(new Set(lines));
            break;
          case 'trim':
            result = lines.map((l) => l.trim());
            break;
          case 'removeEmpty':
            result = lines.filter((l) => l.trim().length > 0);
            break;
          case 'upper':
            result = [req.text.toUpperCase()];
            break;
          case 'lower':
            result = [req.text.toLowerCase()];
            break;
        }

        self.postMessage({
          id: req.id,
          success: true,
          payload: { text: result.join('\n') },
        } as WorkerSuccessResponse);
        break;
      }

      case 'FILTER_ROWS': {
        const q = req.query.toLowerCase().trim();
        const filtered = !q
          ? req.rows
          : req.rows.filter((r) =>
              req.columns.some((col) => String(r[col] ?? '').toLowerCase().includes(q))
            );
        self.postMessage({
          id: req.id,
          success: true,
          payload: { rows: filtered },
        } as WorkerSuccessResponse);
        break;
      }

      default:
        self.postMessage({
          id: (req as any).id || 'unknown',
          success: false,
          error: `Unknown action type`,
        } as WorkerErrorResponse);
    }
  } catch (err: any) {
    self.postMessage({
      id: req.id || 'unknown',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    } as WorkerErrorResponse);
  }
};
