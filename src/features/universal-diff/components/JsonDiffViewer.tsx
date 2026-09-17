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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppSelector, useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import {
  computeJsonDiff,
  type DiffChangeType,
  type JsonDiffSummary,
} from '../services/jsonDiffService';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { formatJson } from '@features/code-formatter/services/codeFormatters';
import { isDarkTheme } from '@theme/types';
import { saveAs } from 'file-saver';

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
);
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.default }))
);

const PRESET_SAMPLES = [
  {
    id: 'api-response',
    name: 'API Response Schema Diff',
    left: `{
  "status": 200,
  "service": "billing-api",
  "version": "1.4.2",
  "data": {
    "account_id": "acc_98721",
    "tier": "STANDARD",
    "quota": {
      "requests_per_min": 1000,
      "max_concurrency": 20
    },
    "features": ["metrics", "alerts", "webhooks"],
    "created_at": "2024-01-15T08:30:00Z"
  }
}`,
    right: `{
  "status": 200,
  "service": "billing-api",
  "version": "2.0.0",
  "data": {
    "account_id": "acc_98721",
    "tier": "ENTERPRISE",
    "quota": {
      "requests_per_min": 5000,
      "max_concurrency": 100,
      "burst_limit": 250
    },
    "features": ["metrics", "alerts", "webhooks", "custom_domains", "sso"],
    "created_at": "2024-01-15T08:30:00Z",
    "last_upgraded": "2026-03-01T14:20:00Z"
  }
}`,
  },
  {
    id: 'cloud-config',
    name: 'Server & Cloud Config Diff',
    left: `{
  "cluster": "us-east-prod",
  "port": 8080,
  "ssl_enabled": true,
  "cors": {
    "origins": ["https://app.example.com"],
    "allow_credentials": false
  },
  "database": {
    "host": "db-primary.internal",
    "pool_size": 15,
    "idle_timeout_ms": 30000
  },
  "logging": {
    "level": "INFO",
    "destinations": ["stdout"]
  }
}`,
    right: `{
  "cluster": "us-east-prod",
  "port": 8443,
  "ssl_enabled": true,
  "cors": {
    "origins": ["https://app.example.com", "https://staging.example.com"],
    "allow_credentials": true
  },
  "database": {
    "host": "db-primary.internal",
    "pool_size": 35,
    "idle_timeout_ms": 15000,
    "read_replica": "db-replica.internal"
  },
  "logging": {
    "level": "DEBUG",
    "destinations": ["stdout", "datadog"]
  }
}`,
  },
  {
    id: 'user-permissions',
    name: 'User & Permissions Diff',
    left: `{
  "user_id": 4029,
  "username": "sarah_eng",
  "role": "MEMBER",
  "is_active": true,
  "teams": ["frontend", "platform"],
  "permissions": ["repo:read", "repo:write"],
  "metadata": {
    "office": "San Francisco",
    "direct_reports": 0
  }
}`,
    right: `{
  "user_id": 4029,
  "username": "sarah_eng",
  "role": "LEAD",
  "is_active": true,
  "teams": ["frontend", "platform", "security"],
  "permissions": ["repo:read", "repo:write", "admin:deploy", "audit:view"],
  "metadata": {
    "office": "San Francisco",
    "direct_reports": 6
  }
}`,
  },
];

