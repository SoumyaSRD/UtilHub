import React, { Suspense, lazy } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { AppCopyButton } from '../AppCopyButton/AppCopyButton';
import { useAppSelector } from '@app/store';
import { isDarkTheme } from '@theme/types';

const Monaco = lazy(() => import('@monaco-editor/react'));

export interface AppCodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  title?: string;
  showCopy?: boolean;
}

export const AppCodeEditor: React.FC<AppCodeEditorProps> = ({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  height = '350px',
  title,
  showCopy = true,
}) => {
  const currentTheme = useAppSelector((state) => state.preferences.themeMode);
  const monacoTheme = isDarkTheme(currentTheme) ? 'vs-dark' : 'light';

  return (
    <Box
      sx={{
        border: '1px solid var(--color-code-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--color-code-bg)',
      }}
    >
      {(title || showCopy) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-code-border)',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            {title || language}
          </Typography>
          {showCopy && <AppCopyButton textToCopy={value} />}
        </Box>
      )}

      <Suspense
        fallback={
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-code-bg)',
              gap: 1.5,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
              Loading editor environment...
            </Typography>
          </Box>
        }
      >
        <Monaco
          height={height}
          language={language}
          value={value}
          theme={monacoTheme}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
          }}
          onChange={(val) => {
            if (onChange && val !== undefined) {
              onChange(val);
            }
          }}
        />
      </Suspense>
    </Box>
  );
};
