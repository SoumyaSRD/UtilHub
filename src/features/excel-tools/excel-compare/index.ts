import { ExcelComparePage } from './pages/ExcelComparePage';
import type { FeatureDefinition } from '@registry/types';

export const excelCompareFeature: FeatureDefinition = {
  id: 'excel.compare',
  name: 'Excel Compare',
  shortName: 'Excel Compare',
  description: 'Diff two spreadsheets by primary key to highlight modified, added, and dropped cells',
  category: 'excel',
  iconName: 'CompareArrows',
  route: '/excel/compare',
  component: ExcelComparePage,
  permissions: ['feature:excel.compare'],
  enabled: true,
  order: 3,
  tags: ['excel', 'diff', 'compare', 'reconciliation', 'delta'],
  searchable: true,
};

export default ExcelComparePage;
