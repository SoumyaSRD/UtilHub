import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/Error';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { AppButton } from '../AppButton/AppButton';
import Collapse from '@mui/material/Collapse';

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  variant?: 'general' | 'unauthorized' | 'notfound';
  onRetry?: () => void;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  title,
  message,
  error,
  variant = 'general',
  onRetry,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const defaultTitle =
    variant === 'unauthorized'
      ? 'Access Denied'
      : variant === 'notfound'
      ? 'Utility Not Found'
      : 'Something went wrong';

  const defaultMessage =
    variant === 'unauthorized'
      ? 'Your current role does not have the required permissions to access this utility. Switch roles or request access from an administrator.'
      : variant === 'notfound'
      ? 'The requested utility route does not exist or has been disabled in platform configuration.'
      : 'An unexpected error occurred while running this utility module.';

  const icon =
    variant === 'unauthorized' ? (
      <LockOutlinedIcon sx={{ fontSize: 48, color: 'var(--color-warning)' }} />
    ) : variant === 'notfound' ? (
      <SearchOffIcon sx={{ fontSize: 48, color: 'var(--color-text-muted)' }} />
    ) : (
      <ErrorIcon sx={{ fontSize: 48, color: 'var(--color-error)' }} />
    );

  const errorString: string =
    error instanceof Error ? error.stack || error.message : typeof error === 'string' ? error : JSON.stringify(error, null, 2);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 5,
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-surface-border)',
        maxWidth: 650,
        mx: 'auto',
        my: 4,
      }}
    >
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text-primary)', mb: 1 }}>
        {title || defaultTitle}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
        {message || defaultMessage}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <AppButton variant="contained" onClick={onRetry}>
            Retry Operation
          </AppButton>
        )}
        <AppButton variant="outlined" onClick={() => (window.location.href = '/')}>
          Back to Dashboard
        </AppButton>
        {Boolean(error) && (
          <AppButton variant="text" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </AppButton>
        )}
      </Box>

      {Boolean(error) && (
        <Collapse in={showDetails} sx={{ width: '100%', mt: 3 }}>
          <pre
            style={{
              padding: '16px',
              textAlign: 'left',
              fontSize: '0.75rem',
              backgroundColor: 'var(--color-code-bg)',
              color: 'var(--color-code-text)',
              border: '1px solid var(--color-code-border)',
              borderRadius: '8px',
              overflowX: 'auto',
              maxHeight: '250px',
            }}
          >
            {errorString}
          </pre>
        </Collapse>
      )}
    </Box>
  );
};
