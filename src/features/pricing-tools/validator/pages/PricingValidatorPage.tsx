import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';

export const PricingValidatorPage: React.FC = () => {
  const [listPrice, setListPrice] = useState<number>(10000);
  const [discountPercent, setDiscountPercent] = useState<number>(35);
  const [costOfGoods, setCostOfGoods] = useState<number>(4500);

  // Policy thresholds
  const MAX_DISCOUNT_CEILING = 40; // max 40% discount without VP approval
  const MIN_MARGIN_FLOOR = 25; // min 25% gross margin

  const discountedPrice = listPrice * (1 - discountPercent / 100);
  const grossProfit = discountedPrice - costOfGoods;
  const grossMarginPercent = discountedPrice > 0 ? (grossProfit / discountedPrice) * 100 : 0;

  const isDiscountApproved = discountPercent <= MAX_DISCOUNT_CEILING;
  const isMarginApproved = grossMarginPercent >= MIN_MARGIN_FLOOR;
  const overallCompliant = isDiscountApproved && isMarginApproved;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="pricing.validator"
        title="Pricing Deal Validator"
        description="Verify sales quotes and custom pricing proposals against corporate gross margin floors and discount limits."
        iconName="Rule"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AppCard title="Quote Parameters" subtitle="Enter deal financials to validate policy adherence">
            <TextField
              type="number"
              label="Standard List Price ($)"
              value={listPrice}
              onChange={(e) => setListPrice(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              type="number"
              label="Proposed Discount (%)"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              type="number"
              label="Cost of Goods / Service Delivery ($)"
              value={costOfGoods}
              onChange={(e) => setCostOfGoods(Number(e.target.value))}
              fullWidth
            />
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AppCard title="Policy Validation Audit">
            {overallCompliant ? (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
                ✓ DEAL APPROVED: Quote passes all corporate margin floors and standard discount thresholds.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
                ⚠ SPECIAL APPROVAL REQUIRED: Quote violates one or more executive pricing governance policies.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid var(--color-border-subtle)', bgcolor: 'var(--color-surface-hover)' }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Final Contract Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-text-primary)', mt: 0.5 }}>
                    ${discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid var(--color-border-subtle)', bgcolor: 'var(--color-surface-hover)' }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Gross Margin
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: isMarginApproved ? 'var(--color-success)' : 'var(--color-error)',
                      mt: 0.5,
                    }}
                  >
                    {grossMarginPercent.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: '6px', bgcolor: 'var(--color-surface)' }}>
                <Typography variant="body2">Discount Ceiling Check (Max {MAX_DISCOUNT_CEILING}%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: isDiscountApproved ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {isDiscountApproved ? 'PASSED' : `EXCEEDED (${discountPercent}%)`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: '6px', bgcolor: 'var(--color-surface)' }}>
                <Typography variant="body2">Gross Margin Floor Check (Min {MIN_MARGIN_FLOOR}%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: isMarginApproved ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {isMarginApproved ? 'PASSED' : `MARGIN DEFICIT (${grossMarginPercent.toFixed(1)}%)`}
                </Typography>
              </Box>
            </Box>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PricingValidatorPage;
