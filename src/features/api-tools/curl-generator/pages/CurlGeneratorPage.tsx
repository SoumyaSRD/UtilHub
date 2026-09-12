import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';
import { AppCopyButton } from '@shared/components/AppCopyButton/AppCopyButton';

export const CurlGeneratorPage: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('POST');
  const [url, setUrl] = useState('https://api.enterprise.internal/v1/orders');
  const [bearerToken, setBearerToken] = useState('eyJh...token');
  const [contentType, setContentType] = useState('application/json');
  const [requestBody, setRequestBody] = useState('{\n  "sku": "SRV-01",\n  "quantity": 5\n}');

  // Generate formatted cURL string
  const generateCurl = () => {
    let curl = `curl --location --request ${method} '${url}' \\\n`;
    if (contentType) {
      curl += `  --header 'Content-Type: ${contentType}' \\\n`;
    }
    if (bearerToken) {
      curl += `  --header 'Authorization: Bearer ${bearerToken}' \\\n`;
    }
    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody.trim()) {
      const escapedBody = requestBody.replace(/'/g, "'\\''");
      curl += `  --data-raw '${escapedBody}'`;
    } else {
      curl = curl.replace(/ \\\n$/, '');
    }
    return curl;
  };

  const curlOutput = generateCurl();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="api.curl"
        title="cURL Command Generator"
        description="Assemble authenticated cURL commands with headers, bearer tokens, and JSON payloads for terminal execution."
        iconName="Terminal"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard title="Request Details">
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <FormControl size="small" sx={{ width: 130 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={method}
                  label="Method"
                  onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                fullWidth
                label="API Endpoint URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Box>

            <TextField
              size="small"
              fullWidth
              label="Authorization Bearer Token (optional)"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              size="small"
              fullWidth
              label="Content-Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              sx={{ mb: 2 }}
            />

            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <TextField
                multiline
                rows={6}
                fullWidth
                label="Request Body (JSON)"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '0.8125rem',
                    backgroundColor: 'var(--color-code-bg)',
                  },
                }}
              />
            )}
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppCard
            title="Generated cURL Command"
            subtitle="Ready to run in bash, zsh, or automated CI/CD jobs"
            headerActions={<AppCopyButton textToCopy={curlOutput} />}
          >
            <AppCodeEditor
              value={curlOutput}
              language="shell"
              readOnly
              height="350px"
              showCopy={false}
            />
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurlGeneratorPage;
