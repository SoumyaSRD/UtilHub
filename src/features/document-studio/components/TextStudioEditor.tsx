import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { saveAs } from 'file-saver';

export interface TextStudioEditorProps {
  fileName: string;
  content: string;
  onChange: (newContent: string) => void;
  language?: string;
}

export const TextStudioEditor: React.FC<TextStudioEditorProps> = ({
  fileName,
  content,
  onChange,
  language = 'plaintext',
}) => {
  const dispatch = useAppDispatch();
  const [caseAnchor, setCaseAnchor] = useState<null | HTMLElement>(null);
  const [cleanAnchor, setCleanAnchor] = useState<null | HTMLElement>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Stats
  const lineCount = content.split('\n').length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const charNoSpaces = content.replace(/\s/g, '').length;

  // Transformations
  const transformCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'kebab') => {
    setCaseAnchor(null);
    let transformed = content;
    switch (type) {
      case 'upper':
        transformed = content.toUpperCase();
        break;
      case 'lower':
        transformed = content.toLowerCase();
        break;
      case 'title':
        transformed = content.replace(/\b\w/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        transformed = content
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '');
        break;
      case 'kebab':
        transformed = content
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        break;
    }
    onChange(transformed);
    dispatch(showToast({ message: `Transformed case to ${type}`, severity: 'success' }));
  };

  // Line cleaning
  const cleanLines = (action: 'sortAsc' | 'sortDesc' | 'dedupe' | 'trim' | 'removeEmpty') => {
    setCleanAnchor(null);
    const lines = content.split('\n');
    let result: string[] = [];

    switch (action) {
      case 'sortAsc':
        result = [...lines].sort((a, b) => a.localeCompare(b));
        break;
      case 'sortDesc':
        result = [...lines].sort((a, b) => b.localeCompare(a));
        break;
      case 'dedupe':
        result = Array.from(new Set(lines));
        break;
      case 'trim':
        result = lines.map((l) => l.trim());
        break;
      case 'removeEmpty':
        result = lines.filter((l) => l.trim().length > 0);
        break;
    }

    onChange(result.join('\n'));
    dispatch(showToast({ message: `Applied line cleaning (${action})`, severity: 'success' }));
  };

  // Find & Replace
  const handleReplaceAll = () => {
    if (!findText) return;
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedFind, 'g');
    const updated = content.replace(regex, replaceText);
    onChange(updated);
    dispatch(showToast({ message: `Replaced all instances of "${findText}"`, severity: 'success' }));
  };

  // Download
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName.endsWith('.txt') || fileName.endsWith('.log') ? fileName : `${fileName}.txt`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AppCard
        title="Notepad & Text Utilities"
        subtitle="Text manipulation, case conversion, line deduplication, and search/replace"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<TextFieldsIcon />}
              onClick={(e) => setCaseAnchor(e.currentTarget)}
            >
              Change Case
            </AppButton>
            <Menu anchorEl={caseAnchor} open={Boolean(caseAnchor)} onClose={() => setCaseAnchor(null)}>
              <MenuItem onClick={() => transformCase('upper')}>UPPERCASE</MenuItem>
              <MenuItem onClick={() => transformCase('lower')}>lowercase</MenuItem>
              <MenuItem onClick={() => transformCase('title')}>Title Case</MenuItem>
              <MenuItem onClick={() => transformCase('camel')}>camelCase</MenuItem>
              <MenuItem onClick={() => transformCase('kebab')}>kebab-case</MenuItem>
            </Menu>

            <AppButton
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={(e) => setCleanAnchor(e.currentTarget)}
            >
              Clean Lines
            </AppButton>
            <Menu anchorEl={cleanAnchor} open={Boolean(cleanAnchor)} onClose={() => setCleanAnchor(null)}>
              <MenuItem onClick={() => cleanLines('sortAsc')}>Sort Lines (A to Z)</MenuItem>
              <MenuItem onClick={() => cleanLines('sortDesc')}>Sort Lines (Z to A)</MenuItem>
              <MenuItem onClick={() => cleanLines('dedupe')}>Remove Duplicate Lines</MenuItem>
              <MenuItem onClick={() => cleanLines('trim')}>Trim Whitespace</MenuItem>
              <MenuItem onClick={() => cleanLines('removeEmpty')}>Remove Empty Lines</MenuItem>
            </Menu>

            <AppButton
              variant="outlined"
              size="small"
              startIcon={<FindReplaceIcon />}
              onClick={() => setShowFindReplace(!showFindReplace)}
            >
              Find & Replace
            </AppButton>

            <AppButton
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download File
            </AppButton>
          </Box>
        }
      >
        {/* Find & Replace Bar */}
        {showFindReplace && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              p: 1.5,
              mb: 2,
              borderRadius: '8px',
              backgroundColor: 'var(--color-surface-hover)',
              border: '1px solid var(--color-surface-border)',
              flexWrap: 'wrap',
            }}
          >
            <TextField
              size="small"
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <TextField
              size="small"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <AppButton variant="contained" size="small" onClick={handleReplaceAll}>
              Replace All
            </AppButton>
          </Box>
        )}

        {/* Live Document Statistics */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip label={`Lines: ${lineCount.toLocaleString()}`} size="small" variant="outlined" />
          <Chip label={`Words: ${wordCount.toLocaleString()}`} size="small" variant="outlined" />
          <Chip label={`Characters: ${charCount.toLocaleString()}`} size="small" variant="outlined" />
          <Chip label={`No Spaces: ${charNoSpaces.toLocaleString()}`} size="small" variant="outlined" />
        </Box>

        <AppCodeEditor
          value={content}
          onChange={onChange}
          language={language}
          height="520px"
          showCopy={true}
          title={fileName}
        />
      </AppCard>
    </Box>
  );
};
