import React from 'react';
import Card, { type CardProps } from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export interface AppCardProps extends Omit<CardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  noPadding = false,
  sx,
  ...props
}) => {
  const hasHeader = Boolean(title || subtitle || headerActions);

  return (
    <Card
      sx={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {hasHeader && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
            }}
          >
            <Box>
              {typeof title === 'string' ? (
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {title}
                </Typography>
              ) : (
                title
              )}
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {headerActions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{headerActions}</Box>}
          </Box>
          <Divider sx={{ borderColor: 'var(--color-divider)' }} />
        </>
      )}
      <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
    </Card>
  );
};
