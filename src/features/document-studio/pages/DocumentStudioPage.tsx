import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SyncIcon from '@mui/icons-material/Sync';
import SpeedIcon from '@mui/icons-material/Speed';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppConfirmDialog } from '@shared/components/AppConfirmDialog/AppConfirmDialog';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { fileWorkerClient } from '@shared/workers/fileWorkerClient';
import { studioStorage } from '../services/studioStorage';
import type { StudioFile, StudioFileType, SpreadsheetContent } from '../types';
import { NewFileModal } from '../components/NewFileModal';
import { ExcelStudioEditor } from '../components/ExcelStudioEditor';
import { TextStudioEditor } from '../components/TextStudioEditor';
import { MarkdownStudioEditor } from '../components/MarkdownStudioEditor';
import { WordStudioEditor } from '../components/WordStudioEditor';
import { PdfStudioViewer } from '../components/PdfStudioViewer';

const DEFAULT_SPREADSHEET: SpreadsheetContent = {
  sheetNames: ['Products', 'Metrics'],
  activeSheet: 'Products',
  sheets: {
    Products: {
      sheetName: 'Products',
      columns: ['SKU', 'Product_Name', 'Category', 'Unit_Price', 'Stock_Qty', 'Status'],
      rows: [
        { SKU: 'SKU-001', Product_Name: 'Enterprise Cloud Server', Category: 'Infrastructure', Unit_Price: 450, Stock_Qty: 18, Status: 'ACTIVE' },
        { SKU: 'SKU-002', Product_Name: 'Database Engine Cluster', Category: 'Database', Unit_Price: 280, Stock_Qty: 42, Status: 'ACTIVE' },
        { SKU: 'SKU-003', Product_Name: 'VPC Gateway Peering', Category: 'Networking', Unit_Price: 75, Stock_Qty: 120, Status: 'ACTIVE' },
        { SKU: 'SKU-004', Product_Name: 'Cold Storage Archive', Category: 'Storage', Unit_Price: 15, Stock_Qty: 950, Status: 'PENDING' },
      ],
    },
    Metrics: {
      sheetName: 'Metrics',
      columns: ['Quarter', 'Revenue_Target', 'Actual_Revenue', 'Variance_Pct'],
      rows: [
        { Quarter: 'Q1', Revenue_Target: 120000, Actual_Revenue: 134500, Variance_Pct: '+12.1%' },
        { Quarter: 'Q2', Revenue_Target: 140000, Actual_Revenue: 138900, Variance_Pct: '-0.8%' },
      ],
    },
  },
};

