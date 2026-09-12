import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

export const Base64Page: React.FC = () => {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = useState('Welcome to UtilityHub! 🚀 Modern enterprise tooling.');
  const [outputText, setOutputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const encodeBase64 = () => {
    setErrorMsg(null);
    try {
      const bytes = new TextEncoder().encode(inputText);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      const encoded = btoa(binString);
      setOutputText(encoded);
      dispatch(showToast({ message: 'Encoded UTF-8 string to Base64', severity: 'success' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Encoding failed');
    }
  };

  const decodeBase64 = () => {
    setErrorMsg(null);
    try {
      const binString = atob(inputText.trim());
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      setOutputText(decoded);
      dispatch(showToast({ message: 'Decoded Base64 to text', severity: 'success' }));
    } catch {
      setErrorMsg('Invalid Base64 input string');
    }
  };

  const encodeUrl = () => {
    setErrorMsg(null);
    try {
      setOutputText(encodeURIComponent(inputText));
      dispatch(showToast({ message: 'URL-encoded string', severity: 'success' }));
    } catch {
      setErrorMsg('URL encoding error');
    }
  };

  const decodeUrl = () => {
    setErrorMsg(null);
    try {
      setOutputText(decodeURIComponent(inputText));
      dispatch(showToast({ message: 'URL-decoded string', severity: 'success' }));
    } catch {
      setErrorMsg('Invalid URL encoded string');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="text.base64"
        title="Base64 & URL Encoder / Decoder"
        description="Encode and decode text payloads between Base64 and URL representations with full UTF-8 Unicode support."
        iconName="EnhancedEncryption"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard title="Input Text" subtitle="Text or encoded payload to transform">
            <TextField
              multiline
              rows={12}
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.8125rem',
                  backgroundColor: 'var(--color-code-bg)',
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <AppButton variant="contained" size="small" onClick={encodeBase64}>
                Base64 Encode
              </AppButton>
              <AppButton variant="outlined" size="small" onClick={decodeBase64}>
                Base64 Decode
              </AppButton>
              <AppButton variant="outlined" size="small" onClick={encodeUrl}>
                URL Encode
              </AppButton>
              <AppButton variant="outlined" size="small" onClick={decodeUrl}>
                URL Decode
              </AppButton>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard
            title="Result Output"
            headerActions={outputText && <AppCopyButton textToCopy={outputText} />}
          >
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                {errorMsg}
              </Alert>
            )}
            <TextField
              multiline
              rows={12}
              fullWidth
              value={outputText}
              slotProps={{ input: { readOnly: true } }}
              placeholder="Encoded / Decoded result will appear here..."
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
      </Grid>
    </Box>
  );
};

export default Base64Page;
