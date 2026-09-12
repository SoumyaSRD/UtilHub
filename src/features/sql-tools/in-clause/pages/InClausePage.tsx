import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Chip from '@mui/material/Chip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

const SAMPLE_INPUT = `USR-89021
USR-99120
USR-89021
USR-10293
USR-55201
USR-33921
USR-44102`;

export const InClausePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [rawInput, setRawInput] = useState(SAMPLE_INPUT);
  const [quoteStyle, setQuoteStyle] = useState<'single' | 'double' | 'none'>('single');
  const [deduplicate, setDeduplicate] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [wrapInClause, setWrapInClause] = useState(true);
  const [columnName, setColumnName] = useState('user_id');
  const [outputSql, setOutputSql] = useState('');
  const [itemCount, setItemCount] = useState<number | null>(null);

  const generate = () => {
    const lines = rawInput
      .split(/[\r\n,]+/)
      .map((s) => (trimWhitespace ? s.trim() : s))
      .filter((s) => s.length > 0);

    const processed = deduplicate ? Array.from(new Set(lines)) : lines;
    setItemCount(processed.length);

    const formattedItems = processed.map((item) => {
      if (quoteStyle === 'single') return `'${item.replace(/'/g, "''")}'`;
      if (quoteStyle === 'double') return `"${item.replace(/"/g, '""')}"`;
      return item;
    });

    const joined = formattedItems.join(',\n  ');
    const result = wrapInClause
      ? `${columnName} IN (\n  ${joined}\n)`
      : `(\n  ${joined}\n)`;

    setOutputSql(result);
    dispatch(showToast({ message: `Generated SQL with ${processed.length} items`, severity: 'success' }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="sql.in-clause"
        title="SQL IN Clause Generator"
        description="Format newline or comma-separated tokens, UUIDs, and keys into clean, sanitized SQL IN expressions."
        iconName="FilterList"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AppCard title="Raw Input Values" subtitle="Paste IDs, tokens or copied spreadsheet columns">
            <TextField
              multiline
              rows={10}
              fullWidth
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste values here..."
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                size="small"
                label="Target Column Name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                disabled={!wrapInClause}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <FormControlLabel
                  control={<Checkbox checked={deduplicate} onChange={(e) => setDeduplicate(e.target.checked)} size="small" />}
                  label="Deduplicate"
                />
                <FormControlLabel
                  control={<Checkbox checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} size="small" />}
                  label="Trim Spaces"
                />
                <FormControlLabel
                  control={<Checkbox checked={wrapInClause} onChange={(e) => setWrapInClause(e.target.checked)} size="small" />}
                  label="Wrap with column IN (...)"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RadioGroup
                  row
                  value={quoteStyle}
                  onChange={(e) => setQuoteStyle(e.target.value as 'single' | 'double' | 'none')}
                >
                  <FormControlLabel value="single" control={<Radio size="small" />} label="Single 'val'" />
                  <FormControlLabel value="double" control={<Radio size="small" />} label='Double "val"' />
                  <FormControlLabel value="none" control={<Radio size="small" />} label="Numeric (No quotes)" />
                </RadioGroup>
              </Box>

              <AppButton variant="contained" startIcon={<FilterListIcon />} onClick={generate} sx={{ mt: 1 }}>
                Generate SQL IN Clause
              </AppButton>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AppCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span>SQL Output</span>
                {itemCount !== null && (
                  <Chip label={`${itemCount} items`} size="small" sx={{ fontWeight: 600 }} />
                )}
              </Box>
            }
            subtitle="Ready to copy into your query tool"
            headerActions={outputSql && <AppCopyButton textToCopy={outputSql} />}
          >
            <AppCodeEditor
              value={outputSql || '-- Generated SQL IN clause will appear here after clicking Generate'}
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

export default InClausePage;
