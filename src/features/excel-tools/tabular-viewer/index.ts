import { TabularViewerPage } from './pages/TabularViewerPage';
import type { FeatureDefinition } from '@registry/types';

export const tabularViewerFeature: FeatureDefinition = {
  id: 'excel.tabular-viewer',
  name: 'Excel & CSV Tabular Viewer',
  shortName: 'Tabular Viewer',
  description: 'Dynamic spreadsheet & CSV viewer with 100k+ virtual scroll, multi-sheet/file tabs, null column remover, and versatile exports',
  category: 'excel',
  iconName: 'TableChart',
  route: '/excel/tabular-viewer',
  component: TabularViewerPage,
  permissions: ['feature:excel.tabular-viewer'],
  enabled: true,
  order: 1, // Top utility in Excel & CSV Tools
  tags: ['excel', 'csv', 'sheets', 'tabs', 'viewer', '100k', 'scroll', 'null-column-remover', 'export', 'table', 'tsv'],
  searchable: true,
  badge: {
    text: 'Excel & CSV',
    variant: 'new',
  },
};

export default TabularViewerPage;
