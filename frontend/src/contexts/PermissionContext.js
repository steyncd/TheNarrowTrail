import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../services/api';

const PermissionContext = createContext(null);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user permissions when user logs in
  useEffect(() => {
    const fetchPermissions = async () => {
      console.log('🔐 PermissionContext: Checking auth state', {
        hasToken: !!token,
        hasUser: !!currentUser,
        userId: currentUser?.id,
        userEmail: currentUser?.email
      });

      if (!token || !currentUser) {
        console.log('⚠️ PermissionContext: No token or user, skipping fetch');
        setPermissions([]);
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url = `${API_URL}/api/permissions/user/permissions`;
        console.log('🌐 PermissionContext: Fetching from', url);

        const response = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 PermissionContext: Response status', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ PermissionContext: Permissions loaded', {
            permissionsCount: data.permissions?.length || 0,
            rolesCount: data.roles?.length || 0,
            permissions: data.permissions?.map(p => p.name),
            roles: data.roles?.map(r => r.name)
          });
          setPermissions(data.permissions || []);
          setRoles(data.roles || []);
        } else {
          const errorText = await response.text();
          console.error('❌ PermissionContext: Failed to fetch permissions:', response.status, errorText);
          setError('Failed to load permissions');
          setPermissions([]);
          setRoles([]);
        }
      } catch (err) {
        console.error('💥 PermissionContext: Error fetching permissions:', err);
        setError('Error loading permissions');
        setPermissions([]);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [token, currentUser]);

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission name (e.g., 'users.view')
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!permission) return false;
    const result = permissions.some(p => p.name === permission);
    return result;
  };

  /**
   * Check if user has ANY of the specified permissions
   * @param {string[]} permissionList - Array of permission names
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return false;
    return permissionList.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has ALL of the specified permissions
   * @param {string[]} permissionList - Array of permission names
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return false;
    return permissionList.every(permission => hasPermission(permission));
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role name (e.g., 'admin')
   * @returns {boolean}
   */
  const hasRole = (roleName) => {
    if (!roleName) return false;
    return roles.some(r => r.name === roleName);
  };

  /**
   * Check if user has ANY of the specified roles
   * @param {string[]} roleList - Array of role names
   * @returns {boolean}
   */
  const hasAnyRole = (roleList) => {
    if (!roleList || roleList.length === 0) return false;
    return roleList.some(roleName => hasRole(roleName));
  };

  /**
   * Check if user is an admin (has admin role)
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Get permissions by category
   * @param {string} category - Category name
   * @returns {array} - Array of permissions in that category
   */
  const getPermissionsByCategory = (category) => {
    if (!category) return [];
    return permissions.filter(p => p.category === category);
  };

  /**
   * Get all permission categories
   * @returns {array} - Array of unique category names
   */
  const getCategories = () => {
    return [...new Set(permissions.map(p => p.category))];
  };

  const value = {
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
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
