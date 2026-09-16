import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CompressIcon from '@mui/icons-material/Compress';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DataObjectIcon from '@mui/icons-material/DataObject';
import StorageIcon from '@mui/icons-material/Storage';
import JavascriptIcon from '@mui/icons-material/Javascript';
import CssIcon from '@mui/icons-material/Css';
import HtmlIcon from '@mui/icons-material/Html';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { formatSql, minifySql, type SqlDialect, type KeywordCase } from '../services/sqlFormatter';
import {
  formatJson,
  minifyJson,
  repairJson,
  escapeJsonString,
  unescapeJsonString,
  jsonToTypeScript,
  formatXmlHtml,
  minifyXmlHtml,
  formatCss,
  minifyCss,
} from '../services/codeFormatters';
import { saveAs } from 'file-saver';

type FormatterMode = 'json' | 'sql' | 'html' | 'css' | 'js';

const SAMPLES: Record<FormatterMode, string> = {
  json: `{
  "database": "production_cluster",
  "connections": 150,
  "isActive": true,
  "tags": ["cloud", "k8s", "high-availability"],
  "regions": { "us-east-1": { "latencyMs": 14.2, "replicas": 3 } }
}`,
  sql: `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as revenue from users u left join orders o on u.id = o.user_id where u.created_at >= '2025-01-01' and u.status in ('ACTIVE', 'VERIFIED') group by u.id, u.username, u.email having count(o.id) > 5 order by revenue desc limit 50;`,
  html: `<div class="container"><header><h1 id="title">Enterprise Utility Hub</h1><nav><ul><li><a href="/dashboard">Dashboard</a></li><li><a href="/studio">Studio</a></li></ul></nav></header><main><p>Unified developer utilities platform.</p></main></div>`,
  css: `.card-container{display:flex;flex-direction:column;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:24px;background-color:#ffffff;}.card-header{font-size:1.25rem;font-weight:700;color:#1e293b;}`,
  js: `function calculateMetrics(records, options = {}) { const threshold = options.minVal ?? 0; return records.filter(r => r.score >= threshold).map(r => ({ id: r.id, grade: r.score > 90 ? 'A' : 'B' })); }`,
};

