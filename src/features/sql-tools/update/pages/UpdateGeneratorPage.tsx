import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import UpdateIcon from '@mui/icons-material/Update';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';
import * as XLSX from 'xlsx';

const SAMPLE_CSV = `id,status,retry_count
1001,COMPLETED,0
1002,FAILED,3
1003,PROCESSING,1`;

export const UpdateGeneratorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [tableName, setTableName] = useState('orders');
  const [whereKey, setWhereKey] = useState('id');
  const [inputData, setInputData] = useState(SAMPLE_CSV);
  const [outputSql, setOutputSql] = useState('');

  const generate = () => {
    try {
      const workbook = XLSX.read(inputData, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (rows.length === 0) {
        dispatch(showToast({ message: 'No rows detected', severity: 'warning' }));
        return;
      }

      const statements = rows.map((row) => {
        const whereVal = row[whereKey];
        const whereClause = typeof whereVal === 'number' ? `"${whereKey}" = ${whereVal}` : `"${whereKey}" = '${String(whereVal ?? '')}'`;

        const setAssignments = Object.keys(row)
          .filter((k) => k !== whereKey)
          .map((col) => {
            const val = row[col];
            if (val === null || val === undefined || val === '') return `"${col}" = NULL`;
            if (typeof val === 'number') return `"${col}" = ${val}`;
            if (typeof val === 'boolean') return `"${col}" = ${val ? 'TRUE' : 'FALSE'}`;
            return `"${col}" = '${String(val).replace(/'/g, "''")}'`;
          })
          .join(', ');

        return `UPDATE "${tableName}" SET ${setAssignments} WHERE ${whereClause};`;
      });

      setOutputSql(statements.join('\n'));
      dispatch(showToast({ message: `Generated ${statements.length} UPDATE statements`, severity: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to generate UPDATE statements', severity: 'error' }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="sql.update"
        title="SQL UPDATE Generator"
        description="Construct batch SQL UPDATE statements from CSV records with targeted WHERE predicate keys."
        iconName="Update"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AppCard title="Table & Key Configuration">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                fullWidth
                label="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="WHERE Key Column"
                value={whereKey}
                onChange={(e) => setWhereKey(e.target.value)}
              />
            </Box>
            <TextField
              multiline
              rows={10}
              fullWidth
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Paste CSV rows with WHERE key column..."
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />
            <AppButton variant="contained" startIcon={<UpdateIcon />} onClick={generate}>
              Generate SQL UPDATE
            </AppButton>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AppCard
            title="Generated SQL"
            headerActions={outputSql && <AppCopyButton textToCopy={outputSql} />}
          >
            <AppCodeEditor
              value={outputSql || '-- Generated SQL UPDATE statements will appear here'}
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

export default UpdateGeneratorPage;
