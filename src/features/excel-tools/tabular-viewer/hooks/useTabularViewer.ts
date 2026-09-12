import { useState, useMemo } from 'react';
import {
  excelService,
  type SheetDetail,
  analyzeColumns,
  stripNullColumnsFromRows,
} from '@shared/services/file/excelService';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { auditService } from '@shared/telemetry/audit';
import { usePermissions } from '@registry/hooks/usePermissions';
import type { ExportType } from '../types';

export const useTabularViewer = () => {
  const dispatch = useAppDispatch();
  const { user } = usePermissions();

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

  // Detected null columns in the current sheet
  const nullColumns = useMemo<string[]>(() => {
    return currentSheet?.nullColumns || [];
  }, [currentSheet]);

  // Visible columns for the table
  const visibleColumns = useMemo<string[]>(() => {
    if (!currentSheet) return [];
    return currentSheet.columns.filter((col) => {
      if (hiddenColumns.has(col)) return false;
      if (hideNullColumns && nullColumns.includes(col)) return false;
      return true;
    });
  }, [currentSheet, hiddenColumns, hideNullColumns, nullColumns]);

  // File selection and parsing
  const handleFileSelect = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      setIsProcessing(true);
      setProgressPercent(20);

      const parsed = await excelService.parseWorkbookAllSheets(uploadedFile);
      setProgressPercent(80);

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

      dispatch(
        showToast({
          message: `Loaded "${uploadedFile.name}" with ${parsed.sheetNames.length} sheet(s) and ${initialSheetDetail?.totalRowCount.toLocaleString()} rows.${
            totalNullCols > 0 ? ` (${totalNullCols} empty column(s) detected)` : ''
          }`,
          severity: 'success',
        })
      );

      auditService.record('TOOL_EXECUTED', user.name, 'excel.tabular-viewer', {
        action: 'file_parsed',
        fileName: uploadedFile.name,
        sheetsCount: parsed.sheetNames.length,
      });
    } catch (err) {
      dispatch(
        showToast({
          message: `Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error',
        })
      );
    } finally {
      setIsProcessing(false);
      setProgressPercent(undefined);
    }
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

        return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
      });
    }

    return rows;
  }, [currentSheet, searchQuery, sortColumn, sortDirection]);

  // Load High-Volume 100,000+ Records Demo Multi-Tab Dataset
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
          // Intentionally completely null / empty columns for testing Null Column Remover:
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
          // Intentionally empty columns:
          DiscountCode: null,
          InternalReturnMemo: '',
          ApproverSignOff: undefined,
        };
      }

      // Sheet 3: Inventory Summary (5,000 rows)
      const invRowsCount = 5000;
      const invRows: Record<string, unknown>[] = new Array(invRowsCount);
      for (let i = 0; i < invRowsCount; i++) {
        invRows[i] = {
          SKU: `SKU-${100 + i}`,
          ItemName: `Enterprise Component #${i + 1}`,
          Warehouse: `WH-${(i % 5) + 1}`,
          StockQuantity: (i * 23) % 2500,
          ReorderPoint: 50,
          Status: (i * 23) % 2500 < 50 ? 'Low Stock' : 'In Stock',
          // Intentionally empty column:
          RestockOverrideNotes: '',
        };
      }

      const custColumns = Object.keys(customerRows[0]);
      const custAnalysis = analyzeColumns(customerRows, custColumns);

      const ordColumns = Object.keys(orderRows[0]);
      const ordAnalysis = analyzeColumns(orderRows, ordColumns);

      const invColumns = Object.keys(invRows[0]);
      const invAnalysis = analyzeColumns(invRows, invColumns);

      const demoSheets: Record<string, SheetDetail> = {
        'Customers (100k)': {
          sheetName: 'Customers (100k)',
          columns: custColumns,
          rows: customerRows,
          totalRowCount: customerRows.length,
          nullColumns: custAnalysis.nullColumns,
          columnStats: custAnalysis.columnStats,
        },
        'Orders': {
          sheetName: 'Orders',
          columns: ordColumns,
          rows: orderRows,
          totalRowCount: orderRows.length,
          nullColumns: ordAnalysis.nullColumns,
          columnStats: ordAnalysis.columnStats,
        },
        'Inventory': {
          sheetName: 'Inventory',
          columns: invColumns,
          rows: invRows,
          totalRowCount: invRows.length,
          nullColumns: invAnalysis.nullColumns,
          columnStats: invAnalysis.columnStats,
        },
      };

      setFileName('enterprise_multisheet_100k_demo.xlsx');
      setFile(new File(['demo'], 'enterprise_multisheet_100k_demo.xlsx', { type: 'application/vnd.ms-excel' }));
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
          message: `Generated 100,000+ records multi-sheet workbook with 3 tabs and 8 detected empty columns for testing.`,
          severity: 'success',
        })
      );
    }, 100);
  };

  // Multi-Format Export Handler
  const exportData = (type: ExportType) => {
    if (!currentSheet) return;
    const baseName = (fileName || 'spreadsheet').replace(/\.[^/.]+$/, '');

    switch (type) {
      case 'excel-cleaned': {
        excelService.exportCleanedExcel(
          currentSheet.rows,
          currentSheet.columns,
          currentSheet.nullColumns,
          `${baseName}_${currentSheet.sheetName}_cleaned.xlsx`,
          currentSheet.sheetName
        );
        dispatch(
          showToast({
            message: `Exported cleaned Excel sheet without ${currentSheet.nullColumns.length} null column(s).`,
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
            message: `Exported full workbook (${sheetsToExport.length} sheets) with all empty columns removed.`,
            severity: 'success',
          })
        );
        break;
      }

      case 'excel-original': {
        excelService.exportToExcel(
          currentSheet.rows,
          `${baseName}_${currentSheet.sheetName}_raw.xlsx`,
          currentSheet.sheetName
        );
        dispatch(showToast({ message: 'Exported original Excel sheet as-is.', severity: 'info' }));
        break;
      }

      case 'csv-cleaned': {
        excelService.exportCleanedCsv(
          currentSheet.rows,
          currentSheet.columns,
          currentSheet.nullColumns,
          `${baseName}_${currentSheet.sheetName}_cleaned.csv`
        );
        dispatch(showToast({ message: 'Exported cleaned CSV.', severity: 'success' }));
        break;
      }

      case 'csv-original': {
        excelService.exportToCsv(
          currentSheet.rows,
          `${baseName}_${currentSheet.sheetName}_raw.csv`
        );
        dispatch(showToast({ message: 'Exported original CSV.', severity: 'info' }));
        break;
      }

      case 'json-cleaned': {
        excelService.exportCleanedJson(
          currentSheet.rows,
          currentSheet.columns,
          currentSheet.nullColumns,
          `${baseName}_${currentSheet.sheetName}_cleaned.json`
        );
        dispatch(showToast({ message: 'Exported cleaned JSON.', severity: 'success' }));
        break;
      }

      case 'filtered-cleaned': {
        const { cleanedRows } = stripNullColumnsFromRows(
          processedRows,
          currentSheet.columns,
          currentSheet.nullColumns
        );
        excelService.exportToExcel(
          cleanedRows,
          `${baseName}_${currentSheet.sheetName}_filtered_${processedRows.length}.xlsx`,
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

  return {
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
    handleSheetChange,
    loadLargeDemoDataset,
    exportData,
    resetAll,
  };
};
