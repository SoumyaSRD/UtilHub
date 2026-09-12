import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import DescriptionIcon from '@mui/icons-material/Description';
import type { SheetDetail } from '@shared/services/file/excelService';

interface SheetTabsProps {
  sheetNames: string[];
  activeSheetName: string;
  sheets: Record<string, SheetDetail>;
  onSheetChange: (sheetName: string) => void;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheetNames,
  activeSheetName,
  sheets,
  onSheetChange,
}) => {
  if (!sheetNames || sheetNames.length === 0) return null;

  const activeIndex = Math.max(0, sheetNames.indexOf(activeSheetName));

  return (
    <Box
      sx={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        px: 2,
        pt: 1,
        borderRadius: '10px 10px 0 0',
      }}
    >
      <Tabs
        value={activeIndex}
        onChange={(_, newIdx) => onSheetChange(sheetNames[newIdx])}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: 'var(--color-primary)',
          },
        }}
      >
        {sheetNames.map((name) => {
          const detail = sheets[name];
          const rowCount = detail?.totalRowCount ?? 0;
          const nullColCount = detail?.nullColumns?.length ?? 0;
          const isActive = name === activeSheetName;

          return (
            <Tab
              key={name}
              icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '0.875rem' }}>{name}</span>
                  <Chip
                    label={`${rowCount.toLocaleString()} rows`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  />
                  {nullColCount > 0 && (
                    <Chip
                      label={`${nullColCount} null col${nullColCount > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    />
                  )}
                </Box>
              }
              sx={{
                textTransform: 'none',
                minHeight: 48,
                py: 1,
                px: 2,
                color: 'var(--color-text-secondary)',
                '&.Mui-selected': {
                  color: 'var(--color-primary)',
                },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};
