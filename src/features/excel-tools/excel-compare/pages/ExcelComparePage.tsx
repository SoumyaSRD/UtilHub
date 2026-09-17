import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DatasetIcon from '@mui/icons-material/Dataset';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppFileUpload } from '@shared/components/AppFileUpload/AppFileUpload';
import { AppEmptyState } from '@shared/components/AppEmptyState/AppEmptyState';
import type { ParsedSheetData } from '@shared/services/file/excelService';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

interface DiffRow {
  key: string;
  status: 'UNCHANGED' | 'MODIFIED' | 'ADDED' | 'REMOVED';
  valuesA: Record<string, unknown> | null;
  valuesB: Record<string, unknown> | null;
  changedFields: string[];
}

export const ExcelComparePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [dataA, setDataA] = useState<ParsedSheetData | null>(null);
  const [dataB, setDataB] = useState<ParsedSheetData | null>(null);
  const [primaryKey, setPrimaryKey] = useState<string>('SKU');
  const [diffResults, setDiffResults] = useState<DiffRow[] | null>(null);

  const loadSample = () => {
    const listA = [
      { SKU: 'PROD-001', Name: 'Cloud Compute Standard', UnitPrice: 45.0, Stock: 100 },
      { SKU: 'PROD-002', Name: 'Database Managed Micro', UnitPrice: 15.0, Stock: 50 },
      { SKU: 'PROD-003', Name: 'Storage Bucket Fast', UnitPrice: 0.08, Stock: 999 },
      { SKU: 'PROD-004', Name: 'Network Gateway Tier 1', UnitPrice: 85.0, Stock: 12 },
    ];
    const listB = [
      { SKU: 'PROD-001', Name: 'Cloud Compute Standard', UnitPrice: 48.5, Stock: 100 }, // UnitPrice modified
      { SKU: 'PROD-002', Name: 'Database Managed Micro', UnitPrice: 15.0, Stock: 40 }, // Stock modified
      { SKU: 'PROD-003', Name: 'Storage Bucket Fast', UnitPrice: 0.08, Stock: 999 }, // Unchanged
      { SKU: 'PROD-005', Name: 'Enterprise VPC Peering', UnitPrice: 120.0, Stock: 5 }, // Added
      // PROD-004 Removed
    ];

    setDataA({
      fileName: 'pricing_v1.xlsx',
      sheetNames: ['Rates'],
      activeSheet: 'Rates',
      columns: Object.keys(listA[0]),
      rows: listA,
      totalRowCount: listA.length,
    });
    setDataB({
      fileName: 'pricing_v2.xlsx',
      sheetNames: ['Rates'],
      activeSheet: 'Rates',
      columns: Object.keys(listB[0]),
      rows: listB,
      totalRowCount: listB.length,
    });
    setPrimaryKey('SKU');
    setDiffResults(null);
    dispatch(showToast({ message: 'Loaded sample Version A vs Version B datasets', severity: 'info' }));
  };

  const executeCompare = () => {
    if (!dataA || !dataB) return;

    const mapA = new Map<string, Record<string, unknown>>();
    const mapB = new Map<string, Record<string, unknown>>();

    dataA.rows.forEach((r) => mapA.set(String(r[primaryKey] ?? ''), r));
    dataB.rows.forEach((r) => mapB.set(String(r[primaryKey] ?? ''), r));

    const allKeys = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));
    const diffs: DiffRow[] = [];

    allKeys.forEach((key) => {
      const rowA = mapA.get(key) || null;
      const rowB = mapB.get(key) || null;

      if (rowA && !rowB) {
        diffs.push({ key, status: 'REMOVED', valuesA: rowA, valuesB: null, changedFields: [] });
      } else if (!rowA && rowB) {
        diffs.push({ key, status: 'ADDED', valuesA: null, valuesB: rowB, changedFields: [] });
      } else if (rowA && rowB) {
        const changed: string[] = [];
        const allCols = Array.from(new Set([...Object.keys(rowA), ...Object.keys(rowB)]));
        allCols.forEach((col) => {
          if (String(rowA[col] ?? '') !== String(rowB[col] ?? '')) {
            changed.push(col);
          }
        });

        diffs.push({
          key,
          status: changed.length > 0 ? 'MODIFIED' : 'UNCHANGED',
          valuesA: rowA,
          valuesB: rowB,
          changedFields: changed,
        });
      }
    });

    setDiffResults(diffs);
    dispatch(showToast({ message: 'Spreadsheet comparison complete', severity: 'success' }));
  };

  const modifiedCount = diffResults?.filter((d) => d.status === 'MODIFIED').length ?? 0;
  const addedCount = diffResults?.filter((d) => d.status === 'ADDED').length ?? 0;
  const removedCount = diffResults?.filter((d) => d.status === 'REMOVED').length ?? 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="excel.compare"
        title="Excel Compare"
        description="Diff two spreadsheets cell-by-cell using an identifying primary key to detect modified, added, or dropped rows."
        iconName="CompareArrows"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={loadSample}>
            Load Demo Comparison
          </AppButton>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard title="Baseline Dataset (Version A)">
            <AppFileUpload
              selectedFile={dataA ? new File([], dataA.fileName) : null}
              onFileSelect={async (file) => {
                try {
                  const res = await fileWorkerClient.parseExcelFile(file);
                  setDataA(res);
                  dispatch(showToast({ message: `Loaded Version A: ${res.fileName} (${res.totalRowCount} rows) via Worker`, severity: 'success' }));
                } catch (e: any) {
                  dispatch(showToast({ message: `Failed to parse Version A: ${e.message}`, severity: 'error' }));
                }
              }}
              onClear={() => setDataA(null)}
            />
          </AppCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard title="Target Dataset (Version B)">
            <AppFileUpload
              selectedFile={dataB ? new File([], dataB.fileName) : null}
              onFileSelect={async (file) => {
                try {
                  const res = await fileWorkerClient.parseExcelFile(file);
                  setDataB(res);
                  dispatch(showToast({ message: `Loaded Version B: ${res.fileName} (${res.totalRowCount} rows) via Worker`, severity: 'success' }));
                } catch (e: any) {
                  dispatch(showToast({ message: `Failed to parse Version B: ${e.message}`, severity: 'error' }));
                }
              }}
              onClear={() => setDataB(null)}
            />
          </AppCard>
        </Grid>
      </Grid>

      {dataA && dataB && (
        <AppCard title="Comparison Configuration">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Primary Match Key</InputLabel>
              <Select
                value={primaryKey}
                label="Primary Match Key"
                onChange={(e) => setPrimaryKey(e.target.value)}
              >
                {dataA.columns.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <AppButton variant="contained" startIcon={<CompareArrowsIcon />} onClick={executeCompare}>
              Run Deep Diff Comparison
            </AppButton>
          </Box>
        </AppCard>
      )}

      {diffResults && (
        <AppCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <span>Comparison Results</span>
              <Chip label={`${modifiedCount} Modified`} size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700 }} />
              <Chip label={`${addedCount} Added`} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />
              <Chip label={`${removedCount} Removed`} size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }} />
            </Box>
          }
        >
          <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Key ({primaryKey})</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Version A Values</TableCell>
                  <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Version B Values</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diffResults.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.key}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          backgroundColor:
                            row.status === 'MODIFIED'
                              ? '#fef3c7'
                              : row.status === 'ADDED'
                              ? '#dcfce7'
                              : row.status === 'REMOVED'
                              ? '#fee2e2'
                              : 'var(--color-surface-hover)',
                          color:
                            row.status === 'MODIFIED'
                              ? '#b45309'
                              : row.status === 'ADDED'
                              ? '#15803d'
                              : row.status === 'REMOVED'
                              ? '#b91c1c'
                              : 'var(--color-text-secondary)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {row.valuesA ? (
                        <pre style={{ margin: 0 }}>{JSON.stringify(row.valuesA, null, 1)}</pre>
                      ) : (
                        <em style={{ color: 'var(--color-text-muted)' }}>[Not Present]</em>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {row.valuesB ? (
                        <pre style={{ margin: 0 }}>{JSON.stringify(row.valuesB, null, 1)}</pre>
                      ) : (
                        <em style={{ color: 'var(--color-text-muted)' }}>[Not Present]</em>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppCard>
      )}

      {(!dataA || !dataB) && (
        <AppEmptyState
          title="Both Spreadsheets Required"
          description="Load a baseline and target spreadsheet to compute field differences and record mutations."
          action={<AppButton variant="outlined" onClick={loadSample}>Try Demo Pricing Comparison</AppButton>}
        />
      )}
    </Box>
  );
};

export default ExcelComparePage;
