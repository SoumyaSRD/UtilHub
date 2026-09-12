import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole =
  | 'ADMIN'
  | 'DEVELOPER'
  | 'QA'
  | 'DEVOPS'
  | 'ANALYST'
  | 'SUPPORT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
}

interface AuthState {
  user: UserProfile;
  activeRole: UserRole;
  customPermissions: string[];
}

// Role-to-Permissions Matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    '*', // Full system access
  ],
  DEVELOPER: [
    'category:excel',
    'category:sql',
    'category:text',
    'category:api',
    'feature:excel.column-extractor',
    'feature:excel.duplicate-remover',
    'feature:excel.compare',
    'feature:excel.csv-to-json',
    'feature:sql.in-clause',
    'feature:sql.insert',
    'feature:sql.update',
    'feature:text.json-formatter',
    'feature:text.regex',
    'feature:text.base64',
    'feature:api.jwt-decoder',
    'feature:api.swagger',
    'feature:api.curl',
  ],
  QA: [
    'category:excel',
    'category:text',
    'category:api',
    'feature:excel.column-extractor',
    'feature:excel.duplicate-remover',
    'feature:excel.compare',
    'feature:excel.csv-to-json',
    'feature:text.json-formatter',
    'feature:text.regex',
    'feature:text.base64',
    'feature:api.jwt-decoder',
    'feature:api.swagger',
  ],
  DEVOPS: [
    'category:text',
    'category:api',
    'category:sql',
    'feature:text.json-formatter',
    'feature:text.base64',
    'feature:api.jwt-decoder',
    'feature:api.curl',
    'feature:sql.in-clause',
  ],
  ANALYST: [
    'category:excel',
    'category:pricing',
    'category:text',
    'feature:excel.column-extractor',
    'feature:excel.duplicate-remover',
    'feature:excel.compare',
    'feature:excel.csv-to-json',
    'feature:pricing.tier-mapping',
    'feature:pricing.catalogue-check',
    'feature:pricing.validator',
    'feature:text.json-formatter',
  ],
  SUPPORT: [
    'category:text',
    'category:api',
    'feature:text.json-formatter',
    'feature:text.base64',
    'feature:api.jwt-decoder',
    'feature:pricing.catalogue-check',
  ],
};

const initialState: AuthState = {
  user: {
    id: 'usr_enterprise_01',
    name: 'Alex Mercer',
    email: 'alex.mercer@enterprise.internal',
    title: 'Principal Staff Engineer',
    department: 'Core Infrastructure & Tooling',
  },
  activeRole: 'ADMIN',
  customPermissions: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setActiveRole, updateProfile } = authSlice.actions;

export default authSlice.reducer;
