import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { AppButton } from '@shared/components/AppButton/AppButton';
import type { StudioFileType, StudioFile, SpreadsheetContent } from '../types';

export interface NewFileModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (file: StudioFile) => void;
}

interface FileOption {
  type: StudioFileType;
  label: string;
  defaultExt: string;
  icon: React.ReactNode;
  desc: string;
}

const FILE_OPTIONS: FileOption[] = [
  {
    type: 'excel',
    label: 'Excel Spreadsheet',
    defaultExt: '.xlsx',
    icon: <TableChartIcon sx={{ fontSize: 32, color: '#16a34a' }} />,
    desc: 'Multi-sheet tabular workbook with rows, columns, and formula operations',
  },
  {
    type: 'text',
    label: 'Notepad / Plain Text',
    defaultExt: '.txt',
    icon: <DescriptionIcon sx={{ fontSize: 32, color: '#2563eb' }} />,
    desc: 'Clean text file for notes, logs, deduplication, and case transformations',
  },
  {
    type: 'markdown',
    label: 'Markdown Document',
    defaultExt: '.md',
    icon: <AutoStoriesIcon sx={{ fontSize: 32, color: '#9333ea' }} />,
    desc: 'Documentation with headings, checklists, code blocks, and live split preview',
  },
  {
    type: 'word',
    label: 'Word / Rich Document',
    defaultExt: '.docx',
    icon: <ArticleIcon sx={{ fontSize: 32, color: '#0284c7' }} />,
    desc: 'Formatted document with headings, tables, alignments, and Word export',
  },
  {
    type: 'code',
    label: 'JSON / Code File',
    defaultExt: '.json',
    icon: <CodeIcon sx={{ fontSize: 32, color: '#ea580c' }} />,
    desc: 'Structured JSON or code document with syntax highlighting and validation',
  },
];

export const NewFileModal: React.FC<NewFileModalProps> = ({ open, onClose, onCreate }) => {
  const [selectedType, setSelectedType] = useState<StudioFileType>('excel');
  const [fileName, setFileName] = useState('Untitled');

  const selectedOpt = FILE_OPTIONS.find((o) => o.type === selectedType) || FILE_OPTIONS[0];

  const handleCreate = () => {
    const cleanName = fileName.trim() || 'Untitled';
    const finalName = cleanName.includes('.')
      ? cleanName
      : `${cleanName}${selectedOpt.defaultExt}`;

    let initialContent: string | SpreadsheetContent = '';

    if (selectedType === 'excel') {
      initialContent = {
        sheetNames: ['Sheet1'],
        activeSheet: 'Sheet1',
        sheets: {
          Sheet1: {
            sheetName: 'Sheet1',
            columns: ['ID', 'Name', 'Category', 'Price', 'Status'],
            rows: [
              { ID: '101', Name: 'Product Alpha', Category: 'Hardware', Price: 199.99, Status: 'In Stock' },
              { ID: '102', Name: 'Product Beta', Category: 'Software', Price: 49.99, Status: 'Active' },
              { ID: '103', Name: 'Product Gamma', Category: 'Services', Price: 29.0, Status: 'Pending' },
            ],
          },
        },
      };
    } else if (selectedType === 'markdown') {
      initialContent = `# ${cleanName}\n\nWelcome to your new Markdown document.\n\n## Features\n- [x] Create and edit files\n- [ ] Export to HTML or PDF\n\n> Note: Use the toolbar above for quick formatting!`;
    } else if (selectedType === 'word') {
      initialContent = `<h1>${cleanName}</h1><p>Start typing your formatted document here. You can use bold, italics, tables, and headings.</p>`;
    } else if (selectedType === 'code') {
      initialContent = `{\n  "name": "${cleanName}",\n  "created": "${new Date().toISOString()}",\n  "items": []\n}`;
    } else {
      initialContent = `New text document created on ${new Date().toLocaleString()}.\n`;
    }

    const newFile: StudioFile = {
      id: `file-${Date.now()}`,
      name: finalName,
      type: selectedType,
      content: initialContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sizeBytes: 1024,
    };

    onCreate(newFile);
    onClose();
    setFileName('Untitled');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Create New File</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <TextField
          label="File Name"
          fullWidth
          size="small"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          helperText={`Will be saved as ${fileName}${fileName.includes('.') ? '' : selectedOpt.defaultExt}`}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Select Document Type
        </Typography>

        <Grid container spacing={1.5}>
          {FILE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.type;
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={opt.type}>
                <Paper
                  variant="outlined"
                  onClick={() => setSelectedType(opt.type)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-surface-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-light, rgba(37, 99, 235, 0.05))'
                      : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                    },
                  }}
                >
                  {opt.icon}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <AppButton variant="outlined" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton variant="contained" onClick={handleCreate}>
          Create File
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
