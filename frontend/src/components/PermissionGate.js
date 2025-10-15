import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';

/**
 * PermissionGate - Conditionally render children based on permissions
 * 
 * Usage:
 * <PermissionGate permission="users.view">
 *   <UserList />
 * </PermissionGate>
 * 
 * <PermissionGate permissions={["users.view", "users.edit"]} requireAll={true}>
 *   <EditUserButton />
 * </PermissionGate>
 * 
 * <PermissionGate role="admin">
 *   <AdminPanel />
 * </PermissionGate>
 */
const PermissionGate = ({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  loading = null
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    loading: permissionsLoading
  } = usePermissions();

  // Show loading state if permissions are still being fetched
  if (permissionsLoading) {
    return loading || null;
  }

  // Check single permission
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback;
    }
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback;
    }
  }

  // Check single role
  if (role) {
    if (!hasRole(role)) {
      return fallback;
    }
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return fallback;
    }
  }

  // User has required permissions/roles, render children
  return <>{children}</>;
};

export default PermissionGate;
