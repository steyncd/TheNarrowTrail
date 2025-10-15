// routes/permissions.js - Permission and role management routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  requirePermission, 
  requireAnyPermission 
} = require('../middleware/permissions');
const permissionController = require('../controllers/permissionController');

// ========================================
// Permission Routes
// ========================================

// Get all permissions (grouped or flat)
router.get(
  '/permissions',
  authenticateToken,
  requireAnyPermission(['users.view', 'settings.view']),
  permissionController.getAllPermissions
);

// Get permissions grouped by category
router.get(
  '/permissions/by-category',
  authenticateToken,
  requireAnyPermission(['users.view', 'settings.view']),
  permissionController.getPermissionsByCategory
);

// Get permission statistics
router.get(
  '/permissions/stats',
  authenticateToken,
  requirePermission('users.view'),
  permissionController.getPermissionStats
);

// ========================================
// Role Routes
// ========================================

// Get all roles
router.get(
  '/roles',
  authenticateToken,
  requireAnyPermission(['users.view', 'users.manage_roles']),
  permissionController.getAllRoles
);

// Get specific role with permissions
router.get(
  '/roles/:id',
  authenticateToken,
  requireAnyPermission(['users.view', 'users.manage_roles']),
  permissionController.getRoleById
);

// Create new role
router.post(
  '/roles',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.createRole
);

// Update role
router.put(
  '/roles/:id',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.updateRole
);

// Delete role
router.delete(
  '/roles/:id',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.deleteRole
);

// Assign permission to role
router.post(
  '/roles/:roleId/permissions',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.assignPermissionToRole
);

// Remove permission from role
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.removePermissionFromRole
);

// Clone role (create copy with same permissions)
router.post(
  '/roles/:roleId/clone',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.cloneRole
);

// Rename role (with uniqueness check)
router.patch(
  '/roles/:id/rename',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.renameRole
);

// Check if role can be deleted (no users linked)
router.get(
  '/roles/:id/can-delete',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.checkRoleDeletion
);

// ========================================
// User Permission Routes
// ========================================

// Get current user's permissions
router.get(
  '/user/permissions',
  authenticateToken,
  permissionController.getUserPermissions
);

// Get specific user's permissions
router.get(
  '/users/:userId/permissions',
  authenticateToken,
  requirePermission('users.view'),
  permissionController.getUserPermissions
);

// Get user's roles
router.get(
  '/users/:userId/roles',
  authenticateToken,
  requireAnyPermission(['users.view', 'users.manage_roles']),
  permissionController.getUserRoles
);

// Assign role to user
router.post(
  '/users/:userId/roles',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.assignRoleToUser
);

// Remove role from user
router.delete(
  '/users/:userId/roles/:roleId',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.removeRoleFromUser
);

// Legacy endpoints (deprecated, but kept for backward compatibility)
router.post(
  '/users/assign-role',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.assignRoleToUser
);

router.post(
  '/users/remove-role',
  authenticateToken,
  requirePermission('users.manage_roles'),
  permissionController.removeRoleFromUser
);

module.exports = router;
