import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import StorageIcon from '@mui/icons-material/Storage';
import FunctionsIcon from '@mui/icons-material/Functions';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SpeedIcon from '@mui/icons-material/Speed';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { setActiveDataset, type ActiveDataset } from '@app/store/slices/sharedDataSlice';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { saveAs } from 'file-saver';
import type { SpreadsheetContent } from '../types';

export interface ExcelStudioEditorProps {
  fileName: string;
  content: SpreadsheetContent;
  onChange: (newContent: SpreadsheetContent) => void;
}

export const ExcelStudioEditor: React.FC<ExcelStudioEditorProps> = ({
  fileName,
  content,
  onChange,
}) => {
  const dispatch = useAppDispatch();
  const [activeSheetName, setActiveSheetName] = useState(
    content.activeSheet || content.sheetNames[0] || 'Sheet1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColForStats, setSelectedColForStats] = useState<string>('');
  const [newColName, setNewColName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Pagination states to prevent DOM freeze
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Sorting state
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const currentSheet = content.sheets[activeSheetName] || {
    sheetName: activeSheetName,
    columns: [],
    rows: [],
  };

  const columns = currentSheet.columns || [];
  const rows = currentSheet.rows || [];

  // Reset page when sheet or search query changes
  useEffect(() => {
    setPage(0);
  }, [activeSheetName, searchQuery]);

  // Filtered & Sorted rows
  const processedRows = useMemo(() => {
    let result = rows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) =>
        columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q))
      );
    }

    if (sortCol) {
      result = [...result].sort((a, b) => {
        const valA = a[sortCol] ?? '';
        const valB = b[sortCol] ?? '';
        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rows, columns, searchQuery, sortCol, sortDir]);

  // Sliced rows for current page (critical for rendering performance)
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return processedRows.slice(start, start + rowsPerPage);
  }, [processedRows, page, rowsPerPage]);

  // Formula stats for selected column
  const stats = useMemo(() => {
    if (!selectedColForStats) return null;
    let sum = 0;
    let countNum = 0;
    let min = Infinity;
    let max = -Infinity;
    const distinctSet = new Set<unknown>();

    rows.forEach((r) => {
      const val = r[selectedColForStats];
      distinctSet.add(val);
      const num = Number(val);
      if (val !== null && val !== undefined && val !== '' && !isNaN(num)) {
        sum += num;
        countNum++;
        if (num < min) min = num;
        if (num > max) max = num;
      }
    });

    return {
      totalRows: rows.length,
      distinctCount: distinctSet.size,
      countNumeric: countNum,
      sum: countNum > 0 ? sum : null,
      avg: countNum > 0 ? (sum / countNum).toFixed(2) : null,
      min: countNum > 0 ? min : null,
      max: countNum > 0 ? max : null,
    };
  }, [rows, selectedColForStats]);

  // Sort handler
  const handleToggleSort = (colName: string) => {
    if (sortCol === colName) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(colName);
      setSortDir('asc');
    }
  };

  // Edit cell with debounced update
  const handleCellChange = useCallback(
    (rowIndexInAll: number, colKey: string, value: string) => {
      const updatedRows = [...rows];
      updatedRows[rowIndexInAll] = {
        ...updatedRows[rowIndexInAll],
        [colKey]: value,
      };
      onChange({
        ...content,
        sheets: {
          ...content.sheets,
          [activeSheetName]: {
            ...currentSheet,
            rows: updatedRows,
          },
        },
      });
    },
    [rows, content, activeSheetName, currentSheet, onChange]
  );

  // Add Row
  const handleAddRow = () => {
    const emptyRow: Record<string, unknown> = {};
    columns.forEach((c) => {
      emptyRow[c] = '';
    });
    const updatedRows = [emptyRow, ...rows];
    onChange({
      ...content,
      sheets: {
        ...content.sheets,
        [activeSheetName]: {
          ...currentSheet,
          rows: updatedRows,
        },
      },
    });
    setPage(0);
    dispatch(showToast({ message: 'Added new row at the top', severity: 'success' }));
  };

  // Delete Row
  const handleDeleteRow = (actualRowIndex: number) => {
    const updatedRows = rows.filter((_, idx) => idx !== actualRowIndex);
    onChange({
      ...content,
      sheets: {
        ...content.sheets,
        [activeSheetName]: {
          ...currentSheet,
          rows: updatedRows,
        },
      },
    });
    dispatch(showToast({ message: 'Deleted row', severity: 'info' }));
  };

  // Add Column
  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const colClean = newColName.trim();
    if (columns.includes(colClean)) {
      dispatch(showToast({ message: `Column "${colClean}" already exists`, severity: 'warning' }));
      return;
    }
    const updatedCols = [...columns, colClean];
    const updatedRows = rows.map((r) => ({ ...r, [colClean]: '' }));
    onChange({
      ...content,
      sheets: {
        ...content.sheets,
        [activeSheetName]: {
          ...currentSheet,
          columns: updatedCols,
          rows: updatedRows,
        },
      },
    });
    setNewColName('');
    dispatch(showToast({ message: `Added column "${colClean}"`, severity: 'success' }));
  };

  // Delete Column
  const handleDeleteColumn = (colName: string) => {
    const updatedCols = columns.filter((c) => c !== colName);
    const updatedRows = rows.map((r) => {
      const copy = { ...r };
      delete copy[colName];
      return copy;
    });
    onChange({
      ...content,
      sheets: {
        ...content.sheets,
        [activeSheetName]: {
          ...currentSheet,
          columns: updatedCols,
          rows: updatedRows,
        },
      },
    });
    if (selectedColForStats === colName) setSelectedColForStats('');
  };

  // Add Sheet
  const handleAddSheet = () => {
    let sheetIndex = content.sheetNames.length + 1;
    let newName = `Sheet${sheetIndex}`;
    while (content.sheetNames.includes(newName)) {
      sheetIndex++;
      newName = `Sheet${sheetIndex}`;
    }
    const newSheetNames = [...content.sheetNames, newName];
    onChange({
      ...content,
      sheetNames: newSheetNames,
      activeSheet: newName,
      sheets: {
        ...content.sheets,
        [newName]: {
          sheetName: newName,
          columns: ['Column1', 'Column2', 'Column3'],
          rows: [{ Column1: '', Column2: '', Column3: '' }],
        },
      },
    });
    setActiveSheetName(newName);
    dispatch(showToast({ message: `Created "${newName}"`, severity: 'success' }));
  };

  // Send dataset to Redux store
  const handleShareToRedux = () => {
    const activeDataset: ActiveDataset = {
      id: `dataset-${Date.now()}`,
      fileName,
      fileType: fileName.endsWith('.csv') ? 'csv' : 'xlsx',
      uploadedAt: new Date().toISOString(),
      sheetNames: content.sheetNames,
      activeSheet: activeSheetName,
      sheets: Object.entries(content.sheets).reduce((acc, [sName, sData]) => {
        acc[sName] = {
          sheetName: sName,
          columns: sData.columns,
          rows: sData.rows,
          totalRowCount: sData.rows.length,
          nullColumns: [],
        };
        return acc;
      }, {} as ActiveDataset['sheets']),
      sourceTool: 'Document Studio',
    };

    dispatch(setActiveDataset(activeDataset));
    dispatch(
      showToast({
        message: `Dataset "${fileName}" is now available in Tabular Viewer, Column Extractor, and all Excel tools!`,
        severity: 'success',
      })
    );
  };

  // Worker-assisted Export
  const handleExport = async (type: 'xlsx' | 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const sheetsList = content.sheetNames.map((sn) => ({
        sheetName: sn,
        rows: content.sheets[sn]?.rows || [],
        columns: content.sheets[sn]?.columns || [],
      }));

      const res = await fileWorkerClient.exportSpreadsheet(sheetsList, type, fileName);

      if (res.buffer) {
        const blob = new Blob([res.buffer], { type: res.mimeType });
        saveAs(blob, res.fileName);
      } else if (res.text) {
        const blob = new Blob([res.text], { type: res.mimeType });
        saveAs(blob, res.fileName);
      }

      dispatch(showToast({ message: `Exported ${res.fileName} successfully!`, severity: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: `Export failed: ${err.message}`, severity: 'error' }));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Sheets Navigation Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-surface-border)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px 8px 0 0',
          px: 1,
        }}
      >
        <Tabs
          value={activeSheetName}
          onChange={(_, val) => setActiveSheetName(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 44 }}
        >
          {content.sheetNames.map((sheet) => (
            <Tab
              key={sheet}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>{sheet}</span>
                  <Chip
                    label={content.sheets[sheet]?.rows?.length || 0}
                    size="small"
                    sx={{ fontSize: '0.65rem', height: 18, pointerEvents: 'none' }}
                  />
                </Box>
              }
              value={sheet}
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>
        <Tooltip title="Add New Sheet Tab">
          <IconButton size="small" onClick={handleAddSheet} sx={{ ml: 1, color: 'var(--color-primary)' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Table Card */}
      <AppCard
        title={`Spreadsheet Editor: ${fileName} (${activeSheetName})`}
        subtitle={`${rows.length.toLocaleString()} total rows, ${columns.length} columns (High-performance paginated)`}
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              icon={<SpeedIcon sx={{ fontSize: 16 }} />}
              label="Web Worker Enabled"
              size="small"
              color="success"
              variant="outlined"
            />
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<StorageIcon />}
              onClick={handleShareToRedux}
            >
              Share to Platform
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              Export CSV
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
            >
              Export XLSX
            </AppButton>
          </Box>
        }
      >
        {/* Editor Controls Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            mb: 2,
            justifyContent: 'space-between',
          }}
        >
          {/* Search & Add Column */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search table rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />,
                },
              }}
              sx={{ width: 220 }}
            />

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <TextField
                size="small"
                placeholder="New column name"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                sx={{ width: 170 }}
              />
              <AppButton variant="outlined" size="small" onClick={handleAddColumn} startIcon={<AddIcon />}>
                Add Col
              </AppButton>
            </Box>

            <AppButton variant="contained" size="small" onClick={handleAddRow} startIcon={<AddIcon />}>
              Add Row
            </AppButton>
          </Box>

          {/* Quick Statistics Selector */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="stats-col-label">Column Stats</InputLabel>
              <Select
                labelId="stats-col-label"
                value={selectedColForStats}
                label="Column Stats"
                onChange={(e) => setSelectedColForStats(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {columns.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Column Stats Display Bar */}
        {stats && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              p: 1.5,
              mb: 2,
              borderRadius: '8px',
              backgroundColor: 'var(--color-surface-hover)',
              border: '1px solid var(--color-surface-border)',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FunctionsIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedColForStats}:
              </Typography>
            </Box>
            <Chip label={`Count: ${stats.totalRows}`} size="small" />
            <Chip label={`Distinct: ${stats.distinctCount}`} size="small" />
            {stats.countNumeric > 0 && (
              <>
                <Chip label={`Sum: ${stats.sum?.toLocaleString()}`} size="small" color="primary" variant="outlined" />
                <Chip label={`Average: ${stats.avg}`} size="small" color="primary" variant="outlined" />
                <Chip label={`Min: ${stats.min}`} size="small" variant="outlined" />
                <Chip label={`Max: ${stats.max}`} size="small" variant="outlined" />
              </>
            )}
          </Box>
        )}

        {/* Paginated Spreadsheet Table (Smooth and Free of Freezing) */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 520,
            borderRadius: '8px',
            border: '1px solid var(--color-surface-border)',
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60, fontWeight: 700, backgroundColor: 'var(--color-surface)' }}>
                  #
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 700,
                      minWidth: 150,
                      backgroundColor: 'var(--color-surface)',
                      userSelect: 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box
                        onClick={() => handleToggleSort(col)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                          {col}
                        </Typography>
                        {sortCol === col && (
                          sortDir === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                        )}
                      </Box>
                      <Tooltip title={`Delete column ${col}`}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteColumn(col)}
                          sx={{ p: 0.25, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                ))}
                <TableCell sx={{ width: 60, fontWeight: 700, backgroundColor: 'var(--color-surface)' }}>
                  Del
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, pIdx) => {
                const actualRowIndex = page * rowsPerPage + pIdx;
                return (
                  <TableRow key={actualRowIndex} hover>
                    <TableCell sx={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                      {actualRowIndex + 1}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col} sx={{ p: 0.5 }}>
                        <TextField
                          size="small"
                          fullWidth
                          variant="standard"
                          value={row[col] ?? ''}
                          onChange={(e) => handleCellChange(actualRowIndex, col, e.target.value)}
                          slotProps={{
                            input: {
                              disableUnderline: true,
                              sx: {
                                fontSize: '0.8125rem',
                                px: 0.75,
                                py: 0.5,
                                borderRadius: '4px',
                                '&:hover': { backgroundColor: 'var(--color-surface-hover)' },
                                '&:focus-within': {
                                  backgroundColor: 'var(--color-surface)',
                                  outline: '1px solid var(--color-primary)',
                                },
                              },
                            },
                          }}
                        />
                      </TableCell>
                    ))}
                    <TableCell sx={{ p: 0.5 }}>
                      <Tooltip title="Delete row">
                        <IconButton size="small" onClick={() => handleDeleteRow(actualRowIndex)} color="error">
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      No rows to display. Click "+ Add Row" to begin.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Bar */}
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 250]}
          component="div"
          count={processedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: '1px solid var(--color-surface-border)' }}
        />
      </AppCard>
    </Box>
  );
};
