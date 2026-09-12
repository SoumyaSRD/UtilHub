import { RegexTesterPage } from './pages/RegexTesterPage';
import type { FeatureDefinition } from '@registry/types';

export const regexTesterFeature: FeatureDefinition = {
  id: 'text.regex',
  name: 'Regex Tester',
  shortName: 'Regex Tester',
  description: 'Test, debug, and extract capture groups from regular expressions with presets',
  category: 'text',
  iconName: 'FindReplace',
  route: '/text/regex',
  component: RegexTesterPage,
  permissions: ['feature:text.regex'],
  enabled: true,
  order: 2,
  tags: ['regex', 'pattern', 'test', 'match', 'extract', 'regex101'],
  searchable: true,
};

export default RegexTesterPage;
