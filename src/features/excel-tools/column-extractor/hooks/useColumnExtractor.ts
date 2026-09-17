import { useState } from 'react';
import { excelService, type ParsedSheetData } from '@shared/services/file/excelService';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { setActiveDataset, type ActiveDataset } from '@app/store/slices/sharedDataSlice';
import { auditService } from '@shared/telemetry/audit';
import { usePermissions } from '@registry/hooks/usePermissions';
import { saveAs } from 'file-saver';

// Sample enterprise dataset with both strings, numbers, and codes
const SAMPLE_DATASET: Record<string, unknown>[] = [
  { CustomerID: 'CUST-1049', Company: 'Acme Global', Region: 'North America', AccountNumber: 881024, Seats: 450, MRR: 12500, Status: 'Active' },
  { CustomerID: 'CUST-1050', Company: 'Starlight Tech', Region: 'EMEA', AccountNumber: 881025, Seats: 120, MRR: 3600, Status: 'Active' },
  { CustomerID: 'CUST-1051', Company: 'Omni Retail Inc', Region: 'North America', AccountNumber: 881026, Seats: 890, MRR: 24800, Status: 'Trial' },
  { CustomerID: 'CUST-1052', Company: 'Nexus Fintech', Region: 'APAC', AccountNumber: 881027, Seats: 310, MRR: 9300, Status: 'Active' },
  { CustomerID: 'CUST-1053', Company: 'Vanguard Health', Region: 'North America', AccountNumber: 881028, Seats: 1250, MRR: 38000, Status: 'Active' },
  { CustomerID: 'CUST-1054', Company: 'BlueWave Labs', Region: 'LATAM', AccountNumber: 881029, Seats: 45, MRR: 1350, Status: 'Pending' },
  { CustomerID: 'CUST-1055', Company: 'Zenith Logistics', Region: 'EMEA', AccountNumber: 881030, Seats: 670, MRR: 18900, Status: 'Active' },
  { CustomerID: 'CUST-1056', Company: 'Quantum AI Systems', Region: 'North America', AccountNumber: 881031, Seats: 2100, MRR: 62000, Status: 'Active' },
  { CustomerID: 'CUST-1049', Company: 'Acme Global', Region: 'North America', AccountNumber: 881024, Seats: 450, MRR: 12500, Status: 'Active' }, // duplicate row for testing deduplication
];

export type CommaFormatType = 'strings' | 'numbers' | 'raw';
export type CommaQuoteStyle = 'single' | 'double' | 'none';
export type CommaWrapBrackets = 'none' | 'parentheses' | 'brackets' | 'curly';

export interface CommaStats {
  totalRows: number;
  extractedCount: number;
  duplicatesRemoved: number;
  nonNumericSkipped: number;
}

