import { usePermissions } from '../contexts/PermissionContext';

/**
 * Custom hook for permission checks
 * Provides easy-to-use functions for checking permissions
 * 
 * Usage:
 * const { can, canAny, canAll, isAdmin, hasRole } = usePermission();
 * 
 * if (can('users.edit')) {
 *   // Show edit button
 * }
 * 
 * if (canAny(['users.view', 'users.edit'])) {
 *   // Show user management section
 * }
 */
const usePermission = () => {
  const {
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    getPermissionsByCategory,
    getCategories
  } = usePermissions();

  // Debug logging
  console.log('🔑 usePermission hook called', {
    permissionsCount: permissions?.length || 0,
    rolesCount: roles?.length || 0,
    loading,
    error,
    isAdmin: isAdmin(),
    permissions: permissions?.map(p => p.name)
  });

  /**
   * Shorthand for hasPermission
   */
  const can = (permission) => hasPermission(permission);

  /**
   * Shorthand for hasAnyPermission
   */
  const canAny = (permissionList) => hasAnyPermission(permissionList);

  /**
   * Shorthand for hasAllPermissions
   */
  const canAll = (permissionList) => hasAllPermissions(permissionList);

  /**
   * Check if user cannot perform an action (opposite of can)
   */
  const cannot = (permission) => !hasPermission(permission);

  return {
    // Permission data
    permissions,
    roles,
    loading,
    error,

    // Permission check functions
    can,
    canAny,
    canAll,
    cannot,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role check functions
    hasRole,
    hasAnyRole,
    isAdmin,

    // Utility functions
    getPermissionsByCategory,
    getCategories
  };
};

export default usePermission;
