import React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text' | 'danger';
  loading?: boolean;
  tooltip?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  variant = 'contained',
  loading = false,
  disabled,
  tooltip,
  startIcon,
  sx,
  ...props
}) => {
  const isDanger = variant === 'danger';
  const muiVariant = isDanger ? 'contained' : variant;

  const buttonElement = (
    <Button
      variant={muiVariant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: '8px',
        px: 2,
        py: 0.8,
        fontSize: '0.875rem',
        ...(isDanger && {
          backgroundColor: 'var(--color-error)',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#dc2626',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
};
