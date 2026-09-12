import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CompressIcon from '@mui/icons-material/Compress';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DatasetIcon from '@mui/icons-material/Dataset';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

const SAMPLE_JSON = `{
  "platform": "UtilityHub",
  "version": "2.4.0",
  "modules": ["excel", "sql", "text", "pricing", "api", "admin"],
  "security": { "rbac": true, "clientSideOnly": true },
  "telemetry": { "active": true, "sink": "memory" }
}`;

export const JsonFormatterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [inputJson, setInputJson] = useState(SAMPLE_JSON);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatBeautify = (spaces = 2) => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, spaces));
      dispatch(showToast({ message: 'Formatted JSON with clean indentation', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const formatMinify = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
      dispatch(showToast({ message: 'Minified JSON to single line', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const sortKeys = () => {
    setErrorMsg(null);
    try {
      const sortObject = (obj: unknown): unknown => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sortObject);
        return Object.keys(obj)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = sortObject((obj as Record<string, unknown>)[key]);
            return acc;
          }, {});
      };

      const parsed = JSON.parse(inputJson);
      const sorted = sortObject(parsed);
      setInputJson(JSON.stringify(sorted, null, 2));
      dispatch(showToast({ message: 'Alphabetically sorted all object keys', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const validate = () => {
    setErrorMsg(null);
    try {
      JSON.parse(inputJson);
      dispatch(showToast({ message: 'JSON is 100% valid syntax', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON syntax');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.json-formatter"
        title="JSON Formatter & Validator"
        description="Beautify, minify, sort keys alphabetically, and validate complex JSON documents."
        iconName="DataObject"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={() => setInputJson(SAMPLE_JSON)}>
            Reset Sample
          </AppButton>
        }
      />

      <AppCard
        title="JSON Editor"
        subtitle="Paste or edit JSON content below"
        headerActions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AppButton variant="contained" size="small" startIcon={<FormatAlignLeftIcon />} onClick={() => formatBeautify(2)}>
              Beautify (2 Spaces)
            </AppButton>
            <AppButton variant="outlined" size="small" startIcon={<CompressIcon />} onClick={formatMinify}>
              Minify
            </AppButton>
            <AppButton variant="outlined" size="small" startIcon={<SortByAlphaIcon />} onClick={sortKeys}>
              Sort Keys
            </AppButton>
            <AppButton variant="outlined" size="small" startIcon={<CheckCircleIcon />} onClick={validate}>
              Validate
            </AppButton>
          </Box>
        }
      >
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        <AppCodeEditor
          value={inputJson}
          onChange={(val) => setInputJson(val)}
          language="json"
          height="450px"
          showCopy={true}
        />
      </AppCard>
    </Box>
  );
};

export default JsonFormatterPage;
