import { SwaggerViewerPage } from './pages/SwaggerViewerPage';
import type { FeatureDefinition } from '@registry/types';

export const swaggerViewerFeature: FeatureDefinition = {
  id: 'api.swagger',
  name: 'Swagger Viewer',
  shortName: 'Swagger / OpenAPI',
  description: 'Inspect internal enterprise microservice contracts and execute test mocks',
  category: 'api',
  iconName: 'Api',
  route: '/api/swagger',
  component: SwaggerViewerPage,
  permissions: ['feature:api.swagger'],
  enabled: true,
  order: 3,
  tags: ['api', 'swagger', 'openapi', 'rest', 'endpoints', 'documentation'],
  searchable: true,
};

export default SwaggerViewerPage;