export const JsonDiffViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.preferences.themeMode);
  const monacoTheme = isDarkTheme(currentTheme) ? 'vs-dark' : 'light';

  const [jsonA, setJsonA] = useState(PRESET_SAMPLES[0].left);
  const [jsonB, setJsonB] = useState(PRESET_SAMPLES[0].right);
  const [sortKeys, setSortKeys] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [diffMode, setDiffMode] = useState<'split' | 'inline'>('split');
  const [viewTab, setViewTab] = useState<'visual' | 'edit'>('visual');
  const [selectedPreset, setSelectedPreset] = useState<string>('api-response');

  // Syntax validation states
  const validationA = useMemo(() => {
    if (!jsonA.trim()) return { valid: false, error: 'Empty JSON' };
    try {
      JSON.parse(jsonA);
      return { valid: true, error: null };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }, [jsonA]);

  const validationB = useMemo(() => {
    if (!jsonB.trim()) return { valid: false, error: 'Empty JSON' };
    try {
      JSON.parse(jsonB);
      return { valid: true, error: null };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }, [jsonB]);

  // Compute Diff Summary via Web Worker
  const [diffSummary, setDiffSummary] = useState<JsonDiffSummary | null>(() => {
    try {
      return computeJsonDiff(PRESET_SAMPLES[0].left, PRESET_SAMPLES[0].right, false);
    } catch {
      return null;
    }
  });
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDiffing, setIsDiffing] = useState<boolean>(false);

  React.useEffect(() => {
    if (!validationA.valid || !validationB.valid) {
      setDiffSummary(null);
      setParseError(
        !validationA.valid
          ? `Original JSON (Left) has syntax error: ${validationA.error}`
          : `Modified JSON (Right) has syntax error: ${validationB.error}`
      );
      return;
    }

    let isCurrent = true;
    setIsDiffing(true);

    const timer = setTimeout(async () => {
      try {
        const summary = await fileWorkerClient.computeJsonDiff(jsonA, jsonB, sortKeys);
        if (isCurrent) {
          setDiffSummary(summary as JsonDiffSummary);
          setParseError(null);
        }
      } catch {
        try {
          const fallback = computeJsonDiff(jsonA, jsonB, sortKeys);
          if (isCurrent) {
            setDiffSummary(fallback);
            setParseError(null);
          }
        } catch (err: any) {
          if (isCurrent) {
            setDiffSummary(null);
            setParseError(err.message || 'Error computing diff');
          }
        }
      } finally {
        if (isCurrent) setIsDiffing(false);
      }
    }, 80);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [jsonA, jsonB, sortKeys, validationA, validationB]);

  // Filtered diff entries
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

  // Handle Preset Select
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = PRESET_SAMPLES.find((item) => item.id === presetId);
    if (p) {
      setJsonA(p.left);
      setJsonB(p.right);
      dispatch(showToast({ message: `Loaded preset: ${p.name}`, severity: 'info' }));
    }
  };

  // Swap Left and Right
  const handleSwap = () => {
    const temp = jsonA;
    setJsonA(jsonB);
    setJsonB(temp);
    dispatch(showToast({ message: 'Swapped Original and Modified JSON', severity: 'info' }));
  };

  // Format Both
  const handleFormatBoth = () => {
    try {
      if (validationA.valid) setJsonA(formatJson(jsonA, 2, sortKeys));
      if (validationB.valid) setJsonB(formatJson(jsonB, 2, sortKeys));
      dispatch(showToast({ message: 'Formatted both JSON documents cleanly', severity: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: `Format error: ${err.message}`, severity: 'error' }));
    }
  };

  // Upload file for Left / Right
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

  // Paste from clipboard
  const handlePaste = async (target: 'A' | 'B') => {
    try {
      const text = await navigator.clipboard.readText();
      if (target === 'A') setJsonA(text);
      else setJsonB(text);
      dispatch(showToast({ message: `Pasted from clipboard into JSON ${target}`, severity: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Unable to access clipboard. Please paste manually.', severity: 'warning' }));
    }
  };

  // Export Diff Report
  const handleExportDiff = () => {
    if (!diffSummary) return;
    const report = {
      timestamp: new Date().toISOString(),
      isIdentical: diffSummary.isIdentical,
      totalChanges: diffSummary.entries.length,
      metrics: {
        added: diffSummary.addedCount,
        removed: diffSummary.removedCount,
        modified: diffSummary.modifiedCount,
        typeChanged: diffSummary.typeChangedCount,
      },
      differences: diffSummary.entries,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    saveAs(blob, 'json_diff_report.json');
    dispatch(showToast({ message: 'Downloaded JSON Diff Report', severity: 'success' }));
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    dispatch(showToast({ message: `Copied path "${path}"`, severity: 'success' }));
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
        title="Side-by-Side Deep JSON Comparison Studio"
        subtitle="Compare schema, keys, and values across two JSON documents with live dual inputs and visual diffing"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="preset-select-label">Sample Presets</InputLabel>
              <Select
                labelId="preset-select-label"
                value={selectedPreset}
                label="Sample Presets"
                onChange={(e) => handleSelectPreset(e.target.value)}
              >
                {PRESET_SAMPLES.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              Swap Sides
            </AppButton>
            {diffSummary && (
              <AppButton
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportDiff}
              >
                Export Report
              </AppButton>
            )}
          </Box>
        }
      >
        {/* Controls & Mode Switches */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            mb: 2,
            p: 1.5,
            borderRadius: '8px',
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px solid var(--color-surface-border)',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Sort Keys (Ignore Key Order)
                </Typography>
              }
            />

            <ToggleButtonGroup
              size="small"
              value={viewTab}
              exclusive
              onChange={(_, val) => val && setViewTab(val)}
            >
              <ToggleButton value="visual">
                <ViewSidebarIcon fontSize="small" sx={{ mr: 0.5 }} /> Diff View
              </ToggleButton>
              <ToggleButton value="edit">
                <EditNoteIcon fontSize="small" sx={{ mr: 0.5 }} /> Edit JSON Inputs
              </ToggleButton>
            </ToggleButtonGroup>

            {viewTab === 'visual' && (
              <ToggleButtonGroup
                size="small"
                value={diffMode}
                exclusive
                onChange={(_, val) => val && setDiffMode(val)}
              >
                <ToggleButton value="split" title="Side by Side Diff">
                  <ViewSidebarIcon fontSize="small" sx={{ mr: 0.5 }} /> Side-by-Side
                </ToggleButton>
                <ToggleButton value="inline" title="Unified Inline Diff">
                  <ViewStreamIcon fontSize="small" sx={{ mr: 0.5 }} /> Inline
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isDiffing && <CircularProgress size={14} color="primary" />}
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {isDiffing ? 'Computing diff via Web Worker...' : 'Web Worker Real-time Diff Active'}
            </Typography>
          </Box>
        </Box>

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
                  {diffSummary.isIdentical ? '100% Identical' : `${diffSummary.entries.length} diffs`}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {diffSummary.isIdentical ? 'No Differences' : 'Total Changes'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {parseError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
            {parseError}
          </Alert>
        )}

        {/* SIDE-BY-SIDE DUAL EDIT PANELS */}
        {viewTab === 'edit' && (
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {/* Left JSON A Panel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Original JSON (A)
                    </Typography>
                    {validationA.valid ? (
                      <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Valid" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip icon={<ErrorIcon sx={{ fontSize: 14 }} />} label="Invalid" size="small" color="error" variant="outlined" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <input
                      type="file"
                      id="upload-json-a"
                      accept=".json,.txt"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'A')}
                    />
                    <label htmlFor="upload-json-a">
                      <Tooltip title="Upload JSON file">
                        <IconButton size="small" component="span">
                          <UploadFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </label>
                    <Tooltip title="Paste from clipboard">
                      <IconButton size="small" onClick={() => handlePaste('A')}>
                        <ContentPasteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Format Left JSON">
                      <IconButton
                        size="small"
                        onClick={() => {
                          try {
                            setJsonA(formatJson(jsonA, 2, sortKeys));
                          } catch (e: any) {
                            dispatch(showToast({ message: e.message, severity: 'error' }));
                          }
                        }}
                      >
                        <FormatAlignLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear Left">
                      <IconButton size="small" onClick={() => setJsonA('')} color="error">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ border: '1px solid var(--color-surface-border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <Suspense fallback={<Box sx={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}>
                    <MonacoEditor
                      height="380px"
                      language="json"
                      value={jsonA}
                      onChange={(val) => setJsonA(val ?? '')}
                      theme={monacoTheme}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                      }}
                    />
                  </Suspense>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {jsonA.split('\n').length} lines
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {jsonA.length} characters
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Right JSON B Panel */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Modified JSON (B)
                    </Typography>
                    {validationB.valid ? (
                      <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Valid" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip icon={<ErrorIcon sx={{ fontSize: 14 }} />} label="Invalid" size="small" color="error" variant="outlined" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <input
                      type="file"
                      id="upload-json-b"
                      accept=".json,.txt"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'B')}
                    />
                    <label htmlFor="upload-json-b">
                      <Tooltip title="Upload JSON file">
                        <IconButton size="small" component="span">
                          <UploadFileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </label>
                    <Tooltip title="Paste from clipboard">
                      <IconButton size="small" onClick={() => handlePaste('B')}>
                        <ContentPasteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Format Right JSON">
                      <IconButton
                        size="small"
                        onClick={() => {
                          try {
                            setJsonB(formatJson(jsonB, 2, sortKeys));
                          } catch (e: any) {
                            dispatch(showToast({ message: e.message, severity: 'error' }));
                          }
                        }}
                      >
                        <FormatAlignLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear Right">
                      <IconButton size="small" onClick={() => setJsonB('')} color="error">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ border: '1px solid var(--color-surface-border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <Suspense fallback={<Box sx={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}>
                    <MonacoEditor
                      height="380px"
                      language="json"
                      value={jsonB}
                      onChange={(val) => setJsonB(val ?? '')}
                      theme={monacoTheme}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                      }}
                    />
                  </Suspense>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {jsonB.split('\n').length} lines
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {jsonB.length} characters
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* SIDE-BY-SIDE MONACO DIFF VIEWER */}
        {viewTab === 'visual' && (
          <Box
            sx={{
              border: '1px solid var(--color-code-border)',
              borderRadius: '8px',
              overflow: 'hidden',
              mb: 2.5,
            }}
          >
            {/* Diff Header Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1,
                px: 2,
                backgroundColor: 'var(--color-surface-hover)',
                borderBottom: '1px solid var(--color-surface-border)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                LEFT: Original JSON (A)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                RIGHT: Modified JSON (B)
              </Typography>
            </Box>

            <Suspense
              fallback={
                <Box sx={{ height: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              }
            >
              <MonacoDiffEditor
                height="480px"
                language="json"
                original={jsonA}
                modified={jsonB}
                theme={monacoTheme}
                options={{
                  renderSideBySide: diffMode === 'split',
                  fontSize: 13,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  readOnly: true,
                }}
              />
            </Suspense>
          </Box>
        )}

        {/* DETAILED SEMANTIC CHANGES TABLE */}
        {diffSummary && diffSummary.entries.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Semantic Differences Breakdown
                </Typography>
                <Chip label={`${filteredEntries.length} changes`} size="small" variant="outlined" />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
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
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="ADDED">Added (+)</MenuItem>
                  <MenuItem value="REMOVED">Removed (-)</MenuItem>
                  <MenuItem value="MODIFIED">Modified (~)</MenuItem>
                  <MenuItem value="TYPE_CHANGED">Type Changed (!)</MenuItem>
                </Select>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320, borderRadius: '8px' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '130px', backgroundColor: 'var(--color-surface)' }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '240px', backgroundColor: 'var(--color-surface)' }}>
                      JSON Path
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'var(--color-surface)' }}>
                      Original Value (Left)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: 'var(--color-surface)' }}>
                      Modified Value (Right)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.map((entry, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{getTypeChip(entry.type)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}
                          >
                            {entry.path}
                          </Typography>
                          <Tooltip title="Copy path">
                            <IconButton size="small" onClick={() => copyPath(entry.path)} sx={{ p: 0.25, opacity: 0.6 }}>
                              <ContentCopyIcon sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#dc2626' }}>
                        {entry.leftValue !== undefined ? JSON.stringify(entry.leftValue) : <em>null / omitted</em>}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#16a34a' }}>
                        {entry.rightValue !== undefined ? JSON.stringify(entry.rightValue) : <em>null / omitted</em>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No matching difference entries found for this filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </AppCard>
    </Box>
  );
};