export const useColumnExtractor = () => {
  const dispatch = useAppDispatch();
  const { user } = usePermissions();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSheetData | null>(null);

  // Mode: 'comma' (comma separated strings/numbers) vs 'table' (sub-table columns)
  const [activeTab, setActiveTab] = useState<number>(0);

  // Table extraction state
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [extractedRows, setExtractedRows] = useState<Record<string, unknown>[] | null>(null);
  const [searchColumnQuery, setSearchColumnQuery] = useState('');

  // Comma-separated extraction configuration
  const [targetColumn, setTargetColumn] = useState<string>('CustomerID');
  const [formatType, setFormatType] = useState<CommaFormatType>('strings');
  const [quoteStyle, setQuoteStyle] = useState<CommaQuoteStyle>('single');
  const [delimiter, setDelimiter] = useState<string>(', ');
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [ignoreBlank, setIgnoreBlank] = useState<boolean>(true);
  const [trimValues, setTrimValues] = useState<boolean>(true);
  const [wrapBrackets, setWrapBrackets] = useState<CommaWrapBrackets>('none');
  const [commaResult, setCommaResult] = useState<string>('');
  const [commaStats, setCommaStats] = useState<CommaStats | null>(null);

  const handleFileSelect = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setIsProcessing(true);
      setExtractedRows(null);
      setCommaResult('');
      setCommaStats(null);

      const parsed = await fileWorkerClient.parseExcelFile(uploadedFile);
      setParsedData(parsed);
      setSelectedColumns(parsed.columns.slice(0, 3));
      if (parsed.columns.length > 0) {
        setTargetColumn(parsed.columns[0]);
      }

      // Sync with cross-tool Redux shared dataset
      const isCsv = uploadedFile.name.toLowerCase().endsWith('.csv');
      dispatch(
        setActiveDataset({
          id: `dataset-${Date.now()}`,
          fileName: uploadedFile.name,
          fileType: isCsv ? 'csv' : 'xlsx',
          uploadedAt: new Date().toISOString(),
          sheetNames: parsed.sheetNames,
          activeSheet: parsed.activeSheet,
          sheets: {
            [parsed.activeSheet]: {
              sheetName: parsed.activeSheet,
              columns: parsed.columns,
              rows: parsed.rows,
              totalRowCount: parsed.totalRowCount,
              nullColumns: parsed.nullColumns || [],
            },
          },
          sourceTool: 'Column Extractor',
        })
      );

      dispatch(
        showToast({
          message: `Loaded "${uploadedFile.name}" with ${parsed.totalRowCount} rows and ${parsed.columns.length} columns (Web Worker).`,
          severity: 'success',
        })
      );
    } catch (err) {
      dispatch(
        showToast({
          message: `Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error',
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSharedDataset = (dataset: ActiveDataset) => {
    const activeSheet = dataset.sheets[dataset.activeSheet] || Object.values(dataset.sheets)[0];
    if (!activeSheet) return;
    const parsed: ParsedSheetData = {
      fileName: dataset.fileName,
      sheetNames: dataset.sheetNames,
      activeSheet: activeSheet.sheetName,
      columns: activeSheet.columns,
      rows: activeSheet.rows,
      totalRowCount: activeSheet.totalRowCount,
      nullColumns: activeSheet.nullColumns,
    };
    setParsedData(parsed);
    setSelectedColumns(parsed.columns.slice(0, 3));
    if (parsed.columns.length > 0) {
      setTargetColumn(parsed.columns[0]);
    }
    setExtractedRows(null);
    setCommaResult('');
    setCommaStats(null);
  };

  const loadSampleData = () => {
    const columns = Object.keys(SAMPLE_DATASET[0]);
    setFile(new File(['sample'], 'enterprise_accounts_2025.xlsx', { type: 'application/vnd.ms-excel' }));
    setParsedData({
      fileName: 'enterprise_accounts_2025.xlsx',
      sheetNames: ['Accounts'],
      activeSheet: 'Accounts',
      columns,
      rows: SAMPLE_DATASET,
      totalRowCount: SAMPLE_DATASET.length,
    });
    setSelectedColumns(['CustomerID', 'Company', 'MRR', 'Status']);
    setTargetColumn('CustomerID');
    setExtractedRows(null);
    setCommaResult('');
    setCommaStats(null);
    dispatch(showToast({ message: 'Loaded sample enterprise dataset with customer accounts and numbers', severity: 'info' }));
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const selectAllColumns = () => {
    if (parsedData) {
      setSelectedColumns([...parsedData.columns]);
    }
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  // Extract Comma Separated Strings or Numbers
  const extractCommaSeparated = () => {
    if (!parsedData) return;
    if (!targetColumn) {
      dispatch(showToast({ message: 'Please select a column to extract', severity: 'warning' }));
      return;
    }

    let nonNumericCount = 0;
    let rawValues = parsedData.rows.map((row) => {
      const val = row[targetColumn];
      if (val === null || val === undefined) return '';
      return String(val);
    });

    // 1. Trim whitespace
    if (trimValues) {
      rawValues = rawValues.map((v) => v.trim());
    }

    // 2. Filter empty/blank values
    if (ignoreBlank) {
      rawValues = rawValues.filter((v) => v.length > 0);
    }

    // 3. Number formatting / extraction filter
    if (formatType === 'numbers') {
      const numericList: string[] = [];
      rawValues.forEach((v) => {
        // Strip commas and currency symbols if present
        const cleaned = v.replace(/[$,]/g, '').trim();
        const num = Number(cleaned);
        if (!isNaN(num) && cleaned !== '') {
          numericList.push(cleaned);
        } else {
          nonNumericCount++;
        }
      });
      rawValues = numericList;
    }

    // 4. Deduplication
    const originalCount = rawValues.length;
    if (deduplicate) {
      rawValues = Array.from(new Set(rawValues));
    }
    const duplicatesRemoved = originalCount - rawValues.length;

    // 5. Quoting
    const formattedValues = rawValues.map((v) => {
      if (formatType === 'numbers' || quoteStyle === 'none') {
        return v;
      }
      if (quoteStyle === 'single') {
        return `'${v.replace(/'/g, "''")}'`;
      }
      if (quoteStyle === 'double') {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    });

    // 6. Delimiter joining
    let output = formattedValues.join(delimiter);

    // 7. Enclose in brackets if requested
    if (wrapBrackets === 'parentheses') {
      output = `(${output})`;
    } else if (wrapBrackets === 'brackets') {
      output = `[${output}]`;
    } else if (wrapBrackets === 'curly') {
      output = `{${output}}`;
    }

    setCommaResult(output);
    setCommaStats({
      totalRows: parsedData.totalRowCount,
      extractedCount: rawValues.length,
      duplicatesRemoved,
      nonNumericSkipped: nonNumericCount,
    });

    auditService.record('TOOL_EXECUTED', user.name, 'excel.column-extractor', {
      mode: 'comma-separated',
      column: targetColumn,
      formatType,
      count: rawValues.length,
    });

    dispatch(
      showToast({
        message: `Extracted ${rawValues.length} comma-separated ${formatType} from column "${targetColumn}"`,
        severity: 'success',
      })
    );
  };

  // Download comma separated text
  const downloadCommaText = (extension: 'txt' | 'csv' = 'txt') => {
    if (!commaResult) return;
    const blob = new Blob([commaResult], { type: 'text/plain;charset=utf-8' });
    const filename = `${targetColumn}_comma_separated.${extension}`;
    saveAs(blob, filename);
    auditService.record('TOOL_EXPORTED', user.name, 'excel.column-extractor', { format: extension });
    dispatch(showToast({ message: `Downloaded ${filename}`, severity: 'success' }));
  };

  // Table extraction via worker
  const extractTable = async () => {
    if (!parsedData) return;
    if (selectedColumns.length === 0) {
      dispatch(showToast({ message: 'Please select at least one column to extract', severity: 'warning' }));
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fileWorkerClient.extractColumns(parsedData.rows, selectedColumns);
      setExtractedRows(res.extractedRows);
      auditService.record('TOOL_EXECUTED', user.name, 'excel.column-extractor', {
        mode: 'table',
        totalRows: parsedData.totalRowCount,
        columnsExtracted: selectedColumns.length,
        columns: selectedColumns,
      });
      dispatch(
        showToast({
          message: `Extracted ${selectedColumns.length} columns across ${res.extractedRows.length} rows (Web Worker).`,
          severity: 'success',
        })
      );
    } catch (err) {
      dispatch(showToast({ message: `Extraction failed: ${err instanceof Error ? err.message : String(err)}`, severity: 'error' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData(null);
    setSelectedColumns([]);
    setExtractedRows(null);
    setSearchColumnQuery('');
    setCommaResult('');
    setCommaStats(null);
  };

  const exportExcel = async () => {
    if (!extractedRows || extractedRows.length === 0) return;
    try {
      const baseName = `extracted_${parsedData?.fileName?.replace(/\.[^/.]+$/, '') || 'dataset'}`;
      const res = await fileWorkerClient.exportSpreadsheet(
        [{ sheetName: 'Extracted', columns: selectedColumns, rows: extractedRows }],
        'xlsx',
        `${baseName}.xlsx`
      );
      if (res.buffer) {
        saveAs(new Blob([res.buffer], { type: res.mimeType }), res.fileName);
      }
      auditService.record('TOOL_EXPORTED', user.name, 'excel.column-extractor', { format: 'xlsx' });
      dispatch(showToast({ message: `Exported ${res.fileName} successfully`, severity: 'success' }));
    } catch {
      excelService.exportToExcel(extractedRows, `extracted_${parsedData?.fileName || 'dataset'}`);
    }
  };

  const exportCsv = async () => {
    if (!extractedRows || extractedRows.length === 0) return;
    try {
      const baseName = `extracted_${parsedData?.fileName?.replace(/\.[^/.]+$/, '') || 'dataset'}`;
      const res = await fileWorkerClient.exportSpreadsheet(
        [{ sheetName: 'Extracted', columns: selectedColumns, rows: extractedRows }],
        'csv',
        `${baseName}.csv`
      );
      if (res.text) {
        saveAs(new Blob([res.text], { type: res.mimeType }), res.fileName);
      }
      auditService.record('TOOL_EXPORTED', user.name, 'excel.column-extractor', { format: 'csv' });
      dispatch(showToast({ message: `Exported ${res.fileName} successfully`, severity: 'success' }));
    } catch {
      excelService.exportToCsv(extractedRows, `extracted_${parsedData?.fileName || 'dataset'}`);
    }
  };

  return {
    file,
    isProcessing,
    parsedData,
    activeTab,
    setActiveTab,

    // Comma-separated mode state
    targetColumn,
    setTargetColumn,
    formatType,
    setFormatType,
    quoteStyle,
    setQuoteStyle,
    delimiter,
    setDelimiter,
    deduplicate,
    setDeduplicate,
    ignoreBlank,
    setIgnoreBlank,
    trimValues,
    setTrimValues,
    wrapBrackets,
    setWrapBrackets,
    commaResult,
    commaStats,
    extractCommaSeparated,
    downloadCommaText,

    // Table extraction mode state
    selectedColumns,
    extractedRows,
    searchColumnQuery,
    setSearchColumnQuery,
    handleFileSelect,
    loadSampleData,
    loadSharedDataset,
    toggleColumn,
    selectAllColumns,
    deselectAllColumns,
    extractTable,
    reset,
    exportExcel,
    exportCsv,
  };
};
