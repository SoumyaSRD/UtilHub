import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TableChartIcon from '@mui/icons-material/TableChart';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import PushPinIcon from '@mui/icons-material/PushPin';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { MarkdownRenderer } from './MarkdownRenderer';
import { exportNoteToOneNoteHtml } from '../services/notesStorage';
import { SECTION_COLORS } from '../services/notesStorage';
import type { NoteItem, Notebook, NoteSection, EditorViewMode } from '../types';

interface NoteEditorProps {
  note: NoteItem;
  notebook?: Notebook;
  section?: NoteSection;
  onUpdateNote: (updated: Partial<NoteItem>) => void;
  onTogglePin: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  notebook,
  section,
  onUpdateNote,
  onTogglePin,
}) => {
  const [viewMode, setViewMode] = useState<EditorViewMode>('split');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [colorMenuAnchorEl, setColorMenuAnchorEl] = useState<null | HTMLElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute word count & reading time
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const readingTimeMins = Math.max(1, Math.ceil(wordCount / 200));

  // Toolbar actions that insert text at cursor
  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      note.content.substring(0, start) + replacement + note.content.substring(end);

    onUpdateNote({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleToggleChecklist = (lineIndex: number, checked: boolean) => {
    const lines = note.content.split('\n');
    if (lines[lineIndex]) {
      if (checked) {
        lines[lineIndex] = lines[lineIndex].replace(/^(\s*-\s*\[)[ ](\])/, '$1x$2');
      } else {
        lines[lineIndex] = lines[lineIndex].replace(/^(\s*-\s*\[)[xX](\])/, '$1 $2');
      }
      onUpdateNote({ content: lines.join('\n') });
    }
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '').toLowerCase();
    if (!note.tags.includes(clean)) {
      onUpdateNote({ tags: [...note.tags, clean] });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({ tags: note.tags.filter((t) => t !== tagToRemove) });
  };

  // Export handlers
  const handleExportOneNote = () => {
    const html = exportNoteToOneNoteHtml(
      note,
      section?.name || 'Section',
      notebook?.name || 'Notebook'
    );
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9_-]/gi, '_') || 'note'}_onenote.html`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchorEl(null);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9_-]/gi, '_') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchorEl(null);
  };

  const handleExportText = () => {
    const textContent = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9_-]/gi, '_') || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchorEl(null);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertFormatting('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertFormatting('*', '*', 'italic text');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'var(--color-surface)',
      }}
    >
      {/* Top Header: Breadcrumbs, Status, Actions */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          bgcolor: 'var(--glass-header-bg)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Breadcrumb Path */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box
            onClick={(e) => setColorMenuAnchorEl(e.currentTarget)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '3px',
              bgcolor: note.color || 'var(--color-primary)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 0 6px rgba(0,0,0,0.2)',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {notebook?.name || 'Notebook'} &gt; {section?.name || 'Section'}
          </Typography>
        </Box>

        {/* Status indicator, View Switcher & Export */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span style={{ fontSize: '0.6rem' }}>●</span> Auto-saved
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 18 }} />

          {/* View Mode Buttons */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: 'var(--color-surface-hover)',
              borderRadius: '6px',
              p: 0.25,
            }}
          >
            <Tooltip title="Split Editor & Preview">
              <IconButton
                size="small"
                onClick={() => setViewMode('split')}
                sx={{
                  color: viewMode === 'split' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  bgcolor: viewMode === 'split' ? 'var(--color-surface)' : 'transparent',
                  borderRadius: '4px',
                  p: 0.5,
                }}
              >
                <ViewSidebarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editor Only">
              <IconButton
                size="small"
                onClick={() => setViewMode('edit')}
                sx={{
                  color: viewMode === 'edit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  bgcolor: viewMode === 'edit' ? 'var(--color-surface)' : 'transparent',
                  borderRadius: '4px',
                  p: 0.5,
                }}
              >
                <EditNoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Preview / Reading Mode">
              <IconButton
                size="small"
                onClick={() => setViewMode('preview')}
                sx={{
                  color: viewMode === 'preview' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  bgcolor: viewMode === 'preview' ? 'var(--color-surface)' : 'transparent',
                  borderRadius: '4px',
                  p: 0.5,
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Tooltip title={note.pinned ? 'Unpin' : 'Pin to Top'}>
            <IconButton
              size="small"
              onClick={onTogglePin}
              sx={{
                color: note.pinned ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <PushPinIcon fontSize="small" sx={{ transform: note.pinned ? 'rotate(45deg)' : 'none' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={copied ? 'Copied Content!' : 'Copy Markdown'}>
            <IconButton size="small" onClick={handleCopyContent} sx={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Export Menu */}
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
            startIcon={<DownloadIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '0.8rem',
              py: 0.3,
              borderRadius: '6px',
            }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => setExportAnchorEl(null)}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  minWidth: 200,
                },
              },
            }}
          >
            <MenuItem onClick={handleExportOneNote}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Microsoft OneNote (.html)
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                  OneNote XML meta tags & styles
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleExportMarkdown}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Markdown Document (.md)
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                  Standard GFM formatting
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleExportText}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Plain Text (.txt)
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                  Clean text file
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Note Title & Meta Bar */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <InputBase
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          placeholder="Page Title..."
          sx={{
            width: '100%',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            mb: 1,
          }}
        />

        {/* Tags & Metadata bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {note.tags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              onDelete={() => handleRemoveTag(tag)}
              sx={{
                height: 22,
                fontSize: '0.75rem',
                bgcolor: 'var(--color-surface-hover)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border-subtle)',
              }}
            />
          ))}

          {isAddingTag ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InputBase
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setIsAddingTag(false);
                }}
                placeholder="tag name..."
                autoFocus
                sx={{
                  fontSize: '0.75rem',
                  px: 1,
                  py: 0.1,
                  bgcolor: 'var(--color-surface-hover)',
                  borderRadius: '12px',
                  border: '1px solid var(--color-primary)',
                  width: 100,
                }}
              />
              <Button size="small" onClick={handleAddTag} sx={{ minWidth: 'auto', p: 0.2, fontSize: '0.7rem' }}>
                Add
              </Button>
            </Box>
          ) : (
            <Chip
              label="+ Add Tag"
              size="small"
              onClick={() => setIsAddingTag(true)}
              sx={{
                height: 22,
                fontSize: '0.72rem',
                cursor: 'pointer',
                bgcolor: 'transparent',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                '&:hover': { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
              }}
            />
          )}

          <Box sx={{ flex: 1 }} />

          {/* Word Count & Reading Time */}
          <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
            {wordCount} words • ~{readingTimeMins} min read
          </Typography>
        </Box>
      </Box>

      {/* Rich Markdown Formatting Toolbar (Only in split/edit modes) */}
      {viewMode !== 'preview' && (
        <Box
          sx={{
            px: 3,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            borderTop: '1px solid var(--color-border-subtle)',
            borderBottom: '1px solid var(--color-border-subtle)',
            bgcolor: 'var(--glass-bg)',
            overflowX: 'auto',
          }}
        >
          <Tooltip title="Heading 1 (#)">
            <Button
              size="small"
              onClick={() => insertFormatting('# ', '', 'Heading 1')}
              sx={{ minWidth: 'auto', px: 1, fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)' }}
            >
              H1
            </Button>
          </Tooltip>
          <Tooltip title="Heading 2 (##)">
            <Button
              size="small"
              onClick={() => insertFormatting('## ', '', 'Heading 2')}
              sx={{ minWidth: 'auto', px: 1, fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)' }}
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip title="Heading 3 (###)">
            <Button
              size="small"
              onClick={() => insertFormatting('### ', '', 'Heading 3')}
              sx={{ minWidth: 'auto', px: 1, fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)' }}
            >
              H3
            </Button>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 18 }} />

          <Tooltip title="Bold (Ctrl+B)">
            <IconButton size="small" onClick={() => insertFormatting('**', '**', 'bold text')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic (Ctrl+I)">
            <IconButton size="small" onClick={() => insertFormatting('*', '*', 'italic text')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => insertFormatting('~~', '~~', 'strikethrough')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatStrikethroughIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Inline Code">
            <IconButton size="small" onClick={() => insertFormatting('`', '`', 'code')} sx={{ color: 'var(--color-text-primary)' }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 18 }} />

          <Tooltip title="To-Do Task Item (- [ ])">
            <IconButton size="small" onClick={() => insertFormatting('- [ ] ', '', 'Task item')} sx={{ color: 'var(--color-primary)' }}>
              <CheckBoxOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet List (-)">
            <IconButton size="small" onClick={() => insertFormatting('- ', '', 'List item')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List (1.)">
            <IconButton size="small" onClick={() => insertFormatting('1. ', '', 'Numbered item')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quote Block (>)">
            <IconButton size="small" onClick={() => insertFormatting('> ', '', 'Quote')} sx={{ color: 'var(--color-text-primary)' }}>
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 18 }} />

          <Tooltip title="Insert Table">
            <IconButton
              size="small"
              onClick={() =>
                insertFormatting(
                  '| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Item 1 | Item 2 | Item 3 |\n'
                )
              }
              sx={{ color: 'var(--color-text-primary)' }}
            >
              <TableChartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tip Callout Box">
            <IconButton
              size="small"
              onClick={() => insertFormatting('> [!TIP]\n> Useful insight or reminder here.\n')}
              sx={{ color: 'var(--color-success)' }}
            >
              <LightbulbOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Horizontal Divider (---)">
            <IconButton size="small" onClick={() => insertFormatting('\n---\n')} sx={{ color: 'var(--color-text-primary)' }}>
              <HorizontalRuleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Current Date & Time Stamp">
            <IconButton
              size="small"
              onClick={() => insertFormatting(`[${new Date().toLocaleString()}] `)}
              sx={{ color: 'var(--color-text-muted)' }}
            >
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Editor & Preview Split Panel */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: viewMode === 'split' ? '1px solid var(--color-border-subtle)' : 'none',
              bgcolor: 'transparent',
            }}
          >
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={(e) => onUpdateNote({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Write your note in Markdown or OneNote formatting..."
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                padding: '24px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '0.96rem',
                fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', monospace",
                lineHeight: 1.7,
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
              }}
            />
          </Box>
        )}

        {/* Live Formatted Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              overflowY: 'auto',
              p: 3,
              bgcolor: viewMode === 'preview' ? 'var(--color-surface)' : 'var(--color-surface-hover)',
            }}
          >
            <MarkdownRenderer
              content={note.content}
              onToggleChecklist={handleToggleChecklist}
            />
          </Box>
        )}
      </Box>

      {/* Color Category Menu */}
      <Menu
        anchorEl={colorMenuAnchorEl}
        open={Boolean(colorMenuAnchorEl)}
        onClose={() => setColorMenuAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            },
          },
        }}
      >
        <Typography variant="caption" sx={{ px: 1, fontWeight: 700, color: 'var(--color-text-muted)' }}>
          OneNote Category Color
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 1 }}>
          {SECTION_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => {
                onUpdateNote({ color: c });
                setColorMenuAnchorEl(null);
              }}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                bgcolor: c,
                cursor: 'pointer',
                border: note.color === c ? '2px solid #fff' : '1px solid transparent',
              }}
            />
          ))}
        </Box>
      </Menu>
    </Box>
  );
};
