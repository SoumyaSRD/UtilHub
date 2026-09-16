import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import TitleIcon from '@mui/icons-material/Title';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { saveAs } from 'file-saver';

export interface MarkdownStudioEditorProps {
  fileName: string;
  content: string;
  onChange: (newContent: string) => void;
}

// Simple safe markdown to HTML parser
function parseMarkdownToHtml(md: string): string {
  let html = md
    // Escape basic HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 1rem 0 0.5rem; font-weight: 700;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 1.25rem 0 0.5rem; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 1.5rem 0 0.75rem; font-weight: 800; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #3b82f6; margin: 1em 0; padding-left: 1rem; color: #64748b; font-style: italic;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

  // Inline Code
  html = html.replace(/`([^`]+)`/gim, '<code style="background-color: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

  // Code Blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre style="background-color: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.85em;"><code>$2</code></pre>');

  // Checklists
  html = html.replace(/^- \[ \] (.*$)/gim, '<div style="display:flex; align-items:center; gap: 8px; margin: 4px 0;"><input type="checkbox" disabled /> <span>$1</span></div>');
  html = html.replace(/^- \[x\] (.*$)/gim, '<div style="display:flex; align-items:center; gap: 8px; margin: 4px 0;"><input type="checkbox" checked disabled /> <span style="text-decoration: line-through; color: #94a3b8;">$1</span></div>');

  // Unordered list
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin: 4px 0;">$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');

  // Paragraphs / linebreaks
  html = html.replace(/\n\n/gim, '<p style="margin: 0.75rem 0; line-height: 1.6;"></p>');
  html = html.replace(/\n/gim, '<br />');

  return html;
}

export const MarkdownStudioEditor: React.FC<MarkdownStudioEditorProps> = ({
  fileName,
  content,
  onChange,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const renderedHtml = parseMarkdownToHtml(content);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(words / 200);

  const insertSnippet = (snippet: string) => {
    onChange(`${content}\n${snippet}`);
  };

  const handleDownload = (format: 'md' | 'html') => {
    if (format === 'md') {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, fileName.endsWith('.md') ? fileName : `${fileName}.md`);
    } else {
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#1e293b;line-height:1.6;}</style></head><body>${renderedHtml}</body></html>`;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${fileName}.html`);
    }
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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1, h2, h3 { color: #0f172a; }
          </style>
        </head>
        <body>
          ${renderedHtml}
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
        title="Markdown Studio & Live Previewer"
        subtitle="Write Markdown with live rendering, syntax helpers, and HTML/PDF export"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
            >
              <ToggleButton value="edit" title="Editor Only">
                <EditIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="split" title="Split View">
                <ViewSidebarIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="preview" title="Preview Only">
                <VisibilityIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <AppButton
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print / PDF
            </AppButton>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload('html')}
            >
              Export HTML
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload('md')}
            >
              Export .md
            </AppButton>
          </Box>
        }
      >
        {/* Formatting Quick Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 1,
            mb: 1.5,
            borderRadius: '6px',
            backgroundColor: 'var(--color-surface-hover)',
            flexWrap: 'wrap',
          }}
        >
          <Tooltip title="Bold (**text**)">
            <IconButton size="small" onClick={() => insertSnippet('**Bold Text**')}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic (*text*)">
            <IconButton size="small" onClick={() => insertSnippet('*Italic Text*')}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough (~~text~~)">
            <IconButton size="small" onClick={() => insertSnippet('~~Strikethrough~~')}>
              <StrikethroughSIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading (## Heading)">
            <IconButton size="small" onClick={() => insertSnippet('## Section Heading')}>
              <TitleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quote (> quote)">
            <IconButton size="small" onClick={() => insertSnippet('> Important note or quotation')}>
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code Block">
            <IconButton size="small" onClick={() => insertSnippet('```javascript\nconst example = true;\n```')}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Table">
            <IconButton
              size="small"
              onClick={() =>
                insertSnippet('| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Data A | Data B | Data C |')
              }
            >
              <TableChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Checklist">
            <IconButton size="small" onClick={() => insertSnippet('- [ ] Task item to complete')}>
              <ChecklistIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton size="small" onClick={() => insertSnippet('[Link Label](https://example.com)')}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label={`${words} words`} size="small" variant="outlined" />
            <Chip label={`~${readTimeMin} min read`} size="small" variant="outlined" />
          </Box>
        </Box>

        {/* Editor & Preview Pane */}
        <Grid container spacing={2}>
          {(viewMode === 'edit' || viewMode === 'split') && (
            <Grid size={{ xs: 12, md: viewMode === 'split' ? 6 : 12 }}>
              <AppCodeEditor
                value={content}
                onChange={onChange}
                language="markdown"
                height="540px"
                title={`${fileName} (Source)`}
              />
            </Grid>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <Grid size={{ xs: 12, md: viewMode === 'split' ? 6 : 12 }}>
              <Paper
                variant="outlined"
                sx={{
                  height: '540px',
                  p: 3,
                  overflowY: 'auto',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-surface-border)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700, mb: 1.5, display: 'block' }}>
                  Live Formatted Preview
                </Typography>
                <div
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  style={{ wordBreak: 'break-word' }}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </AppCard>
    </Box>
  );
};
