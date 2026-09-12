import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@app/store';
import { toggleSidebar, setMobileNavOpen } from '@app/store/slices/uiSlice';
import { useNavigation } from '@registry/hooks/useNavigation';
import { AppIcon } from '@shared/components/AppIcon/AppIcon';

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ collapsed, onNavigate }) => {
  const location = useLocation();
  const { categoriesWithFeatures, favorites } = useNavigation();
  const [filterText, setFilterText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    dashboard: true,
    excel: true,
    sql: true,
    text: true,
    pricing: true,
    api: true,
    admin: true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const filteredCategories = categoriesWithFeatures.map((group) => {
    if (!filterText.trim()) return group;
    const q = filterText.toLowerCase();
    const matched = group.features.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    );
    return {
      ...group,
      features: matched,
    };
  }).filter((group) => group.features.length > 0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-sidebar-bg)',
        color: 'var(--color-sidebar-text)',
        overflowY: 'auto',
        overflowX: 'hidden',
        userSelect: 'none',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--color-sidebar-hover-bg)' },
      }}
    >
      {/* Search Input within Sidebar */}
      {!collapsed && (
        <Box sx={{ p: 1.5, pb: 1, borderBottom: '1px solid var(--color-sidebar-border)' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-sidebar-hover-bg)',
              borderRadius: '6px',
              px: 1,
              py: 0.5,
              border: '1px solid transparent',
              '&:focus-within': { borderColor: 'var(--color-primary)' },
            }}
          >
            <SearchIcon sx={{ fontSize: 16, color: 'var(--color-sidebar-text)', mr: 1 }} />
            <InputBase
              placeholder="Filter tools..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{
                color: 'var(--color-sidebar-text-bright)',
                fontSize: '0.8125rem',
                width: '100%',
                '& input': { padding: 0 },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && !filterText && (
        <Box sx={{ px: collapsed ? 1 : 1.5, py: 1, borderBottom: '1px solid var(--color-sidebar-border)' }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5 }}>
              <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-sidebar-text)',
                }}
              >
                Pinned Favorites
              </Typography>
            </Box>
          )}

          {favorites.map((feat) => {
            const isActive = location.pathname === feat.route;
            const item = (
              <NavLink
                key={`fav-${feat.id}`}
                to={feat.route}
                onClick={onNavigate}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: collapsed ? 1.5 : 1.25,
                    py: 0.75,
                    my: 0.25,
                    borderRadius: '6px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                    color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text-bright)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'var(--color-sidebar-active-bg)'
                        : 'var(--color-sidebar-hover-bg)',
                    },
                  }}
                >
                  <AppIcon name={feat.iconName} fontSize="small" />
                  {!collapsed && (
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }} noWrap>
                      {feat.shortName || feat.name}
                    </Typography>
                  )}
                </Box>
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={`fav-tip-${feat.id}`} title={feat.name} placement="right">
                  {item}
                </Tooltip>
              );
            }
            return item;
          })}
        </Box>
      )}

      {/* Main Categories Navigation */}
      <Box sx={{ flex: 1, px: collapsed ? 1 : 1.5, py: 1 }}>
        {filteredCategories.map(({ category, features }) => {
          const isExpanded = expandedCategories[category.id] ?? true;

          if (collapsed) {
            return (
              <Box key={category.id} sx={{ mb: 1.5 }}>
                {features.map((feat) => {
                  const isActive = location.pathname === feat.route;
                  return (
                    <Tooltip key={feat.id} title={`${category.title} > ${feat.name}`} placement="right">
                      <NavLink to={feat.route} onClick={onNavigate} style={{ textDecoration: 'none' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 44,
                            height: 40,
                            my: 0.5,
                            mx: 'auto',
                            borderRadius: '6px',
                            backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                            color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
                            '&:hover': {
                              backgroundColor: isActive
                                ? 'var(--color-sidebar-active-bg)'
                                : 'var(--color-sidebar-hover-bg)',
                              color: 'var(--color-sidebar-text-bright)',
                            },
                          }}
                        >
                          <AppIcon name={feat.iconName} fontSize="small" />
                        </Box>
                      </NavLink>
                    </Tooltip>
                  );
                })}
              </Box>
            );
          }

          return (
            <Box key={category.id} sx={{ mb: 1 }}>
              {/* Category Header (Accordion trigger) */}
              <Box
                onClick={() => toggleCategory(category.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 0.75,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  color: 'var(--color-sidebar-text)',
                  '&:hover': {
                    backgroundColor: 'var(--color-sidebar-hover-bg)',
                    color: 'var(--color-sidebar-text-bright)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <AppIcon name={category.iconName} fontSize="small" />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {category.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={features.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-sidebar-hover-bg)',
                      color: 'var(--color-sidebar-text)',
                    }}
                  />
                  {isExpanded ? (
                    <ExpandLessIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 16 }} />
                  )}
                </Box>
              </Box>

              {/* Child Tool Items */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 1, pt: 0.25 }}>
                  {features.map((feat) => {
                    const isActive = location.pathname === feat.route;
                    return (
                      <NavLink
                        key={feat.id}
                        to={feat.route}
                        onClick={onNavigate}
                        style={{ textDecoration: 'none' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.25,
                            py: 0.7,
                            my: 0.2,
                            borderRadius: '6px',
                            backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                            color: isActive
                              ? 'var(--color-sidebar-active-text)'
                              : 'var(--color-sidebar-text)',
                            transition: 'all 0.12s ease',
                            '&:hover': {
                              backgroundColor: isActive
                                ? 'var(--color-sidebar-active-bg)'
                                : 'var(--color-sidebar-hover-bg)',
                              color: 'var(--color-sidebar-text-bright)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                            <AppIcon name={feat.iconName} fontSize="small" />
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8125rem',
                                fontWeight: isActive ? 600 : 400,
                              }}
                              noWrap
                            >
                              {feat.name}
                            </Typography>
                          </Box>

                          {feat.badge && (
                            <Chip
                              label={feat.badge.text}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                px: 0.25,
                                backgroundColor:
                                  feat.badge.variant === 'new'
                                    ? 'var(--color-success)'
                                    : 'var(--color-warning)',
                                color: '#ffffff',
                              }}
                            />
                          )}
                        </Box>
                      </NavLink>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const mobileNavOpen = useAppSelector((state) => state.ui.mobileNavOpen);

  return (
    <>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileNavOpen}
        onClose={() => dispatch(setMobileNavOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            borderRight: '1px solid var(--color-sidebar-border)',
            backgroundColor: 'var(--color-sidebar-bg)',
          },
        }}
      >
        <SidebarContent collapsed={false} onNavigate={() => dispatch(setMobileNavOpen(false))} />
      </Drawer>

      {/* Desktop Persistent Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: collapsed ? 'var(--sidebar-width-collapsed, 72px)' : 'var(--sidebar-width-expanded, 280px)',
          minWidth: collapsed ? 'var(--sidebar-width-collapsed, 72px)' : 'var(--sidebar-width-expanded, 280px)',
          height: 'calc(100vh - var(--header-height, 64px))',
          position: 'sticky',
          top: 'var(--header-height, 64px)',
          borderRight: '1px solid var(--color-sidebar-border)',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 90,
        }}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse Toggle Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            p: 1,
            borderTop: '1px solid var(--color-sidebar-border)',
            backgroundColor: 'var(--color-sidebar-bg)',
          }}
        >
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              size="small"
              onClick={() => dispatch(toggleSidebar())}
              sx={{ color: 'var(--color-sidebar-text)' }}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};
