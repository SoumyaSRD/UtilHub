import { PricingValidatorPage } from './pages/PricingValidatorPage';
import type { FeatureDefinition } from '@registry/types';

export const pricingValidatorFeature: FeatureDefinition = {
  id: 'pricing.validator',
  name: 'Pricing Validator',
  shortName: 'Pricing Validator',
  description: 'Evaluate deal profitability, discount ceilings, and gross margin compliance',
  category: 'pricing',
  iconName: 'Rule',
  route: '/pricing/validator',
  component: PricingValidatorPage,
  permissions: ['feature:pricing.validator'],
  enabled: true,
  order: 3,
  tags: ['pricing', 'margin', 'discount', 'approval', 'governance'],
  searchable: true,
};

export default PricingValidatorPage;
