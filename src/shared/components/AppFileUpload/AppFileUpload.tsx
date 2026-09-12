import React, { useCallback, useState } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

export interface AppFileUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  onClear?: () => void;
  accept?: Accept;
  multiple?: boolean;
  maxSizeBytes?: number; // default 1GB
  helperText?: string;
  selectedFile?: File | null;
  selectedFiles?: File[];
  isLoading?: boolean;
  progressPercent?: number;
}

export const AppFileUpload: React.FC<AppFileUploadProps> = ({
  onFileSelect,
  onFilesSelect,
  onClear,
  accept = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
  },
  multiple = false,
  maxSizeBytes = 1024 * 1024 * 1024, // 1GB
  helperText = 'Supports Excel (.xlsx, .xls) and CSV (.csv) up to 1GB',
  selectedFile,
  selectedFiles,
  isLoading = false,
  progressPercent,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: unknown[]) => {
      setErrorMessage(null);
      if (fileRejections && fileRejections.length > 0) {
        setErrorMessage('File rejected: Ensure the file matches allowed formats and does not exceed the size limit.');
        return;
      }
      if (acceptedFiles.length > 0) {
        for (const f of acceptedFiles) {
          if (f.size > maxSizeBytes) {
            const limitStr =
              maxSizeBytes >= 1024 * 1024 * 1024
                ? `${(maxSizeBytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
                : `${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB`;
            setErrorMessage(`File "${f.name}" exceeds maximum size of ${limitStr}.`);
            return;
          }
        }
        if (multiple && onFilesSelect) {
          onFilesSelect(acceptedFiles);
        } else {
          onFileSelect(acceptedFiles[0]);
        }
      }
    },
    [maxSizeBytes, multiple, onFileSelect, onFilesSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled: isLoading,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!selectedFile ? (
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'var(--color-primary)' : 'var(--color-border)',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive ? 'var(--color-primary-light)' : 'var(--color-surface)',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-surface-hover)',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: isDragActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              mb: 1.5,
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {isDragActive ? 'Drop file here...' : 'Click or drag & drop file here'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2.5,
            border: '1px solid var(--color-surface-border)',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InsertDriveFileIcon />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {selectedFiles && selectedFiles.length > 1
                    ? `${selectedFiles.length} Spreadsheets / CSVs Loaded`
                    : selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  {selectedFiles && selectedFiles.length > 1
                    ? selectedFiles.map((f) => f.name).join(', ')
                    : `${formatFileSize(selectedFile.size)} • ${selectedFile.type || 'Document'}`}
                </Typography>
              </Box>
            </Box>

            {onClear && !isLoading && (
              <IconButton size="small" onClick={onClear} aria-label="Remove file">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {isLoading && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress
                variant={progressPercent !== undefined ? 'determinate' : 'indeterminate'}
                value={progressPercent}
                sx={{ borderRadius: 4, height: 6 }}
              />
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>
                {progressPercent !== undefined ? `Processing: ${progressPercent}%` : 'Processing dataset...'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};
