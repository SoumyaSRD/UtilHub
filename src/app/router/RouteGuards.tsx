import React, { useEffect, Suspense } from 'react';
import { usePermissions } from '@registry/hooks/usePermissions';
import { useAppSelector, useAppDispatch } from '@app/store';
import { recordToolUsage } from '@app/store/slices/preferencesSlice';
import { AppErrorState } from '@shared/components/AppErrorState/AppErrorState';
import { AppLoading } from '@shared/components/AppLoading/AppLoading';
import { auditService } from '@shared/telemetry/audit';
import type { FeatureDefinition } from '@registry/types';

interface ProtectedFeatureRouteProps {
  feature: FeatureDefinition;
}

export const ProtectedFeatureRoute: React.FC<ProtectedFeatureRouteProps> = ({ feature }) => {
  const dispatch = useAppDispatch();
  const { user, grantedPermissions, isSuperAdmin } = usePermissions();
  const flags = useAppSelector((state) => state.featureFlags.flags);

  // 1. Check Feature Flag
  const isEnabled = flags[feature.id] !== false;

  // 2. Check Permissions
  const hasAccess =
    isSuperAdmin ||
    feature.permissions.length === 0 ||
    feature.permissions.some(
      (p) =>
        grantedPermissions.includes(p) ||
        grantedPermissions.includes(`category:${feature.category}`)
    );

  useEffect(() => {
    if (isEnabled && hasAccess) {
      dispatch(recordToolUsage(feature.id));
      auditService.record('TOOL_EXECUTED', user.name, feature.id, {
        toolName: feature.name,
        category: feature.category,
      });
    } else if (!hasAccess) {
      auditService.record(
        'PERMISSION_DENIED',
        user.name,
        feature.id,
        { toolName: feature.name },
        'WARNING'
      );
    }
  }, [feature.id, isEnabled, hasAccess, dispatch, user.name, feature.name, feature.category]);

  if (!isEnabled) {
    return (
      <AppErrorState
        variant="notfound"
        title="Utility Feature Disabled"
        message={`The utility "${feature.name}" is currently disabled in the platform feature flags configuration.`}
      />
    );
  }

  if (!hasAccess) {
    return (
      <AppErrorState
        variant="unauthorized"
        title="Access Restricted"
        message={`Your active role does not possess the permissions (${feature.permissions.join(
          ', '
        )}) required to access "${feature.name}". Switch roles via the top header to evaluate RBAC.`}
      />
    );
  }

  const Component = feature.component;

  return (
    <Suspense fallback={<AppLoading variant="page" message={`Loading ${feature.name}...`} />}>
      <Component />
    </Suspense>
  );
};
