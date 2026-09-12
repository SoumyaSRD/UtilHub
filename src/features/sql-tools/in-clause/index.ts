import { InClausePage } from './pages/InClausePage';
import type { FeatureDefinition } from '@registry/types';

export const inClauseFeature: FeatureDefinition = {
  id: 'sql.in-clause',
  name: 'IN Clause Generator',
  shortName: 'IN Clause',
  description: 'Convert raw lists of IDs and strings into sanitized SQL IN clauses',
  category: 'sql',
  iconName: 'FilterList',
  route: '/sql/in-clause',
  component: InClausePage,
  permissions: ['feature:sql.in-clause'],
  enabled: true,
  order: 1,
  tags: ['sql', 'in', 'clause', 'query', 'database', 'filter'],
  searchable: true,
};

export default InClausePage;
