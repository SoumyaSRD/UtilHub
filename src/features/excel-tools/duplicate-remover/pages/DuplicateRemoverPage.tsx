import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DatasetIcon from '@mui/icons-material/Dataset';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppFileUpload } from '@shared/components/AppFileUpload/AppFileUpload';
import { AppEmptyState } from '@shared/components/AppEmptyState/AppEmptyState';
import { excelService, type ParsedSheetData } from '@shared/services/file/excelService';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { setActiveDataset, type ActiveDataset } from '@app/store/slices/sharedDataSlice';
import { SharedDatasetBanner } from '@shared/components/SharedDatasetBanner/SharedDatasetBanner';
import { auditService } from '@shared/telemetry/audit';
import { usePermissions } from '@registry/hooks/usePermissions';

const SAMPLE_DUPES: Record<string, unknown>[] = [
  { ID: 'E-101', Name: 'Sarah Connor', Email: 'sarah.c@cyberdyne.io', Department: 'Security', City: 'Los Angeles' },
  { ID: 'E-102', Name: 'John Connor', Email: 'john.c@cyberdyne.io', Department: 'Operations', City: 'San Francisco' },
  { ID: 'E-103', Name: 'Sarah Connor', Email: 'sarah.c@cyberdyne.io', Department: 'Security', City: 'Los Angeles' }, // duplicate
  { ID: 'E-104', Name: 'Miles Dyson', Email: 'miles.d@cyberdyne.io', Department: 'R&D', City: 'Palo Alto' },
  { ID: 'E-105', Name: 'Kyle Reese', Email: 'kyle.r@techcom.org', Department: 'Tactical', City: 'Los Angeles' },
  { ID: 'E-106', Name: 'Miles Dyson', Email: 'miles.d@cyberdyne.io', Department: 'R&D', City: 'Palo Alto' }, // duplicate
  { ID: 'E-107', Name: 'Marcus Wright', Email: 'marcus.w@project.net', Department: 'Engineering', City: 'Austin' },
];

