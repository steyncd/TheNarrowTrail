// middleware/permissions.js - Permission middleware for granular access control
const pool = require('../config/database');

/**
 * Check if a user has a specific permission
 * @param {number} userId - User ID
 * @param {string} permissionName - Permission name (e.g., 'users.view')
 * @returns {Promise<boolean>} - True if user has permission
 */
async function hasPermission(userId, permissionName) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND p.name = $2`,
      [userId, permissionName]
    );
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if a user has ANY of the specified permissions
 * @param {number} userId - User ID
 * @param {string[]} permissionNames - Array of permission names
 * @returns {Promise<boolean>} - True if user has at least one permission
 */
async function hasAnyPermission(userId, permissionNames) {
  try {
    console.log(`[hasAnyPermission] Checking user ${userId} for permissions:`, permissionNames);
    
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND p.name = ANY($2)`,
      [userId, permissionNames]
    );
    
    console.log(`[hasAnyPermission] Query result count:`, result.rows[0].count);
    console.log(`[hasAnyPermission] Returning:`, parseInt(result.rows[0].count) > 0);
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if a user has ALL of the specified permissions
 * @param {number} userId - User ID
 * @param {string[]} permissionNames - Array of permission names
 * @returns {Promise<boolean>} - True if user has all permissions
 */
async function hasAllPermissions(userId, permissionNames) {
  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT p.name) as count
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND p.name = ANY($2)`,
      [userId, permissionNames]
    );
    
    return parseInt(result.rows[0].count) === permissionNames.length;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param {number} userId - User ID
 * @returns {Promise<string[]>} - Array of permission names
 */
async function getUserPermissions(userId) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT p.id, p.name, p.category, p.description
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1
       ORDER BY p.name`,
      [userId]
    );
    
    // Return full permission objects, not just names
    return result.rows;
  } catch (error) {
    console.error('Get permissions error:', error);
    return [];
  }
}

/**
 * Get all roles for a user
 * @param {number} userId - User ID
 * @returns {Promise<object[]>} - Array of role objects
 */
async function getUserRoles(userId) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.description
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1
       ORDER BY r.name`,
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Get roles error:', error);
    return [];
  }
}

/**
 * Middleware to require a specific permission
 * Returns 403 if user doesn't have permission
 * 
 * Usage: router.get('/admin/users', authenticateToken, requirePermission('users.view'), controller)
 */
function requirePermission(permissionName) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasAccess = await hasPermission(req.user.id, permissionName);
    
    if (!hasAccess) {
      console.log(`Permission denied: User ${req.user.id} lacks permission ${permissionName}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissionName
      });
    }
    
    next();
  };
}

/**
 * Middleware to require ANY of the specified permissions
 * Returns 403 if user doesn't have at least one permission
 * 
 * Usage: router.get('/content', authenticateToken, requireAnyPermission(['hikes.view', 'users.view']), controller)
 */
function requireAnyPermission(permissionNames) {
  return async (req, res, next) => {
    console.log(`[requireAnyPermission] Called with permissions:`, permissionNames);
    console.log(`[requireAnyPermission] User:`, req.user ? `ID ${req.user.id} (${req.user.email})` : 'None');
    
    if (!req.user) {
      console.log(`[requireAnyPermission] No user found - returning 401`);
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasAccess = await hasAnyPermission(req.user.id, permissionNames);
    
    console.log(`[requireAnyPermission] hasAccess result:`, hasAccess);
    
    if (!hasAccess) {
      console.log(`[requireAnyPermission] Permission denied: User ${req.user.id} lacks any of ${permissionNames.join(', ')}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredAny: permissionNames
      });
    }
    
    console.log(`[requireAnyPermission] Access granted - calling next()`);
    next();
  };
}

/**
 * Middleware to require ALL of the specified permissions
 * Returns 403 if user doesn't have all permissions
 * 
 * Usage: router.post('/advanced', authenticateToken, requireAllPermissions(['users.edit', 'users.delete']), controller)
 */
function requireAllPermissions(permissionNames) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasAccess = await hasAllPermissions(req.user.id, permissionNames);
    
    if (!hasAccess) {
      console.log(`Permission denied: User ${req.user.id} lacks all of ${permissionNames.join(', ')}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredAll: permissionNames
      });
    }
    
    next();
  };
}

/**
 * Backward compatibility: Keep requireAdmin but use permission system
 * Checks if user has admin role OR has all admin-level permissions
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin role
  const roles = await getUserRoles(req.user.id);
  const isAdmin = roles.some(role => role.name === 'admin');
  
  if (isAdmin) {
    return next();
  }
  
  // Fallback to old behavior for migration period
  if (req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required' });
}

module.exports = {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getUserRoles,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAdmin
};
