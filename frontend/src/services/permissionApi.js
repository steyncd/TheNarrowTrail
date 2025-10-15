import { API_URL } from './api';

/**
 * Permission API Service
 * Handles all permission-related API calls
 */
class PermissionService {
  /**
   * Get current user's permissions
   * @param {string} token - JWT token
   * @returns {Promise} - User permissions and roles
   */
  static async getUserPermissions(token) {
    const response = await fetch(`${API_URL}/api/permissions/user/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    return response.json();
  }

  /**
   * Get all available permissions (admin only)
   * @param {string} token - JWT token
   * @returns {Promise} - All permissions
   */
  static async getAllPermissions(token) {
    const response = await fetch(`${API_URL}/api/permissions/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    return response.json();
  }

  /**
   * Get permissions by category (admin only)
   * @param {string} token - JWT token
   * @param {string} category - Category name
   * @returns {Promise} - Permissions in category
   */
  static async getPermissionsByCategory(token, category) {
    const response = await fetch(`${API_URL}/api/permissions/permissions/category/${category}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions by category');
    }

    return response.json();
  }

  /**
   * Get all roles (admin only)
   * @param {string} token - JWT token
   * @returns {Promise} - All roles with permissions
   */
  static async getAllRoles(token) {
    const response = await fetch(`${API_URL}/api/permissions/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    return response.json();
  }

  /**
   * Get specific role by ID (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @returns {Promise} - Role details with permissions
   */
  static async getRoleById(token, roleId) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }

    return response.json();
  }

  /**
   * Assign role to user (admin only)
   * @param {string} token - JWT token
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise} - Success response
   */
  static async assignRole(token, userId, roleId) {
    const response = await fetch(`${API_URL}/api/permissions/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roleId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign role');
    }

    return response.json();
  }

  /**
   * Remove role from user (admin only)
   * @param {string} token - JWT token
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise} - Success response
   */
  static async removeRole(token, userId, roleId) {
    const response = await fetch(`${API_URL}/api/permissions/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove role');
    }

    return response.json();
  }

  /**
   * Get user's roles (admin only)
   * @param {string} token - JWT token
   * @param {number} userId - User ID
   * @returns {Promise} - User's roles
   */
  static async getUserRoles(token, userId) {
    const response = await fetch(`${API_URL}/api/permissions/users/${userId}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }

    return response.json();
  }

  /**
   * Assign permission to role (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @param {number} permissionId - Permission ID
   * @returns {Promise} - Success response
   */
  static async assignPermissionToRole(token, roleId, permissionId) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ permissionId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign permission to role');
    }

    return response.json();
  }

  /**
   * Remove permission from role (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @param {number} permissionId - Permission ID
   * @returns {Promise} - Success response
   */
  static async removePermissionFromRole(token, roleId, permissionId) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove permission from role');
    }

    return response.json();
  }

  /**
   * Clone role (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Source role ID to clone
   * @param {string} name - New role name
   * @param {string} description - New role description (optional)
   * @returns {Promise} - New role details
   */
  static async cloneRole(token, roleId, name, description) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}/clone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clone role');
    }

    return response.json();
  }

  /**
   * Rename role (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @param {string} name - New role name
   * @returns {Promise} - Success response
   */
  static async renameRole(token, roleId, name) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}/rename`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rename role');
    }

    return response.json();
  }

  /**
   * Check if role can be deleted (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @returns {Promise} - Can delete status with reason
   */
  static async checkRoleDeletion(token, roleId) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}/can-delete`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check role deletion status');
    }

    return response.json();
  }

  /**
   * Delete role (admin only)
   * @param {string} token - JWT token
   * @param {number} roleId - Role ID
   * @returns {Promise} - Success response
   */
  static async deleteRole(token, roleId) {
    const response = await fetch(`${API_URL}/api/permissions/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete role');
    }

    return response.json();
  }
}

export default PermissionService;
