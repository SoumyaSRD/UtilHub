import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { featureRegistry } from '@registry/featureRegistry';
import { CATEGORIES } from '@registry/categories';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/' || path === '/dashboard') {
    return null;
  }

  const currentFeature = featureRegistry.getByRoute(path);
  const currentCategory = currentFeature ? CATEGORIES[currentFeature.category] : null;

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'var(--color-text-muted)' }} />}
        aria-label="breadcrumb"
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            '&:hover': { color: 'var(--color-primary)' },
          }}
        >
          <HomeIcon sx={{ fontSize: 15 }} />
          <span>Home</span>
        </Link>

        {currentCategory && (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
          >
            {currentCategory.title}
          </Typography>
        )}

        {currentFeature && (
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}
          >
            {currentFeature.name}
          </Typography>
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};
