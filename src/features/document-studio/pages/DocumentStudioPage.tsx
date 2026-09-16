import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import { excelService } from '@shared/services/file/excelService';
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

const STORAGE_KEY = 'helper_studio_files_v1';

export const DocumentStudioPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<StudioFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FILES;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return files[0]?.id || '';
  });

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<StudioFile | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      // ignore
    }
  }, [files]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCreateFile = (newFile: StudioFile) => {
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    dispatch(showToast({ message: `Created "${newFile.name}"`, severity: 'success' }));
  };

  const handleUpdateContent = (updatedContent: string | SpreadsheetContent) => {
    if (!activeFile) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? { ...f, content: updatedContent, updatedAt: new Date().toISOString() }
          : f
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    const remaining = files.filter((f) => f.id !== fileToDelete.id);
    setFiles(remaining);
    if (activeFileId === fileToDelete.id) {
      setActiveFileId(remaining[0]?.id || '');
    }
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
    setFiles((prev) => [...prev, dup]);
    setActiveFileId(dup.id);
    dispatch(showToast({ message: `Duplicated "${activeFile.name}"`, severity: 'success' }));
  };

  const handleRename = () => {
    if (!activeFile || !renameValue.trim()) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, name: renameValue.trim() } : f))
    );
    setRenameDialogOpen(false);
    dispatch(showToast({ message: `Renamed file to "${renameValue.trim()}"`, severity: 'success' }));
  };

  // Upload any file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const lowerName = uploaded.name.toLowerCase();
    let fileType: StudioFileType = 'text';

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
      fileType = lowerName.endsWith('.csv') ? 'csv' : 'excel';
      try {
        const parsed = await excelService.parseFile(uploaded);
        const spreadsheetContent: SpreadsheetContent = {
          sheetNames: parsed.sheetNames,
          activeSheet: parsed.activeSheet,
          sheets: {
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
        setFiles((prev) => [...prev, newFile]);
        setActiveFileId(newFile.id);
        dispatch(showToast({ message: `Uploaded and parsed spreadsheet "${uploaded.name}"`, severity: 'success' }));
      } catch (err) {
        dispatch(showToast({ message: 'Failed to parse Excel file', severity: 'error' }));
      }
    } else if (lowerName.endsWith('.pdf')) {
      fileType = 'pdf';
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
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      dispatch(showToast({ message: `Loaded PDF document "${uploaded.name}"`, severity: 'success' }));
    } else if (lowerName.endsWith('.md')) {
      fileType = 'markdown';
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
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      dispatch(showToast({ message: `Loaded Markdown document "${uploaded.name}"`, severity: 'success' }));
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.html')) {
      fileType = 'word';
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
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      dispatch(showToast({ message: `Loaded document "${uploaded.name}"`, severity: 'success' }));
    } else {
      fileType = lowerName.endsWith('.json') ? 'code' : 'text';
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
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      dispatch(showToast({ message: `Loaded file "${uploaded.name}"`, severity: 'success' }));
    }

    e.target.value = '';
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
        return <PictureAsPdfIcon sx={{ fontSize: 18, color: '#ef4444' }} />;
      case 'code':
        return <CodeIcon sx={{ fontSize: 18, color: '#ea580c' }} />;
      default:
        return <DescriptionIcon sx={{ fontSize: 18, color: '#2563eb' }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header */}
      <AppPageHeader
        toolId="documents.studio"
        title="Universal Document & File Studio"
        description="Dynamic multi-format workstation to view, edit, delete, create, and convert Excel spreadsheets, Word documents, PDFs, Markdown, and Notepad text files."
        iconName="FolderSpecial"
        actions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsNewModalOpen(true)}
            >
              New File
            </AppButton>

            <input
              type="file"
              id="studio-file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.txt,.log,.md,.doc,.docx,.pdf,.json,.html,.sql"
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
          </Box>
        }
      />

      {/* Dynamic File Tabs Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-surface-border)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          px: 1,
          py: 0.5,
          overflowX: 'auto',
        }}
      >
        <Tabs
          value={activeFile?.id || false}
          onChange={(_, val) => setActiveFileId(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 44, flex: 1 }}
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
                      fontWeight: activeFile?.id === file.id ? 700 : 500,
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Tooltip title="Delete file">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                      sx={{ p: 0.25, ml: 0.5, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              sx={{ minHeight: 44, textTransform: 'none', px: 1.5 }}
            />
          ))}
        </Tabs>

        {activeFile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1, flexShrink: 0 }}>
            <Tooltip title="File Options">
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setRenameValue(activeFile.name);
                  setRenameDialogOpen(true);
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Rename File
              </MenuItem>
              <MenuItem onClick={handleDuplicate}>
                <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicate File
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setFileToDelete(activeFile);
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete File
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>

      {/* Editor Canvas */}
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
              content={String(activeFile.content)}
              onChange={handleUpdateContent}
            />
          )}

          {activeFile.type === 'word' && (
            <WordStudioEditor
              fileName={activeFile.name}
              content={String(activeFile.content)}
              onChange={handleUpdateContent}
            />
          )}

          {activeFile.type === 'pdf' && (
            <PdfStudioViewer
              fileName={activeFile.name}
              pdfUrl={activeFile.pdfUrl}
              textContent={String(activeFile.content)}
              onExtractToText={(extracted) => {
                const extractedFile: StudioFile = {
                  id: `file-${Date.now()}`,
                  name: `Extracted_from_${activeFile.name}.txt`,
                  type: 'text',
                  content: extracted,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  sizeBytes: extracted.length,
                };
                handleCreateFile(extractedFile);
              }}
            />
          )}

          {activeFile.type === 'text' && (
            <TextStudioEditor
              fileName={activeFile.name}
              content={String(activeFile.content)}
              onChange={handleUpdateContent}
              language="plaintext"
            />
          )}

          {activeFile.type === 'code' && (
            <TextStudioEditor
              fileName={activeFile.name}
              content={String(activeFile.content)}
              onChange={handleUpdateContent}
              language={activeFile.name.endsWith('.sql') ? 'sql' : 'json'}
            />
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
            No files currently open in workspace
          </Typography>
          <AppButton variant="contained" startIcon={<AddIcon />} onClick={() => setIsNewModalOpen(true)}>
            Create New File
          </AppButton>
        </Box>
      )}

      {/* New File Modal */}
      <NewFileModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateFile}
      />

      {/* Delete Confirmation Dialog */}
      <AppConfirmDialog
        open={Boolean(fileToDelete)}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action removes it from your current workspace session.`}
        confirmLabel="Delete"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFileToDelete(null)}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Rename File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AppButton variant="outlined" onClick={() => setRenameDialogOpen(false)}>
            Cancel
          </AppButton>
          <AppButton variant="contained" onClick={handleRename}>
            Rename
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentStudioPage;
