import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TableViewIcon from '@mui/icons-material/TableView';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TableChartIcon from '@mui/icons-material/TableChart';
import { AppButton } from '@shared/components/AppButton/AppButton';
import type { ExportType } from '../types';

interface ExportMenuProps {
  onExport: (type: ExportType) => void;
  nullColumnsCount: number;
  totalSheetsCount: number;
  hasFilter: boolean;
  filteredCount: number;
  totalCount: number;
  isCsv?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  nullColumnsCount,
  totalSheetsCount,
  hasFilter,
  filteredCount,
  totalCount,
  isCsv = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (type: ExportType) => {
    handleClose();
    onExport(type);
  };

  return (
    <Box>
      <AppButton
        variant="contained"
        startIcon={<FileDownloadIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        sx={{
          fontWeight: 600,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        }}
      >
        Download {isCsv ? 'CSV / Excel' : 'Options'}
      </AppButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 380,
              maxHeight: 520,
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              p: 0.5,
            },
          },
        }}
      >
        {/* Section Header: Cleaned / Null Column Remover */}
        <Box sx={{ px: 2, py: 1, backgroundColor: 'var(--color-surface-hover)', borderRadius: '6px', m: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Null Column Remover Downloads
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block', mt: 0.25 }}>
            Strips all {nullColumnsCount} empty/null column(s) across rows
          </Typography>
        </Box>

        {/* CSV Cleaned Downloads */}
        <MenuItem onClick={() => handleSelect('csv-cleaned')} sx={{ py: 1.2, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: '#0284c7' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned CSV (,)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Standard comma-separated CSV with null columns removed</Typography>}
          />
          <Chip label="CSV" size="small" sx={{ bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, height: 20 }} />
        </MenuItem>

        <MenuItem onClick={() => handleSelect('csv-cleaned-semicolon')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: '#0369a1' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned CSV (;)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>European standard semicolon-separated CSV</Typography>}
          />
        </MenuItem>

        <MenuItem onClick={() => handleSelect('csv-cleaned-tab')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: '#075985' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned TSV (\t)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Tab-delimited spreadsheet format</Typography>}
          />
        </MenuItem>

        {totalSheetsCount > 1 && (
          <MenuItem onClick={() => handleSelect('csv-all-tabs-cleaned')} sx={{ py: 1.2, borderRadius: '6px' }}>
            <ListItemIcon>
              <TableChartIcon sx={{ color: '#2563eb' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download All Tabs as Cleaned CSVs</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Exports each of the {totalSheetsCount} tabs as separate cleaned CSVs</Typography>}
            />
            <Chip label="All Tabs" size="small" sx={{ bgcolor: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: 700, height: 20 }} />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Excel Cleaned Downloads */}
        <MenuItem onClick={() => handleSelect('excel-cleaned')} sx={{ py: 1.2, borderRadius: '6px' }}>
          <ListItemIcon>
            <TableViewIcon sx={{ color: '#16a34a' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned Excel (.xlsx)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Active tab converted to Excel with null columns stripped</Typography>}
          />
          <Chip label="XLSX" size="small" sx={{ bgcolor: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: 700, height: 20 }} />
        </MenuItem>

        {totalSheetsCount > 1 && (
          <MenuItem onClick={() => handleSelect('excel-workbook-cleaned')} sx={{ py: 1.2, borderRadius: '6px' }}>
            <ListItemIcon>
              <AutoFixHighIcon sx={{ color: '#2563eb' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Full Workbook (.xlsx)</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>All {totalSheetsCount} tabs combined into multi-sheet Excel</Typography>}
            />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleSelect('json-cleaned')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <DataObjectIcon sx={{ color: '#9333ea' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned JSON (.json)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>JSON array of objects omitting all null properties</Typography>}
          />
        </MenuItem>

        {hasFilter && (
          <MenuItem onClick={() => handleSelect('csv-filtered-cleaned')} sx={{ py: 1.2, borderRadius: '6px' }}>
            <ListItemIcon>
              <FilterAltIcon sx={{ color: '#ea580c' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Filtered Rows as CSV ({filteredCount.toLocaleString()} / {totalCount.toLocaleString()})</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Exports matching search rows as CSV without empty columns</Typography>}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Section Header: Raw / As-Is */}
        <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
          Original (Raw) Downloads
        </Typography>

        <MenuItem onClick={() => handleSelect('csv-original')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: 'var(--color-text-secondary)' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: '0.8125rem' }}>Download Original CSV (.csv)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>All original columns as CSV</Typography>}
          />
        </MenuItem>

        <MenuItem onClick={() => handleSelect('excel-original')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <TableViewIcon sx={{ color: 'var(--color-text-secondary)' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: '0.8125rem' }}>Download Original Excel (.xlsx)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Exact sheet data with all original columns</Typography>}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};
