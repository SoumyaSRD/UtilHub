import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import DatasetIcon from '@mui/icons-material/Dataset';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';
import { AppButton } from '@shared/components/AppButton/AppButton';
import { AppFileUpload } from '@shared/components/AppFileUpload/AppFileUpload';
import { excelService } from '@shared/services/file/excelService';

interface CatalogueIssue {
  sku: string;
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  field: string;
  currentValue: unknown;
}

const SAMPLE_CATALOGUE = [
  { SKU: 'SKU-001', Name: 'Database Storage 100GB', Price: 25.0, Currency: 'USD', Status: 'ACTIVE' },
  { SKU: 'SKU-002', Name: 'Compute Node Extra', Price: -10.0, Currency: 'USD', Status: 'ACTIVE' }, // Negative price!
  { SKU: 'SKU-003', Name: '', Price: 40.0, Currency: 'EUR', Status: 'ACTIVE' }, // Missing Name!
  { SKU: 'SKU-004', Name: 'Load Balancer Managed', Price: 75.0, Currency: 'INVALID', Status: 'ACTIVE' }, // Invalid Currency!
  { SKU: 'SKU-005', Name: 'SSL Wildcard Cert', Price: 120.0, Currency: 'USD', Status: 'DEPRECATED' },
];

export const CatalogueCheckPage: React.FC = () => {
  const [issues, setIssues] = useState<CatalogueIssue[] | null>(null);
  const [checkedCount, setCheckedCount] = useState<number>(0);

  const runAudit = (rows: Record<string, unknown>[]) => {
    const identifiedIssues: CatalogueIssue[] = [];
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

    rows.forEach((r) => {
      const sku = String(r['SKU'] || r['sku'] || r['id'] || 'UNKNOWN');
      const name = String(r['Name'] || r['name'] || '').trim();
      const price = Number(r['Price'] || r['price'] || 0);
      const currency = String(r['Currency'] || r['currency'] || 'USD').toUpperCase();

      if (!name) {
        identifiedIssues.push({ sku, issue: 'Missing product catalogue name', severity: 'HIGH', field: 'Name', currentValue: name });
      }
      if (isNaN(price) || price <= 0) {
        identifiedIssues.push({ sku, issue: 'Negative or zero price detected', severity: 'HIGH', field: 'Price', currentValue: price });
      }
      if (!validCurrencies.includes(currency)) {
        identifiedIssues.push({ sku, issue: `Unsupported ISO currency (${currency})`, severity: 'MEDIUM', field: 'Currency', currentValue: currency });
      }
    });

    setCheckedCount(rows.length);
    setIssues(identifiedIssues);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="pricing.catalogue-check"
        title="Catalogue Price & Currency Checker"
        description="Verify product catalogue consistency, negative prices, unsupported ISO currencies, and missing metadata."
        iconName="FactCheck"
        actions={
          <AppButton variant="outlined" startIcon={<DatasetIcon />} onClick={() => runAudit(SAMPLE_CATALOGUE)}>
            Run Audit on Demo Catalogue
          </AppButton>
        }
      />

      <AppCard title="Upload Product Catalogue" subtitle="Upload CSV or Excel catalogue file to audit">
        <AppFileUpload
          onFileSelect={async (file) => {
            const parsed = await excelService.parseFile(file);
            runAudit(parsed.rows);
          }}
        />
      </AppCard>

      {issues && (
        <AppCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <span>Audit Findings</span>
              <Chip
                label={`${issues.length} Issues Found`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: issues.length > 0 ? '#fee2e2' : '#dcfce7',
                  color: issues.length > 0 ? '#b91c1c' : '#15803d',
                }}
              />
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                Across {checkedCount} catalogue items
              </Typography>
            </Box>
          }
        >
          {issues.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'var(--color-success)', fontWeight: 600 }}>
                ✓ No catalogue anomalies or pricing errors detected. All records comply with platform policies.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Issue Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Current Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((iss, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 600 }}>{iss.sku}</TableCell>
                      <TableCell>
                        <Chip
                          label={iss.severity}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            bgcolor: iss.severity === 'HIGH' ? '#fee2e2' : '#fef3c7',
                            color: iss.severity === 'HIGH' ? '#b91c1c' : '#b45309',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{iss.field}</TableCell>
                      <TableCell>{iss.issue}</TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
                        {String(iss.currentValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AppCard>
      )}
    </Box>
  );
};

export default CatalogueCheckPage;
