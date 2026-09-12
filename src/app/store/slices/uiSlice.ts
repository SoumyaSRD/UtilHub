import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastNotification {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  auditDrawerOpen: boolean;
  activeToast: ToastNotification | null;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandPaletteOpen: false,
  auditDrawerOpen: false,
  activeToast: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    setAuditDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.auditDrawerOpen = action.payload;
    },
    showToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'> & { id?: string }>) => {
      state.activeToast = {
        id: action.payload.id ?? Math.random().toString(36).substring(2, 9),
        message: action.payload.message,
        severity: action.payload.severity,
        duration: action.payload.duration ?? 4000,
      };
    },
    hideToast: (state) => {
      state.activeToast = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setMobileNavOpen,
  setCommandPaletteOpen,
  setAuditDrawerOpen,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
