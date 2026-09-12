import { CsvToJsonPage } from './pages/CsvToJsonPage';
import type { FeatureDefinition } from '@registry/types';

export const csvToJsonFeature: FeatureDefinition = {
  id: 'excel.csv-to-json',
  name: 'CSV to JSON',
  shortName: 'CSV to JSON',
  description: 'Convert CSV/TSV spreadsheets into JSON arrays with automatic type inference',
  category: 'excel',
  iconName: 'Transform',
  route: '/excel/csv-to-json',
  component: CsvToJsonPage,
  permissions: ['feature:excel.csv-to-json'],
  enabled: true,
  order: 4,
  tags: ['csv', 'json', 'transform', 'convert', 'parser'],
  searchable: true,
};

export default CsvToJsonPage;
