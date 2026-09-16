import React, { useState, useMemo, Suspense, lazy } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppSelector, useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import {
  computeJsonDiff,
  type JsonDiffSummary,
  type DiffChangeType,
} from '../services/jsonDiffService';
import { formatJson } from '@features/code-formatter/services/codeFormatters';

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
);

const SAMPLE_JSON_A = `{
  "platform": "Helper Suite",
  "version": "1.8.0",
  "status": "production",
  "clusters": ["us-east-1", "eu-west-1"],
  "security": {
    "authMode": "JWT",
    "sessionTimeoutSec": 3600,
    "mfaRequired": false
  },
  "limits": {
    "maxPayloadMb": 50,
    "rateLimitRps": 200
  }
}`;

const SAMPLE_JSON_B = `{
  "platform": "Helper Suite Enterprise",
  "version": "2.0.0",
  "status": "production",
  "clusters": ["us-east-1", "eu-west-1", "ap-south-1"],
  "security": {
    "authMode": "OAuth2+JWT",
    "sessionTimeoutSec": 1800,
    "mfaRequired": true,
    "rbacEnabled": true
  },
  "limits": {
    "maxPayloadMb": 100
  }
}`;

export const JsonDiffViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.preferences.themeMode);
  const monacoTheme = currentTheme === 'dark' ? 'vs-dark' : 'light';

  const [jsonA, setJsonA] = useState(SAMPLE_JSON_A);
  const [jsonB, setJsonB] = useState(SAMPLE_JSON_B);
  const [sortKeys, setSortKeys] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const diffSummary: JsonDiffSummary | null = useMemo(() => {
    try {
      setParseError(null);
      return computeJsonDiff(jsonA, jsonB, sortKeys);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON syntax');
      return null;
    }
  }, [jsonA, jsonB, sortKeys]);

  const filteredEntries = useMemo(() => {
    if (!diffSummary) return [];
    return diffSummary.entries.filter((entry) => {
      const matchesType = filterType === 'ALL' || entry.type === filterType;
      const matchesSearch =
        !searchQuery.trim() ||
        entry.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(entry.leftValue).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(entry.rightValue).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [diffSummary, filterType, searchQuery]);

  const handleSwap = () => {
    const temp = jsonA;
    setJsonA(jsonB);
    setJsonB(temp);
    dispatch(showToast({ message: 'Swapped JSON A and JSON B', severity: 'info' }));
  };

  const handleFormatBoth = () => {
    try {
      setJsonA(formatJson(jsonA, 2, sortKeys));
      setJsonB(formatJson(jsonB, 2, sortKeys));
      setParseError(null);
      dispatch(showToast({ message: 'Formatted both JSON documents cleanly', severity: 'success' }));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Format error on one of the JSON inputs');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result ?? '');
      if (target === 'A') setJsonA(content);
      else setJsonB(content);
      dispatch(showToast({ message: `Loaded ${file.name} into JSON ${target}`, severity: 'success' }));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getTypeChip = (type: DiffChangeType) => {
    switch (type) {
      case 'ADDED':
        return <Chip label="+ ADDED" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 700 }} />;
      case 'REMOVED':
        return <Chip label="- REMOVED" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', fontWeight: 700 }} />;
      case 'MODIFIED':
        return <Chip label="~ MODIFIED" size="small" sx={{ bgcolor: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', fontWeight: 700 }} />;
      case 'TYPE_CHANGED':
        return <Chip label="! TYPE CHANGE" size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#9333ea', fontWeight: 700 }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Action and Configuration Header */}
      <AppCard
        title="Deep JSON Comparison Controls"
        subtitle="Compare structure, schema, and values across two JSON objects or configs"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<FormatAlignLeftIcon />}
              onClick={handleFormatBoth}
            >
              Format Both
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={handleSwap}
            >
              Swap Left / Right
            </AppButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                Sort keys before comparing (Semantic Equality)
              </Typography>
            }
          />

          <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="upload-json-a"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'A')}
            />
            <label htmlFor="upload-json-a">
              <AppButton component="span" variant="outlined" size="small" startIcon={<UploadFileIcon />}>
                Upload JSON A
              </AppButton>
            </label>

            <input
              type="file"
              id="upload-json-b"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'B')}
            />
            <label htmlFor="upload-json-b">
              <AppButton component="span" variant="outlined" size="small" startIcon={<UploadFileIcon />}>
                Upload JSON B
              </AppButton>
            </label>
          </Box>
        </Box>

        {parseError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {parseError}
          </Alert>
        )}

        {/* Structural Metrics Cards */}
        {diffSummary && (
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  +{diffSummary.addedCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Keys Added
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#dc2626' }}>
                  -{diffSummary.removedCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Keys Removed
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(234, 179, 8, 0.05)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ca8a04' }}>
                  ~{diffSummary.modifiedCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Values Modified
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-surface-border)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: diffSummary.isIdentical ? '#16a34a' : 'var(--color-text-primary)' }}>
                  {diffSummary.isIdentical ? '100%' : `${diffSummary.entries.length} diffs`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {diffSummary.isIdentical ? 'Identical' : 'Total Differences'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Monaco Diff View */}
        <Box
          sx={{
            border: '1px solid var(--color-code-border)',
            borderRadius: '8px',
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            }
          >
            <MonacoDiffEditor
              height="450px"
              language="json"
              original={jsonA}
              modified={jsonB}
              theme={monacoTheme}
              options={{
                renderSideBySide: true,
                fontSize: 13,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </Suspense>
        </Box>

        {/* Detailed Semantic Changes Table */}
        {diffSummary && diffSummary.entries.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Semantic Differences Breakdown ({filteredEntries.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search path or value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 220 }}
              />
              <Select
                size="small"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="ADDED">Added (+)</MenuItem>
                <MenuItem value="REMOVED">Removed (-)</MenuItem>
                <MenuItem value="MODIFIED">Modified (~)</MenuItem>
                <MenuItem value="TYPE_CHANGED">Type Changed</MenuItem>
              </Select>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, borderRadius: '8px' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '130px' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '220px' }}>JSON Path</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Original Value (Left)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Modified Value (Right)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.map((entry, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{getTypeChip(entry.type)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {entry.path}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#dc2626' }}>
                        {entry.leftValue !== undefined ? JSON.stringify(entry.leftValue) : <em>null / omitted</em>}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#16a34a' }}>
                        {entry.rightValue !== undefined ? JSON.stringify(entry.rightValue) : <em>null / omitted</em>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </AppCard>
    </Box>
  );
};
