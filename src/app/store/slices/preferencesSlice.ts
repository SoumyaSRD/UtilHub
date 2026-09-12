import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@theme/types';

interface RecentTool {
  toolId: string;
  timestamp: string;
}

interface PreferencesState {
  themeMode: ThemeMode;
  favorites: string[];
  recentlyUsed: RecentTool[];
  tableDensity: 'compact' | 'standard' | 'comfortable';
}

const PREF_STORAGE_KEY = 'utilityhub_user_preferences';

const loadPreferences = (): PreferencesState => {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    themeMode: 'dark',
    favorites: ['excel.column-extractor', 'sql.in-clause', 'text.json-formatter'],
    recentlyUsed: [],
    tableDensity: 'standard',
  };
};

const initialState: PreferencesState = loadPreferences();

const persist = (state: PreferencesState) => {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(state));
    document.documentElement.setAttribute('data-theme', state.themeMode);
  } catch {
    // ignore
  }
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      persist(state);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((fav) => fav !== id);
      } else {
        state.favorites.push(id);
      }
      persist(state);
    },
    recordToolUsage: (state, action: PayloadAction<string>) => {
      const toolId = action.payload;
      state.recentlyUsed = [
        { toolId, timestamp: new Date().toISOString() },
        ...state.recentlyUsed.filter((r) => r.toolId !== toolId),
      ].slice(0, 10);
      persist(state);
    },
    setTableDensity: (state, action: PayloadAction<'compact' | 'standard' | 'comfortable'>) => {
      state.tableDensity = action.payload;
      persist(state);
    },
  },
});

export const { setThemeMode, toggleFavorite, recordToolUsage, setTableDensity } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;
