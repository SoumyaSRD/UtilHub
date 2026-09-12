import { TabularViewerPage } from './pages/TabularViewerPage';
import type { FeatureDefinition } from '@registry/types';

export const tabularViewerFeature: FeatureDefinition = {
  id: 'excel.tabular-viewer',
  name: 'Excel Tabular Viewer',
  shortName: 'Tabular Viewer',
  description: 'Dynamic spreadsheet viewer with 100k+ virtual scroll, multi-sheet tabs, null column remover, and versatile exports',
  category: 'excel',
  iconName: 'TableChart',
  route: '/excel/tabular-viewer',
  component: TabularViewerPage,
  permissions: ['feature:excel.tabular-viewer'],
  enabled: true,
  order: 1, // Featured at the top of Excel tools
  tags: ['excel', 'csv', 'sheets', 'tabs', 'viewer', '100k', 'scroll', 'null-column-remover', 'export', 'table'],
  searchable: true,
  badge: {
    text: '100k+ Tabs',
    variant: 'new',
  },
};

export default TabularViewerPage;
