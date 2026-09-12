import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';

interface RowDetailModalProps {
  open: boolean;
  onClose: () => void;
  row: Record<string, unknown> | null;
  rowNumber: number | null;
  sheetName: string;
}

export const RowDetailModal: React.FC<RowDetailModalProps> = ({
  open,
  onClose,
  row,
  rowNumber,
  sheetName,
}) => {
  if (!row) return null;

  const entries = Object.entries(row);
  const jsonString = JSON.stringify(row, null, 2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Record Inspector
          </Typography>
          <Chip label={`Row #${rowNumber}`} size="small" sx={{ fontWeight: 700, bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }} />
          <Chip label={`Sheet: ${sheetName}`} size="small" sx={{ bgcolor: 'var(--color-surface-hover)' }} />
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '8px', border: '1px solid var(--color-border-subtle)', boxShadow: 'none' }}>
          <Table size="small">
            <TableBody>
              {entries.map(([key, val]) => {
                const isEmpty = val === null || val === undefined || val === '';
                return (
                  <TableRow key={key} sx={{ '&:nth-of-type(even)': { backgroundColor: 'var(--color-background)' } }}>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--color-text-secondary)', width: 220, borderBottom: '1px solid var(--color-border-subtle)' }}>
                      {key}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                      {isEmpty ? (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>(null / empty)</span>
                      ) : (
                        String(val)
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--color-border)', justifyContent: 'space-between' }}>
        <AppCopyButton textToCopy={jsonString} tooltipText="Copy row as JSON" />
        <AppButton variant="contained" size="small" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};
