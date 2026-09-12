import { JwtDecoderPage } from './pages/JwtDecoderPage';
import type { FeatureDefinition } from '@registry/types';

export const jwtDecoderFeature: FeatureDefinition = {
  id: 'api.jwt-decoder',
  name: 'JWT Decoder',
  shortName: 'JWT Decoder',
  description: 'Locally inspect claims, headers, and expiration dates of JSON Web Tokens',
  category: 'api',
  iconName: 'Token',
  route: '/api/jwt-decoder',
  component: JwtDecoderPage,
  permissions: ['feature:api.jwt-decoder'],
  enabled: true,
  order: 1,
  tags: ['jwt', 'token', 'auth', 'claims', 'security', 'decode'],
  searchable: true,
  badge: {
    text: 'Client Only',
    variant: 'new',
  },
};

export default JwtDecoderPage;
