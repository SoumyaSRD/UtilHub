import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import DatasetIcon from '@mui/icons-material/Dataset';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';

// Sample JWT token (standard test token)
const SAMPLE_JWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwaS1rZXktMTAxIn0.eyJzdWIiOiJ1c3JfZW50ZXJwcmlzZV8wMSIsIm5hbWUiOiJBbGV4IE1lcmNlciIsInJvbGVzIjpbIkFETUlOIiwiREVWRUxPUEVSIl0sImlzcyI6ImF1dGguZW50ZXJwcmlzZS5pbyIsImF1ZCI6InV0aWxpdHlodWItYXBpIiwiZXhwIjoyMDgwMDAwMDAwLCJpYXQiOjE3NDIwMDAwMDB9.dGVzdC1zaWduYXR1cmUtZXhhbXBsZQ';

export const JwtDecoderPage: React.FC = () => {
  const [jwtInput, setJwtInput] = useState(SAMPLE_JWT);

  const decodedResult = useMemo(() => {
    if (!jwtInput.trim()) return null;

    const parts = jwtInput.trim().split('.');
    if (parts.length < 2) {
      return { error: 'Invalid JWT format: A JSON Web Token must contain at least Header and Payload parts separated by dots.' };
    }

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const bin = atob(base64);
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      };

      const headerJson = JSON.parse(base64UrlDecode(parts[0]));
      const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2] || '';

      let expiryDate: Date | null = null;
      let isExpired = false;

      if (payloadJson.exp && typeof payloadJson.exp === 'number') {
        expiryDate = new Date(payloadJson.exp * 1000);
        isExpired = expiryDate.getTime() < Date.now();
      }

      return {
        header: JSON.stringify(headerJson, null, 2),
        payload: JSON.stringify(payloadJson, null, 2),
        signature,
        expiryDate,
        isExpired,
        error: null,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Malformed base64 token' };
    }
  }, [jwtInput]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="api.jwt-decoder"
        title="JWT Token Inspector"
        description="Safely inspect and decode JSON Web Tokens locally with claim validation and expiration tracking."
        iconName="Token"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={() => setJwtInput(SAMPLE_JWT)}>
            Load Sample Token
          </AppButton>
        }
      />

      {/* Security Disclaimer */}
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        <strong>Security Notice:</strong> This tool decodes the token locally in your browser. Decoding does NOT verify the cryptographic signature. Never paste production secrets or signing keys.
      </Alert>

      <AppCard title="Raw Encoded JWT Token">
        <TextField
          multiline
          rows={3}
          fullWidth
          value={jwtInput}
          onChange={(e) => setJwtInput(e.target.value)}
          placeholder="Paste eyJhbGciOi... token here"
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.85rem',
              backgroundColor: 'var(--color-code-bg)',
            },
          }}
        />
      </AppCard>

      {decodedResult && !decodedResult.error && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppCard
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Header</span>
                  <Chip label="Algorithm & Type" size="small" sx={{ fontSize: '0.65rem' }} />
                </Box>
              }
            >
              <AppCodeEditor value={decodedResult.header || ''} language="json" readOnly height="300px" />
            </AppCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <AppCard
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Payload Claims</span>
                  {decodedResult.expiryDate && (
                    <Chip
                      label={decodedResult.isExpired ? 'EXPIRED' : 'ACTIVE / VALID'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: decodedResult.isExpired ? '#fee2e2' : '#dcfce7',
                        color: decodedResult.isExpired ? '#b91c1c' : '#15803d',
                      }}
                    />
                  )}
                </Box>
              }
              subtitle={
                decodedResult.expiryDate
                  ? `Expires: ${decodedResult.expiryDate.toLocaleString()}`
                  : 'No standard "exp" expiration claim present'
              }
            >
              <AppCodeEditor value={decodedResult.payload || ''} language="json" readOnly height="300px" />
            </AppCard>
          </Grid>
        </Grid>
      )}

      {decodedResult?.error && (
        <Alert severity="error" sx={{ borderRadius: '8px' }}>
          {decodedResult.error}
        </Alert>
      )}
    </Box>
  );
};

export default JwtDecoderPage;
