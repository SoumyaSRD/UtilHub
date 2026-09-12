import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HelpIcon from '@mui/icons-material/Help';
import { AppIcon } from '../AppIcon/AppIcon';
import { useNavigation } from '@registry/hooks/useNavigation';
import type { FeatureBadge } from '@registry/types';

export interface AppPageHeaderProps {
  toolId?: string;
  title: string;
  description?: string;
  iconName?: string;
  badge?: FeatureBadge;
  documentationUrl?: string;
  actions?: React.ReactNode;
}

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  toolId,
  title,
  description,
  iconName,
  badge,
  documentationUrl,
  actions,
}) => {
  const { favoriteIds, toggleFavorite } = useNavigation();
  const isFavorite = toolId ? favoriteIds.includes(toolId) : false;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 3,
        pb: 2,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {iconName && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <AppIcon name={iconName} fontSize="medium" />
          </Box>
        )}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {title}
            </Typography>

            {toolId && (
              <Tooltip title={isFavorite ? 'Remove from favorites' : 'Pin to favorites'}>
                <IconButton
                  size="small"
                  onClick={() => toggleFavorite(toolId)}
                  sx={{
                    color: isFavorite ? '#f59e0b' : 'var(--color-text-muted)',
                    '&:hover': { color: '#f59e0b' },
                  }}
                  aria-label="Toggle favorite"
                >
                  {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}

            {badge && (
              <Chip
                label={badge.text}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor:
                    badge.variant === 'new'
                      ? 'var(--color-success-bg)'
                      : badge.variant === 'beta'
                      ? 'var(--color-warning-bg)'
                      : 'var(--color-primary-light)',
                  color:
                    badge.variant === 'new'
                      ? 'var(--color-success)'
                      : badge.variant === 'beta'
                      ? 'var(--color-warning)'
                      : 'var(--color-primary)',
                }}
              />
            )}
          </Box>

          {description && (
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, maxWidth: 800 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {documentationUrl && (
          <Tooltip title="View Tool Documentation">
            <IconButton
              size="small"
              component="a"
              href={documentationUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {actions}
      </Box>
    </Box>
  );
};
