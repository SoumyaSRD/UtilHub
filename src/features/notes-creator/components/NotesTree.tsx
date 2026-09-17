import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { SECTION_COLORS } from '../services/notesStorage';
import type { NoteItem, NotesWorkspace } from '../types';

interface NotesTreeProps {
  workspace: NotesWorkspace;
  onSelectNote: (noteId: string) => void;
  onSelectNotebook: (notebookId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onCreateNote: (parentId?: string | null) => void;
  onCreateSection: (name: string, color: string) => void;
  onCreateNotebook: (name: string, description: string, color: string) => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (noteId: string) => void;
  onTogglePinNote: (noteId: string) => void;
  onRenameNote: (noteId: string, newTitle: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export const NotesTree: React.FC<NotesTreeProps> = ({
  workspace,
  onSelectNote,
  onSelectNotebook,
  onSelectSection,
  onCreateNote,
  onCreateSection,
  onCreateNotebook,
  onDeleteNote,
  onDuplicateNote,
  onTogglePinNote,
  onRenameNote,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    workspace.expandedNodeIds.forEach((id) => (init[id] = true));
    return init;
  });

  // Modal states
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookDesc, setNewNotebookDesc] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState(SECTION_COLORS[0]);

  const [isNewSectionOpen, setIsNewSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState(SECTION_COLORS[1]);

  const [renameTargetNote, setRenameTargetNote] = useState<NoteItem | null>(null);
  const [renameText, setRenameText] = useState('');

  // Context menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuNote, setActiveMenuNote] = useState<NoteItem | null>(null);
  const [notebookMenuAnchorEl, setNotebookMenuAnchorEl] = useState<null | HTMLElement>(null);

  const activeNotebook =
    workspace.notebooks.find((nb) => nb.id === workspace.activeNotebookId) || workspace.notebooks[0];

  const sectionsInNotebook = workspace.sections.filter(
    (sec) => sec.notebookId === activeNotebook?.id
  );

  const activeSection =
    sectionsInNotebook.find((sec) => sec.id === workspace.activeSectionId) || sectionsInNotebook[0];

  const notesInSection = workspace.notes.filter(
    (n) => n.sectionId === activeSection?.id && !n.isStickyNote
  );

  // Extract all unique tags in this section for quick filter chips
  const allSectionTags = Array.from(
    new Set(notesInSection.flatMap((n) => n.tags))
  );

  const toggleExpand = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const handleOpenMenu = (note: NoteItem, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setActiveMenuNote(note);
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuNote(null);
  };

  // Filter notes based on search text and tag
  const filterNote = (note: NoteItem): boolean => {
    if (selectedTag && !note.tags.includes(selectedTag)) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  // Build tree hierarchy: root notes (parentId === null) and their children
  const rootNotes = notesInSection.filter((n) => n.parentId === null);

  const renderNoteTreeNode = (note: NoteItem, depth = 0): React.ReactNode => {
    const childNotes = notesInSection.filter((n) => n.parentId === note.id);
    const hasChildren = childNotes.length > 0;
    const isExpanded = !!expandedNodes[note.id];
    const isSelected = workspace.activeNoteId === note.id;
    const matches = filterNote(note);

    // If searching, check if either this note or any descendant matches
    const hasMatchingDescendant = childNotes.some(
      (child) => filterNote(child) || notesInSection.some((gc) => gc.parentId === child.id && filterNote(gc))
    );

    if (!matches && !hasMatchingDescendant && (searchFilter || selectedTag)) {
      return null;
    }

    return (
      <Box key={note.id} sx={{ my: 0.25 }}>
        <Box
          onClick={() => onSelectNote(note.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.75,
            px: 1,
            pl: 1 + depth * 1.75,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            bgcolor: isSelected
              ? 'var(--color-primary-light)'
              : 'transparent',
            border: isSelected
              ? '1px solid var(--color-primary)'
              : '1px solid transparent',
            color: isSelected
              ? 'var(--color-primary-contrast, var(--color-text-primary))'
              : 'var(--color-text-primary)',
            '&:hover': {
              bgcolor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
              '& .tree-actions': {
                opacity: 1,
              },
            },
          }}
        >
          {/* Caret icon for nesting */}
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => toggleExpand(note.id, e)}
              sx={{ p: 0.25, mr: 0.5, color: 'var(--color-text-muted)' }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 20, mr: 0.5 }} />
          )}

          {/* Color tag dot */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: note.color || 'var(--color-primary)',
              mr: 1,
              flexShrink: 0,
            }}
          />

