import { Base64Page } from './pages/Base64Page';
import type { FeatureDefinition } from '@registry/types';

export const base64Feature: FeatureDefinition = {
  id: 'text.base64',
  name: 'Base64 Converter',
  shortName: 'Base64',
  description: 'Encode and decode strings using Base64 and URL encoding with UTF-8 safety',
  category: 'text',
  iconName: 'EnhancedEncryption',
  route: '/text/base64',
  component: Base64Page,
  permissions: ['feature:text.base64'],
  enabled: true,
  order: 3,
  tags: ['base64', 'encode', 'decode', 'url', 'crypto', 'string'],
  searchable: true,
};

export default Base64Page;
