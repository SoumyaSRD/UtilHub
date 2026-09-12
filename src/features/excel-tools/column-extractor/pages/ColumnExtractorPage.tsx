import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DatasetIcon from '@mui/icons-material/Dataset';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CodeIcon from '@mui/icons-material/Code';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppFileUpload } from '@shared/components/AppFileUpload/AppFileUpload';
import { AppEmptyState } from '@shared/components/AppEmptyState/AppEmptyState';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { useColumnExtractor, type CommaFormatType, type CommaQuoteStyle, type CommaWrapBrackets } from '../hooks/useColumnExtractor';

export const ColumnExtractorPage: React.FC = () => {
  const {
    file,
    isProcessing,
    parsedData,
    activeTab,
    setActiveTab,

    // Comma-separated state
    targetColumn,
    setTargetColumn,
    formatType,
    setFormatType,
    quoteStyle,
    setQuoteStyle,
    delimiter,
    setDelimiter,
    deduplicate,
    setDeduplicate,
    ignoreBlank,
    setIgnoreBlank,
    trimValues,
    setTrimValues,
    wrapBrackets,
    setWrapBrackets,
    commaResult,
    commaStats,
    extractCommaSeparated,
    downloadCommaText,

    // Table extraction state
    selectedColumns,
    extractedRows,
    searchColumnQuery,
    setSearchColumnQuery,
    handleFileSelect,
    loadSampleData,
    toggleColumn,
    selectAllColumns,
    deselectAllColumns,
    extractTable,
    reset,
    exportExcel,
    exportCsv,
  } = useColumnExtractor();

  const filteredColumns = parsedData
    ? parsedData.columns.filter((col) =>
        col.toLowerCase().includes(searchColumnQuery.toLowerCase())
      )
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tool Header */}
      <AppPageHeader
        toolId="excel.column-extractor"
        title="Column Extractor"
        description="Extract comma-separated strings or numbers from any Excel column, or isolate multiple columns into a filtered spreadsheet."
        iconName="ViewColumn"
        badge={{ text: 'Enhanced', variant: 'new' }}
        actions={
          <AppButton
            variant="outlined"
            startIcon={<DatasetIcon />}
            onClick={loadSampleData}
            tooltip="Load a demonstration dataset with accounts, customer IDs, and numbers"
          >
            Load Sample Dataset
          </AppButton>
        }
      />

      {/* Step 1: Upload / Input Section */}
      <AppCard
        title="1. Source Spreadsheet"
        subtitle="Upload an Excel (.xlsx, .xls) or CSV file to detect column headers"
      >
        <AppFileUpload
          selectedFile={file}
          onFileSelect={handleFileSelect}
          onClear={reset}
          isLoading={isProcessing}
        />
      </AppCard>

      {/* Step 2: Extraction Configuration */}
      {parsedData && (
        <AppCard noPadding>
          <Box sx={{ borderBottom: 1, borderColor: 'var(--color-divider)', px: 2.5, pt: 1 }}>
            <Tabs value={activeTab} onChange={(_, idx) => setActiveTab(idx)}>
              <Tab
                icon={<FormatQuoteIcon fontSize="small" />}
                iconPosition="start"
                label="Comma-Separated Extractor (Strings & Numbers)"
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              />
              <Tab
                icon={<ViewColumnIcon fontSize="small" />}
                iconPosition="start"
                label="Sub-Table Extractor (Multi-Column Grid)"
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              />
            </Tabs>
          </Box>

          {/* TAB 0: Comma-Separated Values (Strings / Numbers) */}
          {activeTab === 0 && (
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                Extract values from a single Excel column into a formatted list of comma-separated strings or pure numbers (ideal for SQL IN clauses, API filters, arrays, or clipboard pasting).
              </Typography>

              <Grid container spacing={2.5}>
                {/* Target Column Selector */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Target Column to Extract</InputLabel>
                    <Select
                      value={targetColumn}
                      label="Target Column to Extract"
                      onChange={(e) => setTargetColumn(e.target.value)}
                    >
                      {parsedData.columns.map((col) => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Output Data Type (Strings / Numbers / Raw) */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Output Value Type</InputLabel>
                    <Select
                      value={formatType}
                      label="Output Value Type"
                      onChange={(e) => setFormatType(e.target.value as CommaFormatType)}
                    >
                      <MenuItem value="strings">Comma-Separated Strings (Quoted)</MenuItem>
                      <MenuItem value="numbers">Comma-Separated Numbers (Numeric only)</MenuItem>
                      <MenuItem value="raw">Raw Text (Unquoted Strings)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Delimiter */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Delimiter</InputLabel>
                    <Select
                      value={delimiter}
                      label="Delimiter"
                      onChange={(e) => setDelimiter(e.target.value)}
                    >
                      <MenuItem value=", ">Comma with space (, )</MenuItem>
                      <MenuItem value=",">Plain comma (,)</MenuItem>
                      <MenuItem value={',\n'}>Comma with newline (,\n)</MenuItem>
                      <MenuItem value="; ">Semicolon (; )</MenuItem>
                      <MenuItem value={'\n'}>Newline only (\n)</MenuItem>
                      <MenuItem value="|">Pipe (|)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Advanced Formatting & Quoting Options */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  {/* Quote Style (only applicable if strings/raw) */}
                  {formatType !== 'numbers' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', mb: 0.5 }}>
                        String Quoting Style:
                      </Typography>
                      <RadioGroup
                        row
                        value={quoteStyle}
                        onChange={(e) => setQuoteStyle(e.target.value as CommaQuoteStyle)}
                      >
                        <FormControlLabel value="single" control={<Radio size="small" />} label="Single 'val'" />
                        <FormControlLabel value="double" control={<Radio size="small" />} label='Double "val"' />
                        <FormControlLabel value="none" control={<Radio size="small" />} label="No Quotes" />
                      </RadioGroup>
                    </Grid>
                  )}

                  {/* Enclose In Brackets */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', mb: 0.5 }}>
                      Enclosing Wrapper:
                    </Typography>
                    <RadioGroup
                      row
                      value={wrapBrackets}
                      onChange={(e) => setWrapBrackets(e.target.value as CommaWrapBrackets)}
                    >
                      <FormControlLabel value="none" control={<Radio size="small" />} label="None" />
                      <FormControlLabel value="parentheses" control={<Radio size="small" />} label="(...)" />
                      <FormControlLabel value="brackets" control={<Radio size="small" />} label="[...]" />
                      <FormControlLabel value="curly" control={<Radio size="small" />} label="{...}" />
                    </RadioGroup>
                  </Grid>

                  {/* Cleaning Toggles */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', mb: 0.5 }}>
                      Data Cleaning:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <FormControlLabel
                        control={<Switch checked={deduplicate} onChange={(e) => setDeduplicate(e.target.checked)} size="small" />}
                        label="Deduplicate (Unique values only)"
                        sx={{ '& .MuiTypography-root': { fontSize: '0.8125rem' } }}
                      />
                      <FormControlLabel
                        control={<Switch checked={ignoreBlank} onChange={(e) => setIgnoreBlank(e.target.checked)} size="small" />}
                        label="Ignore empty / blank cells"
                        sx={{ '& .MuiTypography-root': { fontSize: '0.8125rem' } }}
                      />
                      <FormControlLabel
                        control={<Switch checked={trimValues} onChange={(e) => setTrimValues(e.target.checked)} size="small" />}
                        label="Trim outer whitespace"
                        sx={{ '& .MuiTypography-root': { fontSize: '0.8125rem' } }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Action Button Bar */}
              <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                <AppButton
                  variant="contained"
                  startIcon={<CodeIcon />}
                  onClick={extractCommaSeparated}
                >
                  Extract Comma-Separated {formatType === 'numbers' ? 'Numbers' : 'Strings'}
                </AppButton>
                <AppButton variant="outlined" startIcon={<RestartAltIcon />} onClick={reset}>
                  Reset
                </AppButton>
              </Box>

              {/* Results Area for Comma-Separated Extractor */}
              {commaResult && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--color-divider)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Extracted Comma-Separated Output
                      </Typography>
                      {commaStats && (
                        <>
                          <Chip
                            label={`${commaStats.extractedCount} Items Extracted`}
                            size="small"
                            sx={{ fontWeight: 700, bgcolor: 'var(--color-success-bg)', color: 'var(--color-success)' }}
                          />
                          {commaStats.duplicatesRemoved > 0 && (
                            <Chip
                              label={`${commaStats.duplicatesRemoved} Duplicates Dropped`}
                              size="small"
                              sx={{ fontWeight: 600, bgcolor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
                            />
                          )}
                          {commaStats.nonNumericSkipped > 0 && (
                            <Chip
                              label={`${commaStats.nonNumericSkipped} Non-Numeric Skipped`}
                              size="small"
                              sx={{ fontWeight: 600, bgcolor: 'var(--color-surface-hover)' }}
                            />
                          )}
                        </>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <AppButton
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => downloadCommaText('txt')}
                      >
                        Download TXT
                      </AppButton>
                      <AppButton
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => downloadCommaText('csv')}
                      >
                        Download CSV
                      </AppButton>
                      <AppCopyButton textToCopy={commaResult} tooltipText="Copy comma-separated list to clipboard" />
                    </Box>
                  </Box>

                  <AppCodeEditor
                    value={commaResult}
                    language="text"
                    readOnly
                    height="220px"
                    title={`Column: ${targetColumn} (${formatType})`}
                    showCopy={false}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* TAB 1: Sub-Table Extractor (Multi-Column Grid) */}
          {activeTab === 1 && (
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Pick multiple columns to generate a focused sub-spreadsheet.
                  </Typography>
                  <Chip
                    label={`${selectedColumns.length} of ${parsedData.columns.length} columns selected`}
                    size="small"
                    sx={{ mt: 1, fontWeight: 600, bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <AppButton variant="text" size="small" onClick={selectAllColumns}>
                    Select All
                  </AppButton>
                  <AppButton variant="text" size="small" onClick={deselectAllColumns}>
                    Deselect All
                  </AppButton>
                </Box>
              </Box>

              {/* Column Search Filter */}
              <Box sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search column names..."
                  value={searchColumnQuery}
                  onChange={(e) => setSearchColumnQuery(e.target.value)}
                  fullWidth
                  sx={{
                    maxWidth: 350,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-surface)',
                    },
                  }}
                />
              </Box>

              {/* Columns Grid */}
              <Grid container spacing={1.5} sx={{ maxHeight: 240, overflowY: 'auto', p: 0.5 }}>
                {filteredColumns.map((col) => {
                  const isChecked = selectedColumns.includes(col);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={col}>
                      <Box
                        onClick={() => toggleColumn(col)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                          backgroundColor: isChecked ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                          },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0.5, mr: 1, color: isChecked ? 'var(--color-primary)' : undefined }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isChecked ? 600 : 400,
                            color: isChecked ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Selected Order Summary Chips */}
              {selectedColumns.length > 0 && (
                <Box sx={{ mt: 1, pt: 1.5, borderTop: '1px solid var(--color-divider)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Selected Extraction Sequence ({selectedColumns.length} columns)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedColumns.map((col, index) => (
                      <Chip
                        key={col}
                        label={`${index + 1}. ${col}`}
                        onDelete={() => toggleColumn(col)}
                        size="small"
                        sx={{
                          backgroundColor: 'var(--color-surface-hover)',
                          border: '1px solid var(--color-border)',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Action Execution Bar */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 1.5, borderTop: '1px solid var(--color-divider)' }}>
                <AppButton
                  variant="contained"
                  startIcon={<FilterAltIcon />}
                  onClick={extractTable}
                  disabled={selectedColumns.length === 0}
                >
                  Extract Sub-Table ({selectedColumns.length} Columns)
                </AppButton>
                <AppButton variant="outlined" startIcon={<RestartAltIcon />} onClick={reset}>
                  Reset
                </AppButton>
              </Box>

              {/* Table Output Section */}
              {extractedRows && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--color-divider)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Extracted Table Preview
                      </Typography>
                      <Chip
                        label={`${extractedRows.length} Rows`}
                        size="small"
                        sx={{ fontWeight: 700, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <AppButton
                        variant="contained"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={exportExcel}
                      >
                        Download Excel (.xlsx)
                      </AppButton>
                      <AppButton
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={exportCsv}
                      >
                        Download CSV
                      </AppButton>
                      <AppCopyButton
                        textToCopy={JSON.stringify(extractedRows, null, 2)}
                        tooltipText="Copy extracted rows as JSON"
                      />
                    </Box>
                  </Box>

                  <TableContainer
                    component={Paper}
                    sx={{
                      maxHeight: 350,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '8px',
                      boxShadow: 'none',
                    }}
                  >
                    <Table stickyHeader size="small" aria-label="Extracted data table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700, width: 60 }}>
                            #
                          </TableCell>
                          {selectedColumns.map((col) => (
                            <TableCell key={col} sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {extractedRows.slice(0, 100).map((row, idx) => (
                          <TableRow
                            key={idx}
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: 'var(--color-background)' } }}
                          >
                            <TableCell sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                              {idx + 1}
                            </TableCell>
                            {selectedColumns.map((col) => (
                              <TableCell key={col} sx={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                                {String(row[col] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </AppCard>
      )}

      {/* Empty State when no file uploaded */}
      {!parsedData && (
        <AppEmptyState
          title="No Spreadsheet Loaded"
          description="Upload an Excel workbook (.xlsx, .xls) or CSV document to extract comma-separated values (strings or numbers) or filtered sub-tables."
          action={
            <AppButton variant="outlined" onClick={loadSampleData} startIcon={<DatasetIcon />}>
              Try with Demo Accounts & Numbers
            </AppButton>
          }
        />
      )}
    </Box>
  );
};

export default ColumnExtractorPage;
