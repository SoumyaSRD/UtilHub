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
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
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
  formatJsTs,
  minifyJsTs,
} from '../services/codeFormatters';
import {
  transpileTsToJs,
  executeCodeInSandbox,
  type ExecutionResult,
} from '../services/tsCompiler';
import { CODE_CHALLENGE_SNIPPETS } from '../services/codeSnippets';
import { saveAs } from 'file-saver';

type FormatterMode = 'sql' | 'json' | 'js' | 'playground' | 'html' | 'css';

const SAMPLES: Record<Exclude<FormatterMode, 'playground'>, string> = {
  sql: `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as revenue from users u left join orders o on u.id = o.user_id where u.created_at >= '2025-01-01' and u.status in ('ACTIVE', 'VERIFIED') group by u.id, u.username, u.email having count(o.id) > 5 order by revenue desc limit 50;`,
  json: `{
  "database": "production_cluster",
  "connections": 150,
  "isActive": true,
  "tags": ["cloud", "k8s", "high-availability"],
  "regions": { "us-east-1": { "latencyMs": 14.2, "replicas": 3 } }
}`,
  js: `interface PlatformMetrics {
  id: string;
  name: string;
  uptimePct: number;
  tags?: string[];
}

function calculateHealth(metrics: PlatformMetrics[], minThreshold: number = 95.0): { healthy: boolean; healthyCount: number; alertList: string[] } {
  const alertList: string[] = [];
  let healthyCount = 0;

  for (const m of metrics) {
    if (m.uptimePct >= minThreshold) {
      healthyCount++;
    } else {
      alertList.push(\`Service \${m.name} (\${m.id}) below SLA: \${m.uptimePct}%\`);
    }
  }

  return {
    healthy: alertList.length === 0,
    healthyCount,
    alertList,
  };
}

export const sampleMetrics: PlatformMetrics[] = [
  { id: 'srv-01', name: 'Auth Gateway', uptimePct: 99.98, tags: ['security', 'core'] },
  { id: 'srv-02', name: 'Database Cluster', uptimePct: 99.95, tags: ['storage'] },
  { id: 'srv-03', name: 'Batch Worker', uptimePct: 93.40, tags: ['async'] },
];

console.log('Result:', calculateHealth(sampleMetrics));`,
  html: `<div class="container"><header><h1 id="title">Enterprise Utility Hub</h1><nav><ul><li><a href="/dashboard">Dashboard</a></li><li><a href="/studio">Studio</a></li></ul></nav></header><main><p>Unified developer utilities platform.</p></main></div>`,
  css: `.card-container{display:flex;flex-direction:column;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:24px;background-color:#ffffff;}.card-header{font-size:1.25rem;font-weight:700;color:#1e293b;}`,
};

