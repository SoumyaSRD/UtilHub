import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import { saveAs } from 'file-saver';

export interface PdfStudioViewerProps {
  fileName: string;
  pdfUrl?: string;
  textContent?: string;
  onExtractToText?: (text: string) => void;
}

export const PdfStudioViewer: React.FC<PdfStudioViewerProps> = ({
  fileName,
  pdfUrl,
  textContent = '',
  onExtractToText,
}) => {
  const dispatch = useAppDispatch();
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 50));
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);

  const handleDownload = () => {
    if (pdfUrl) {
      saveAs(pdfUrl, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    } else {
      const blob = new Blob([textContent], { type: 'application/pdf' });
      saveAs(blob, `${fileName}.pdf`);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const w = window.open(pdfUrl, '_blank');
      w?.focus();
      w?.print();
    } else {
      window.print();
    }
  };

  const handleExtractText = () => {
    if (onExtractToText && textContent) {
      onExtractToText(textContent);
      dispatch(showToast({ message: 'Extracted PDF text into new Notepad file', severity: 'success' }));
    } else {
      dispatch(showToast({ message: 'No textual content available to extract', severity: 'warning' }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AppCard
        title="PDF Viewer & Document Inspector"
        subtitle="View, zoom, rotate, download, and extract text from PDF documents"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {onExtractToText && textContent && (
              <AppButton
                variant="outlined"
                size="small"
                startIcon={<TextSnippetIcon />}
                onClick={handleExtractText}
              >
                Extract to Notepad
              </AppButton>
            )}
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download PDF
            </AppButton>
          </Box>
        }
      >
        {/* PDF Controls */}
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            mb: 2,
            borderRadius: '8px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Chip label={`${zoom}%`} size="small" sx={{ fontWeight: 600 }} />
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Rotate Left">
              <IconButton size="small" onClick={handleRotateLeft}>
                <RotateLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotate Right">
              <IconButton size="small" onClick={handleRotateRight}>
                <RotateRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Chip label={`${rotation}°`} size="small" variant="outlined" />
          </Box>
        </Paper>

        {/* Viewer Canvas */}
        <Box
          sx={{
            minHeight: '600px',
            backgroundColor: 'rgba(0,0,0,0.06)',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          {pdfUrl ? (
            <Box
              component="iframe"
              src={pdfUrl}
              sx={{
                width: `${zoom}%`,
                maxWidth: '100%',
                height: '650px',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
              title="PDF Viewer"
            />
          ) : (
            <Paper
              sx={{
                p: 4,
                maxWidth: '650px',
                width: '100%',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 56, color: 'var(--color-primary)', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {fileName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
                PDF document loaded in memory. You can view extracted text, print, or download.
              </Typography>
              {textContent && (
                <Box
                  sx={{
                    p: 2,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-surface-border)',
                  }}
                >
                  {textContent}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </AppCard>
    </Box>
  );
};
