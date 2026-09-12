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
import { AppButton } from '@shared/components/AppButton/AppButton';
import type { ExportType } from '../types';

interface ExportMenuProps {
  onExport: (type: ExportType) => void;
  nullColumnsCount: number;
  totalSheetsCount: number;
  hasFilter: boolean;
  filteredCount: number;
  totalCount: number;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  nullColumnsCount,
  totalSheetsCount,
  hasFilter,
  filteredCount,
  totalCount,
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
        Download Options
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
              minWidth: 360,
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
            Automatically detects & removes {nullColumnsCount} completely empty column(s)
          </Typography>
        </Box>

        <MenuItem onClick={() => handleSelect('excel-cleaned')} sx={{ py: 1.25, borderRadius: '6px' }}>
          <ListItemIcon>
            <TableViewIcon sx={{ color: '#16a34a' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned Excel (.xlsx)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Active sheet with {nullColumnsCount} null column(s) stripped</Typography>}
          />
          <Chip label="Cleaned" size="small" sx={{ bgcolor: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: 700, height: 20 }} />
        </MenuItem>

        {totalSheetsCount > 1 && (
          <MenuItem onClick={() => handleSelect('excel-workbook-cleaned')} sx={{ py: 1.25, borderRadius: '6px' }}>
            <ListItemIcon>
              <AutoFixHighIcon sx={{ color: '#2563eb' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Full Workbook (.xlsx)</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>All {totalSheetsCount} sheets with null columns removed in each</Typography>}
            />
            <Chip label="Multi-Tab" size="small" sx={{ bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, height: 20 }} />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleSelect('csv-cleaned')} sx={{ py: 1.25, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: '#0284c7' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned CSV (.csv)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Current sheet formatted as CSV without empty columns</Typography>}
          />
        </MenuItem>

        <MenuItem onClick={() => handleSelect('json-cleaned')} sx={{ py: 1.25, borderRadius: '6px' }}>
          <ListItemIcon>
            <DataObjectIcon sx={{ color: '#9333ea' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Cleaned JSON (.json)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>JSON array of records omitting all null properties</Typography>}
          />
        </MenuItem>

        {hasFilter && (
          <MenuItem onClick={() => handleSelect('filtered-cleaned')} sx={{ py: 1.25, borderRadius: '6px' }}>
            <ListItemIcon>
              <FilterAltIcon sx={{ color: '#ea580c' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Download Filtered Rows ({filteredCount.toLocaleString()} / {totalCount.toLocaleString()})</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Exports only matching search results with null columns removed</Typography>}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Section Header: Raw / As-Is */}
        <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
          Original (Raw) Downloads
        </Typography>

        <MenuItem onClick={() => handleSelect('excel-original')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <TableViewIcon sx={{ color: 'var(--color-text-secondary)' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: '0.8125rem' }}>Download Original Excel (.xlsx)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Exact sheet data with all original columns preserved</Typography>}
          />
        </MenuItem>

        <MenuItem onClick={() => handleSelect('csv-original')} sx={{ py: 1, borderRadius: '6px' }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: 'var(--color-text-secondary)' }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: '0.8125rem' }}>Download Original CSV (.csv)</Typography>}
            secondary={<Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>All original columns as CSV</Typography>}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};
