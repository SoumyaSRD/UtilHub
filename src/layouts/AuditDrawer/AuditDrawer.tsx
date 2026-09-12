import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { useAppDispatch, useAppSelector } from '@app/store';
import { setAuditDrawerOpen, showToast } from '@app/store/slices/uiSlice';
import { auditService, type AuditRecord } from '@shared/telemetry/audit';

export const AuditDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.auditDrawerOpen);
  const [records, setRecords] = useState<AuditRecord[]>(() => auditService.getRecords());

  const handleOpen = () => {
    setRecords(auditService.getRecords());
  };

  const handleClear = () => {
    auditService.clear();
    setRecords([]);
    dispatch(showToast({ message: 'Audit log cleared', severity: 'info' }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => dispatch(setAuditDrawerOpen(false))}
      onTransitionEnter={handleOpen}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-surface-border)',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Audit & Security Log
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
            Traceability of role changes, executions & configs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Clear audit records">
            <IconButton size="small" onClick={handleClear} sx={{ color: 'var(--color-text-secondary)' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => dispatch(setAuditDrawerOpen(false))} sx={{ color: 'var(--color-text-secondary)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Record List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {records.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
              No audit records logged yet in this session.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {records.map((rec) => (
              <ListItem
                key={rec.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                  <Chip
                    label={rec.action}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor:
                        rec.status === 'SUCCESS'
                          ? 'var(--color-success-bg)'
                          : 'var(--color-error-bg)',
                      color:
                        rec.status === 'SUCCESS'
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                    {new Date(rec.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {rec.targetId}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  Actor: {rec.actor}
                </Typography>

                {rec.details && Object.keys(rec.details).length > 0 && (
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      width: '100%',
                      fontSize: '0.7rem',
                      backgroundColor: 'var(--color-code-bg)',
                      color: 'var(--color-code-text)',
                      borderRadius: '4px',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(rec.details, null, 2)}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};
