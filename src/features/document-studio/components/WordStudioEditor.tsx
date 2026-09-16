import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TableChartIcon from '@mui/icons-material/TableChart';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { saveAs } from 'file-saver';

export interface WordStudioEditorProps {
  fileName: string;
  content: string;
  onChange: (newContent: string) => void;
}

export const WordStudioEditor: React.FC<WordStudioEditorProps> = ({
  fileName,
  content,
  onChange,
}) => {
  const dispatch = useAppDispatch();
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 8px;">Header 1</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">Header 2</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Cell 3</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCmd('insertHTML', tableHtml);
  };

  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${fileName}</title></head>
      <body style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${content}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    saveAs(blob, fileName.endsWith('.doc') || fileName.endsWith('.docx') ? fileName : `${fileName}.doc`);
    dispatch(showToast({ message: 'Downloaded document in Word-compatible format', severity: 'success' }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: Calibri, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AppCard
        title="Word & Rich Text Document Editor"
        subtitle="Format documents with rich headings, alignments, tables, lists, and Word (.doc/docx) export"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print / PDF
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadDoc}
            >
              Export Word (.doc)
            </AppButton>
          </Box>
        }
      >
        {/* Word Toolbar */}
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 1,
            mb: 2,
            borderRadius: '8px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="Heading 1">
            <AppButton variant="text" size="small" onClick={() => executeCmd('formatBlock', '<h1>')}>
              H1
            </AppButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <AppButton variant="text" size="small" onClick={() => executeCmd('formatBlock', '<h2>')}>
              H2
            </AppButton>
          </Tooltip>
          <Tooltip title="Paragraph">
            <AppButton variant="text" size="small" onClick={() => executeCmd('formatBlock', '<p>')}>
              P
            </AppButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => executeCmd('bold')}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => executeCmd('italic')}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => executeCmd('underline')}>
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => executeCmd('strikeThrough')}>
              <StrikethroughSIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Align Left">
            <IconButton size="small" onClick={() => executeCmd('justifyLeft')}>
              <FormatAlignLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton size="small" onClick={() => executeCmd('justifyCenter')}>
              <FormatAlignCenterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton size="small" onClick={() => executeCmd('justifyRight')}>
              <FormatAlignRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Justify">
            <IconButton size="small" onClick={() => executeCmd('justifyFull')}>
              <FormatAlignJustifyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Bulleted List">
            <IconButton size="small" onClick={() => executeCmd('insertUnorderedList')}>
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={() => executeCmd('insertOrderedList')}>
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Blockquote">
            <IconButton size="small" onClick={() => executeCmd('formatBlock', '<blockquote>')}>
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Horizontal Divider">
            <IconButton size="small" onClick={() => executeCmd('insertHorizontalRule')}>
              <HorizontalRuleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Table">
            <IconButton size="small" onClick={handleInsertTable}>
              <TableChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Word Document Canvas (Page View) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.03)',
            p: { xs: 1, md: 3 },
            borderRadius: '8px',
            minHeight: '600px',
            overflowY: 'auto',
          }}
        >
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
            sx={{
              width: '100%',
              maxWidth: '850px',
              minHeight: '680px',
              p: { xs: 3, md: 5 },
              backgroundColor: '#ffffff',
              color: '#1e293b',
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              outline: 'none',
              lineHeight: 1.7,
              fontFamily: 'Calibri, Arial, sans-serif',
              fontSize: '1rem',
              '&:focus': {
                boxShadow: '0 4px 24px rgba(37, 99, 235, 0.16)',
              },
              '& h1': { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', mb: 1 },
              '& h2': { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', mb: 1 },
              '& p': { mb: 1 },
              '& blockquote': {
                borderLeft: '4px solid #3b82f6',
                pl: 2,
                ml: 0,
                color: '#64748b',
                fontStyle: 'italic',
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
                '& th, & td': {
                  border: '1px solid #cbd5e1',
                  padding: '8px',
                },
              },
            }}
          />
        </Box>
      </AppCard>
    </Box>
  );
};
