import { DuplicateRemoverPage } from './pages/DuplicateRemoverPage';
import type { FeatureDefinition } from '@registry/types';

export const duplicateRemoverFeature: FeatureDefinition = {
  id: 'excel.duplicate-remover',
  name: 'Duplicate Remover',
  shortName: 'Duplicate Remover',
  description: 'Identify and remove duplicate records based on composite column keys',
  category: 'excel',
  iconName: 'ContentCut',
  route: '/excel/duplicate-remover',
  component: DuplicateRemoverPage,
  permissions: ['feature:excel.duplicate-remover'],
  enabled: true,
  order: 2,
  tags: ['excel', 'csv', 'duplicates', 'cleanse', 'unique', 'dedupe'],
  searchable: true,
};

export default DuplicateRemoverPage;
