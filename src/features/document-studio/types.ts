export type StudioFileType =
  | 'excel'
  | 'csv'
  | 'text'
  | 'markdown'
  | 'word'
  | 'pdf'
  | 'code';

export interface SpreadsheetSheet {
  sheetName: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface SpreadsheetContent {
  sheetNames: string[];
  activeSheet: string;
  sheets: Record<string, SpreadsheetSheet>;
}

export interface StudioFile {
  id: string;
  name: string;
  type: StudioFileType;
  content: string | SpreadsheetContent;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
}
