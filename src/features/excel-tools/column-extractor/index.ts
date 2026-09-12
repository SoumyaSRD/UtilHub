import { ColumnExtractorPage } from './pages/ColumnExtractorPage';
import type { FeatureDefinition } from '@registry/types';

export const columnExtractorFeature: FeatureDefinition = {
  id: 'excel.column-extractor',
  name: 'Column Extractor',
  shortName: 'Column Extractor',
  description: 'Extract and isolate selected columns from Excel and CSV spreadsheets',
  category: 'excel',
  iconName: 'ViewColumn',
  route: '/excel/column-extractor',
  component: ColumnExtractorPage,
  permissions: ['feature:excel.column-extractor'],
  enabled: true,
  order: 1,
  tags: ['excel', 'csv', 'columns', 'filter', 'isolate', 'export', 'spreadsheet'],
  searchable: true,
  badge: {
    text: 'Popular',
    variant: 'new',
  },
};

export default ColumnExtractorPage;
