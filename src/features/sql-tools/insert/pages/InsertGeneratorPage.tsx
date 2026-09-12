import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import * as XLSX from 'xlsx';

const SAMPLE_CSV = `sku,name,price,is_active
SRV-01,Dedicated Node,499.00,true
SRV-02,Shared Cluster,149.50,true
SRV-03,Edge Worker,29.99,false`;

export const InsertGeneratorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [tableName, setTableName] = useState('products');
  const [inputData, setInputData] = useState(SAMPLE_CSV);
  const [outputSql, setOutputSql] = useState('');

  const generate = () => {
    try {
      const workbook = XLSX.read(inputData, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (rows.length === 0) {
        dispatch(showToast({ message: 'No rows detected in input', severity: 'warning' }));
        return;
      }

      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(', ');

      const valueRows = rows.map((row) => {
        const vals = columns.map((c) => {
          const val = row[c];
          if (val === null || val === undefined || val === '') return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `  (${vals.join(', ')})`;
      });

      const sql = `INSERT INTO "${tableName}" (\n  ${colList}\n)\nVALUES\n${valueRows.join(',\n')};`;
      setOutputSql(sql);
      dispatch(showToast({ message: `Generated INSERT for ${rows.length} rows`, severity: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to parse input data', severity: 'error' }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="sql.insert"
        title="SQL INSERT Generator"
        description="Convert tabular rows into multi-row SQL INSERT statements with escaped strings and data type formatting."
        iconName="PlaylistAdd"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AppCard title="Table & Input Data">
            <TextField
              size="small"
              fullWidth
              label="Destination Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              multiline
              rows={10}
              fullWidth
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Paste CSV rows here..."
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />
            <AppButton variant="contained" startIcon={<PlaylistAddIcon />} onClick={generate}>
              Generate SQL INSERT
            </AppButton>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AppCard
            title="Generated SQL"
            headerActions={outputSql && <AppCopyButton textToCopy={outputSql} />}
          >
            <AppCodeEditor
              value={outputSql || '-- Generated SQL will appear here'}
              language="sql"
              readOnly
              height="380px"
              showCopy={false}
            />
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InsertGeneratorPage;
