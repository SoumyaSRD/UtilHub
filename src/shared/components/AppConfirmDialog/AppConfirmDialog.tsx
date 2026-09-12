import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { AppButton } from '../AppButton/AppButton';

export interface AppConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AppConfirmDialog: React.FC<AppConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            border: '1px solid var(--color-surface-border)',
            backgroundColor: 'var(--color-surface)',
            p: 1,
            maxWidth: 440,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        <AppButton variant="outlined" onClick={onCancel}>
          {cancelLabel}
        </AppButton>
        <AppButton variant={isDangerous ? 'danger' : 'contained'} onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
