export type ThemeMode =
  | 'solo-leveling'
  | 'dark'
  | 'cyberpunk-neon'
  | 'dracula'
  | 'tokyo-sunset'
  | 'nordic-frost'
  | 'light'
  | 'enterprise-blue'
  | 'enterprise-green'
  | 'high-contrast';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  isDark: boolean;
  accentColor: string;
  badge?: string;
  secondaryAccent?: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  {
    id: 'solo-leveling',
    name: 'Solo Leveling',
    description: 'Shadow Monarch aesthetic: electric necromancy blue, abyss void & monarch aura',
    isDark: true,
    accentColor: '#00e5ff',
    secondaryAccent: '#8b5cf6',
    badge: 'ARISE',
  },
  {
    id: 'dark',
    name: 'Obsidian Night',
    description: 'Ultra dark low-eye-strain theme for engineering power users',
    isDark: true,
    accentColor: '#3b82f6',
    badge: 'DEFAULT',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Electric synthwave high-energy theme with neon cyan & magenta accents',
    isDark: true,
    accentColor: '#00f0ff',
    badge: 'NEW',
  },
  {
    id: 'dracula',
    name: 'Dracula Pro',
    description: 'The iconic gothic vampire palette with vivid purple and pink highlights',
    isDark: true,
    accentColor: '#bd93f9',
    badge: 'POPULAR',
  },
  {
    id: 'tokyo-sunset',
    name: 'Tokyo Sunset',
    description: 'Twilight neon nightscape with sunset amber and sakura pink glow',
    isDark: true,
    accentColor: '#ff9e64',
    badge: 'TRENDING',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Serene Arctic polar night slate with crystalline frost-blue accents',
    isDark: true,
    accentColor: '#88c0d0',
    badge: 'CLEAN',
  },
  {
    id: 'dark',
    name: 'Obsidian Night',
    description: 'Ultra dark low-eye-strain theme for engineering power users',
    isDark: true,
    accentColor: '#3b82f6',
  },
  {
    id: 'light',
    name: 'Enterprise Slate',
    description: 'Clean, high-clarity neutral theme for standard office lighting',
    isDark: false,
    accentColor: '#1976d2',
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

export const isDarkTheme = (mode: ThemeMode): boolean => {
  const found = AVAILABLE_THEMES.find((t) => t.id === mode);
  return found ? found.isDark : true;
};