export const CodeFormatterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<FormatterMode>('js');
  const [content, setContent] = useState<string>(SAMPLES.js);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // JS/TS Formatter Options
  const [jsIndent, setJsIndent] = useState<2 | 4 | '\t'>(2);
  const [jsSemicolons, setJsSemicolons] = useState<boolean>(true);
  const [jsQuotes, setJsQuotes] = useState<'single' | 'double' | 'preserve'>('preserve');
  const [jsSpaceOperators, setJsSpaceOperators] = useState<boolean>(true);

  // SQL options
  const [sqlDialect, setSqlDialect] = useState<SqlDialect>('postgres');
  const [sqlKeywordCase, setSqlKeywordCase] = useState<KeywordCase>('upper');
  const [sqlIndent, setSqlIndent] = useState<number>(2);
  const [sqlBreakOnComma, setSqlBreakOnComma] = useState<boolean>(false);

  // JSON options
  const [jsonIndent, setJsonIndent] = useState<number>(2);

  // Playground / Compiler State
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(CODE_CHALLENGE_SNIPPETS[0].id);
  const [playgroundCode, setPlaygroundCode] = useState<string>(CODE_CHALLENGE_SNIPPETS[0].code);
  const [compiledJs, setCompiledJs] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [playgroundTab, setPlaygroundTab] = useState<'console' | 'compiled'>('console');

  const activeSnippet = CODE_CHALLENGE_SNIPPETS.find((s) => s.id === selectedSnippetId);

  const handleModeChange = (_: React.SyntheticEvent, newMode: FormatterMode) => {
    if (!newMode) return;
    setMode(newMode);
    setErrorMsg(null);
    if (newMode !== 'playground') {
      setContent(SAMPLES[newMode]);
    }
  };

  const handleSelectSnippet = (id: string) => {
    setSelectedSnippetId(id);
    const snip = CODE_CHALLENGE_SNIPPETS.find((s) => s.id === id);
    if (snip) {
      setPlaygroundCode(snip.code);
      setExecutionResult(null);
      setCompiledJs('');
      dispatch(showToast({ message: `Loaded challenge: ${snip.title}`, severity: 'info' }));
    }
  };

  const handleFormat = () => {
    setErrorMsg(null);
    try {
      if (mode === 'js') {
        const formatted = formatJsTs(content, {
          indentSize: jsIndent,
          insertSemicolons: jsSemicolons,
          quoteType: jsQuotes,
          spaceAroundOperators: jsSpaceOperators,
        });
        setContent(formatted);
        dispatch(showToast({ message: 'Formatted TypeScript / JavaScript code perfectly!', severity: 'success' }));
      } else if (mode === 'sql') {
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
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Formatting failed. Please check syntax.');
    }
  };

  const handleMinify = () => {
    setErrorMsg(null);
    try {
      if (mode === 'js') {
        setContent(minifyJsTs(content));
        dispatch(showToast({ message: 'Minified TypeScript / JavaScript code', severity: 'success' }));
      } else if (mode === 'sql') {
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
      setErrorMsg(err instanceof Error ? err.message : 'Minification failed.');
    }
  };

  // Compile and Run in Playground
  const handleRunPlayground = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      // 1. Transpile TS to JS
      const transpileRes = await transpileTsToJs(playgroundCode);
      if (transpileRes.error) {
        throw new Error(`TypeScript Compilation Error: ${transpileRes.error}`);
      }
      setCompiledJs(transpileRes.js);

      // 2. Execute in Sandbox
      const execRes = await executeCodeInSandbox(transpileRes.js);
      setExecutionResult(execRes);
      setPlaygroundTab('console');

      if (execRes.success) {
        dispatch(showToast({ message: `Compiled & Ran in ${execRes.executionTimeMs}ms`, severity: 'success' }));
      } else {
        dispatch(showToast({ message: `Execution error: ${execRes.error}`, severity: 'error' }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing code');
      setExecutionResult({
        success: false,
        logs: [{ type: 'error', message: err.message }],
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Transpile Only
  const handleTranspileOnly = async () => {
    setIsRunning(true);
    try {
      const res = await transpileTsToJs(playgroundCode);
      if (res.error) {
        throw new Error(res.error);
      }
      setCompiledJs(res.js);
      setPlaygroundTab('compiled');
      dispatch(showToast({ message: 'Transpiled TypeScript to JavaScript successfully', severity: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: `Transpile error: ${err.message}`, severity: 'error' }));
    } finally {
      setIsRunning(false);
    }
  };

  // Format Playground Code
  const handleFormatPlayground = () => {
    try {
      const formatted = formatJsTs(playgroundCode, {
        indentSize: 2,
        insertSemicolons: true,
        quoteType: 'preserve',
      });
      setPlaygroundCode(formatted);
      dispatch(showToast({ message: 'Formatted code snippet', severity: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: `Format error: ${err.message}`, severity: 'error' }));
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
    const extMap: Record<Exclude<FormatterMode, 'playground'>, string> = {
      json: 'json',
      sql: 'sql',
      html: 'html',
      css: 'css',
      js: 'ts',
    };
    if (mode === 'playground') {
      const blob = new Blob([playgroundCode], { type: 'text/typescript;charset=utf-8' });
      saveAs(blob, `${selectedSnippetId}.ts`);
      return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `formatted_output.${extMap[mode]}`);
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.code-formatter"
        title="TypeScript, JavaScript & Code Studio"
        description="High-precision formatters for TypeScript, JavaScript, SQL, JSON, HTML, and CSS. Includes a live TypeScript/JavaScript compiler & coding challenges playground."
        iconName="Code"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {mode !== 'playground' ? (
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
            ) : (
              <AppButton
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={() => {
                  if (activeSnippet) setPlaygroundCode(activeSnippet.code);
                  setExecutionResult(null);
                }}
              >
                Reset Challenge
              </AppButton>
            )}
          </Box>
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
          <Tab icon={<JavascriptIcon />} iconPosition="start" label="TypeScript & JS Formatter" value="js" />
          <Tab icon={<PsychologyIcon />} iconPosition="start" label="TS/JS Compiler & Challenges" value="playground" />
          <Tab icon={<StorageIcon />} iconPosition="start" label="SQL Formatter" value="sql" />
          <Tab icon={<DataObjectIcon />} iconPosition="start" label="JSON Formatter & Tools" value="json" />
          <Tab icon={<HtmlIcon />} iconPosition="start" label="HTML & XML" value="html" />
          <Tab icon={<CssIcon />} iconPosition="start" label="CSS & Styles" value="css" />
        </Tabs>
      </Box>

      {/* TAB 1: TYPESCRIPT & JAVASCRIPT COMPILER & CHALLENGES PLAYGROUND */}
      {mode === 'playground' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Challenge Selector & Header Card */}
          <AppCard
            title="TypeScript / JavaScript Practice Arena & Compiler"
            subtitle="Practice algorithms, data structures, and TypeScript types. Write, compile, and execute code with live terminal feedback."
            headerActions={
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel id="challenge-select-label">Select Code Challenge</InputLabel>
                  <Select
                    labelId="challenge-select-label"
                    value={selectedSnippetId}
                    label="Select Code Challenge"
                    onChange={(e) => handleSelectSnippet(e.target.value)}
                  >
                    {CODE_CHALLENGE_SNIPPETS.map((snip) => (
                      <MenuItem key={snip.id} value={snip.id}>
                        {snip.title} ({snip.difficulty})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <AppButton
                  variant="outlined"
                  size="small"
                  startIcon={<FormatAlignLeftIcon />}
                  onClick={handleFormatPlayground}
                >
                  Format Code
                </AppButton>

                <AppButton
                  variant="outlined"
                  size="small"
                  startIcon={<CodeIcon />}
                  onClick={handleTranspileOnly}
                  disabled={isRunning}
                >
                  Transpile TS
                </AppButton>

                <AppButton
                  variant="contained"
                  size="small"
                  startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                  onClick={handleRunPlayground}
                  disabled={isRunning}
                  sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                >
                  Run Code (Ctrl+Enter)
                </AppButton>

                <AppButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Save .ts
                </AppButton>
              </Box>
            }
          >
            {/* Challenge Description Banner */}
            {activeSnippet && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-surface-border)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {activeSnippet.title}
                  </Typography>
                  <Chip
                    label={activeSnippet.difficulty}
                    size="small"
                    color={getDifficultyColor(activeSnippet.difficulty)}
                  />
                  <Chip label={activeSnippet.category} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {activeSnippet.description}
                </Typography>
              </Paper>
            )}

            {/* Split Workspace: Code Editor (Left) & Output Console (Right) */}
            <Grid container spacing={2}>
              {/* Left Code Editor */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      TypeScript / JavaScript Editor
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Press Ctrl+Enter or click Run Code
                    </Typography>
                  </Box>
                  <AppCodeEditor
                    value={playgroundCode}
                    onChange={(val) => setPlaygroundCode(val)}
                    language="typescript"
                    height="540px"
                    showCopy={true}
                    title="workspace.ts"
                  />
                </Box>
              </Grid>

              {/* Right Output / Console Panel */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: '575px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-code-bg)',
                    color: 'var(--color-code-text)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-code-border)',
                  }}
                >
                  {/* Console Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1,
                      backgroundColor: 'var(--color-surface)',
                      borderBottom: '1px solid var(--color-code-border)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Execution Console
                      </Typography>
                      {executionResult && (
                        <Chip
                          icon={executionResult.success ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : <ErrorIcon sx={{ fontSize: 13 }} />}
                          label={executionResult.success ? `Success (${executionResult.executionTimeMs}ms)` : `Error (${executionResult.executionTimeMs}ms)`}
                          size="small"
                          color={executionResult.success ? 'success' : 'error'}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tabs
                        value={playgroundTab}
                        onChange={(_, val) => setPlaygroundTab(val)}
                        textColor="inherit"
                        indicatorColor="primary"
                        sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0, px: 1, fontSize: '0.75rem', textTransform: 'none', color: '#94a3b8' } }}
                      >
                        <Tab label="Console Logs" value="console" />
                        <Tab label="Compiled JS" value="compiled" />
                      </Tabs>
                      {executionResult && (
                        <Tooltip title="Clear Console">
                          <IconButton size="small" onClick={() => setExecutionResult(null)} sx={{ color: '#94a3b8' }}>
                            <DeleteSweepIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Console Body */}
                  <Box sx={{ flex: 1, p: 2, overflowY: 'auto', fontFamily: '"JetBrains Mono", Menlo, monospace', fontSize: '0.82rem' }}>
                    {playgroundTab === 'console' ? (
                      executionResult ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {executionResult.logs.map((log, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'flex-start',
                                color:
                                  log.type === 'error'
                                    ? '#f87171'
                                    : log.type === 'warn'
                                    ? '#fbbf24'
                                    : log.type === 'info'
                                    ? '#38bdf8'
                                    : '#e2e8f0',
                                borderLeft: log.type === 'error' ? '3px solid #ef4444' : 'none',
                                pl: log.type === 'error' ? 1 : 0,
                              }}
                            >
                              <Typography component="span" sx={{ opacity: 0.5, userSelect: 'none', fontSize: '0.75rem' }}>
                                &gt;
                              </Typography>
                              <Typography component="pre" sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                                {log.message}
                              </Typography>
                            </Box>
                          ))}

                          {executionResult.logs.length === 0 && (
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                              Code executed successfully with no console outputs.
                            </Typography>
                          )}

                          {executionResult.returnValue !== undefined && (
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(148, 163, 184, 0.2)' }}>
                              <Typography variant="caption" sx={{ color: '#38bdf8', display: 'block', fontWeight: 600, mb: 0.5 }}>
                                Return Value:
                              </Typography>
                              <Typography component="pre" sx={{ margin: 0, color: '#a7f3d0', fontFamily: 'inherit' }}>
                                {executionResult.returnValue}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: 1 }}>
                          <TerminalIcon sx={{ fontSize: 40 }} />
                          <Typography variant="body2">Click "Run Code" to compile and execute.</Typography>
                        </Box>
                      )
                    ) : (
                      /* Compiled JS View */
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600 }}>
                            Transpiled ES2022 Output:
                          </Typography>
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(compiledJs)} sx={{ color: '#94a3b8' }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography component="pre" sx={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                          {compiledJs || '// Click "Transpile TS" or "Run Code" to generate compiled JavaScript.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </AppCard>
        </Box>
      )}

      {/* TAB 2: FORMATTER (TS/JS, SQL, JSON, HTML, CSS) */}
      {mode !== 'playground' && (
        <AppCard
          title={`${mode === 'js' ? 'TypeScript & JavaScript' : mode.toUpperCase()} Formatter & Configuration`}
          subtitle="Fine-tune indentation, dialect, keyword casing, quotes, and syntax transformation"
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
          {/* Format Options Bar */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            {mode === 'js' && (
              <>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Indentation</InputLabel>
                  <Select
                    value={jsIndent}
                    label="Indentation"
                    onChange={(e) => setJsIndent(e.target.value as any)}
                  >
                    <MenuItem value={2}>2 Spaces</MenuItem>
                    <MenuItem value={4}>4 Spaces</MenuItem>
                    <MenuItem value={'\t'}>Tab</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Quotes</InputLabel>
                  <Select
                    value={jsQuotes}
                    label="Quotes"
                    onChange={(e) => setJsQuotes(e.target.value as any)}
                  >
                    <MenuItem value="preserve">Preserve Quotes</MenuItem>
                    <MenuItem value="single">Single Quotes (')</MenuItem>
                    <MenuItem value="double">Double Quotes (")</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={jsSemicolons}
                      onChange={(e) => setJsSemicolons(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Insert Semicolons</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={jsSpaceOperators}
                      onChange={(e) => setJsSpaceOperators(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Space Around Operators</Typography>}
                />
              </>
            )}

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

                <AppButton variant="text" size="small" onClick={() => handleEscapeToggle(true)}>
                  Escape
                </AppButton>
                <AppButton variant="text" size="small" onClick={() => handleEscapeToggle(false)}>
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
            language={mode === 'js' ? 'typescript' : mode}
            height="500px"
            showCopy={true}
            title={`${mode === 'js' ? 'TypeScript / JavaScript' : mode.toUpperCase()} Editor`}
          />
        </AppCard>
      )}
    </Box>
  );
};

export default CodeFormatterPage;
