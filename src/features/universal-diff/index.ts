import { lazy } from 'react';
import type { FeatureDefinition } from '@registry/types';

export const universalDiffFeature: FeatureDefinition = {
  id: 'text.universal-diff',
  name: 'Universal Diff & Comparison Studio',
  shortName: 'Diff Studio',
  description: 'Deep structural comparison for JSON, side-by-side Monaco code & text diffing, and spreadsheet data comparison.',
  category: 'text',
  iconName: 'Difference',
  route: '/text/diff',
  component: lazy(() => import('./pages/UniversalDiffPage')),
  permissions: ['tools:view'],
  enabled: true,
  order: 2,
  tags: ['diff', 'compare', 'json', 'text', 'code', 'monaco', 'structural', 'spreadsheet'],
  searchable: true,
  badge: {
    text: 'ENHANCED',
    variant: 'updated',
  },
};
