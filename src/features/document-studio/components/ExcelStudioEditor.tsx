import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import StorageIcon from '@mui/icons-material/Storage';
import FunctionsIcon from '@mui/icons-material/Functions';
import SearchIcon from '@mui/icons-material/Search';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { setActiveDataset, type ActiveDataset } from '@app/store/slices/sharedDataSlice';
import { excelService } from '@shared/services/file/excelService';
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

  const currentSheet = content.sheets[activeSheetName] || {
    sheetName: activeSheetName,
    columns: [],
    rows: [],
  };

  const columns = currentSheet.columns || [];
  const rows = currentSheet.rows || [];

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q))
    );
  }, [rows, columns, searchQuery]);

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

  // Edit cell
  const handleCellChange = (rowIndex: number, colKey: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
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
  };

  // Add Row
  const handleAddRow = () => {
    const emptyRow: Record<string, unknown> = {};
    columns.forEach((c) => {
      emptyRow[c] = '';
    });
    const updatedRows = [...rows, emptyRow];
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
    dispatch(showToast({ message: 'Added new row', severity: 'success' }));
  };

  // Delete Row
  const handleDeleteRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index);
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
  };

  // Add Column
  const handleAddColumn = () => {
    const trimmed = newColName.trim();
    if (!trimmed) return;
    if (columns.includes(trimmed)) {
      dispatch(showToast({ message: 'Column already exists', severity: 'error' }));
      return;
    }
    const updatedCols = [...columns, trimmed];
    const updatedRows = rows.map((r) => ({ ...r, [trimmed]: '' }));
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
    dispatch(showToast({ message: `Added column "${trimmed}"`, severity: 'success' }));
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

  // Export
  const handleExport = (type: 'xlsx' | 'csv' | 'json') => {
    if (type === 'xlsx') {
      const sheetsList = content.sheetNames.map((sn) => ({
        sheetName: sn,
        rows: content.sheets[sn]?.rows || [],
        columns: content.sheets[sn]?.columns || [],
        nullColumns: [],
      }));
      excelService.exportMultiSheetCleanedWorkbook(sheetsList, fileName);
    } else if (type === 'csv') {
      excelService.exportToCsv(rows, `${fileName}_${activeSheetName}.csv`);
    } else if (type === 'json') {
      excelService.exportCleanedJson(rows, columns, [], `${fileName}_${activeSheetName}.json`);
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
          {content.sheetNames.map((sn) => (
            <Tab key={sn} label={sn} value={sn} sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
        <Tooltip title="Add New Sheet">
          <IconButton size="small" onClick={handleAddSheet} sx={{ ml: 1 }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Spreadsheet Toolbar */}
      <AppCard
        title="Spreadsheet Operations & Formulas"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<StorageIcon />}
              onClick={handleShareToRedux}
              title="Make this dataset available across Tabular Viewer, Column Extractor, and Duplicate Remover"
            >
              Share with Cross-Tool Redux
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
            >
              Export Excel (.xlsx)
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </AppButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search cells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />,
              },
            }}
            sx={{ minWidth: 200 }}
          />

          <AppButton variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>
            Add Row
          </AppButton>

          {/* Add Column Box */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="New column name"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              sx={{ width: 160 }}
            />
            <AppButton variant="outlined" size="small" onClick={handleAddColumn}>
              + Col
            </AppButton>
          </Box>

          {/* Quick Formula Stats Selector */}
          <FormControl size="small" sx={{ minWidth: 170, ml: 'auto' }}>
            <InputLabel>Column Calculation</InputLabel>
            <Select
              value={selectedColForStats}
              label="Column Calculation"
              onChange={(e) => setSelectedColForStats(e.target.value)}
            >
              <MenuItem value="">-- Select Column --</MenuItem>
              {columns.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Dynamic Formula Stats Chips */}
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

        {/* Editable Spreadsheet Table */}
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
                      minWidth: 140,
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                        {col}
                      </Typography>
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
              {filteredRows.map((row, rIdx) => (
                <TableRow key={rIdx} hover>
                  <TableCell sx={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                    {rIdx + 1}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ p: 0.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        variant="standard"
                        value={row[col] ?? ''}
                        onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
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
                      <IconButton size="small" onClick={() => handleDeleteRow(rIdx)} color="error">
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
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
      </AppCard>
    </Box>
  );
};
