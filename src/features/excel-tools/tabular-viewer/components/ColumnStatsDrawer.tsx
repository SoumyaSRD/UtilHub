import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { ColumnStat } from '@shared/services/file/excelService';
import { AppButton } from '@shared/components/AppButton/AppButton';

interface ColumnStatsDrawerProps {
  open: boolean;
  onClose: () => void;
  columns: string[];
  columnStats?: Record<string, ColumnStat>;
  nullColumns: string[];
  hiddenColumns: Set<string>;
  hideNullColumns: boolean;
  treatTextNulls?: boolean;
  onToggleColumnVisibility: (columnName: string) => void;
  onToggleHideNullColumns: (hide: boolean) => void;
  onToggleTreatTextNulls?: (treat: boolean) => void;
  onShowAllColumns: () => void;
}

export const ColumnStatsDrawer: React.FC<ColumnStatsDrawerProps> = ({
  open,
  onClose,
  columns,
  columnStats,
  nullColumns,
  hiddenColumns,
  hideNullColumns,
  treatTextNulls = true,
  onToggleColumnVisibility,
  onToggleHideNullColumns,
  onToggleTreatTextNulls,
  onShowAllColumns,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 440 },
          p: 3,
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid var(--color-border)' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Column Schema & Stats
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
            {columns.length} columns total • {nullColumns.length} empty column(s) detected
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close drawer">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Global Null Column Quick Toggle Banner */}
      <Box
        sx={{
          p: 2,
          borderRadius: '8px',
          backgroundColor: nullColumns.length > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-surface-hover)',
          border: '1px solid',
          borderColor: nullColumns.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Null Column Remover
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
              {nullColumns.length > 0
                ? `Hide all ${nullColumns.length} columns with 100% empty/null cells`
                : 'No completely empty columns found'}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={hideNullColumns}
                onChange={(e) => onToggleHideNullColumns(e.target.checked)}
                disabled={nullColumns.length === 0}
                color="error"
              />
            }
            label=""
          />
        </Box>

        {onToggleTreatTextNulls && (
          <Box sx={{ pt: 1, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
                CSV Null Representations
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', display: 'block' }}>
                Treat "NA", "NULL", "None", and "-" as empty
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={treatTextNulls}
              onChange={(e) => onToggleTreatTextNulls(e.target.checked)}
            />
          </Box>
        )}
      </Box>

      {/* Search columns & reset actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Filter columns..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'var(--color-text-muted)', mr: 1 }} />,
            },
          }}
        />
        <AppButton variant="outlined" size="small" onClick={onShowAllColumns}>
          Reset
        </AppButton>
      </Box>

      {/* Columns List */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, pr: 0.5 }}>
        {filteredColumns.map((col) => {
          const stat = columnStats?.[col];
          const isNullCol = nullColumns.includes(col);
          const isHidden = hiddenColumns.has(col) || (hideNullColumns && isNullCol);

          return (
            <Box
              key={col}
              sx={{
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: isHidden ? 'var(--color-background)' : 'var(--color-surface)',
                opacity: isHidden ? 0.75 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isHidden ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={col}
                  >
                    {col}
                  </Typography>

                  {isNullCol && (
                    <Chip
                      label="100% Null"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                      }}
                    />
                  )}
                </Box>

                <Tooltip title={isHidden ? 'Show column' : 'Hide column'}>
                  <IconButton size="small" onClick={() => onToggleColumnVisibility(col)}>
                    {isHidden ? (
                      <VisibilityOffIcon fontSize="small" sx={{ color: 'var(--color-text-muted)' }} />
                    ) : (
                      <VisibilityIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              {stat && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      Type: <strong>{stat.inferredType}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {stat.fillPercentage}% filled ({stat.filledCount.toLocaleString()} / {stat.totalCount.toLocaleString()})
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={stat.fillPercentage}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: 'var(--color-border)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stat.isNullColumn ? '#ef4444' : stat.fillPercentage > 80 ? 'var(--color-success)' : 'var(--color-primary)',
                      },
                    }}
                  />

                  {stat.sampleValues.length > 0 && (
                    <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }} noWrap>
                      Samples: {stat.sampleValues.slice(0, 3).join(', ')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
};
