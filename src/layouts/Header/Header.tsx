import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import PaletteIcon from '@mui/icons-material/Palette';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  toggleSidebar,
  setMobileNavOpen,
  setCommandPaletteOpen,
  setAuditDrawerOpen,
} from '@app/store/slices/uiSlice';
import { setThemeMode } from '@app/store/slices/preferencesSlice';
import { AVAILABLE_THEMES } from '@theme/types';
import type { ThemeMode } from '@theme/types';
import { usePermissions } from '@registry/hooks/usePermissions';
import type { UserRole } from '@app/store/slices/authSlice';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.preferences.themeMode);
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen);
  const { user, activeRole, switchRole } = usePermissions();

  const [themeAnchorEl, setThemeAnchorEl] = React.useState<null | HTMLElement>(null);
  const [roleAnchorEl, setRoleAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenThemeMenu = (event: React.MouseEvent<HTMLElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };
  const handleCloseThemeMenu = () => {
    setThemeAnchorEl(null);
  };
  const handleSelectTheme = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
    handleCloseThemeMenu();
  };

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setRoleAnchorEl(event.currentTarget);
  };
  const handleCloseRoleMenu = () => {
    setRoleAnchorEl(null);
  };
  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    handleCloseRoleMenu();
  };

  const rolesList: UserRole[] = ['ADMIN', 'DEVELOPER', 'QA', 'DEVOPS', 'ANALYST', 'SUPPORT'];

  return (
    <Box
      component="header"
      sx={{
        height: 'var(--header-height, 64px)',
        backgroundColor: 'var(--glass-header-bg, var(--color-header-bg))',
        backdropFilter: 'var(--glass-blur, blur(16px))',
        WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
        borderBottom: '1px solid var(--glass-border, var(--color-header-border))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--glass-shadow, 0 2px 10px rgba(0, 0, 0, 0.05))',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Left side: Brand + Mobile/Desktop Sidebar Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          size="small"
          onClick={() => {
            if (window.innerWidth < 900) {
              dispatch(setMobileNavOpen(!mobileNavOpen));
            } else {
              dispatch(toggleSidebar());
            }
          }}
          sx={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle navigation"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            U
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                fontSize: '1.1rem',
              }}
            >
              UTILITY<span style={{ color: 'var(--color-primary)' }}>HUB</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Enterprise Productivity Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Middle: Command Palette Quick Search Input */}
      <Box
        onClick={() => dispatch(setCommandPaletteOpen(true))}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          px: 2,
          py: 0.8,
          cursor: 'pointer',
          width: { sm: 260, md: 360 },
          transition: 'border-color 0.15s ease',
          '&:hover': {
            borderColor: 'var(--color-primary)',
          },
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: 'var(--color-text-muted)' }} />
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', flex: 1, fontSize: '0.8125rem' }}>
          Search tools, actions & docs...
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-code-bg)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '4px',
            px: 0.75,
            py: 0.2,
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          <KeyboardCommandKeyIcon sx={{ fontSize: 12, mr: 0.2 }} /> K
        </Box>
      </Box>

      {/* Right side: Role Switcher, Theme Switcher, Audit Trail, User */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Mobile Search Button */}
        <IconButton
          size="small"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          sx={{ display: { xs: 'flex', sm: 'none' }, color: 'var(--color-text-secondary)' }}
          aria-label="Search"
        >
          <SearchIcon fontSize="small" />
        </IconButton>

        {/* RBAC Role Switcher */}
        <Tooltip title="Switch Active RBAC Role">
          <Chip
            icon={<SecurityIcon style={{ fontSize: 16 }} />}
            label={activeRole}
            size="small"
            onClick={handleOpenRoleMenu}
            clickable
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor:
                activeRole === 'ADMIN'
                  ? 'var(--color-primary-light)'
                  : 'var(--color-surface)',
              color:
                activeRole === 'ADMIN'
                  ? 'var(--color-primary)'
                  : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          />
        </Tooltip>
        <Menu
          anchorEl={roleAnchorEl}
          open={Boolean(roleAnchorEl)}
          onClose={handleCloseRoleMenu}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: '8px',
                border: '1px solid var(--color-surface-border)',
                backgroundColor: 'var(--color-surface)',
                minWidth: 180,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--color-divider)' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Simulate RBAC Role
            </Typography>
          </Box>
          {rolesList.map((role) => (
            <MenuItem
              key={role}
              selected={role === activeRole}
              onClick={() => handleSelectRole(role)}
              sx={{ fontSize: '0.85rem', fontWeight: role === activeRole ? 700 : 500 }}
            >
              {role}
            </MenuItem>
          ))}
        </Menu>

        {/* Theme Mode Selector */}
        <Tooltip title="Switch Enterprise Theme">
          <IconButton
            size="small"
            onClick={handleOpenThemeMenu}
            sx={{ color: 'var(--color-text-secondary)' }}
            aria-label="Theme selector"
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={themeAnchorEl}
          open={Boolean(themeAnchorEl)}
          onClose={handleCloseThemeMenu}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: '12px',
                border: '1px solid var(--glass-border, var(--color-surface-border))',
                backgroundColor: 'var(--glass-bg, var(--color-surface))',
                backdropFilter: 'var(--glass-blur, blur(16px))',
                WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
                boxShadow: 'var(--glass-shadow, 0 10px 40px rgba(0,0,0,0.4))',
                minWidth: 320,
                maxWidth: 380,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color Theme & Style
            </Typography>
            <Chip label="Glassmorphic" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }} />
          </Box>
          {AVAILABLE_THEMES.map((theme) => (
            <MenuItem
              key={theme.id}
              selected={theme.id === currentTheme}
              onClick={() => handleSelectTheme(theme.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.2,
                px: 2,
                transition: 'all 0.15s ease',
                '&.Mui-selected': {
                  backgroundColor: 'var(--color-surface-hover)',
                },
                '&:hover': {
                  backgroundColor: 'var(--color-surface-hover)',
                },
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: theme.secondaryAccent
                    ? `linear-gradient(135deg, ${theme.accentColor} 50%, ${theme.secondaryAccent} 50%)`
                    : theme.accentColor,
                  boxShadow: `0 0 10px ${theme.accentColor}90`,
                  border: '1px solid rgba(255,255,255,0.3)',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: theme.id === currentTheme ? 700 : 500,
                      fontSize: '0.8125rem',
                      color: theme.id === currentTheme ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    }}
                  >
                    {theme.name}
                  </Typography>
                  {theme.badge && (
                    <Chip
                      label={theme.badge}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: theme.accentColor,
                        color: theme.isDark ? '#000000' : '#ffffff',
                        px: 0.5,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.7rem',
                    display: 'block',
                    maxWidth: 220,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {theme.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Audit Log Drawer Trigger */}
        <Tooltip title="Platform Audit Trail">
          <IconButton
            size="small"
            onClick={() => dispatch(setAuditDrawerOpen(true))}
            sx={{ color: 'var(--color-text-secondary)' }}
            aria-label="Audit logs"
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* User Profile avatar */}
        <Tooltip title={`${user.name} (${user.title})`}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 1,
              borderLeft: '1px solid var(--color-divider)',
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              {user.name.split(' ').map((n) => n[0]).join('')}
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};
