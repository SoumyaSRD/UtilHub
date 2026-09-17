import { lazy } from 'react';
import type { FeatureDefinition } from '@registry/types';

export const notesCreatorFeature: FeatureDefinition = {
  id: 'documents.notes-creator',
  name: 'Tree-Structured Notes & OneNote Creator',
  shortName: 'Notes Studio',
  description:
    'Feature-rich Microsoft OneNote and Sticky Notes creator with hierarchical tree structure, interactive checklists, markdown preview, local storage persistence, and OneNote HTML/JSON export.',
  category: 'documents',
  iconName: 'NoteAlt',
  route: '/documents/notes',
  component: lazy(() => import('./pages/NotesCreatorPage')),
  permissions: ['tools:view'],
  enabled: true,
  order: 2,
  tags: [
    'notes',
    'onenote',
    'tree',
    'microsoft',
    'sticky-notes',
    'checklist',
    'markdown',
    'export',
    'localstorage',
  ],
  searchable: true,
  badge: {
    text: 'NEW',
    variant: 'new',
  },
};
