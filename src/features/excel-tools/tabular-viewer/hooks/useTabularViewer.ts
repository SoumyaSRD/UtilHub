import { useState, useMemo } from 'react';
import {
  excelService,
  type SheetDetail,
  analyzeColumns,
  stripNullColumnsFromRows,
} from '@shared/services/file/excelService';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { setActiveDataset, type ActiveDataset } from '@app/store/slices/sharedDataSlice';
import { auditService } from '@shared/telemetry/audit';
import { usePermissions } from '@registry/hooks/usePermissions';
import type { ExportType } from '../types';

export const useTabularViewer = () => {
  const dispatch = useAppDispatch();
  const { user } = usePermissions();

  const [files, setFiles] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [sheets, setSheets] = useState<Record<string, SheetDetail>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined);

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Column Visibility & Null Column Remover state
  const [hideNullColumns, setHideNullColumns] = useState<boolean>(false);
  const [treatTextNulls, setTreatTextNulls] = useState<boolean>(true);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // UI state
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'virtual' | 'paged'>('virtual');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);

  // Active Sheet
  const currentSheet = useMemo<SheetDetail | null>(() => {
    if (!activeSheetName || !sheets[activeSheetName]) return null;
    return sheets[activeSheetName];
  }, [activeSheetName, sheets]);

  // Detected null columns in the current sheet (recalculated if treatTextNulls changes)
  const nullColumns = useMemo<string[]>(() => {
    if (!currentSheet) return [];
    // If treatTextNulls is toggled, re-analyze columns
    const { nullColumns: detected } = analyzeColumns(currentSheet.rows, currentSheet.columns, treatTextNulls);
    return detected;
  }, [currentSheet, treatTextNulls]);

  // Visible columns for the table
  const visibleColumns = useMemo<string[]>(() => {
    if (!currentSheet) return [];
    return currentSheet.columns.filter((col) => {
      if (hiddenColumns.has(col)) return false;
      if (hideNullColumns && nullColumns.includes(col)) return false;
      return true;
    });
  }, [currentSheet, hiddenColumns, hideNullColumns, nullColumns]);

  // Multi-file selection and parsing (supports multiple CSVs or Excel workbooks)
  const handleFilesSelect = async (uploadedFiles: File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    try {
      setFiles(uploadedFiles);
      setFile(uploadedFiles[0]);
      setFileName(
        uploadedFiles.length === 1
          ? uploadedFiles[0].name
          : `${uploadedFiles.length} files (${uploadedFiles.map((f) => f.name).join(', ')})`
      );
      setIsProcessing(true);
      setProgressPercent(25);

      const parsed = await excelService.parseMultipleFiles(uploadedFiles);
      setProgressPercent(85);

      setSheetNames(parsed.sheetNames);
      setSheets(parsed.sheets);

      const initialSheet = parsed.sheetNames[0] || '';
      setActiveSheetName(initialSheet);
      setHiddenColumns(new Set());
      setSearchQuery('');
      setSortColumn(null);
      setSortDirection(null);
      setPage(0);

      const initialSheetDetail = parsed.sheets[initialSheet];
      const totalNullCols = initialSheetDetail?.nullColumns.length || 0;
      const isCsv = uploadedFiles.some((f) => f.name.toLowerCase().endsWith('.csv'));

      // Populate cross-tool Redux shared dataset
      dispatch(
        setActiveDataset({
          id: `dataset-${Date.now()}`,
          fileName:
            uploadedFiles.length === 1
              ? uploadedFiles[0].name
              : `${uploadedFiles.length} files (${uploadedFiles.map((f) => f.name).join(', ')})`,
          fileType: isCsv ? 'csv' : 'xlsx',
          uploadedAt: new Date().toISOString(),
          sheetNames: parsed.sheetNames,
          activeSheet: initialSheet,
          sheets: Object.entries(parsed.sheets).reduce((acc, [sName, sData]) => {
            acc[sName] = {
              sheetName: sName,
              columns: sData.columns,
              rows: sData.rows,
              totalRowCount: sData.totalRowCount,
              nullColumns: sData.nullColumns,
            };
            return acc;
          }, {} as ActiveDataset['sheets']),
          sourceTool: 'Tabular Viewer',
        })
      );

      dispatch(
        showToast({
          message: `Loaded ${uploadedFiles.length} file(s) into ${parsed.sheetNames.length} tab(s) with ${initialSheetDetail?.totalRowCount.toLocaleString()} rows in active tab.${
            totalNullCols > 0 ? ` (${totalNullCols} empty column(s) detected)` : ''
          }`,
          severity: 'success',
        })
      );

      auditService.record('TOOL_EXECUTED', user.name, 'excel.tabular-viewer', {
        action: isCsv ? 'csv_parsed' : 'excel_parsed',
        filesCount: uploadedFiles.length,
        sheetsCount: parsed.sheetNames.length,
      });
    } catch (err) {
      dispatch(
        showToast({
          message: `Failed to parse files: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error',
        })
      );
    } finally {
      setIsProcessing(false);
      setProgressPercent(undefined);
    }
  };

  const handleFileSelect = (singleFile: File) => {
    handleFilesSelect([singleFile]);
  };

  // Switch dynamic sheet tab
  const handleSheetChange = (newSheetName: string) => {
    setActiveSheetName(newSheetName);
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection(null);
    setPage(0);
    setSelectedRow(null);
    setSelectedRowNumber(null);
  };

  // Column toggle
  const toggleColumnVisibility = (columnName: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnName)) {
        next.delete(columnName);
      } else {
        next.add(columnName);
      }
      return next;
    });
  };

  const showAllColumns = () => {
    setHiddenColumns(new Set());
    setHideNullColumns(false);
  };

  // Sorting handler
  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  // Filter and Sort rows
  const processedRows = useMemo(() => {
    if (!currentSheet) return [];
    let rows = currentSheet.rows;

    // 1. Search Query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) => {
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. Sorting
    if (sortColumn && sortDirection) {
      const dir = sortDirection === 'asc' ? 1 : -1;
      const col = sortColumn;

      rows = [...rows].sort((a, b) => {
        const valA = a[col];
        const valB = b[col];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }

        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && String(valA).trim() !== '' && String(valB).trim() !== '') {
          return (numA - numB) * dir;
        }

        return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
      });
    }

    return rows;
  }, [currentSheet, searchQuery, sortColumn, sortDirection]);

  // Load High-Volume 100,000+ Records Multi-CSV Demo
  const loadLargeCsvDemo = (targetRows = 100000) => {
    setIsProcessing(true);
    setProgressPercent(25);

    setTimeout(() => {
      const countries = ['United States', 'Germany', 'Japan', 'United Kingdom', 'Canada', 'Australia', 'India', 'France'];
      const statuses = ['Active', 'Pending', 'Verified', 'Suspended', 'Trial'];
      const tiers = ['Enterprise', 'Growth', 'Starter', 'Professional'];
      const paymentMethods = ['Credit Card', 'Wire Transfer', 'ACH', 'PayPal'];

      const customerRows: Record<string, unknown>[] = new Array(targetRows);

      for (let i = 0; i < targetRows; i++) {
        customerRows[i] = {
          CustomerID: `CSV-CUST-${100000 + i}`,
          Company: `Global Enterprise ${(i % 800) + 1}`,
          Country: countries[i % countries.length],
          SubscriptionTier: tiers[i % tiers.length],
          PaymentMethod: paymentMethods[i % paymentMethods.length],
          MonthlySpendUSD: Number((1200 + ((i * 47) % 48000)).toFixed(2)),
          Status: statuses[i % statuses.length],
          // Intentionally empty CSV columns with various CSV null representations:
          MiddleInitial: '',
          FaxNumber: '   ',
          LegacyTaxExemptId: 'NULL',
          DeprecatedSecondaryEmail: 'NA',
          InternalAuditNotes: 'N/A',
        };
      }

      // Sheet 2: Transactions CSV (25,000 rows)
      const txnRowsCount = 25000;
      const txnRows: Record<string, unknown>[] = new Array(txnRowsCount);
      for (let i = 0; i < txnRowsCount; i++) {
        txnRows[i] = {
          TransactionID: `TXN-${900000 + i}`,
          CustomerID: `CSV-CUST-${100000 + (i % targetRows)}`,
          InvoiceNumber: `INV-2026-${1000 + (i % 5000)}`,
          AmountUSD: Number((150 + ((i * 83) % 12000)).toFixed(2)),
          Status: i % 12 === 0 ? 'Disputed' : 'Settled',
          // Intentionally empty CSV columns:
          DiscountPromoCode: 'None',
          MerchantMemo: '',
          ChargebackReason: '-',
        };
      }

      const custColumns = Object.keys(customerRows[0]);
      const custAnalysis = analyzeColumns(customerRows, custColumns, treatTextNulls);

      const txnColumns = Object.keys(txnRows[0]);
      const txnAnalysis = analyzeColumns(txnRows, txnColumns, treatTextNulls);

      const demoSheets: Record<string, SheetDetail> = {
        'customers_100k.csv': {
          sheetName: 'customers_100k.csv',
          columns: custColumns,
          rows: customerRows,
          totalRowCount: customerRows.length,
          nullColumns: custAnalysis.nullColumns,
          columnStats: custAnalysis.columnStats,
          fileType: 'csv',
        },
        'transactions_25k.csv': {
          sheetName: 'transactions_25k.csv',
          columns: txnColumns,
          rows: txnRows,
          totalRowCount: txnRows.length,
          nullColumns: txnAnalysis.nullColumns,
          columnStats: txnAnalysis.columnStats,
          fileType: 'csv',
        },
      };

      const demoFile = new File(['demo_csv'], 'customers_and_transactions.csv', { type: 'text/csv' });
      setFiles([demoFile]);
      setFile(demoFile);
      setFileName('customers_and_transactions_100k_demo.csv');
      setSheetNames(Object.keys(demoSheets));
      setSheets(demoSheets);
      setActiveSheetName('customers_100k.csv');
      setHiddenColumns(new Set());
      setHideNullColumns(false);
      setSearchQuery('');
      setSortColumn(null);
      setSortDirection(null);
      setPage(0);
      setIsProcessing(false);
      setProgressPercent(undefined);

      dispatch(
        showToast({
          message: `Loaded 125,000 rows across 2 CSV tabs with 8 detected empty CSV columns (handled "", "NULL", "NA", "-").`,
          severity: 'success',
        })
      );
    }, 100);
  };

  // Load High-Volume 100,000+ Records Excel Multi-Tab Dataset
  const loadLargeDemoDataset = (targetRows = 100000) => {
    setIsProcessing(true);
    setProgressPercent(20);

    setTimeout(() => {
      const countries = ['United States', 'Germany', 'Japan', 'United Kingdom', 'Canada', 'Australia', 'India', 'France'];
      const statuses = ['Active', 'Pending', 'Verified', 'Suspended', 'Trial'];
      const tiers = ['Enterprise', 'Growth', 'Starter', 'Professional'];
      const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'Liam', 'Ava', 'Noah', 'Isabella', 'William', 'Mia'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor'];

      const customerRowsCount = targetRows;
      const customerRows: Record<string, unknown>[] = new Array(customerRowsCount);

      for (let i = 0; i < customerRowsCount; i++) {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[(i * 3) % lastNames.length];
        customerRows[i] = {
          CustomerID: `CUST-${100000 + i}`,
          FullName: `${fn} ${ln}`,
          Company: `Company ${(i % 500) + 1} Corp`,
          Email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 1000}@enterprise.io`,
          Country: countries[i % countries.length],
          SubscriptionTier: tiers[i % tiers.length],
          AnnualRevenue: Math.floor(10000 + ((i * 137) % 950000)),
          AccountScore: Number((60 + ((i * 7) % 40) + ((i % 10) * 0.1)).toFixed(1)),
          Status: statuses[i % statuses.length],
          // Intentionally completely null / empty columns:
          MiddleName: null,
          FaxNumber: '',
          LegacySystemCode: undefined,
          DeprecatedNotes: '',
        };
      }

      // Sheet 2: Orders (30,000 rows)
      const orderRowsCount = 30000;
      const orderRows: Record<string, unknown>[] = new Array(orderRowsCount);
      for (let i = 0; i < orderRowsCount; i++) {
        orderRows[i] = {
          OrderID: `ORD-${500000 + i}`,
          CustomerID: `CUST-${100000 + (i % customerRowsCount)}`,
          ProductSKU: `SKU-${100 + (i % 45)}`,
          Quantity: (i % 10) + 1,
          UnitPrice: 49.99 + (i % 50) * 10,
          TotalAmount: Number(((i % 10 + 1) * (49.99 + (i % 50) * 10)).toFixed(2)),
          Status: i % 15 === 0 ? 'Refunded' : i % 5 === 0 ? 'Processing' : 'Completed',
          DiscountCode: null,
          InternalReturnMemo: '',
          ApproverSignOff: undefined,
        };
      }

      const custColumns = Object.keys(customerRows[0]);
      const custAnalysis = analyzeColumns(customerRows, custColumns, treatTextNulls);

      const ordColumns = Object.keys(orderRows[0]);
      const ordAnalysis = analyzeColumns(orderRows, ordColumns, treatTextNulls);

      const demoSheets: Record<string, SheetDetail> = {
        'Customers (100k)': {
          sheetName: 'Customers (100k)',
          columns: custColumns,
          rows: customerRows,
          totalRowCount: customerRows.length,
          nullColumns: custAnalysis.nullColumns,
          columnStats: custAnalysis.columnStats,
          fileType: 'xlsx',
        },
        'Orders': {
          sheetName: 'Orders',
          columns: ordColumns,
          rows: orderRows,
          totalRowCount: orderRows.length,
          nullColumns: ordAnalysis.nullColumns,
          columnStats: ordAnalysis.columnStats,
          fileType: 'xlsx',
        },
      };

      const demoFile = new File(['demo'], 'enterprise_multisheet_100k_demo.xlsx', { type: 'application/vnd.ms-excel' });
      setFiles([demoFile]);
      setFile(demoFile);
      setFileName('enterprise_multisheet_100k_demo.xlsx');
      setSheetNames(Object.keys(demoSheets));
      setSheets(demoSheets);
      setActiveSheetName('Customers (100k)');
      setHiddenColumns(new Set());
      setHideNullColumns(false);
      setSearchQuery('');
      setSortColumn(null);
      setSortDirection(null);
      setPage(0);
      setIsProcessing(false);
      setProgressPercent(undefined);

      dispatch(
        showToast({
          message: `Generated 130,000+ records multi-sheet workbook with 2 tabs and 7 detected empty columns for testing.`,
          severity: 'success',
        })
      );
    }, 100);
  };

  // Multi-Format Export Handler (Excel & CSV)
  const exportData = (type: ExportType) => {
    if (!currentSheet) return;
    const baseName = (fileName || 'dataset').replace(/\.[^/.]+$/, '');
    const cleanSheetTitle = currentSheet.sheetName.replace(/\.[^/.]+$/, '');

    switch (type) {
      case 'csv-cleaned': {
        excelService.exportCleanedCsv(
          currentSheet.rows,
          currentSheet.columns,
          nullColumns,
          `${baseName}_${cleanSheetTitle}_cleaned.csv`,
          ','
        );
        dispatch(
          showToast({
            message: `Exported cleaned CSV without ${nullColumns.length} empty column(s).`,
            severity: 'success',
          })
        );
        break;
      }

      case 'csv-cleaned-semicolon': {
        excelService.exportCleanedCsv(
          currentSheet.rows,
          currentSheet.columns,
          nullColumns,
          `${baseName}_${cleanSheetTitle}_cleaned_semicolon.csv`,
          ';'
        );
        dispatch(showToast({ message: 'Exported cleaned semicolon-separated CSV (;).', severity: 'success' }));
        break;
      }

      case 'csv-cleaned-tab': {
        excelService.exportCleanedCsv(
          currentSheet.rows,
          currentSheet.columns,
          nullColumns,
          `${baseName}_${cleanSheetTitle}_cleaned_tab.tsv`,
          '\t'
        );
        dispatch(showToast({ message: 'Exported cleaned TSV (Tab-separated).', severity: 'success' }));
        break;
      }

      case 'csv-all-tabs-cleaned': {
        const sheetsToExport = sheetNames.map((sName) => {
          const detail = sheets[sName];
          return {
            sheetName: detail.sheetName,
            rows: detail.rows,
            columns: detail.columns,
            nullColumns: detail.nullColumns,
          };
        });
        excelService.exportAllTabsAsCleanedCsv(sheetsToExport, baseName, ',');
        dispatch(
          showToast({
            message: `Exported ${sheetsToExport.length} cleaned CSV files (one per tab) without null columns.`,
            severity: 'success',
          })
        );
        break;
      }

      case 'csv-filtered-cleaned': {
        const { cleanedRows } = stripNullColumnsFromRows(
          processedRows,
          currentSheet.columns,
          nullColumns
        );
        excelService.exportToCsv(
          cleanedRows,
          `${baseName}_${cleanSheetTitle}_filtered_${processedRows.length}.csv`,
          ','
        );
        dispatch(
          showToast({
            message: `Exported ${processedRows.length} filtered rows as cleaned CSV.`,
            severity: 'success',
          })
        );
        break;
      }

      case 'csv-original': {
        excelService.exportToCsv(
          currentSheet.rows,
          `${baseName}_${cleanSheetTitle}_raw.csv`,
          ','
        );
        dispatch(showToast({ message: 'Exported original CSV as-is.', severity: 'info' }));
        break;
      }

      case 'excel-cleaned': {
        excelService.exportCleanedExcel(
          currentSheet.rows,
          currentSheet.columns,
          nullColumns,
          `${baseName}_${cleanSheetTitle}_cleaned.xlsx`,
          currentSheet.sheetName.slice(0, 31)
        );
        dispatch(
          showToast({
            message: `Exported cleaned Excel sheet without ${nullColumns.length} null column(s).`,
            severity: 'success',
          })
        );
        break;
      }

      case 'excel-workbook-cleaned': {
        const sheetsToExport = sheetNames.map((sName) => {
          const detail = sheets[sName];
          return {
            sheetName: detail.sheetName,
            rows: detail.rows,
            columns: detail.columns,
            nullColumns: detail.nullColumns,
          };
        });
        excelService.exportMultiSheetCleanedWorkbook(
          sheetsToExport,
          `${baseName}_full_workbook_cleaned.xlsx`
        );
        dispatch(
          showToast({
            message: `Exported full workbook (${sheetsToExport.length} tabs) with empty columns removed.`,
            severity: 'success',
          })
        );
        break;
      }

      case 'excel-original': {
        excelService.exportToExcel(
          currentSheet.rows,
          `${baseName}_${cleanSheetTitle}_raw.xlsx`,
          currentSheet.sheetName.slice(0, 31)
        );
        dispatch(showToast({ message: 'Exported original Excel sheet as-is.', severity: 'info' }));
        break;
      }

      case 'json-cleaned': {
        excelService.exportCleanedJson(
          currentSheet.rows,
          currentSheet.columns,
          nullColumns,
          `${baseName}_${cleanSheetTitle}_cleaned.json`
        );
        dispatch(showToast({ message: 'Exported cleaned JSON.', severity: 'success' }));
        break;
      }

      case 'filtered-cleaned': {
        const { cleanedRows } = stripNullColumnsFromRows(
          processedRows,
          currentSheet.columns,
          nullColumns
        );
        excelService.exportToExcel(
          cleanedRows,
          `${baseName}_${cleanSheetTitle}_filtered_${processedRows.length}.xlsx`,
          'Filtered'
        );
        dispatch(
          showToast({
            message: `Exported ${processedRows.length} filtered rows with null columns removed.`,
            severity: 'success',
          })
        );
        break;
      }
    }

    auditService.record('TOOL_EXPORTED', user.name, 'excel.tabular-viewer', {
      format: type,
      sheet: currentSheet.sheetName,
      rowsCount: processedRows.length,
    });
  };

  const resetAll = () => {
    setFiles([]);
    setFile(null);
    setFileName('');
    setSheetNames([]);
    setActiveSheetName('');
    setSheets({});
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection(null);
    setHideNullColumns(false);
    setHiddenColumns(new Set());
    setSelectedRow(null);
    setSelectedRowNumber(null);
    setPage(0);
  };

  const loadSharedDataset = (dataset: ActiveDataset) => {
    setFileName(dataset.fileName);
    setSheetNames(dataset.sheetNames);
    const convertedSheets: Record<string, SheetDetail> = {};
    Object.entries(dataset.sheets).forEach(([sName, sData]) => {
      const stats = analyzeColumns(sData.rows, sData.columns, treatTextNulls);
      convertedSheets[sName] = {
        sheetName: sName,
        columns: sData.columns,
        rows: sData.rows,
        totalRowCount: sData.totalRowCount,
        nullColumns: sData.nullColumns || stats.nullColumns,
        columnStats: stats.columnStats,
        fileType: dataset.fileType === 'csv' ? 'csv' : 'xlsx',
      };
    });
    setSheets(convertedSheets);
    setActiveSheetName(dataset.activeSheet || dataset.sheetNames[0] || '');
    setHiddenColumns(new Set());
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection(null);
    setPage(0);
  };

  return {
    files,
    file,
    fileName,
    sheetNames,
    activeSheetName,
    sheets,
    currentSheet,
    isProcessing,
    progressPercent,

    // Search & Sort
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    handleSort,

    // Columns & Null remover
    nullColumns,
    visibleColumns,
    hideNullColumns,
    setHideNullColumns,
    treatTextNulls,
    setTreatTextNulls,
    hiddenColumns,
    toggleColumnVisibility,
    showAllColumns,

    // Rows
    processedRows,
    selectedRow,
    setSelectedRow,
    selectedRowNumber,
    setSelectedRowNumber,

    // View & Pagination
    viewMode,
    setViewMode,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    isStatsOpen,
    setIsStatsOpen,

    // Actions
    handleFileSelect,
    handleFilesSelect,
    handleSheetChange,
    loadLargeDemoDataset,
    loadLargeCsvDemo,
    loadSharedDataset,
    exportData,
    resetAll,
  };
};
