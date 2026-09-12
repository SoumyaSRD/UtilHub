import { InsertGeneratorPage } from './pages/InsertGeneratorPage';
import type { FeatureDefinition } from '@registry/types';

export const insertGeneratorFeature: FeatureDefinition = {
  id: 'sql.insert',
  name: 'INSERT Generator',
  shortName: 'INSERT Generator',
  description: 'Generate multi-row SQL INSERT statements from CSV and spreadsheet rows',
  category: 'sql',
  iconName: 'PlaylistAdd',
  route: '/sql/insert',
  component: InsertGeneratorPage,
  permissions: ['feature:sql.insert'],
  enabled: true,
  order: 2,
  tags: ['sql', 'insert', 'dml', 'database', 'bulk'],
  searchable: true,
};

export default InsertGeneratorPage;
