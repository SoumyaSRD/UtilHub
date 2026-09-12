import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TransformIcon from '@mui/icons-material/Transform';
import DatasetIcon from '@mui/icons-material/Dataset';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import * as XLSX from 'xlsx';

const SAMPLE_CSV = `id,name,role,department,salary,active
101,Alex Morgan,Principal Architect,Infrastructure,185000,true
102,David Chen,Senior SRE,DevOps,152000,true
103,Elena Rostova,QA Lead,Quality Engineering,138000,true
104,Marcus Vance,Business Analyst,Operations,115000,false`;

export const CsvToJsonPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [jsonOutput, setJsonOutput] = useState('');
  const [parseTypes, setParseTypes] = useState(true);

  const convert = () => {
    try {
      const workbook = XLSX.read(csvInput, { type: 'string', raw: !parseTypes });
      const sheetName = workbook.SheetNames[0];
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: !parseTypes });

      const formatted = JSON.stringify(json, null, 2);
      setJsonOutput(formatted);
      dispatch(showToast({ message: `Successfully converted ${json.length} records to JSON`, severity: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: `CSV parse error: ${err instanceof Error ? err.message : 'Invalid CSV'}`, severity: 'error' }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="excel.csv-to-json"
        title="CSV to JSON Converter"
        description="Convert tabular CSV/TSV data into strongly typed JSON arrays with automatic type casting."
        iconName="Transform"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={() => setCsvInput(SAMPLE_CSV)}>
            Reset Sample CSV
          </AppButton>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard
            title="CSV / TSV Input"
            subtitle="Paste raw delimited text or type lines"
            headerActions={
              <FormControlLabel
                control={<Switch checked={parseTypes} onChange={(e) => setParseTypes(e.target.checked)} size="small" />}
                label="Infer Numbers/Booleans"
                sx={{ '& .MuiTypography-root': { fontSize: '0.8rem', color: 'var(--color-text-secondary)' } }}
              />
            }
          >
            <TextField
              multiline
              rows={14}
              fullWidth
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Paste comma-separated data with headers..."
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />
            <Box sx={{ mt: 2 }}>
              <AppButton variant="contained" startIcon={<TransformIcon />} onClick={convert}>
                Convert to JSON
              </AppButton>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard
            title="JSON Output"
            subtitle="Formatted JSON Array"
            headerActions={jsonOutput && <AppCopyButton textToCopy={jsonOutput} />}
          >
            <AppCodeEditor
              value={jsonOutput || '// Converted JSON payload will appear here after clicking Convert'}
              language="json"
              readOnly
              height="340px"
              showCopy={false}
            />
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CsvToJsonPage;
