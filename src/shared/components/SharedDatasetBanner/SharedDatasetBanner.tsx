import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { AppButton } from '../AppButton/AppButton';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  clearActiveDataset,
  dismissDatasetForTool,
  type ActiveDataset,
} from '@app/store/slices/sharedDataSlice';
import { showToast } from '@app/store/slices/uiSlice';

export interface SharedDatasetBannerProps {
  toolId: string;
  isCurrentDataLoaded: boolean;
  onUseDataset: (dataset: ActiveDataset) => void;
}

export const SharedDatasetBanner: React.FC<SharedDatasetBannerProps> = ({
  toolId,
  isCurrentDataLoaded,
  onUseDataset,
}) => {
  const dispatch = useAppDispatch();
  const activeDataset = useAppSelector((state) => state.sharedData.activeDataset);
  const dismissedDatasetId = useAppSelector(
    (state) => state.sharedData.dismissedTools[toolId]
  );

  if (!activeDataset) return null;

  // Don't show banner if already loaded in this tool, or if user dismissed it for this dataset
  const isDismissed = dismissedDatasetId === activeDataset.id;
  const isVisible = !isCurrentDataLoaded && !isDismissed;

  const totalRowCount = Object.values(activeDataset.sheets).reduce(
    (sum, s) => sum + s.totalRowCount,
    0
  );
  const sheetCount = activeDataset.sheetNames.length;
  const activeSheetData = activeDataset.sheets[activeDataset.activeSheet];
  const colCount = activeSheetData?.columns?.length ?? 0;

  const handleApply = () => {
    onUseDataset(activeDataset);
    dispatch(
      showToast({
        message: `Loaded previously uploaded dataset "${activeDataset.fileName}"`,
        severity: 'success',
      })
    );
  };

  const handleClear = () => {
    dispatch(clearActiveDataset());
    dispatch(
      showToast({
        message: 'Shared dataset store cleared',
        severity: 'info',
      })
    );
  };

  const handleDismiss = () => {
    dispatch(dismissDatasetForTool({ toolId, datasetId: activeDataset.id }));
  };

  return (
    <Collapse in={isVisible} unmountOnExit>
      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: '10px',
          border: '1px solid var(--color-primary)',
          backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.08))',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StorageIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Previously Uploaded Data Available
              </Typography>
              <Chip
                label={activeDataset.fileName}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-surface-border)',
                }}
              />
              <Chip
                label={`${totalRowCount.toLocaleString()} rows • ${colCount} cols ${
                  sheetCount > 1 ? `• ${sheetCount} sheets` : ''
                }`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.25 }}>
              Do you want to use the existing data uploaded from {activeDataset.sourceTool || 'another tool'}?
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <AppButton
            variant="contained"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={handleApply}
          >
            Use Existing Data
          </AppButton>
          <AppButton
            variant="outlined"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClear}
          >
            Clear Store
          </AppButton>
          <IconButton size="small" onClick={handleDismiss} title="Dismiss">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Collapse>
  );
};
