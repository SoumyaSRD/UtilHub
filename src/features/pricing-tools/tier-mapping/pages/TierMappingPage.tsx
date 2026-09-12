import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { AppPageHeader } from '@shared/components/AppPageHeader/AppPageHeader';
import { AppCard } from '@shared/components/AppCard/AppCard';

interface TierBracket {
  name: string;
  minUnits: number;
  maxUnits: number | null;
  unitPrice: number;
  discountPct: number;
}

const DEFAULT_TIERS: TierBracket[] = [
  { name: 'Tier 1 (Starter)', minUnits: 1, maxUnits: 50, unitPrice: 20.0, discountPct: 0 },
  { name: 'Tier 2 (Growth)', minUnits: 51, maxUnits: 250, unitPrice: 17.0, discountPct: 15 },
  { name: 'Tier 3 (Enterprise)', minUnits: 251, maxUnits: 1000, unitPrice: 14.0, discountPct: 30 },
  { name: 'Tier 4 (Strategic Scale)', minUnits: 1001, maxUnits: null, unitPrice: 10.0, discountPct: 50 },
];

export const TierMappingPage: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(320);
  const [tiers] = useState<TierBracket[]>(DEFAULT_TIERS);

  // Calculate volume pricing: Graduated vs Flat
  const calculateCosts = () => {
    // 1. Flat tier calculation (entire quantity at tier rate)
    const matchedTier = tiers.find((t) => {
      if (t.maxUnits === null) return quantity >= t.minUnits;
      return quantity >= t.minUnits && quantity <= t.maxUnits;
    }) || tiers[0];

    const flatTotal = quantity * matchedTier.unitPrice;

    // 2. Graduated tiered calculation (bracket by bracket)
    let remaining = quantity;
    let graduatedTotal = 0;
    const bracketBreakdown: { name: string; units: number; rate: number; subtotal: number }[] = [];

    for (const t of tiers) {
      if (remaining <= 0) break;
      const capacity = t.maxUnits === null ? remaining : t.maxUnits - t.minUnits + 1;
      const unitsInThisBracket = Math.min(remaining, capacity);
      const subtotal = unitsInThisBracket * t.unitPrice;
      bracketBreakdown.push({
        name: t.name,
        units: unitsInThisBracket,
        rate: t.unitPrice,
        subtotal,
      });
      graduatedTotal += subtotal;
      remaining -= unitsInThisBracket;
    }

    return { matchedTier, flatTotal, graduatedTotal, bracketBreakdown };
  };

  const results = calculateCosts();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        toolId="pricing.tier-mapping"
        title="Tier Mapping & Volume Pricing Engine"
        description="Model enterprise graduated brackets vs flat tier pricing with unit cost discount progression."
        iconName="Layers"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <AppCard title="Order Quantity Simulation">
            <TextField
              type="number"
              label="Simulated Units / Seats"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)' }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Matched Volume Bracket
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)', mt: 0.5 }}>
                {results.matchedTier.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                Effective Flat Rate: <strong>${results.matchedTier.unitPrice.toFixed(2)} / unit</strong> ({results.matchedTier.discountPct}% off base)
              </Typography>
            </Box>
          </AppCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <AppCard
            title="Graduated Bracket Breakdown"
            subtitle={`Distribution of ${quantity.toLocaleString()} units through tiered bands`}
            headerActions={
              <Chip
                label={`Graduated Total: $${results.graduatedTotal.toLocaleString()}`}
                sx={{ fontWeight: 700, bgcolor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              />
            }
          >
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid var(--color-border-subtle)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tier Band</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Units Billed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tier Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.bracketBreakdown.map((b) => (
                    <TableRow key={b.name}>
                      <TableCell sx={{ fontWeight: 600 }}>{b.name}</TableCell>
                      <TableCell>{b.units.toLocaleString()} units</TableCell>
                      <TableCell>${b.rate.toFixed(2)}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        ${b.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'var(--color-surface-hover)' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total Graduated Contract Value</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                      ${results.graduatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TierMappingPage;
