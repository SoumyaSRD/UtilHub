import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@app/store';
import { toggleFavorite } from '@app/store/slices/preferencesSlice';
import { featureRegistry } from '../featureRegistry';
import { CATEGORY_LIST } from '../categories';
import { usePermissions } from './usePermissions';
import type { FeatureDefinition, CategoryDefinition } from '../types';

export interface CategoryWithFeatures {
  category: CategoryDefinition;
  features: FeatureDefinition[];
}

export const useNavigation = () => {
  const dispatch = useAppDispatch();
  const { grantedPermissions } = usePermissions();
  const flags = useAppSelector((state) => state.featureFlags.flags);
  const favoriteIds = useAppSelector((state) => state.preferences.favorites);
  const recentHistory = useAppSelector((state) => state.preferences.recentlyUsed);

  // Filter accessible features
  const availableFeatures = useMemo(() => {
    return featureRegistry.getAvailable(grantedPermissions, flags);
  }, [grantedPermissions, flags]);

  // Group by category
  const categoriesWithFeatures: CategoryWithFeatures[] = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const feats = availableFeatures.filter((f) => f.category === cat.id);
      return {
        category: cat,
        features: feats,
      };
    }).filter((group) => group.features.length > 0);
  }, [availableFeatures]);

  // Favorites that are currently accessible
  const favorites: FeatureDefinition[] = useMemo(() => {
    return favoriteIds
      .map((id) => availableFeatures.find((f) => f.id === id))
      .filter((f): f is FeatureDefinition => f !== undefined);
  }, [favoriteIds, availableFeatures]);

  // Recently used tools that are currently accessible
  const recentlyUsed: FeatureDefinition[] = useMemo(() => {
    return recentHistory
      .map((r) => availableFeatures.find((f) => f.id === r.toolId))
      .filter((f): f is FeatureDefinition => f !== undefined);
  }, [recentHistory, availableFeatures]);

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavorite(toolId));
  };

  return {
    availableFeatures,
    categoriesWithFeatures,
    favorites,
    recentlyUsed,
    favoriteIds,
    toggleFavorite: handleToggleFavorite,
  };
};
