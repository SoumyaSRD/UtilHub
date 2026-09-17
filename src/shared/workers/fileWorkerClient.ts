import * as XLSX from 'xlsx';
import type {
  WorkerRequest,
  WorkerResponse,
  WorkerSuccessResponse,
} from './fileProcessor.worker';

class FileWorkerClient {
  private worker: Worker | null = null;
  private pendingRequests: Map<
    string,
    {
      resolve: (val: any) => void;
      reject: (err: Error) => void;
      timeoutId: any;
    }
  > = new Map();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(
          new URL('./fileProcessor.worker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const res = event.data;
          if (!res || !res.id) return;

          const pending = this.pendingRequests.get(res.id);
          if (pending) {
            clearTimeout(pending.timeoutId);
            this.pendingRequests.delete(res.id);
            if (res.success) {
              pending.resolve((res as WorkerSuccessResponse).payload);
            } else {
              pending.reject(new Error(res.error || 'Worker operation failed'));
            }
          }
        };

        this.worker.onerror = (error) => {
          console.error('[FileWorkerClient] Worker Error:', error);
          this.pendingRequests.forEach(({ reject, timeoutId }) => {
            clearTimeout(timeoutId);
            reject(new Error('Worker encountered an unrecoverable error'));
          });
          this.pendingRequests.clear();
        };
      } catch (e) {
        console.warn('[FileWorkerClient] Could not initialize Web Worker, falling back to main thread:', e);
        this.worker = null;
      }
    }
  }

  private postRequest<T>(req: WorkerRequest, timeoutMs = 60000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread execution
        this.executeOnMainThread<T>(req).then(resolve).catch(reject);
        return;
      }

      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(req.id)) {
          this.pendingRequests.delete(req.id);
          reject(new Error(`Worker operation timed out after ${timeoutMs / 1000}s`));
        }
      }, timeoutMs);

      this.pendingRequests.set(req.id, { resolve, reject, timeoutId });

      if (req.type === 'PARSE_EXCEL') {
        this.worker.postMessage(req, [req.data]);
      } else {
        this.worker.postMessage(req);
      }
    });
  }

  /**
   * Main thread fallback if worker unavailable
   */
  private async executeOnMainThread<T>(req: WorkerRequest): Promise<T> {
    switch (req.type) {
      case 'PARSE_EXCEL': {
        const workbook = XLSX.read(req.data, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const firstSheetName = sheetNames[0] || 'Sheet1';
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false });
        const columnSet = new Set<string>();
        rawRows.slice(0, 500).forEach((row) => Object.keys(row).forEach((k) => columnSet.add(k)));
        const columns = Array.from(columnSet);
        const allSheets: Record<string, { sheetName: string; columns: string[]; rows: Record<string, unknown>[] }> = {};
        sheetNames.forEach((sn) => {
          const ws = workbook.Sheets[sn];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '', raw: false });
          const cols = new Set<string>();
          rows.slice(0, 200).forEach((r) => Object.keys(r).forEach((k) => cols.add(k)));
          allSheets[sn] = { sheetName: sn, columns: Array.from(cols), rows };
        });
        return {
          fileName: req.fileName,
          sheetNames,
          activeSheet: firstSheetName,
          columns,
          rows: rawRows,
          totalRowCount: rawRows.length,
          nullColumns: [],
          columnStats: {},
          sheets: allSheets,
        } as unknown as T;
      }
      case 'EXPORT_EXCEL': {
        if (req.format === 'xlsx') {
          const wb = XLSX.utils.book_new();
          req.sheets.forEach((sheet) => {
            const ws = XLSX.utils.json_to_sheet(sheet.rows, { header: sheet.columns });
            XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName.substring(0, 31));
          });
          const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          return {
            buffer: outBuffer,
            fileName: req.fileName.endsWith('.xlsx') ? req.fileName : `${req.fileName}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          } as unknown as T;
        } else if (req.format === 'csv') {
          const primarySheet = req.sheets[0] || { columns: [], rows: [] };
          const ws = XLSX.utils.json_to_sheet(primarySheet.rows, { header: primarySheet.columns });
          return {
            text: XLSX.utils.sheet_to_csv(ws),
            fileName: req.fileName.endsWith('.csv') ? req.fileName : `${req.fileName}.csv`,
            mimeType: 'text/csv;charset=utf-8',
          } as unknown as T;
        } else {
          const primarySheet = req.sheets[0] || { rows: [] };
          return {
            text: JSON.stringify(primarySheet.rows, null, 2),
            fileName: req.fileName.endsWith('.json') ? req.fileName : `${req.fileName}.json`,
            mimeType: 'application/json;charset=utf-8',
          } as unknown as T;
        }
      }
      case 'CLEAN_TEXT': {
        const lines = req.text.split('\n');
        let res: string[] = [];
        if (req.action === 'sortAsc') res = [...lines].sort((a, b) => a.localeCompare(b));
        else if (req.action === 'sortDesc') res = [...lines].sort((a, b) => b.localeCompare(a));
        else if (req.action === 'dedupe') res = Array.from(new Set(lines));
        else if (req.action === 'trim') res = lines.map((l) => l.trim());
        else if (req.action === 'removeEmpty') res = lines.filter((l) => l.trim().length > 0);
        else if (req.action === 'upper') res = [req.text.toUpperCase()];
        else res = [req.text.toLowerCase()];
        return { text: res.join('\n') } as unknown as T;
      }
      case 'FILTER_ROWS': {
        const q = req.query.toLowerCase().trim();
        const filtered = !q
          ? req.rows
          : req.rows.filter((r) =>
              req.columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q))
            );
        return { rows: filtered } as unknown as T;
      }
    }
  }

  /**
   * Parse Excel or CSV file via worker
   */
  public async parseExcelFile(file: File): Promise<{
    fileName: string;
    sheetNames: string[];
    activeSheet: string;
    columns: string[];
    rows: Record<string, unknown>[];
    totalRowCount: number;
    nullColumns: string[];
    columnStats: Record<string, any>;
    sheets: Record<string, { sheetName: string; columns: string[]; rows: Record<string, unknown>[] }>;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const id = `parse-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return this.postRequest({
      type: 'PARSE_EXCEL',
      id,
      data: arrayBuffer,
      fileName: file.name,
    });
  }

  /**
   * Export workbook or sheet to XLSX, CSV, or JSON
   */
  public async exportSpreadsheet(
    sheets: Array<{
      sheetName: string;
      columns: string[];
      rows: Record<string, unknown>[];
    }>,
    format: 'xlsx' | 'csv' | 'json',
    fileName: string
  ): Promise<{ buffer?: ArrayBuffer; text?: string; fileName: string; mimeType: string }> {
    const id = `export-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return this.postRequest({
      type: 'EXPORT_EXCEL',
      id,
      sheets,
      format,
      fileName,
    });
  }

  /**
   * Perform heavy line cleaning / case conversion
   */
  public async cleanText(
    text: string,
    action: 'sortAsc' | 'sortDesc' | 'dedupe' | 'trim' | 'removeEmpty' | 'upper' | 'lower'
  ): Promise<string> {
    const id = `clean-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await this.postRequest<{ text: string }>({
      type: 'CLEAN_TEXT',
      id,
      text,
      action,
    });
    return res.text;
  }

  /**
   * Filter large row dataset
   */
  public async filterRows(
    rows: Record<string, unknown>[],
    columns: string[],
    query: string
  ): Promise<Record<string, unknown>[]> {
    const id = `filter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await this.postRequest<{ rows: Record<string, unknown>[] }>({
      type: 'FILTER_ROWS',
      id,
      rows,
      columns,
      query,
    });
    return res.rows;
  }
}

export const fileWorkerClient = new FileWorkerClient();