export const DuplicateRemoverPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = usePermissions();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSheetData | null>(null);
  const [keyColumns, setKeyColumns] = useState<string[]>([]);
  const [keepStrategy, setKeepStrategy] = useState<'first' | 'last'>('first');
  const [cleanedRows, setCleanedRows] = useState<Record<string, unknown>[] | null>(null);
  const [duplicatesCount, setDuplicatesCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileSelect = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setIsProcessing(true);
      const parsed = await fileWorkerClient.parseExcelFile(uploadedFile);
      setParsedData(parsed);
      setKeyColumns(parsed.columns.slice(0, 2));
      setCleanedRows(null);

      // Sync with shared Redux store
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
          sourceTool: 'Duplicate Remover',
        })
      );
      dispatch(showToast({ message: `Loaded ${parsed.totalRowCount} rows (Web Worker)`, severity: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to read spreadsheet', severity: 'error' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSharedDataset = (dataset: ActiveDataset) => {
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
    setKeyColumns(parsed.columns.slice(0, 2));
    setCleanedRows(null);
    setDuplicatesCount(0);
  };

  const loadSample = () => {
    setFile(new File(['sample'], 'employee_directory_with_dupes.xlsx', { type: 'application/vnd.ms-excel' }));
    setParsedData({
      fileName: 'employee_directory_with_dupes.xlsx',
      sheetNames: ['Staff'],
      activeSheet: 'Staff',
      columns: Object.keys(SAMPLE_DUPES[0]),
      rows: SAMPLE_DUPES,
      totalRowCount: SAMPLE_DUPES.length,
    });
    setKeyColumns(['Email']);
    setCleanedRows(null);
    dispatch(showToast({ message: 'Loaded sample with deliberate duplicates', severity: 'info' }));
  };

  const toggleColumn = (col: string) => {
    setKeyColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const removeDuplicates = async () => {
    if (!parsedData) return;
    if (keyColumns.length === 0) {
      dispatch(showToast({ message: 'Select at least one uniqueness column key', severity: 'warning' }));
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fileWorkerClient.removeDuplicates(parsedData.rows, keyColumns, keepStrategy);
      const uniqueRows = res.cleanedRows;
      const removed = res.duplicatesRemoved;

      setCleanedRows(uniqueRows);
      setDuplicatesCount(removed);

      auditService.record('TOOL_EXECUTED', user.name, 'excel.duplicate-remover', {
        originalCount: parsedData.totalRowCount,
        uniqueCount: uniqueRows.length,
        duplicatesRemoved: removed,
        keyColumns,
      });

      dispatch(
        showToast({
          message: `Identified and removed ${removed} duplicate records (Web Worker)!`,
          severity: 'success',
        })
      );
    } catch (err) {
      dispatch(showToast({ message: `Deduplication failed: ${err instanceof Error ? err.message : String(err)}`, severity: 'error' }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="excel.duplicate-remover"
        title="Duplicate Remover"
        description="Filter and remove redundant rows based on composite primary keys or exact matches."
        iconName="ContentCut"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={loadSample}>
            Load Demo Data
          </AppButton>
        }
      />

      {/* Shared Cross-Tool Dataset Prompt Banner */}
      <SharedDatasetBanner
        toolId="excel.duplicate-remover"
        isCurrentDataLoaded={Boolean(parsedData)}
        onUseDataset={handleUseSharedDataset}
      />

      <AppCard title="1. Upload File" subtitle="Upload spreadsheet to analyze duplicate rows">
        <AppFileUpload
          selectedFile={file}
          onFileSelect={handleFileSelect}
          onClear={() => {
            setFile(null);
            setParsedData(null);
            setCleanedRows(null);
          }}
        />
      </AppCard>

      {parsedData && (
        <AppCard
          title="2. Configure Uniqueness Keys"
          subtitle="Rows with identical values across all checked columns will be treated as duplicate"
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)', mb: 1 }}>
              Select Uniqueness Composite Key(s):
            </Typography>
            <Grid container spacing={1.5}>
              {parsedData.columns.map((col) => {
                const checked = keyColumns.includes(col);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={col}>
                    <Box
                      onClick={() => toggleColumn(col)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: checked ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                        backgroundColor: checked ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        cursor: 'pointer',
                      }}
                    >
                      <Checkbox checked={checked} size="small" sx={{ p: 0.5, mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: checked ? 600 : 400 }}>
                        {col}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Deduplication Rule:
            </FormLabel>
            <RadioGroup
              row
              value={keepStrategy}
              onChange={(e) => setKeepStrategy(e.target.value as 'first' | 'last')}
            >
              <FormControlLabel value="first" control={<Radio size="small" />} label="Keep First Occurrence" />
              <FormControlLabel value="last" control={<Radio size="small" />} label="Keep Last Occurrence" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--color-divider)' }}>
            <AppButton variant="contained" startIcon={<ContentCutIcon />} onClick={removeDuplicates} loading={isProcessing}>
              Deduplicate Dataset
            </AppButton>
          </Box>
        </AppCard>
      )}

      {cleanedRows && (
        <AppCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <span>3. Cleaned Dataset</span>
              <Chip label={`${duplicatesCount} Duplicates Removed`} size="small" color="success" />
              <Chip label={`${cleanedRows.length} Unique Rows Retained`} size="small" variant="outlined" />
            </Box>
          }
          headerActions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <AppButton
                variant="contained"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={() => excelService.exportToExcel(cleanedRows, 'deduplicated_dataset.xlsx')}
              >
                Export Excel
              </AppButton>
              <AppButton
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={() => excelService.exportToCsv(cleanedRows, 'deduplicated_dataset.csv')}
              >
                Export CSV
              </AppButton>
            </Box>
          }
        >
          <TableContainer component={Paper} sx={{ maxHeight: 350, boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>#</TableCell>
                  {parsedData?.columns.map((c) => (
                    <TableCell key={c} sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cleanedRows.slice(0, 50).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: 'var(--color-text-muted)' }}>{idx + 1}</TableCell>
                    {parsedData?.columns.map((c) => (
                      <TableCell key={c}>{String(row[c] ?? '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {!parsedData && (
        <AppEmptyState
          title="No Spreadsheet Selected"
          description="Drop an Excel or CSV file to identify duplicate rows across any column combination."
          action={<AppButton variant="outlined" onClick={loadSample}>Try Demo Records</AppButton>}
        />
      )}
    </Box>
  );
};

export default DuplicateRemoverPage;
