import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { NotesTree } from '../components/NotesTree';
import { NoteEditor } from '../components/NoteEditor';
import { StickyNotesBoard } from '../components/StickyNotesBoard';
import {
  loadNotesWorkspace,
  saveNotesWorkspace,
  createDefaultWorkspace,
  SECTION_COLORS,
  STICKY_NOTE_COLORS,
} from '../services/notesStorage';
import type { NotesWorkspace, NoteItem, NotesViewMode } from '../types';

export const NotesCreatorPage: React.FC = () => {
  const [workspace, setWorkspace] = useState<NotesWorkspace>(() => loadNotesWorkspace());
  const [activeTab, setActiveTab] = useState<NotesViewMode>('tree');
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'info' | 'error' } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save whenever workspace changes
  useEffect(() => {
    saveNotesWorkspace(workspace);
  }, [workspace]);

  // Find currently active note
  const activeNote =
    workspace.notes.find((n) => n.id === workspace.activeNoteId) ||
    workspace.notes.find((n) => !n.isStickyNote) ||
    null;

  const activeNotebook = workspace.notebooks.find((nb) => nb.id === workspace.activeNotebookId);
  const activeSection = workspace.sections.find((sec) => sec.id === workspace.activeSectionId);

  // Note updates
  const handleUpdateNote = (updatedFields: Partial<NoteItem>) => {
    if (!activeNote) return;
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === activeNote.id ? { ...n, ...updatedFields, updatedAt: now } : n
      ),
    }));
  };

  // Sticky Note updates
  const handleUpdateSticky = (id: string, updatedFields: Partial<NoteItem>) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updatedFields, updatedAt: now } : n)),
    }));
  };

  // Create new page (or sub-page)
  const handleCreateNote = (parentId: string | null = null) => {
    const now = new Date().toISOString();
    const newNoteId = `note-${Date.now()}`;
    const newNote: NoteItem = {
      id: newNoteId,
      notebookId: workspace.activeNotebookId,
      sectionId: workspace.activeSectionId,
      parentId,
      title: parentId ? 'New Sub-Page' : 'Untitled Page',
      content: `# ${parentId ? 'New Sub-Page' : 'Untitled Page'}\n\nStart writing your note...\n\n- [ ] Task 1\n- [ ] Task 2\n`,
      tags: [],
      color: activeSection?.color || SECTION_COLORS[0],
      pinned: false,
      isStickyNote: false,
      createdAt: now,
      updatedAt: now,
    };

    setWorkspace((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      activeNoteId: newNoteId,
      expandedNodeIds: parentId ? [...prev.expandedNodeIds, parentId] : prev.expandedNodeIds,
    }));
  };

  // Create new sticky note
  const handleCreateSticky = (color: string) => {
    const now = new Date().toISOString();
    const stickySection = workspace.sections.find((s) => s.notebookId.includes('stk')) || workspace.sections[0];
    const newSticky: NoteItem = {
      id: `sticky-${Date.now()}`,
      notebookId: stickySection.notebookId,
      sectionId: stickySection.id,
      parentId: null,
      title: 'New Quick Note',
      content: '',
      tags: ['quick'],
      color: color || STICKY_NOTE_COLORS[0].bg,
      pinned: false,
      isStickyNote: true,
      createdAt: now,
      updatedAt: now,
    };

    setWorkspace((prev) => ({
      ...prev,
      notes: [newSticky, ...prev.notes],
    }));
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    setWorkspace((prev) => {
      const remaining = prev.notes.filter((n) => n.id !== noteId && n.parentId !== noteId);
      const nextActive = remaining.find((n) => !n.isStickyNote)?.id || null;
      return {
        ...prev,
        notes: remaining,
        activeNoteId: prev.activeNoteId === noteId ? nextActive : prev.activeNoteId,
      };
    });
    setNotification({ message: 'Page deleted', severity: 'info' });
  };

  // Duplicate note
  const handleDuplicateNote = (noteId: string) => {
    const target = workspace.notes.find((n) => n.id === noteId);
    if (!target) return;
    const now = new Date().toISOString();
    const dupe: NoteItem = {
      ...target,
      id: `note-${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    setWorkspace((prev) => ({
      ...prev,
      notes: [dupe, ...prev.notes],
      activeNoteId: dupe.id,
    }));
    setNotification({ message: 'Page duplicated', severity: 'success' });
  };

  // Toggle pin
  const handleTogglePinNote = (noteId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  // Rename note
  const handleRenameNote = (noteId: string, newTitle: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)),
    }));
  };

  // Create Section
  const handleCreateSection = (name: string, color: string) => {
    const newSec = {
      id: `sec-${Date.now()}`,
      notebookId: workspace.activeNotebookId,
      name,
      color,
      order: workspace.sections.length + 1,
    };
    setWorkspace((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
      activeSectionId: newSec.id,
    }));
    setNotification({ message: `Section "${name}" added`, severity: 'success' });
  };

  // Create Notebook
  const handleCreateNotebook = (name: string, description: string, color: string) => {
    const newNb = {
      id: `nb-${Date.now()}`,
      name,
      description,
      color,
      icon: 'AutoStories',
      order: workspace.notebooks.length + 1,
    };
    const defaultSec = {
      id: `sec-${Date.now()}`,
      notebookId: newNb.id,
      name: 'General',
      color,
      order: 1,
    };
    setWorkspace((prev) => ({
      ...prev,
      notebooks: [...prev.notebooks, newNb],
      sections: [...prev.sections, defaultSec],
      activeNotebookId: newNb.id,
      activeSectionId: defaultSec.id,
    }));
    setNotification({ message: `Notebook "${name}" created`, severity: 'success' });
  };

  // Backup: Export Workspace JSON
  const handleExportWorkspace = () => {
    const jsonStr = JSON.stringify(workspace, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilityhub_notes_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification({ message: 'Complete notes backup exported successfully', severity: 'success' });
  };

  // Restore: Import Workspace JSON
  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notebooks && parsed.sections && parsed.notes) {
          setWorkspace(parsed);
          saveNotesWorkspace(parsed);
          setNotification({ message: 'Notes backup restored successfully!', severity: 'success' });
        } else {
          setNotification({ message: 'Invalid notes backup file format', severity: 'error' });
        }
      } catch (err) {
        setNotification({ message: 'Failed to parse JSON backup file', severity: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default sample notes
  const handleResetToDefault = () => {
    const defaultWs = createDefaultWorkspace();
    setWorkspace(defaultWs);
    saveNotesWorkspace(defaultWs);
    setIsResetConfirmOpen(false);
    setNotification({ message: 'Loaded comprehensive demo notes with all features', severity: 'info' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        minHeight: 650,
        m: -2,
        overflow: 'hidden',
      }}
    >
      {/* Platform Top Header Bar: Mode Tabs, Backup/Restore, Tree Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1,
          bgcolor: 'var(--glass-header-bg)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NoteAltIcon sx={{ color: 'var(--color-primary)', fontSize: '1.6rem' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--color-text-primary)' }}>
                Notes Studio
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                Microsoft OneNote & Sticky Notes Compatible
              </Typography>
            </Box>
          </Box>

          {/* View Switcher: Tree vs Sticky Notes */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 0.5,
              },
            }}
          >
            <Tab
              value="tree"
              icon={<AutoStoriesIcon fontSize="small" />}
              iconPosition="start"
              label="OneNote Tree Notebooks"
            />
            <Tab
              value="sticky"
              icon={<StickyNote2Icon fontSize="small" />}
              iconPosition="start"
              label="Microsoft Sticky Notes"
            />
          </Tabs>
        </Box>

        {/* Global Toolbar: Import, Export, Reset, Toggle Tree */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeTab === 'tree' && (
            <Tooltip title={isTreeCollapsed ? 'Show Navigation Tree' : 'Hide Navigation Tree'}>
              <IconButton
                size="small"
                onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
                sx={{
                  color: isTreeCollapsed ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                }}
              >
                <ViewSidebarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportWorkspace}
            accept=".json"
            style={{ display: 'none' }}
          />

          <Tooltip title="Restore Notes from JSON Backup">
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              Restore
            </Button>
          </Tooltip>

          <Tooltip title="Backup Entire Notes Workspace to JSON">
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportWorkspace}
              sx={{ textTransform: 'none', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              Backup
            </Button>
          </Tooltip>

          <Tooltip title="Reset to Demo Notes (Explore All Features)">
            <IconButton
              size="small"
              onClick={() => setIsResetConfirmOpen(true)}
              sx={{
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '6px',
              }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Workspace Body */}
      {activeTab === 'tree' ? (
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tree Explorer Panel */}
          {!isTreeCollapsed && (
            <Box sx={{ width: 320, minWidth: 260, maxWidth: 420, height: '100%' }}>
              <NotesTree
                workspace={workspace}
                onSelectNote={(id) => setWorkspace((prev) => ({ ...prev, activeNoteId: id }))}
                onSelectNotebook={(nbId) => {
                  const firstSec = workspace.sections.find((s) => s.notebookId === nbId);
                  setWorkspace((prev) => ({
                    ...prev,
                    activeNotebookId: nbId,
                    activeSectionId: firstSec ? firstSec.id : prev.activeSectionId,
                  }));
                }}
                onSelectSection={(secId) => {
                  const firstNote = workspace.notes.find((n) => n.sectionId === secId && !n.isStickyNote);
                  setWorkspace((prev) => ({
                    ...prev,
                    activeSectionId: secId,
                    activeNoteId: firstNote ? firstNote.id : prev.activeNoteId,
                  }));
                }}
                onCreateNote={handleCreateNote}
                onCreateSection={handleCreateSection}
                onCreateNotebook={handleCreateNotebook}
                onDeleteNote={handleDeleteNote}
                onDuplicateNote={handleDuplicateNote}
                onTogglePinNote={handleTogglePinNote}
                onRenameNote={handleRenameNote}
              />
            </Box>
          )}

          {/* Editor Panel */}
          <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            {activeNote ? (
              <NoteEditor
                note={activeNote}
                notebook={activeNotebook}
                section={activeSection}
                onUpdateNote={handleUpdateNote}
                onTogglePin={() => handleTogglePinNote(activeNote.id)}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--color-text-muted)',
                }}
              >
                <NoteAltIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No page selected
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleCreateNote(null)}
                  sx={{ textTransform: 'none' }}
                >
                  Create New Page
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        /* Microsoft Sticky Notes Board View */
        <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <StickyNotesBoard
            notes={workspace.notes}
            onCreateSticky={handleCreateSticky}
            onUpdateSticky={handleUpdateSticky}
            onDeleteSticky={handleDeleteNote}
          />
        </Box>
      )}

      {/* Dialog: Confirm Reset to Sample Notes */}
      <Dialog
        open={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Reset to Sample Notes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            This will reload all default feature-rich sample notes, including architecture decision records,
            sprint checklists, and Microsoft sticky notes. Any unsaved custom notes will be replaced.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsResetConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetToDefault}>
            Reset to Sample Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            sx={{ width: '100%', borderRadius: '8px' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default NotesCreatorPage;
