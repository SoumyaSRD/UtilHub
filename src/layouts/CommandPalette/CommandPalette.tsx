import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useAppDispatch, useAppSelector } from '@app/store';
import { setCommandPaletteOpen } from '@app/store/slices/uiSlice';
import { useNavigation } from '@registry/hooks/useNavigation';
import { AppIcon } from '@shared/components/AppIcon/AppIcon';
import { CATEGORIES } from '@registry/categories';

export const CommandPalette: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((state) => state.ui.commandPaletteOpen);
  const { availableFeatures, favoriteIds } = useNavigation();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Global keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(!open));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, open]);

  // Reset search when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter features
  const filteredFeatures = React.useMemo(() => {
    if (!query.trim()) {
      return availableFeatures.slice(0, 12);
    }
    const q = query.toLowerCase().trim();
    return availableFeatures.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
    );
  }, [availableFeatures, query]);

  // Handle arrow navigation and enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredFeatures.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredFeatures.length) % Math.max(1, filteredFeatures.length));
    } else if (e.key === 'Enter' && filteredFeatures[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredFeatures[selectedIndex].route);
    }
  };

  const handleSelect = (route: string) => {
    dispatch(setCommandPaletteOpen(false));
    navigate(route);
  };

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCommandPaletteOpen(false))}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-surface-border)',
            overflow: 'hidden',
            top: '-15%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          },
        },
      }}
    >
      {/* Search Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid var(--color-divider)',
          gap: 1.5,
        }}
      >
        <SearchIcon sx={{ color: 'var(--color-text-muted)', fontSize: 22 }} />
        <InputBase
          autoFocus
          placeholder="Type a command, tool name or keyword..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          sx={{
            flex: 1,
            color: 'var(--color-text-primary)',
            fontSize: '1rem',
          }}
        />
        <Chip
          label="ESC"
          size="small"
          onClick={() => dispatch(setCommandPaletteOpen(false))}
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            backgroundColor: 'var(--color-code-bg)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        />
      </Box>

      {/* Results List */}
      <List
        ref={listRef}
        sx={{
          maxHeight: 380,
          overflowY: 'auto',
          py: 1,
          px: 1,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--color-border)' },
        }}
      >
        {filteredFeatures.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              No tools or actions found matching "{query}"
            </Typography>
          </Box>
        ) : (
          filteredFeatures.map((feat, index) => {
            const isSelected = index === selectedIndex;
            const category = CATEGORIES[feat.category];
            const isFav = favoriteIds.includes(feat.id);

            return (
              <ListItemButton
                key={feat.id}
                selected={isSelected}
                onClick={() => handleSelect(feat.route)}
                onMouseEnter={() => setSelectedIndex(index)}
                sx={{
                  borderRadius: '8px',
                  my: 0.25,
                  py: 1,
                  px: 1.5,
                  backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--color-surface-hover)',
                    '&:hover': { backgroundColor: 'var(--color-surface-hover)' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  <AppIcon name={feat.iconName} fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {feat.name}
                      </Typography>
                      {category && (
                        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                          in {category.title}
                        </Typography>
                      )}
                      {isFav && <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }} noWrap>
                      {feat.description}
                    </Typography>
                  }
                />
                {isSelected && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-text-muted)' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Select</Typography>
                    <KeyboardReturnIcon sx={{ fontSize: 14 }} />
                  </Box>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>

      {/* Footer Instructions */}
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <span><kbd style={{ padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: 3 }}>↑</kbd> <kbd style={{ padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: 3 }}>↓</kbd> to navigate</span>
          <span><kbd style={{ padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: 3 }}>↵</kbd> to select</span>
        </Box>
        <span>{filteredFeatures.length} utilities available</span>
      </Box>
    </Dialog>
  );
};
