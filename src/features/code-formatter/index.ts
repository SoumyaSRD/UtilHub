import { lazy } from 'react';
import type { FeatureDefinition } from '@registry/types';

export const codeFormatterFeature: FeatureDefinition = {
  id: 'text.code-formatter',
  name: 'Multi-Language Code & SQL Formatter',
  shortName: 'Code Formatter',
  description: 'Beautify, minify, repair, and convert SQL, JSON, TypeScript, HTML, and CSS with advanced dialect and casing options.',
  category: 'text',
  iconName: 'Code',
  route: '/text/formatter',
  component: lazy(() => import('./pages/CodeFormatterPage')),
  permissions: ['tools:view'],
  enabled: true,
  order: 1,
  tags: ['sql', 'json', 'formatter', 'beautify', 'minify', 'typescript', 'xml', 'html', 'css'],
  searchable: true,
  badge: {
    text: 'NEW',
    variant: 'new',
  },
};
