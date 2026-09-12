import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppIcon } from '@shared/components/AppIcon/AppIcon';
import { useNavigation } from '@registry/hooks/useNavigation';
import { usePermissions } from '@registry/hooks/usePermissions';
import { useAppDispatch } from '@app/store';
import { setCommandPaletteOpen } from '@app/store/slices/uiSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, activeRole } = usePermissions();
  const { availableFeatures, categoriesWithFeatures, favorites, recentlyUsed } = useNavigation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Welcome Hero Banner */}
      <AppCard
        sx={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-primary-light) 100%)',
          border: '1px solid var(--color-surface-border)',
          p: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Welcome back, {user.name.split(' ')[0]}
              </Typography>
              <Chip
                label={`Role: ${activeRole}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', maxWidth: 700 }}>
              Centralized engineering productivity platform. Discover, execute, and automate business data, SQL transforms, and developer workflows.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <AppButton
              variant="contained"
              startIcon={<BoltIcon />}
              onClick={() => dispatch(setCommandPaletteOpen(true))}
            >
              Command Palette (⌘K)
            </AppButton>
            <AppButton
              variant="outlined"
              onClick={() => navigate('/excel/column-extractor')}
            >
              Launch Column Extractor
            </AppButton>
          </Box>
        </Box>
      </AppCard>

      {/* KPI Stats Row */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppCard>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Accessible Utilities
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {availableFeatures.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-success)', fontWeight: 600 }}>
                Active for {activeRole}
              </Typography>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppCard>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pinned Favorites
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                {favorites.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                Quick Access
              </Typography>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppCard>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Recent Tool Sessions
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                {recentlyUsed.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                In this workspace
              </Typography>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AppCard>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Platform Security
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 28 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Client Memory Safe
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  Zero Server Exfiltration
                </Typography>
              </Box>
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      {/* Pinned Favorites Quick Launch */}
      {favorites.length > 0 && (
        <AppCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <span>Pinned Utilities</span>
            </Box>
          }
          subtitle="Your personal starred engineering shortcuts"
        >
          <Grid container spacing={2}>
            {favorites.map((feat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feat.id}>
                <Box
                  onClick={() => navigate(feat.route)}
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-surface-hover)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppIcon name={feat.iconName} fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {feat.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block', mb: 1.5 }}>
                    {feat.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>Launch Utility</span>
                    <ArrowForwardIcon sx={{ fontSize: 13 }} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AppCard>
      )}

      {/* Tool Category Launchpad */}
      <AppCard
        title="Tool Categories & Suites"
        subtitle="Explore available domain-specific utility modules"
      >
        <Grid container spacing={2.5}>
          {categoriesWithFeatures
            .filter((c) => c.category.id !== 'dashboard')
            .map(({ category, features }) => (
              <Grid size={{ xs: 12, md: 6 }} key={category.id}>
                <Box
                  sx={{
                    p: 2.5,
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '10px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppIcon name={category.iconName} fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {category.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                          {features.length} tools available
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
                      {category.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {features.map((feat) => (
                      <Chip
                        key={feat.id}
                        icon={<AppIcon name={feat.iconName} style={{ fontSize: 15 }} />}
                        label={feat.shortName || feat.name}
                        onClick={() => navigate(feat.route)}
                        clickable
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                            backgroundColor: 'var(--color-surface-hover)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            ))}
        </Grid>
      </AppCard>
    </Box>
  );
};
