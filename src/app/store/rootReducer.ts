import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import preferencesReducer from './slices/preferencesSlice';
import authReducer from './slices/authSlice';
import featureFlagReducer from './slices/featureFlagSlice';

export const rootReducer = combineReducers({
  ui: uiReducer,
  preferences: preferencesReducer,
  auth: authReducer,
  featureFlags: featureFlagReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
