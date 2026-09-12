export type ThemeMode =
  | 'light'
  | 'dark'
  | 'enterprise-blue'
  | 'enterprise-green'
  | 'high-contrast';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  isDark: boolean;
  accentColor: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'light',
    name: 'Enterprise Slate',
    description: 'Clean, high-clarity neutral theme for standard office lighting',
    isDark: false,
    accentColor: '#1976d2',
  },
  {
    id: 'dark',
    name: 'Obsidian Night',
    description: 'Ultra dark low-eye-strain theme for engineering power users',
    isDark: true,
    accentColor: '#3b82f6',
  },
  {
    id: 'enterprise-blue',
    name: 'Corporate Cobalt',
    description: 'Signature corporate aesthetic for dense analytics and data grids',
    isDark: false,
    accentColor: '#0284c7',
  },
  {
    id: 'enterprise-green',
    name: 'Financial Emerald',
    description: 'Operations & pricing theme with high contrast emerald accents',
    isDark: false,
    accentColor: '#059669',
  },
  {
    id: 'high-contrast',
    name: 'Accessibility AAA',
    description: 'Maximum contrast borders and stark typography (WCAG AAA)',
    isDark: false,
    accentColor: '#0000ee',
  },
];
