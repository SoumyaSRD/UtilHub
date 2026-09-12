import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppCodeEditor } from '@shared/components/AppCodeEditor/AppCodeEditor';

interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  parameters: { name: string; type: string; in: string; required: boolean }[];
  sampleResponse: unknown;
}

const DEMO_ENDPOINTS: EndpointSpec[] = [
  {
    method: 'GET',
    path: '/api/v2/catalog/skus',
    summary: 'List available product catalogue SKUs with pricing and currency metadata',
    parameters: [
      { name: 'limit', type: 'integer', in: 'query', required: false },
      { name: 'category', type: 'string', in: 'query', required: false },
    ],
    sampleResponse: {
      status: 'success',
      count: 2,
      data: [
        { sku: 'SRV-01', name: 'Dedicated Node', price: 499.0, currency: 'USD' },
        { sku: 'SRV-02', name: 'Shared Cluster', price: 149.5, currency: 'USD' },
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/v2/pricing/calculate-tier',
    summary: 'Calculate volume graduated pricing for a proposed enterprise deal',
    parameters: [{ name: 'body', type: 'object', in: 'body', required: true }],
    sampleResponse: {
      quoteId: 'Q-2025-891',
      totalUnits: 450,
      flatRate: 14.0,
      graduatedTotal: 5850.0,
      currency: 'USD',
    },
  },
  {
    method: 'GET',
    path: '/api/v2/audit/events',
    summary: 'Query platform administrative audit trail logs',
    parameters: [
      { name: 'actor', type: 'string', in: 'query', required: false },
      { name: 'since', type: 'string', in: 'query', required: false },
    ],
    sampleResponse: {
      total: 142,
      records: [
        { id: 'aud_1', action: 'ROLE_CHANGED', actor: 'Alex Mercer', timestamp: '2025-05-12T10:00:00Z' },
      ],
    },
  },
];

export const SwaggerViewerPage: React.FC = () => {
  const [activeResponse, setActiveResponse] = useState<Record<string, unknown> | null>(null);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'POST':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'PUT':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'DELETE':
        return { bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="api.swagger"
        title="OpenAPI / Swagger Explorer"
        description="Interactive documentation and live testbench for internal enterprise platform microservices."
        iconName="Api"
      />

      <AppCard title="Available Platform Endpoints" subtitle="OpenAPI 3.1.0 Service Specification">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {DEMO_ENDPOINTS.map((ep) => {
            const colors = getMethodColor(ep.method);
            return (
              <Accordion
                key={`${ep.method}-${ep.path}`}
                sx={{
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip
                      label={ep.method}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        backgroundColor: colors.bg,
                        color: colors.text,
                        width: 65,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}>
                      {ep.path}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-text-secondary)', ml: 'auto', mr: 2, display: { xs: 'none', sm: 'block' } }}
                    >
                      {ep.summary}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ borderTop: '1px solid var(--color-divider)', pt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: 'var(--color-text-primary)' }}>
                    {ep.summary}
                  </Typography>

                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Parameters
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {ep.parameters.map((p) => (
                      <Chip
                        key={p.name}
                        label={`${p.name} (${p.type} in ${p.in})${p.required ? ' *' : ''}`}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Mock Response Example
                    </Typography>
                    <AppButton
                      size="small"
                      variant="outlined"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => setActiveResponse(ep.sampleResponse as Record<string, unknown>)}
                    >
                      Execute Mock
                    </AppButton>
                  </Box>

                  <AppCodeEditor
                    value={JSON.stringify(ep.sampleResponse, null, 2)}
                    language="json"
                    readOnly
                    height="180px"
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </AppCard>

      {activeResponse && (
        <AppCard
          title="Executed Mock Response"
          headerActions={
            <AppButton size="small" variant="text" onClick={() => setActiveResponse(null)}>
              Clear
            </AppButton>
          }
        >
          <AppCodeEditor
            value={JSON.stringify(activeResponse, null, 2)}
            language="json"
            readOnly
            height="220px"
          />
        </AppCard>
      )}
    </Box>
  );
};

export default SwaggerViewerPage;
