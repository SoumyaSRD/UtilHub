import type { CategoryDefinition, ToolCategoryId } from './types';

export const CATEGORIES: Record<ToolCategoryId, CategoryDefinition> = {
  dashboard: {
    id: 'dashboard',
    title: 'Platform Hub',
    description: 'Central overview, quick launchpad, and engineering activity',
    iconName: 'Dashboard',
    order: 1,
  },
  documents: {
    id: 'documents',
    title: 'Document & File Studio',
    description: 'Dynamic workstation to create, view, edit, delete, and convert Excel, Word, PDF, Markdown, and Text files',
    iconName: 'FolderSpecial',
    order: 2,
  },
  excel: {
    id: 'excel',
    title: 'Excel & CSV Tools',
    description: 'Data cleansing, deduplication, column extraction, and spreadsheet comparison',
    iconName: 'TableChart',
    order: 3,
  },
  sql: {
    id: 'sql',
    title: 'SQL Tools',
    description: 'Query helpers, IN-clause builders, and bulk DML statement generators',
    iconName: 'Storage',
    order: 3,
  },
  text: {
    id: 'text',
    title: 'Text Tools',
    description: 'JSON formatters, regex analyzers, string diffs, and cryptographic decoders',
    iconName: 'Code',
    order: 4,
  },
  pricing: {
    id: 'pricing',
    title: 'Pricing Tools',
    description: 'Tier rule mappings, catalogue validation, and financial rate models',
    iconName: 'MonetizationOn',
    order: 5,
  },
  api: {
    id: 'api',
    title: 'API Tools',
    description: 'JWT inspection, OpenAPI specifications, and cURL payload generators',
    iconName: 'Http',
    order: 6,
  },
  admin: {
    id: 'admin',
    title: 'Platform Admin',
    description: 'Role access, permission audit trails, and feature flag management',
    iconName: 'AdminPanelSettings',
    order: 7,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES).sort((a, b) => a.order - b.order);
