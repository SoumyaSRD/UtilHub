import { UpdateGeneratorPage } from './pages/UpdateGeneratorPage';
import type { FeatureDefinition } from '@registry/types';

export const updateGeneratorFeature: FeatureDefinition = {
  id: 'sql.update',
  name: 'UPDATE Generator',
  shortName: 'UPDATE Generator',
  description: 'Generate batch SQL UPDATE statements from CSV records matching specific WHERE keys',
  category: 'sql',
  iconName: 'Update',
  route: '/sql/update',
  component: UpdateGeneratorPage,
  permissions: ['feature:sql.update'],
  enabled: true,
  order: 3,
  tags: ['sql', 'update', 'dml', 'database', 'batch'],
  searchable: true,
};

export default UpdateGeneratorPage;
