import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import type { ColumnStat } from '@shared/services/file/excelService';

interface VirtualScrollTableProps {
  rows: Record<string, unknown>[];
  columns: string[];
  columnStats?: Record<string, ColumnStat>;
  nullColumns: string[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  onSort: (col: string) => void;
  onSelectRow: (row: Record<string, unknown>, rowNumber: number) => void;
  viewMode: 'virtual' | 'paged';
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

const ROW_HEIGHT = 38;
const OVERSCAN = 15;

export const VirtualScrollTable: React.FC<VirtualScrollTableProps> = ({
  rows,
  columns,
  columnStats,
  nullColumns,
  sortColumn,
  sortDirection,
  onSort,
  onSelectRow,
  viewMode,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(550);
  const [jumpInput, setJumpInput] = useState('');

  // Update viewport size
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight || 550);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Jump to specific row
  const jumpToRowIndex = (targetIndex: number) => {
    if (!containerRef.current) return;
    const clamped = Math.max(0, Math.min(targetIndex, rows.length - 1));
    containerRef.current.scrollTop = clamped * ROW_HEIGHT;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rowNum = parseInt(jumpInput.trim(), 10);
    if (!isNaN(rowNum) && rowNum >= 1 && rowNum <= rows.length) {
      jumpToRowIndex(rowNum - 1);
    }
  };

  // Virtual calculations
  const totalRows = rows.length;
  const totalHeight = totalRows * ROW_HEIGHT;

  const { startIndex, endIndex, visibleRows } = useMemo(() => {
    if (viewMode === 'paged') {
      const start = page * rowsPerPage;
      const end = Math.min(start + rowsPerPage, totalRows);
      return {
        startIndex: start,
        endIndex: end,
        visibleRows: rows.slice(start, end),
      };
    }

    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + 2 * OVERSCAN;
    const end = Math.min(totalRows, start + visibleCount);

    return {
      startIndex: start,
      endIndex: end,
      visibleRows: rows.slice(start, end),
    };
  }, [scrollTop, viewportHeight, totalRows, rows, viewMode, page, rowsPerPage]);

  const topOffset = viewMode === 'virtual' ? startIndex * ROW_HEIGHT : 0;
  const bottomOffset = viewMode === 'virtual' ? Math.max(0, totalHeight - endIndex * ROW_HEIGHT) : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Table Navigation & Quick Controls Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Showing{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {totalRows > 0 ? (viewMode === 'virtual' ? `${startIndex + 1} - ${endIndex}` : `${page * rowsPerPage + 1} - ${Math.min((page + 1) * rowsPerPage, totalRows)}`) : 0}
            </strong>{' '}
            of <strong style={{ color: 'var(--color-primary)' }}>{totalRows.toLocaleString()}</strong> records
          </Typography>
          <Chip
            size="small"
            label={`${columns.length} Columns Visible`}
            sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: 'var(--color-background)', border: '1px solid var(--color-border)' }}
          />
        </Box>

        {viewMode === 'virtual' && totalRows > 50 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Jump to top (Row 1)">
              <IconButton size="small" onClick={() => jumpToRowIndex(0)} sx={{ color: 'var(--color-text-secondary)' }}>
                <VerticalAlignTopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Jump to bottom">
              <IconButton size="small" onClick={() => jumpToRowIndex(totalRows - 1)} sx={{ color: 'var(--color-text-secondary)' }}>
                <VerticalAlignBottomIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Jump To Row input */}
            <form onSubmit={handleJumpSubmit} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TextField
                size="small"
                placeholder="Jump to row #"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                sx={{
                  width: 120,
                  '& .MuiInputBase-root': { height: 28, fontSize: '0.75rem', borderRadius: '6px' },
                }}
              />
              <IconButton size="small" type="submit" sx={{ bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </form>
          </Box>
        )}
      </Box>

      {/* Main Table Scroll Container */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          height: 560,
          maxHeight: 'calc(100vh - 360px)',
          minHeight: 380,
          overflowY: 'auto',
          overflowX: 'auto',
          position: 'relative',
          userSelect: 'text',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--color-border)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--color-text-muted)',
          },
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: 'max-content',
            minWidth: '100%',
            tableLayout: 'fixed',
          }}
        >
          {/* Sticky Header */}
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'var(--color-surface-hover)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            }}
          >
            <tr>
              {/* Row Index Column Header */}
              <th
                style={{
                  width: 70,
                  minWidth: 70,
                  padding: '10px 12px',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  borderBottom: '2px solid var(--color-border)',
                  borderRight: '1px solid var(--color-border)',
                  position: 'sticky',
                  left: 0,
                  zIndex: 12,
                  backgroundColor: 'var(--color-surface-hover)',
                }}
              >
                #
              </th>

              {/* Dynamic Column Headers */}
              {columns.map((col) => {
                const stat = columnStats?.[col];
                const isNullCol = nullColumns.includes(col);
                const isCurrentSort = sortColumn === col;

                return (
                  <th
                    key={col}
                    onClick={() => onSort(col)}
                    style={{
                      minWidth: 160,
                      maxWidth: 320,
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isCurrentSort ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      borderBottom: '2px solid var(--color-border)',
                      borderRight: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      backgroundColor: isNullCol ? 'rgba(239, 68, 68, 0.05)' : undefined,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}>
                        <span title={col} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {col}
                        </span>
                        {isNullCol && (
                          <Tooltip title="All values in this column are empty/null. Can be removed on download.">
                            <Chip
                              label="100% Empty"
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>

                      <TableSortLabel
                        active={isCurrentSort}
                        direction={sortDirection || 'asc'}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            color: 'var(--color-primary) !important',
                          },
                        }}
                      />
                    </Box>

                    {/* Fill rate mini indicator */}
                    {stat && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {stat.inferredType} • {stat.fillPercentage}% filled
                        </Typography>
                      </Box>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body with Top & Bottom Virtual Spacers */}
          <tbody>
            {viewMode === 'virtual' && topOffset > 0 && (
              <tr style={{ height: topOffset }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}

            {visibleRows.map((row, idx) => {
              const actualRowIndex = startIndex + idx;
              const isEven = actualRowIndex % 2 === 0;

              return (
                <tr
                  key={actualRowIndex}
                  onClick={() => onSelectRow(row, actualRowIndex + 1)}
                  style={{
                    height: ROW_HEIGHT,
                    backgroundColor: isEven ? 'var(--color-surface)' : 'var(--color-background)',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = isEven ? 'var(--color-surface)' : 'var(--color-background)')
                  }
                >
                  {/* Sticky Row Index */}
                  <td
                    style={{
                      width: 70,
                      minWidth: 70,
                      padding: '6px 12px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      borderRight: '1px solid var(--color-border)',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      backgroundColor: isEven ? 'var(--color-surface)' : 'var(--color-background)',
                    }}
                  >
                    {actualRowIndex + 1}
                  </td>

                  {/* Cell Data */}
                  {columns.map((col) => {
                    const rawVal = row[col];
                    const isEmpty = rawVal === null || rawVal === undefined || rawVal === '';
                    const displayStr = isEmpty ? '' : String(rawVal);

                    return (
                      <td
                        key={col}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8125rem',
                          color: isEmpty ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          borderRight: '1px solid var(--color-border-subtle)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 320,
                        }}
                        title={displayStr}
                      >
                        {isEmpty ? (
                          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                            (null)
                          </span>
                        ) : (
                          displayStr
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {viewMode === 'virtual' && bottomOffset > 0 && (
              <tr style={{ height: bottomOffset }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      {/* Pagination Bar for Paged Mode */}
      {viewMode === 'paged' && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[25, 50, 100, 250, 500, 1000]}
          sx={{ borderTop: '1px solid var(--color-border)' }}
        />
      )}
    </Box>
  );
};