const DEFAULT_FILES: StudioFile[] = [
  {
    id: 'f-sample-excel',
    name: 'Enterprise_Inventory.xlsx',
    type: 'excel',
    content: DEFAULT_SPREADSHEET,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sizeBytes: 8192,
  },
  {
    id: 'f-sample-md',
    name: 'Architecture_Guide.md',
    type: 'markdown',
    content: `# Engineering Architecture & Operations Guide\n\nWelcome to the dynamic document workspace. Here you can write specifications, checklists, and documentation with live HTML and PDF exports.\n\n## Quick Checklist\n- [x] Excel in-cell editing & formulas\n- [x] Markdown live dual-pane rendering\n- [x] Word rich formatting and exports\n- [x] PDF text extractor\n\n> "Simplicity is prerequisite for reliability." - Edsger W. Dijkstra\n\n\`\`\`typescript\ninterface PlatformMetrics {\n  uptime: number;\n  activeWorkspaces: number;\n}\n\`\`\``,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sizeBytes: 4096,
  },
  {
    id: 'f-sample-word',
    name: 'Executive_Summary.docx',
    type: 'word',
    content: `<h1>Platform Executive Summary</h1><p>This document highlights modern web architecture and client-side high performance data processing capabilities.</p><h2>Key Capabilities</h2><p>Users can view, edit, delete, and create spreadsheets, rich text documents, PDF files, and Markdown notes seamlessly in the browser.</p>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sizeBytes: 3500,
  },
];

export const DocumentStudioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<StudioFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<StudioFile | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [storageStatus, setStorageStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('Processing in Web Worker...');

  // Initialize from IndexedDB via studioStorage
  useEffect(() => {
    let mounted = true;
    studioStorage.loadFiles(DEFAULT_FILES).then((loaded) => {
      if (mounted && loaded.length > 0) {
        setFiles(loaded);
        setActiveFileId((prev) => (loaded.some((f) => f.id === prev) ? prev : loaded[0].id));
      }
    });

    const unsubscribe = studioStorage.subscribeStatus((st) => {
      if (mounted) setStorageStatus(st);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCreateFile = (newFile: StudioFile) => {
    const updated = [...files, newFile];
    setFiles(updated);
    setActiveFileId(newFile.id);
    studioStorage.saveFilesDebounced(updated, 100);
    dispatch(showToast({ message: `Created "${newFile.name}"`, severity: 'success' }));
  };

  const handleUpdateContent = (updatedContent: string | SpreadsheetContent) => {
    if (!activeFile) return;
    const updated = files.map((f) =>
      f.id === activeFile.id
        ? { ...f, content: updatedContent, updatedAt: new Date().toISOString() }
        : f
    );
    setFiles(updated);
    studioStorage.saveFilesDebounced(updated, 500);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    const remaining = files.filter((f) => f.id !== fileToDelete.id);
    setFiles(remaining);
    if (activeFileId === fileToDelete.id) {
      setActiveFileId(remaining[0]?.id || '');
    }
    studioStorage.saveFilesDebounced(remaining, 100);
    dispatch(showToast({ message: `Deleted "${fileToDelete.name}"`, severity: 'info' }));
    setFileToDelete(null);
  };

  const handleDuplicate = () => {
    if (!activeFile) return;
    setMenuAnchor(null);
    const dup: StudioFile = {
      ...activeFile,
      id: `file-${Date.now()}`,
      name: `Copy_of_${activeFile.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...files, dup];
    setFiles(updated);
    setActiveFileId(dup.id);
    studioStorage.saveFilesDebounced(updated, 100);
    dispatch(showToast({ message: `Duplicated "${activeFile.name}"`, severity: 'success' }));
  };

  const handleRename = () => {
    if (!activeFile || !renameValue.trim()) return;
    const clean = renameValue.trim();
    const updated = files.map((f) => (f.id === activeFile.id ? { ...f, name: clean } : f));
    setFiles(updated);
    studioStorage.saveFilesDebounced(updated, 100);
    setRenameDialogOpen(false);
    dispatch(showToast({ message: `Renamed file to "${clean}"`, severity: 'success' }));
  };

  // Upload file using Web Worker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const lowerName = uploaded.name.toLowerCase();
    setIsProcessingFile(true);
    setProcessingStatusText(`Offloading ${uploaded.name} to Web Worker...`);

    try {
      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
        const fileType: StudioFileType = lowerName.endsWith('.csv') ? 'csv' : 'excel';
        const parsed = await fileWorkerClient.parseExcelFile(uploaded);

        const spreadsheetContent: SpreadsheetContent = {
          sheetNames: parsed.sheetNames,
          activeSheet: parsed.activeSheet,
          sheets: parsed.sheets || {
            [parsed.activeSheet]: {
              sheetName: parsed.activeSheet,
              columns: parsed.columns,
              rows: parsed.rows,
            },
          },
        };

        const newFile: StudioFile = {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: fileType,
          content: spreadsheetContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: uploaded.size,
        };

        const updated = [...files, newFile];
        setFiles(updated);
        setActiveFileId(newFile.id);
        studioStorage.saveFilesDebounced(updated, 200);
        dispatch(
          showToast({
            message: `Parsed "${uploaded.name}" smoothly via Web Worker!`,
            severity: 'success',
          })
        );
      } else if (lowerName.endsWith('.pdf')) {
        const fileUrl = URL.createObjectURL(uploaded);
        const newFile: StudioFile = {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: 'pdf',
          content: '',
          pdfUrl: fileUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: uploaded.size,
        };
        const updated = [...files, newFile];
        setFiles(updated);
        setActiveFileId(newFile.id);
        studioStorage.saveFilesDebounced(updated, 200);
        dispatch(showToast({ message: `Loaded PDF document "${uploaded.name}"`, severity: 'success' }));
      } else if (lowerName.endsWith('.md')) {
        const text = await uploaded.text();
        const newFile: StudioFile = {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: 'markdown',
          content: text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: uploaded.size,
        };
        const updated = [...files, newFile];
        setFiles(updated);
        setActiveFileId(newFile.id);
        studioStorage.saveFilesDebounced(updated, 200);
        dispatch(showToast({ message: `Loaded Markdown document "${uploaded.name}"`, severity: 'success' }));
      } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.html')) {
        const text = await uploaded.text();
        const newFile: StudioFile = {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: 'word',
          content: text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: uploaded.size,
        };
        const updated = [...files, newFile];
        setFiles(updated);
        setActiveFileId(newFile.id);
        studioStorage.saveFilesDebounced(updated, 200);
        dispatch(showToast({ message: `Loaded document "${uploaded.name}"`, severity: 'success' }));
      } else {
        const fileType: StudioFileType = lowerName.endsWith('.json') ? 'code' : 'text';
        const text = await uploaded.text();
        const newFile: StudioFile = {
          id: `file-${Date.now()}`,
          name: uploaded.name,
          type: fileType,
          content: text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sizeBytes: uploaded.size,
        };
        const updated = [...files, newFile];
        setFiles(updated);
        setActiveFileId(newFile.id);
        studioStorage.saveFilesDebounced(updated, 200);
        dispatch(showToast({ message: `Loaded file "${uploaded.name}"`, severity: 'success' }));
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      dispatch(showToast({ message: `Failed to process file: ${err.message}`, severity: 'error' }));
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const getFileIcon = (type: StudioFileType) => {
    switch (type) {
      case 'excel':
      case 'csv':
        return <TableChartIcon sx={{ fontSize: 18, color: '#16a34a' }} />;
      case 'markdown':
        return <AutoStoriesIcon sx={{ fontSize: 18, color: '#9333ea' }} />;
      case 'word':
        return <ArticleIcon sx={{ fontSize: 18, color: '#0284c7' }} />;
      case 'pdf':
        return <PictureAsPdfIcon sx={{ fontSize: 18, color: '#dc2626' }} />;
      case 'code':
        return <CodeIcon sx={{ fontSize: 18, color: '#f59e0b' }} />;
      default:
        return <DescriptionIcon sx={{ fontSize: 18, color: '#64748b' }} />;
    }
  };

  const getStorageStatusBadge = () => {
    if (storageStatus === 'saving') {
      return (
        <Chip
          icon={<SyncIcon sx={{ fontSize: 14, animation: 'spin 1.5s linear infinite' }} />}
          label="Saving..."
          size="small"
          variant="outlined"
          color="warning"
        />
      );
    }
    if (storageStatus === 'unsaved') {
      return <Chip label="Unsaved Changes" size="small" variant="outlined" color="default" />;
    }
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
        label="IndexedDB Saved"
        size="small"
        variant="outlined"
        color="success"
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Loading Backdrop for Worker operations */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10, display: 'flex', flexDirection: 'column', gap: 2 }}
        open={isProcessingFile}
      >
        <CircularProgress color="inherit" size={48} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {processingStatusText}
        </Typography>
        <Chip
          icon={<SpeedIcon />}
          label="Zero UI Freeze (Web Worker Process)"
          color="primary"
          variant="filled"
        />
      </Backdrop>

      {/* Page Header */}
      <AppPageHeader
        toolId="documents.studio"
        title="Document & File Studio"
        description="Unified in-browser editor and viewer for Excel spreadsheets, Word documents, Markdown guides, PDFs, and text notes. Smooth, worker-accelerated CRUD."
        iconName="Description"
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {getStorageStatusBadge()}
            <input
              type="file"
              id="studio-file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.txt,.json,.md,.doc,.docx,.html,.pdf"
            />
            <label htmlFor="studio-file-upload">
              <AppButton
                component="span"
                variant="outlined"
                startIcon={<UploadFileIcon />}
              >
                Upload File
              </AppButton>
            </label>
            <AppButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsNewModalOpen(true)}
            >
              New File
            </AppButton>
          </Box>
        }
      />

      {/* Document Workspace Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-surface-border)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '12px',
          p: 0.5,
        }}
      >
        <Tabs
          value={activeFile?.id || ''}
          onChange={(_, val) => setActiveFileId(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ flex: 1, minHeight: 48 }}
        >
          {files.map((file) => (
            <Tab
              key={file.id}
              value={file.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFileIcon(file.type)}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: file.id === activeFileId ? 700 : 500,
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                  {files.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                      sx={{ p: 0.25, ml: 0.5, opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              }
              sx={{ minHeight: 48, textTransform: 'none' }}
            />
          ))}
        </Tabs>

        {activeFile && (
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
            <Tooltip title="File Options">
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setRenameValue(activeFile.name);
                  setRenameDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Rename
              </MenuItem>
              <MenuItem onClick={handleDuplicate}>
                <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicate
              </MenuItem>
              {files.length > 1 && (
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setFileToDelete(activeFile);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}
      </Box>

      {/* Active Editor Panel */}
      {activeFile ? (
        <Box>
          {(activeFile.type === 'excel' || activeFile.type === 'csv') && (
            <ExcelStudioEditor
              fileName={activeFile.name}
              content={activeFile.content as SpreadsheetContent}
              onChange={handleUpdateContent}
            />
          )}

          {activeFile.type === 'markdown' && (
            <MarkdownStudioEditor
              fileName={activeFile.name}
              content={activeFile.content as string}
              onChange={handleUpdateContent}
            />
          )}

          {activeFile.type === 'word' && (
            <WordStudioEditor
              fileName={activeFile.name}
              content={activeFile.content as string}
              onChange={handleUpdateContent}
            />
          )}

          {activeFile.type === 'pdf' && (
            <PdfStudioViewer
              fileName={activeFile.name}
              pdfUrl={activeFile.pdfUrl}
              textContent={typeof activeFile.content === 'string' ? activeFile.content : ''}
              onExtractToText={(text) => {
                const newTxt: StudioFile = {
                  id: `file-${Date.now()}`,
                  name: `${activeFile.name}_extracted.txt`,
                  type: 'text',
                  content: text,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  sizeBytes: text.length,
                };
                handleCreateFile(newTxt);
              }}
            />
          )}

          {(activeFile.type === 'text' || activeFile.type === 'code') && (
            <TextStudioEditor
              fileName={activeFile.name}
              content={activeFile.content as string}
              onChange={handleUpdateContent}
              language={activeFile.type === 'code' ? 'json' : 'plaintext'}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No files available. Click "New File" to create a spreadsheet, note, or rich document.
          </Typography>
        </Box>
      )}

      {/* New File Modal */}
      <NewFileModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateFile}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        </DialogContent>
        <DialogActions>
          <AppButton variant="text" onClick={() => setRenameDialogOpen(false)}>
            Cancel
          </AppButton>
          <AppButton variant="contained" onClick={handleRename}>
            Rename
          </AppButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AppConfirmDialog
        open={Boolean(fileToDelete)}
        title="Delete Document?"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? Any unsaved changes will be lost.`}
        confirmLabel="Delete File"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />
    </Box>
  );
};

export default DocumentStudioPage;
