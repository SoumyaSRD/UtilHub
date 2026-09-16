import React, { useState, Suspense, lazy } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppSelector, useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
);

const SAMPLE_ORIGINAL = `// Version 1.0
function calculateDiscount(user, cartTotal) {
  let discount = 0;
  if (user.isPremium) {
    discount = cartTotal * 0.10;
  }
  return discount;
}`;

const SAMPLE_MODIFIED = `// Version 2.0 - With Tier Support
function calculateDiscount(user, cartTotal) {
  let discount = 0;
  if (user.tier === 'PLATINUM') {
    discount = cartTotal * 0.20;
  } else if (user.tier === 'GOLD' || user.isPremium) {
    discount = cartTotal * 0.12;
  }
  return Math.min(discount, 50.0);
}`;

export const TextDiffViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.preferences.themeMode);
  const monacoTheme = currentTheme === 'dark' ? 'vs-dark' : 'light';

  const [language, setLanguage] = useState('javascript');
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState(SAMPLE_MODIFIED);
  const [sideBySide, setSideBySide] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    dispatch(showToast({ message: 'Swapped original and modified texts', severity: 'info' }));
  };

  const handleReset = () => {
    setOriginalText(SAMPLE_ORIGINAL);
    setModifiedText(SAMPLE_MODIFIED);
    dispatch(showToast({ message: 'Reset to sample text', severity: 'info' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'original' | 'modified') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result ?? '');
      if (target === 'original') {
        setOriginalText(content);
      } else {
        setModifiedText(content);
      }
      dispatch(showToast({ message: `Loaded ${file.name} into ${target}`, severity: 'success' }));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const originalLines = originalText.split('\n').length;
  const modifiedLines = modifiedText.split('\n').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <AppCard
        title="Diff Configuration & Comparison Controls"
        subtitle="Compare code, configuration files, text documents, or markdown line-by-line"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<SwapHorizIcon />}
              onClick={handleSwap}
            >
              Swap Sides
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              Reset Sample
            </AppButton>
          </Box>
        }
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Syntax Language</InputLabel>
              <Select
                value={language}
                label="Syntax Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="plaintext">Plain Text</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="sql">SQL</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="markdown">Markdown</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="yaml">YAML</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={sideBySide}
                  onChange={(e) => setSideBySide(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {sideBySide ? <ViewColumnIcon fontSize="small" /> : <ViewStreamIcon fontSize="small" />}
                  <Typography variant="body2">
                    {sideBySide ? 'Side-by-Side View' : 'Inline Unified View'}
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Ignore Whitespace</Typography>}
            />
          </Box>

          {/* Upload buttons for Original and Modified */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <input
              type="file"
              id="upload-original-file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'original')}
            />
            <label htmlFor="upload-original-file">
              <AppButton
                component="span"
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
              >
                Upload Left (Original)
              </AppButton>
            </label>

            <input
              type="file"
              id="upload-modified-file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'modified')}
            />
            <label htmlFor="upload-modified-file">
              <AppButton
                component="span"
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
              >
                Upload Right (Modified)
              </AppButton>
            </label>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <Chip label={`Left: ${originalLines} lines`} size="small" variant="outlined" />
          <Chip label={`Right: ${modifiedLines} lines`} size="small" variant="outlined" />
        </Box>

        <Box
          sx={{
            border: '1px solid var(--color-code-border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Suspense
            fallback={
              <Box
                sx={{
                  height: '520px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-code-bg)',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={24} />
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  Loading diff engine...
                </Typography>
              </Box>
            }
          >
            <MonacoDiffEditor
              height="550px"
              language={language}
              original={originalText}
              modified={modifiedText}
              theme={monacoTheme}
              options={{
                renderSideBySide: sideBySide,
                ignoreTrimWhitespace: ignoreWhitespace,
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 13,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </Suspense>
        </Box>
      </AppCard>
    </Box>
  );
};
