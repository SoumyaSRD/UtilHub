import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Menu from '@mui/material/Menu';
import { STICKY_NOTE_COLORS } from '../services/notesStorage';
import type { NoteItem } from '../types';

interface StickyNotesBoardProps {
  notes: NoteItem[];
  onCreateSticky: (color: string) => void;
  onUpdateSticky: (id: string, updated: Partial<NoteItem>) => void;
  onDeleteSticky: (id: string) => void;
}

export const StickyNotesBoard: React.FC<StickyNotesBoardProps> = ({
  notes,
  onCreateSticky,
  onUpdateSticky,
  onDeleteSticky,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [colorMenuAnchorEl, setColorMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [targetNoteId, setTargetNoteId] = useState<string | null>(null);

  const stickyNotes = notes.filter((n) => n.isStickyNote);

  const filteredStickies = stickyNotes.filter((n) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Sort pinned stickies first
  const sortedStickies = [...filteredStickies].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleOpenColorMenu = (noteId: string, e: React.MouseEvent<HTMLElement>) => {
    setTargetNoteId(noteId);
    setColorMenuAnchorEl(e.currentTarget);
  };

  const handleCloseColorMenu = () => {
    setColorMenuAnchorEl(null);
    setTargetNoteId(null);
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        p: 3,
        bgcolor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Top Controls: Search, Add Sticky Note, Description */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Microsoft Sticky Notes Board
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
            Fast scratchpad cards for quick ideas, reminders, and checklists.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Search bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              px: 1.5,
              py: 0.5,
              width: 240,
            }}
          >
            <SearchIcon sx={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', mr: 1 }} />
            <InputBase
              placeholder="Search sticky notes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              sx={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', flex: 1 }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateSticky(STICKY_NOTE_COLORS[0].bg)}
            sx={{
              bgcolor: 'var(--color-primary)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            New Sticky Note
          </Button>
        </Box>
      </Box>

      {/* Grid of Sticky Notes */}
      {sortedStickies.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed var(--color-border-subtle)',
            borderRadius: '12px',
          }}
        >
          <Typography variant="body1" sx={{ color: 'var(--color-text-muted)', mb: 2 }}>
            No sticky notes found. Create your first sticky card!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => onCreateSticky(STICKY_NOTE_COLORS[0].bg)}
            sx={{ textTransform: 'none' }}
          >
            Add Sticky Note
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2.5,
          }}
        >
          {sortedStickies.map((sticky) => {
            const colorScheme =
              STICKY_NOTE_COLORS.find((c) => c.bg === sticky.color) || STICKY_NOTE_COLORS[0];

            return (
              <Box
                key={sticky.id}
                sx={{
                  bgcolor: colorScheme.bg,
                  color: colorScheme.text,
                  border: `1px solid ${colorScheme.border}`,
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 260,
                  p: 2,
                  position: 'relative',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  },
                }}
              >
                {/* Sticky Header: Drag bar, Pin, Color, Delete */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: 0.5,
                    borderBottom: `1px solid ${colorScheme.border}`,
                  }}
                >
                  <InputBase
                    value={sticky.title}
                    onChange={(e) => onUpdateSticky(sticky.id, { title: e.target.value })}
                    placeholder="Note title..."
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: colorScheme.text,
                      flex: 1,
                      mr: 1,
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={sticky.pinned ? 'Unpin' : 'Pin'}>
                      <IconButton
                        size="small"
                        onClick={() => onUpdateSticky(sticky.id, { pinned: !sticky.pinned })}
                        sx={{ color: colorScheme.text, p: 0.5 }}
                      >
                        <PushPinIcon
                          fontSize="small"
                          sx={{ transform: sticky.pinned ? 'rotate(45deg)' : 'none' }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Change Color">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenColorMenu(sticky.id, e)}
                        sx={{ color: colorScheme.text, p: 0.5 }}
                      >
                        <ColorLensIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteSticky(sticky.id)}
                        sx={{ color: colorScheme.text, p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Sticky Body */}
                <textarea
                  value={sticky.content}
                  onChange={(e) => onUpdateSticky(sticky.id, { content: e.target.value })}
                  placeholder="Type note content here..."
                  style={{
                    flex: 1,
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    backgroundColor: 'transparent',
                    color: colorScheme.text,
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                  }}
                />

                {/* Bottom Timestamp */}
                <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.72rem' }}>
                    {new Date(sticky.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Color Palette Menu */}
      <Menu
        anchorEl={colorMenuAnchorEl}
        open={Boolean(colorMenuAnchorEl)}
        onClose={handleCloseColorMenu}
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
          Sticky Note Color
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, p: 1 }}>
          {STICKY_NOTE_COLORS.map((c) => (
            <Box
              key={c.name}
              onClick={() => {
                if (targetNoteId) {
                  onUpdateSticky(targetNoteId, { color: c.bg });
                }
                handleCloseColorMenu();
              }}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                bgcolor: c.bg,
                border: `2px solid ${c.border}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          ))}
        </Box>
      </Menu>
    </Box>
  );
};
