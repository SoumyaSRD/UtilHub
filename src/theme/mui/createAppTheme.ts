import { createTheme, type Theme } from '@mui/material/styles';
import { type ThemeMode, isDarkTheme } from '../types';

export const createAppTheme = (mode: ThemeMode): Theme => {
  const isDark = isDarkTheme(mode);

  const getPrimary = () => {
    switch (mode) {
      case 'solo-leveling':
        return { main: '#00e5ff', light: '#38fdfd', dark: '#00b4d8', contrastText: '#05070e' };
      case 'cyberpunk-neon':
        return { main: '#00f0ff', light: '#38f8ff', dark: '#00b4bf', contrastText: '#000000' };
      case 'dracula':
        return { main: '#bd93f9', light: '#caa7fc', dark: '#9d6be8', contrastText: '#282a36' };
      case 'nordic-frost':
        return { main: '#88c0d0', light: '#8fbcbb', dark: '#5e81ac', contrastText: '#242933' };
      case 'tokyo-sunset':
        return { main: '#ff9e64', light: '#ffb38a', dark: '#f7768e', contrastText: '#131421' };
      case 'enterprise-green':
        return { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#ffffff' };
      case 'enterprise-blue':
        return { main: '#0284c7', light: '#38bdf8', dark: '#0369a1', contrastText: '#ffffff' };
      case 'high-contrast':
        return { main: '#0000ee', light: '#3333ff', dark: '#0000aa', contrastText: '#ffffff' };
      case 'dark':
        return { main: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#ffffff' };
      default:
        return { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#ffffff' };
    }
  };

  const getSecondary = () => {
    switch (mode) {
      case 'solo-leveling':
        return { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9' };
      case 'cyberpunk-neon':
        return { main: '#ff007f' };
      case 'dracula':
        return { main: '#ff79c6' };
      case 'nordic-frost':
        return { main: '#81a1c1' };
      case 'tokyo-sunset':
        return { main: '#f7768e' };
      default:
        return { main: isDark ? '#94a3b8' : '#475569' };
    }
  };

  const getBackground = () => {
    switch (mode) {
      case 'solo-leveling':
        return { default: '#05070e', paper: '#0c0f1d' };
      case 'cyberpunk-neon':
        return { default: '#080811', paper: '#0f111e' };
      case 'dracula':
        return { default: '#1e1f29', paper: '#282a36' };
      case 'nordic-frost':
        return { default: '#1f232a', paper: '#292e39' };
      case 'tokyo-sunset':
        return { default: '#11121d', paper: '#181926' };
      case 'dark':
        return { default: '#090d16', paper: '#111827' };
      case 'enterprise-blue':
        return { default: '#f0f6fc', paper: '#ffffff' };
      case 'enterprise-green':
        return { default: '#f4f8f6', paper: '#ffffff' };
      case 'high-contrast':
        return { default: '#ffffff', paper: '#ffffff' };
      default:
        return { default: '#f8fafc', paper: '#ffffff' };
    }
  };

  const getText = () => {
    switch (mode) {
      case 'solo-leveling':
        return { primary: '#f0f4ff', secondary: '#9bb0d6' };
      case 'cyberpunk-neon':
        return { primary: '#f0f4fc', secondary: '#9da7c7' };
      case 'dracula':
        return { primary: '#f8f8f2', secondary: '#a7acc0' };
      case 'nordic-frost':
        return { primary: '#eceff4', secondary: '#d8dee9' };
      case 'tokyo-sunset':
        return { primary: '#c0caf5', secondary: '#a9b1d6' };
      default:
        return {
          primary: isDark ? '#f9fafb' : '#0f172a',
          secondary: isDark ? '#9ca3af' : '#475569',
        };
    }
  };

  const getDivider = () => {
    switch (mode) {
      case 'solo-leveling':
        return '#1e2442';
      case 'cyberpunk-neon':
        return '#1f233f';
      case 'dracula':
        return '#343746';
      case 'nordic-frost':
        return '#3b4252';
      case 'tokyo-sunset':
        return '#2b2e47';
      default:
        return isDark ? '#1f2937' : '#e2e8f0';
    }
  };

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: getPrimary(),
      secondary: getSecondary(),
      background: getBackground(),
      text: getText(),
      divider: getDivider(),
      success: {
        main:
          mode === 'solo-leveling'
            ? '#10b981'
            : mode === 'cyberpunk-neon'
            ? '#00ff9f'
            : mode === 'dracula'
            ? '#50fa7b'
            : mode === 'tokyo-sunset'
            ? '#73daca'
            : '#10b981',
      },
      warning: {
        main:
          mode === 'solo-leveling'
            ? '#f59e0b'
            : mode === 'cyberpunk-neon'
            ? '#ffd600'
            : mode === 'dracula'
            ? '#ffb86c'
            : mode === 'tokyo-sunset'
            ? '#e0af68'
            : '#f59e0b',
      },
      error: {
        main:
          mode === 'solo-leveling'
            ? '#f43f5e'
            : mode === 'cyberpunk-neon'
            ? '#ff2a6d'
            : mode === 'dracula'
            ? '#ff5555'
            : mode === 'tokyo-sunset'
            ? '#f7768e'
            : '#ef4444',
      },
      info: {
        main:
          mode === 'solo-leveling'
            ? '#00e5ff'
            : mode === 'cyberpunk-neon'
            ? '#05d9e8'
            : mode === 'dracula'
            ? '#8be9fd'
            : mode === 'tokyo-sunset'
            ? '#7aa2f7'
            : '#0ea5e9',
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
            fontWeight: 600,
            transition: 'all 0.18s ease',
            '&:hover': {
              boxShadow: '0 0 14px var(--color-primary-glow, rgba(59, 130, 246, 0.35))',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid var(--glass-border, var(--color-surface-border, #e2e8f0))',
            backgroundColor: 'var(--glass-bg, var(--color-surface))',
            backdropFilter: 'var(--glass-blur, blur(16px))',
            WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
            boxShadow: 'var(--glass-shadow, var(--shadow-card, 0 1px 3px 0 rgba(0,0,0,0.05)))',
            backgroundImage: 'none',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'var(--glass-bg, var(--color-surface))',
            backdropFilter: 'var(--glass-blur, blur(16px))',
            WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
            border: '1px solid var(--glass-border, var(--color-surface-border, #e2e8f0))',
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
