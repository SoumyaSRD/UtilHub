import { CatalogueCheckPage } from './pages/CatalogueCheckPage';
import type { FeatureDefinition } from '@registry/types';

export const catalogueCheckFeature: FeatureDefinition = {
  id: 'pricing.catalogue-check',
  name: 'Catalogue Check',
  shortName: 'Catalogue Check',
  description: 'Audit product catalogue integrity, detect negative pricing, and ensure currency validity',
  category: 'pricing',
  iconName: 'FactCheck',
  route: '/pricing/catalogue-check',
  component: CatalogueCheckPage,
  permissions: ['feature:pricing.catalogue-check'],
  enabled: true,
  order: 2,
  tags: ['pricing', 'catalogue', 'audit', 'sku', 'currency', 'integrity'],
  searchable: true,
};

export default CatalogueCheckPage;
