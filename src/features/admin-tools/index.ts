import { AdminPage } from './pages/AdminPage';
import type { FeatureDefinition } from '@registry/types';

export const adminFeature: FeatureDefinition = {
  id: 'admin.hub',
  name: 'Platform Administration',
  shortName: 'Admin Governance',
  description: 'Manage runtime feature flags, inspect role permissions matrices, and audit system activity logs',
  category: 'admin',
  iconName: 'AdminPanelSettings',
  route: '/admin',
  component: AdminPage,
  permissions: ['feature:admin.users', 'category:admin'],
  enabled: true,
  order: 1,
  tags: ['admin', 'roles', 'permissions', 'feature flags', 'audit', 'governance'],
  searchable: true,
};

export default AdminPage;
