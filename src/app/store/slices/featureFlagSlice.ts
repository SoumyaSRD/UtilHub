import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FeatureFlagsState {
  flags: Record<string, boolean>;
}

const initialState: FeatureFlagsState = {
  flags: {
    'excel.column-extractor': true,
    'excel.duplicate-remover': true,
    'excel.compare': true,
    'excel.csv-to-json': true,
    'sql.in-clause': true,
    'sql.insert': true,
    'sql.update': true,
    'text.json-formatter': true,
    'text.regex': true,
    'text.base64': true,
    'pricing.tier-mapping': true,
    'pricing.catalogue-check': true,
    'pricing.validator': true,
    'api.jwt-decoder': true,
    'api.swagger': true,
    'api.curl': true,
    'admin.users': true,
    'admin.roles': true,
    'admin.audit': true,
    'admin.flags': true,
  },
};

export const featureFlagSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    toggleFlag: (state, action: PayloadAction<string>) => {
      const flag = action.payload;
      state.flags[flag] = !state.flags[flag];
    },
    setFlag: (state, action: PayloadAction<{ flag: string; enabled: boolean }>) => {
      state.flags[action.payload.flag] = action.payload.enabled;
    },
  },
});

export const { toggleFlag, setFlag } = featureFlagSlice.actions;

export default featureFlagSlice.reducer;