          {/* Note Title */}
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: isSelected ? 600 : 400,
              fontSize: depth === 0 ? '0.9rem' : '0.84rem',
            }}
          >
            {note.title || 'Untitled Page'}
          </Typography>

          {/* Pinned Icon */}
          {note.pinned && (
            <PushPinIcon
              sx={{
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                transform: 'rotate(45deg)',
                mr: 0.5,
              }}
            />
          )}

          {/* Hover Actions */}
          <Box
            className="tree-actions"
            sx={{
              display: 'flex',
              alignItems: 'center',
              opacity: isSelected ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          >
            <Tooltip title="Add Sub-page">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedNodes((prev) => ({ ...prev, [note.id]: true }));
                  onCreateNote(note.id);
                }}
                sx={{ p: 0.25, color: 'var(--color-text-muted)' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(note, e)}
              sx={{ p: 0.25, color: 'var(--color-text-muted)' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Children Sub-tree */}
        {hasChildren && (isExpanded || searchFilter || selectedTag) && (
          <Box sx={{ borderLeft: '1px dashed var(--color-border-subtle)', ml: 1.5 + depth * 1.75 }}>
            {childNotes.map((child) => renderNoteTreeNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* 1. Notebook Picker Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box
          onClick={(e) => setNotebookMenuAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflow: 'hidden',
            flex: 1,
            cursor: 'pointer',
            p: 0.5,
            borderRadius: '6px',
            '&:hover': { bgcolor: 'var(--color-surface-hover)' },
          }}
        >
          <AutoStoriesIcon sx={{ color: activeNotebook?.color || 'var(--color-primary)', fontSize: '1.25rem' }} />
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeNotebook?.name || 'My Notebook'}
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: '1rem', color: 'var(--color-text-muted)' }} />
            </Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', display: 'block' }}>
              Switch Notebook
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={notebookMenuAnchorEl}
          open={Boolean(notebookMenuAnchorEl)}
          onClose={() => setNotebookMenuAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                minWidth: 220,
              },
            },
          }}
        >
          {workspace.notebooks.map((nb) => (
            <MenuItem
              key={nb.id}
              selected={nb.id === activeNotebook?.id}
              onClick={() => {
                onSelectNotebook(nb.id);
                setNotebookMenuAnchorEl(null);
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: nb.color }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: nb.id === activeNotebook?.id ? 700 : 500 }}>
                  {nb.name}
                </Typography>
                {nb.description && (
                  <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                    {nb.description}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setNotebookMenuAnchorEl(null);
              setIsNewNotebookOpen(true);
            }}
            sx={{ color: 'var(--color-primary)' }}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Create New Notebook
          </MenuItem>
        </Menu>

        <Tooltip title="Create New Notebook">
          <IconButton
            size="small"
            onClick={() => setIsNewNotebookOpen(true)}
            sx={{
              color: 'var(--color-primary)',
              bgcolor: 'var(--color-surface-hover)',
              borderRadius: '6px',
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 2. OneNote Horizontal Section Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          px: 1,
          pt: 1,
          pb: 0.5,
          borderBottom: '1px solid var(--color-border-subtle)',
          gap: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {sectionsInNotebook.map((sec) => {
          const isSecActive = sec.id === activeSection?.id;
          const count = workspace.notes.filter((n) => n.sectionId === sec.id && !n.isStickyNote).length;
          return (
            <Button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              size="small"
              sx={{
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.25,
                py: 0.4,
                borderRadius: '6px 6px 0 0',
                borderBottom: isSecActive ? `3px solid ${sec.color}` : '3px solid transparent',
                bgcolor: isSecActive ? 'var(--color-surface-hover)' : 'transparent',
                color: isSecActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontWeight: isSecActive ? 700 : 500,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <FolderIcon sx={{ fontSize: '0.9rem', color: sec.color }} />
              {sec.name}
              <span
                style={{
                  fontSize: '0.72rem',
                  opacity: 0.75,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-border-subtle)',
                }}
              >
                {count}
              </span>
            </Button>
          );
        })}

        <Tooltip title="Add New Section">
          <IconButton
            size="small"
            onClick={() => setIsNewSectionOpen(true)}
            sx={{
              p: 0.5,
              color: 'var(--color-text-muted)',
              '&:hover': { color: 'var(--color-primary)' },
            }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3. Search & Filter Bar */}
      <Box sx={{ p: 1.25, pb: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            px: 1,
            py: 0.25,
          }}
        >
          <SearchIcon sx={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', mr: 0.75 }} />
          <InputBase
            placeholder="Search notes or #tag..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            sx={{
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)',
              flex: 1,
            }}
          />
          {searchFilter && (
            <Typography
              variant="caption"
              onClick={() => setSearchFilter('')}
              sx={{ cursor: 'pointer', color: 'var(--color-text-muted)', px: 0.5 }}
            >
              ✕
            </Typography>
          )}
        </Box>

        {/* Tag chips */}
        {allSectionTags.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, overflowX: 'auto', pb: 0.5 }}>
            <Chip
              label="All"
              size="small"
              variant={selectedTag === null ? 'filled' : 'outlined'}
              onClick={() => setSelectedTag(null)}
              sx={{
                height: 22,
                fontSize: '0.72rem',
                cursor: 'pointer',
                bgcolor: selectedTag === null ? 'var(--color-primary)' : 'transparent',
                color: selectedTag === null ? '#fff' : 'var(--color-text-muted)',
              }}
            />
            {allSectionTags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                variant={selectedTag === tag ? 'filled' : 'outlined'}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  bgcolor: selectedTag === tag ? 'var(--color-primary)' : 'transparent',
                  color: selectedTag === tag ? '#fff' : 'var(--color-text-muted)',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 4. Action Bar: "+ New Page" & Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Pages & Sub-Pages ({notesInSection.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreateNote(null)}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontSize: '0.78rem',
            py: 0.3,
            px: 1.25,
            borderRadius: '6px',
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary-hover)' },
          }}
        >
          New Page
        </Button>
      </Box>

      {/* 5. Tree List of Notes */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        {rootNotes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <DescriptionIcon sx={{ fontSize: 36, color: 'var(--color-text-muted)', opacity: 0.5, mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mb: 1 }}>
              No notes in this section yet.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onCreateNote(null)}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            >
              Create First Page
            </Button>
          </Box>
        ) : (
          rootNotes.map((rootNote) => renderNoteTreeNode(rootNote, 0))
        )}
      </Box>

      {/* Context Menu on Note */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              minWidth: 160,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuNote) {
              onCreateNote(activeMenuNote.id);
            }
            handleCloseMenu();
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--color-primary)' }} />
          Add Sub-page
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuNote) {
              setRenameTargetNote(activeMenuNote);
              setRenameText(activeMenuNote.title);
            }
            handleCloseMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuNote) {
              onTogglePinNote(activeMenuNote.id);
            }
            handleCloseMenu();
          }}
        >
          <PushPinIcon fontSize="small" sx={{ mr: 1.5 }} />
          {activeMenuNote?.pinned ? 'Unpin Note' : 'Pin to Top'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuNote) {
              onDuplicateNote(activeMenuNote.id);
            }
            handleCloseMenu();
          }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 1.5 }} />
          Duplicate Page
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuNote) {
              onDeleteNote(activeMenuNote.id);
            }
            handleCloseMenu();
          }}
          sx={{ color: 'var(--color-error)' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete Page
        </MenuItem>
      </Menu>

      {/* Dialog: Create Notebook */}
      <Dialog
        open={isNewNotebookOpen}
        onClose={() => setIsNewNotebookOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Notebook</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Notebook Name"
            fullWidth
            size="small"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="e.g. Q4 Strategy & Roadmap"
            autoFocus
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            size="small"
            value={newNotebookDesc}
            onChange={(e) => setNewNotebookDesc(e.target.value)}
            placeholder="Brief overview of contents"
          />
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', mb: 0.5, display: 'block' }}>
              Notebook Color Theme
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {SECTION_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setNewNotebookColor(c)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: newNotebookColor === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: newNotebookColor === c ? `0 0 8px ${c}` : 'none',
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsNewNotebookOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!newNotebookName.trim()}
            onClick={() => {
              onCreateNotebook(newNotebookName.trim(), newNotebookDesc.trim(), newNotebookColor);
              setNewNotebookName('');
              setNewNotebookDesc('');
              setIsNewNotebookOpen(false);
            }}
          >
            Create Notebook
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Create Section */}
      <Dialog
        open={isNewSectionOpen}
        onClose={() => setIsNewSectionOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Section to {activeNotebook?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Section Name"
            fullWidth
            size="small"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="e.g. Sprint Retrospectives"
            autoFocus
          />
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', mb: 0.5, display: 'block' }}>
              Section Tab Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {SECTION_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setNewSectionColor(c)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: newSectionColor === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: newSectionColor === c ? `0 0 8px ${c}` : 'none',
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsNewSectionOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!newSectionName.trim()}
            onClick={() => {
              onCreateSection(newSectionName.trim(), newSectionColor);
              setNewSectionName('');
              setIsNewSectionOpen(false);
            }}
          >
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Rename Note */}
      <Dialog
        open={Boolean(renameTargetNote)}
        onClose={() => setRenameTargetNote(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Rename Page</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Page Title"
            fullWidth
            size="small"
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameTargetNote(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!renameText.trim()}
            onClick={() => {
              if (renameTargetNote) {
                onRenameNote(renameTargetNote.id, renameText.trim());
              }
              setRenameTargetNote(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
