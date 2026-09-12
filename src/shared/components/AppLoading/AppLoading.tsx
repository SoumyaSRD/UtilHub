import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export interface AppLoadingProps {
  message?: string;
  variant?: 'page' | 'inline' | 'overlay';
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  message = 'Loading platform module...',
  variant = 'inline',
}) => {
  if (variant === 'page') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} thickness={4} sx={{ color: 'var(--color-primary)' }} />
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, gap: 1.5 }}>
      <CircularProgress size={24} thickness={4} sx={{ color: 'var(--color-primary)' }} />
      {message && (
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
