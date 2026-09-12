import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeMode } from '../types';

export const createAppTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#3b82f6' : mode === 'enterprise-green' ? '#059669' : mode === 'enterprise-blue' ? '#0284c7' : '#1976d2',
        light: isDark ? '#60a5fa' : '#42a5f5',
        dark: isDark ? '#1d4ed8' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#94a3b8' : '#475569',
      },
      background: {
        default: isDark ? '#090d16' : mode === 'enterprise-blue' ? '#f0f6fc' : mode === 'enterprise-green' ? '#f4f8f6' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f9fafb' : '#0f172a',
        secondary: isDark ? '#9ca3af' : '#475569',
      },
      divider: isDark ? '#1f2937' : '#e2e8f0',
      success: {
        main: '#10b981',
      },
      warning: {
        main: '#f59e0b',
      },
      error: {
        main: '#ef4444',
      },
      info: {
        main: '#0ea5e9',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.015em' },
      h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.125rem', fontWeight: 600 },
      h5: { fontSize: '1rem', fontWeight: 600 },
      h6: { fontSize: '0.875rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
      body1: { fontSize: '0.875rem', lineHeight: 1.5 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid var(--color-surface-border, #e2e8f0)',
            boxShadow: 'var(--shadow-card, 0 1px 3px 0 rgba(0,0,0,0.05))',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
    },
  });
};
