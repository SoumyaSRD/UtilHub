import { TierMappingPage } from './pages/TierMappingPage';
import type { FeatureDefinition } from '@registry/types';

export const tierMappingFeature: FeatureDefinition = {
  id: 'pricing.tier-mapping',
  name: 'Tier Mapping',
  shortName: 'Tier Mapping',
  description: 'Model enterprise graduated volume brackets vs flat rate contracts with revenue forecasting',
  category: 'pricing',
  iconName: 'Layers',
  route: '/pricing/tier-mapping',
  component: TierMappingPage,
  permissions: ['feature:pricing.tier-mapping'],
  enabled: true,
  order: 1,
  tags: ['pricing', 'tiers', 'volume', 'brackets', 'revenue', 'discounts'],
  searchable: true,
};

export default TierMappingPage;
