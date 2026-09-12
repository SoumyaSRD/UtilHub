import { DashboardPage } from './pages/DashboardPage';
import type { FeatureDefinition } from '@registry/types';

export const dashboardFeature: FeatureDefinition = {
  id: 'dashboard',
  name: 'Platform Overview',
  shortName: 'Overview',
  description: 'Enterprise productivity hub overview, KPI statistics, and quick launcher',
  category: 'dashboard',
  iconName: 'Dashboard',
  route: '/dashboard',
  component: DashboardPage,
  permissions: [],
  enabled: true,
  order: 1,
  tags: ['home', 'overview', 'stats', 'launchpad'],
  searchable: true,
};

export default DashboardPage;
