import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export interface AppEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 5,
        textAlign: 'center',
        border: '1px dashed var(--color-border)',
        borderRadius: '12px',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <Box
        sx={{
          color: 'var(--color-text-muted)',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon || <FolderOpenIcon sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-text-primary)', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', maxWidth: 450, mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action && <Box>{action}</Box>}
    </Box>
  );
};
