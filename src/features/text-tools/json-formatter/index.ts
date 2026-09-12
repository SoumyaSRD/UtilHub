import { JsonFormatterPage } from './pages/JsonFormatterPage';
import type { FeatureDefinition } from '@registry/types';

export const jsonFormatterFeature: FeatureDefinition = {
  id: 'text.json-formatter',
  name: 'JSON Formatter',
  shortName: 'JSON Formatter',
  description: 'Beautify, minify, sort keys, and validate JSON payloads with syntax highlighting',
  category: 'text',
  iconName: 'DataObject',
  route: '/text/json-formatter',
  component: JsonFormatterPage,
  permissions: ['feature:text.json-formatter'],
  enabled: true,
  order: 1,
  tags: ['json', 'format', 'beautify', 'minify', 'validate', 'syntax'],
  searchable: true,
  badge: {
    text: 'Popular',
    variant: 'new',
  },
};

export default JsonFormatterPage;
