import type React from 'react';

export type ToolCategoryId =
  | 'dashboard'
  | 'excel'
  | 'sql'
  | 'text'
  | 'pricing'
  | 'api'
  | 'admin';

export interface CategoryDefinition {
  id: ToolCategoryId;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export interface FeatureBadge {
  text: string;
  variant: 'new' | 'beta' | 'updated';
}

export interface FeatureDefinition {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  category: ToolCategoryId;
  iconName: string;
  route: string;
  component: React.ComponentType;
  permissions: string[];
  enabled: boolean;
  order: number;
  tags: string[];
  searchable: boolean;
  documentationUrl?: string;
  badge?: FeatureBadge;
}
