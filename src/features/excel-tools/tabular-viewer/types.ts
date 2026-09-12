import type { SheetDetail } from '@shared/services/file/excelService';

export interface TabularViewerState {
  file: File | null;
  fileName: string;
  sheetNames: string[];
  activeSheetName: string;
  sheets: Record<string, SheetDetail>;
  isProcessing: boolean;
  searchQuery: string;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  hideNullColumns: boolean;
  hiddenColumns: Set<string>;
  selectedRowIndex: number | null;
  isStatsOpen: boolean;
  viewMode: 'virtual' | 'paged';
  page: number;
  rowsPerPage: number;
}

export type ExportType =
  | 'excel-cleaned'
  | 'excel-workbook-cleaned'
  | 'excel-original'
  | 'csv-cleaned'
  | 'csv-original'
  | 'json-cleaned'
  | 'filtered-cleaned';
