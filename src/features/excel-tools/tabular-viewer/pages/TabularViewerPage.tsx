import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import DatasetIcon from '@mui/icons-material/Dataset';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SpeedIcon from '@mui/icons-material/Speed';
import LayersIcon from '@mui/icons-material/Layers';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppFileUpload } from '@shared/components/AppFileUpload/AppFileUpload';
import { AppEmptyState } from '@shared/components/AppEmptyState/AppEmptyState';
import { useTabularViewer } from '../hooks/useTabularViewer';
import { VirtualScrollTable } from '../components/VirtualScrollTable';
import { SheetTabs } from '../components/SheetTabs';
import { ExportMenu } from '../components/ExportMenu';
import { ColumnStatsDrawer } from '../components/ColumnStatsDrawer';
import { RowDetailModal } from '../components/RowDetailModal';

export const TabularViewerPage: React.FC = () => {
  const {
    file,
    fileName,
    sheetNames,
    activeSheetName,
    sheets,
    currentSheet,
    isProcessing,
    progressPercent,

    // Search & Sort
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    handleSort,

    // Columns & Null remover
    nullColumns,
    visibleColumns,
    hideNullColumns,
    setHideNullColumns,
    hiddenColumns,
    toggleColumnVisibility,
    showAllColumns,

    // Rows
    processedRows,
    selectedRow,
    setSelectedRow,
    selectedRowNumber,
    setSelectedRowNumber,

    // View & Pagination
    viewMode,
    setViewMode,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    isStatsOpen,
    setIsStatsOpen,

    // Actions
    handleFileSelect,
    handleSheetChange,
    loadLargeDemoDataset,
    exportData,
    resetAll,
  } = useTabularViewer();

  const totalRowCount = currentSheet?.totalRowCount ?? 0;
  const filteredRowCount = processedRows.length;
  const hasFilter = searchQuery.trim().length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Page Header */}
      <AppPageHeader
        toolId="excel.tabular-viewer"
        title="Excel Tabular Viewer & Multi-Sheet Studio"
        description="High-performance dynamic spreadsheet viewer with 100,000+ record virtual scrolling, dynamic sheet tabs, intelligent null-column remover, and multi-format exports."
        iconName="TableChart"
        badge={{ text: '100k+ Ready', variant: 'new' }}
        actions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              startIcon={<DatasetIcon />}
              onClick={() => loadLargeDemoDataset(100000)}
              tooltip="Generate and load a high-performance 100,000-row multi-sheet workbook with empty columns"
            >
              Load 100k Multi-Tab Demo
            </AppButton>
            {currentSheet && (
              <AppButton variant="text" startIcon={<RestartAltIcon />} onClick={resetAll} color="inherit">
                Reset
              </AppButton>
            )}
          </Box>
        }
      />

      {/* Upload Box (Collapsed into a slim bar if file is loaded) */}
      {!currentSheet ? (
        <AppCard
          title="Upload Spreadsheet"
          subtitle="Upload any Excel (.xlsx, .xls) or CSV (.csv) workbook. Multi-sheet workbooks and 100,000+ records supported."
        >
          <AppFileUpload
            selectedFile={file}
            onFileSelect={handleFileSelect}
            onClear={resetAll}
            isLoading={isProcessing}
            progressPercent={progressPercent}
            helperText="Supports multi-tab Excel workbooks and large datasets up to 1GB with virtualized 60fps rendering"
          />
        </AppCard>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {fileName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                {sheetNames.length} Sheet{sheetNames.length > 1 ? 's' : ''} • {totalRowCount.toLocaleString()} Rows in current tab
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={resetAll}
            >
              Upload Different File
            </AppButton>
          </Box>
        </Box>
      )}

      {/* When Spreadsheet Loaded */}
      {currentSheet && (
        <>
          {/* Metrics Quick Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            <AppCard noPadding>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <TableRowsIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Active Sheet Rows
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {totalRowCount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </AppCard>

            <AppCard noPadding>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }}>
                  <ViewColumnIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Visible Columns
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {visibleColumns.length} / {currentSheet.columns.length}
                  </Typography>
                </Box>
              </Box>
            </AppCard>

            <AppCard noPadding>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: nullColumns.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-success-bg)',
                    color: nullColumns.length > 0 ? '#ef4444' : 'var(--color-success)',
                  }}
                >
                  <AutoFixHighIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Empty / Null Columns
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: nullColumns.length > 0 ? '#ef4444' : 'var(--color-success)',
                    }}
                  >
                    {nullColumns.length} Detected
                  </Typography>
                </Box>
              </Box>
            </AppCard>

            <AppCard noPadding>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <SpeedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Rendering Engine
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1rem' }}>
                    {viewMode === 'virtual' ? 'Virtual Scroller (60fps)' : 'Paged Mode'}
                  </Typography>
                </Box>
              </Box>
            </AppCard>
          </Box>

          {/* Null Column Remover Alert & Action Bar */}
          {nullColumns.length > 0 && (
            <Alert
              severity="warning"
              icon={<AutoFixHighIcon />}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={hideNullColumns}
                        onChange={(e) => setHideNullColumns(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Hide Null Columns
                      </Typography>
                    }
                  />
                  <AppButton
                    size="small"
                    variant="contained"
                    onClick={() => exportData('excel-cleaned')}
                    sx={{ fontWeight: 600 }}
                  >
                    Download Cleaned Sheet
                  </AppButton>
                </Box>
              }
              sx={{
                borderRadius: '10px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                alignItems: 'center',
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Null Column Remover Detected {nullColumns.length} Empty Column{nullColumns.length > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: 'inherit', display: 'block', mt: 0.25 }}>
                Columns <strong>{nullColumns.join(', ')}</strong> contain 100% empty or null values across all {totalRowCount.toLocaleString()} rows. You can hide them in the grid or download a cleaned version with these columns automatically removed.
              </Typography>
            </Alert>
          )}

          {/* Toolbar & Interactive Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              p: 2,
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            {/* Global Search */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260, maxWidth: 420 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search all columns & rows..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'var(--color-text-muted)', mr: 1 }} />,
                  },
                }}
              />
              {hasFilter && (
                <Chip
                  label={`${filteredRowCount.toLocaleString()} matched`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                />
              )}
            </Box>

            {/* Quick Action Toggles & Export */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, next) => {
                  if (next) setViewMode(next);
                }}
                aria-label="View mode"
              >
                <ToggleButton value="virtual" aria-label="Virtual scroll">
                  <SpeedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Virtual (100k+)
                </ToggleButton>
                <ToggleButton value="paged" aria-label="Paged mode">
                  Paged
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Column Stats Drawer Button */}
              <AppButton
                variant="outlined"
                size="small"
                startIcon={<ViewColumnIcon />}
                onClick={() => setIsStatsOpen(true)}
              >
                Columns ({visibleColumns.length})
              </AppButton>

              {/* Multi-Format Export Dropdown */}
              <ExportMenu
                onExport={exportData}
                nullColumnsCount={nullColumns.length}
                totalSheetsCount={sheetNames.length}
                hasFilter={hasFilter}
                filteredCount={filteredRowCount}
                totalCount={totalRowCount}
              />
            </Box>
          </Box>

          {/* Dynamic Sheet Tabs according to Excel Workbook */}
          <Box sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <SheetTabs
              sheetNames={sheetNames}
              activeSheetName={activeSheetName}
              sheets={sheets}
              onSheetChange={handleSheetChange}
            />

            {/* Virtualized Table for 100,000+ Records */}
            <Box sx={{ p: 1.5, backgroundColor: 'var(--color-background)' }}>
              <VirtualScrollTable
                rows={processedRows}
                columns={visibleColumns}
                columnStats={currentSheet.columnStats}
                nullColumns={nullColumns}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectRow={(row, rowNum) => {
                  setSelectedRow(row);
                  setSelectedRowNumber(rowNum);
                }}
                viewMode={viewMode}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            </Box>
          </Box>
        </>
      )}

      {/* Empty State */}
      {!currentSheet && (
        <AppEmptyState
          title="No Spreadsheet Loaded"
          description="Upload an Excel workbook (.xlsx, .xls) or CSV file with single or multiple sheets. Easily inspect 100,000+ rows smoothly with our virtual scroll table and intelligent null column remover."
          action={
            <AppButton
              variant="contained"
              onClick={() => loadLargeDemoDataset(100000)}
              startIcon={<DatasetIcon />}
            >
              Test with 100k Multi-Tab Demo Dataset
            </AppButton>
          }
        />
      )}

      {/* Column Schema & Statistics Drawer */}
      {currentSheet && (
        <ColumnStatsDrawer
          open={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          columns={currentSheet.columns}
          columnStats={currentSheet.columnStats}
          nullColumns={nullColumns}
          hiddenColumns={hiddenColumns}
          hideNullColumns={hideNullColumns}
          onToggleColumnVisibility={toggleColumnVisibility}
          onToggleHideNullColumns={setHideNullColumns}
          onShowAllColumns={showAllColumns}
        />
      )}

      {/* Record Inspector Modal */}
      <RowDetailModal
        open={Boolean(selectedRow)}
        onClose={() => {
          setSelectedRow(null);
          setSelectedRowNumber(null);
        }}
        row={selectedRow}
        rowNumber={selectedRowNumber}
        sheetName={activeSheetName}
      />
    </Box>
  );
};

export default TabularViewerPage;
