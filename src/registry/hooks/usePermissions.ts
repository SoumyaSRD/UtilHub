import { useAppDispatch, useAppSelector } from '@app/store';
import { setActiveRole, ROLE_PERMISSIONS, type UserRole } from '@app/store/slices/authSlice';
import { auditService } from '@shared/telemetry/audit';

export const usePermissions = () => {
  const dispatch = useAppDispatch();
  const activeRole = useAppSelector((state) => state.auth.activeRole);
  const user = useAppSelector((state) => state.auth.user);
  const customPermissions = useAppSelector((state) => state.auth.customPermissions);

  const grantedPermissions = [
    ...(ROLE_PERMISSIONS[activeRole] || []),
    ...customPermissions,
  ];

  const isSuperAdmin = grantedPermissions.includes('*');

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return grantedPermissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return activeRole === role;
  };

  const switchRole = (newRole: UserRole) => {
    auditService.record(
      'ROLE_CHANGED',
      user.name,
      newRole,
      { previousRole: activeRole, newRole },
      'SUCCESS'
    );
    dispatch(setActiveRole(newRole));
  };

  return {
    user,
    activeRole,
    grantedPermissions,
    isSuperAdmin,
    hasPermission,
    hasRole,
    switchRole,
  };
};
