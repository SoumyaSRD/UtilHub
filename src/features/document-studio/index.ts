import { lazy } from 'react';
import type { FeatureDefinition } from '@registry/types';

export const documentStudioFeature: FeatureDefinition = {
  id: 'documents.studio',
  name: 'Universal Document & File Studio',
  shortName: 'Document Studio',
  description: 'Dynamic multi-format workstation to view, edit, delete, create, and convert Excel spreadsheets, Word documents, PDFs, Markdown, and Notepad text files.',
  category: 'documents',
  iconName: 'FolderSpecial',
  route: '/documents/studio',
  component: lazy(() => import('./pages/DocumentStudioPage')),
  permissions: ['tools:view'],
  enabled: true,
  order: 1,
  tags: ['excel', 'csv', 'word', 'pdf', 'markdown', 'notepad', 'text', 'editor', 'studio'],
  searchable: true,
  badge: {
    text: 'STUDIO',
    variant: 'new',
  },
};