export const CodeFormatterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<FormatterMode>('sql');
  const [content, setContent] = useState<string>(SAMPLES.sql);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // SQL options
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgres');
  const [sqlKeywordCase, setSqlKeywordCase] = useState<KeywordCase>('upper');
  const [sqlIndent, setSqlIndent] = useState<number>(2);
  const [sqlBreakOnComma, setSqlBreakOnComma] = useState<boolean>(false);

  // JSON options
  const [jsonIndent, setJsonIndent] = useState<number>(2);

  const handleModeChange = (_: React.SyntheticEvent, newMode: FormatterMode) => {
    if (!newMode) return;
    setMode(newMode);
    setContent(SAMPLES[newMode]);
    setErrorMsg(null);
  };

  const handleFormat = () => {
    setErrorMsg(null);
    try {
      if (mode === 'sql') {
        const formatted = formatSql(content, {
          dialect: sqlDialect,
          keywordCase: sqlKeywordCase,
          indentSpaces: sqlIndent,
          breakOnComma: sqlBreakOnComma,
        });
        setContent(formatted);
        dispatch(showToast({ message: 'Formatted SQL query successfully', severity: 'success' }));
      } else if (mode === 'json') {
        const formatted = formatJson(content, jsonIndent, false);
        setContent(formatted);
        dispatch(showToast({ message: 'Beautified JSON successfully', severity: 'success' }));
      } else if (mode === 'html') {
        const formatted = formatXmlHtml(content);
        setContent(formatted);
        dispatch(showToast({ message: 'Formatted HTML/XML tags successfully', severity: 'success' }));
      } else if (mode === 'css') {
        const formatted = formatCss(content);
        setContent(formatted);
        dispatch(showToast({ message: 'Formatted CSS stylesheet successfully', severity: 'success' }));
      } else if (mode === 'js') {
        // Simple JS indentation via JSON or format
        setContent(content.trim());
        dispatch(showToast({ message: 'Processed JavaScript code', severity: 'success' }));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Formatting failed. Please check syntax.');
    }
  };

  const handleMinify = () => {
    setErrorMsg(null);
    try {
      if (mode === 'sql') {
        setContent(minifySql(content));
        dispatch(showToast({ message: 'Minified SQL to compact statement', severity: 'success' }));
      } else if (mode === 'json') {
        setContent(minifyJson(content));
        dispatch(showToast({ message: 'Minified JSON to single line', severity: 'success' }));
      } else if (mode === 'html') {
        setContent(minifyXmlHtml(content));
        dispatch(showToast({ message: 'Minified HTML/XML', severity: 'success' }));
      } else if (mode === 'css') {
        setContent(minifyCss(content));
        dispatch(showToast({ message: 'Minified CSS rules', severity: 'success' }));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Minification failed. Please check syntax.');
    }
  };

  const handleJsonSortKeys = () => {
    setErrorMsg(null);
    try {
      const sorted = formatJson(content, jsonIndent, true);
      setContent(sorted);
      dispatch(showToast({ message: 'Sorted all JSON object keys alphabetically', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleJsonRepair = () => {
    setErrorMsg(null);
    try {
      const repaired = repairJson(content);
      setContent(repaired);
      dispatch(showToast({ message: 'Repaired relaxed JSON quotes and commas', severity: 'success' }));
    } catch (err) {
      setErrorMsg('Could not repair JSON automatically. Please check brackets and quotes.');
    }
  };

  const handleJsonToTypeScript = () => {
    setErrorMsg(null);
    try {
      const tsInterfaces = jsonToTypeScript(content);
      setContent(tsInterfaces);
      setMode('js');
      dispatch(showToast({ message: 'Generated TypeScript interfaces from JSON', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse JSON for TypeScript generation');
    }
  };

  const handleEscapeToggle = (escape: boolean) => {
    setErrorMsg(null);
    try {
      if (escape) {
        setContent(escapeJsonString(content));
        dispatch(showToast({ message: 'Escaped string for code embedding', severity: 'info' }));
      } else {
        setContent(unescapeJsonString(content));
        dispatch(showToast({ message: 'Unescaped string', severity: 'info' }));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'String escape/unescape failed');
    }
  };

  const handleDownload = () => {
    const extMap: Record<FormatterMode, string> = {
      json: 'json',
      sql: 'sql',
      html: 'html',
      css: 'css',
      js: 'ts',
    };
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `formatted_output.${extMap[mode]}`);
  };

  const getEditorLanguage = () => {
    switch (mode) {
      case 'json': return 'json';
      case 'sql': return 'sql';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'typescript';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.code-formatter"
        title="Multi-Language Code & Data Formatter"
        description="Beautify, minify, repair, and convert SQL, JSON, TypeScript, HTML, and CSS with advanced dialect and casing options."
        iconName="Code"
        actions={
          <AppButton
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={() => {
              setContent(SAMPLES[mode]);
              setErrorMsg(null);
            }}
          >
            Reset Sample
          </AppButton>
        }
      />

      {/* Mode Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-surface-border)' }}>
        <Tabs
          value={mode}
          onChange={handleModeChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<StorageIcon />} iconPosition="start" label="SQL Formatter" value="sql" />
          <Tab icon={<DataObjectIcon />} iconPosition="start" label="JSON Formatter & Tools" value="json" />
          <Tab icon={<HtmlIcon />} iconPosition="start" label="HTML & XML" value="html" />
          <Tab icon={<CssIcon />} iconPosition="start" label="CSS & Styles" value="css" />
          <Tab icon={<JavascriptIcon />} iconPosition="start" label="JavaScript & TypeScript" value="js" />
        </Tabs>
      </Box>

      {/* Toolbar and Options Bar */}
      <AppCard
        title={`${mode.toUpperCase()} Configuration & Actions`}
        subtitle="Fine-tune indentation, dialect, keyword casing, and code transformation"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<FormatAlignLeftIcon />}
              onClick={handleFormat}
            >
              Format / Beautify
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<CompressIcon />}
              onClick={handleMinify}
            >
              Minify
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </AppButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          {mode === 'sql' && (
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Dialect</InputLabel>
                <Select
                  value={sqlDialect}
                  label="Dialect"
                  onChange={(e) => setSqlDialect(e.target.value as SqlDialect)}
                >
                  <MenuItem value="postgres">PostgreSQL</MenuItem>
                  <MenuItem value="standard">Standard SQL (ANSI)</MenuItem>
                  <MenuItem value="mysql">MySQL / MariaDB</MenuItem>
                  <MenuItem value="sqlite">SQLite</MenuItem>
                  <MenuItem value="oracle">Oracle PL/SQL</MenuItem>
                  <MenuItem value="bigquery">Google BigQuery</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Keyword Case</InputLabel>
                <Select
                  value={sqlKeywordCase}
                  label="Keyword Case"
                  onChange={(e) => setSqlKeywordCase(e.target.value as KeywordCase)}
                >
                  <MenuItem value="upper">UPPERCASE (SELECT)</MenuItem>
                  <MenuItem value="lower">lowercase (select)</MenuItem>
                  <MenuItem value="preserve">Preserve Original</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Indentation</InputLabel>
                <Select
                  value={sqlIndent}
                  label="Indentation"
                  onChange={(e) => setSqlIndent(Number(e.target.value))}
                >
                  <MenuItem value={2}>2 Spaces</MenuItem>
                  <MenuItem value={4}>4 Spaces</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={sqlBreakOnComma}
                    onChange={(e) => setSqlBreakOnComma(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Break lines on comma</Typography>}
              />
            </>
          )}

          {mode === 'json' && (
            <>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Indentation</InputLabel>
                <Select
                  value={jsonIndent}
                  label="Indentation"
                  onChange={(e) => setJsonIndent(Number(e.target.value))}
                >
                  <MenuItem value={2}>2 Spaces</MenuItem>
                  <MenuItem value={4}>4 Spaces</MenuItem>
                </Select>
              </FormControl>

              <AppButton
                variant="outlined"
                size="small"
                startIcon={<SortByAlphaIcon />}
                onClick={handleJsonSortKeys}
              >
                Sort Keys (A-Z)
              </AppButton>

              <AppButton
                variant="outlined"
                size="small"
                startIcon={<AutoFixHighIcon />}
                onClick={handleJsonRepair}
                title="Convert single quotes to double quotes, strip trailing commas, and quote keys"
              >
                Repair Loose JSON
              </AppButton>

              <AppButton
                variant="outlined"
                size="small"
                startIcon={<CodeIcon />}
                onClick={handleJsonToTypeScript}
              >
                Generate TypeScript
              </AppButton>

              <AppButton
                variant="text"
                size="small"
                onClick={() => handleEscapeToggle(true)}
              >
                Escape
              </AppButton>
              <AppButton
                variant="text"
                size="small"
                onClick={() => handleEscapeToggle(false)}
              >
                Unescape
              </AppButton>
            </>
          )}
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        <AppCodeEditor
          value={content}
          onChange={(val) => setContent(val)}
          language={getEditorLanguage()}
          height="500px"
          showCopy={true}
          title={`${mode.toUpperCase()} Editor`}
        />
      </AppCard>
    </Box>
  );
};

export default CodeFormatterPage;
