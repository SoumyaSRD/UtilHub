import { CurlGeneratorPage } from './pages/CurlGeneratorPage';
import type { FeatureDefinition } from '@registry/types';

export const curlGeneratorFeature: FeatureDefinition = {
  id: 'api.curl',
  name: 'cURL Generator',
  shortName: 'cURL Generator',
  description: 'Assemble authenticated cURL commands with headers and payloads for terminal execution',
  category: 'api',
  iconName: 'Terminal',
  route: '/api/curl',
  component: CurlGeneratorPage,
  permissions: ['feature:api.curl'],
  enabled: true,
  order: 2,
  tags: ['api', 'curl', 'http', 'request', 'terminal', 'bash'],
  searchable: true,
};

export default CurlGeneratorPage;
