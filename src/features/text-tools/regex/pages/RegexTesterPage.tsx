import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';

const PRESET_PATTERNS = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { label: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: 'UUID v4', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', flags: 'gi' },
  { label: 'ISO Date', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { label: 'SemVer', pattern: 'v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)', flags: 'g' },
];

const SAMPLE_TEXT = `Server logs:
2025-05-12 10:23:44 Connection from user admin@enterprise.internal at 192.168.1.104
Session ID: e80b553f-912f-488b-a492-96576da69812
Secondary user david.chen@enterprise.org authenticated from 10.0.4.22
Current release tag: v2.4.1`;

export const RegexTesterPage: React.FC = () => {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flagGlobal, setFlagGlobal] = useState(true);
  const [flagIgnoreCase, setFlagIgnoreCase] = useState(false);
  const [flagMultiline, setFlagMultiline] = useState(false);
  const [testText, setTestText] = useState(SAMPLE_TEXT);

  const flagsString = `${flagGlobal ? 'g' : ''}${flagIgnoreCase ? 'i' : ''}${flagMultiline ? 'm' : ''}`;

  const matchResults = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flagsString);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (flagGlobal) {
        let m: RegExpExecArray | null;
        let count = 0;
        while ((m = regex.exec(testText)) !== null && count < 500) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          count++;
          if (m.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      return { matches, error: null };
    } catch (err) {
      return { matches: [], error: err instanceof Error ? err.message : 'Invalid regex pattern' };
    }
  }, [pattern, flagsString, testText, flagGlobal]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.regex"
        title="Regex Tester & Analyzer"
        description="Test regular expressions against real text with capture group inspection and common pattern presets."
        iconName="FindReplace"
      />

      {/* Pattern input & flags */}
      <AppCard title="Regular Expression Pattern">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="RegEx Pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            error={Boolean(matchResults.error)}
            helperText={matchResults.error}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={flagGlobal} onChange={(e) => setFlagGlobal(e.target.checked)} size="small" />}
              label="Global (g)"
            />
            <FormControlLabel
              control={<Checkbox checked={flagIgnoreCase} onChange={(e) => setFlagIgnoreCase(e.target.checked)} size="small" />}
              label="Ignore Case (i)"
            />
            <FormControlLabel
              control={<Checkbox checked={flagMultiline} onChange={(e) => setFlagMultiline(e.target.checked)} size="small" />}
              label="Multiline (m)"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Presets:
            </Typography>
            {PRESET_PATTERNS.map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                size="small"
                onClick={() => {
                  setPattern(p.pattern);
                  setFlagGlobal(p.flags.includes('g'));
                  setFlagIgnoreCase(p.flags.includes('i'));
                }}
                clickable
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      </AppCard>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard title="Test String" subtitle="Target text to match against">
            <TextField
              multiline
              rows={12}
              fullWidth
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span>Match Results</span>
                <Chip
                  label={`${matchResults.matches.length} matches`}
                  size="small"
                  color={matchResults.matches.length > 0 ? 'success' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            }
          >
            <TableContainer component={Paper} sx={{ maxHeight: 330, boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700, width: 40 }}>#</TableCell>
                    <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Match Content</TableCell>
                    <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Index</TableCell>
                    <TableCell sx={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>Groups</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matchResults.matches.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: 'var(--color-text-muted)' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {m.match}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {m.index}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {m.groups.length > 0 ? m.groups.join(', ') : 'None'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegexTesterPage;
