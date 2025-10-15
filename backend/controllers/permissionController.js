// controllers/permissionController.js - Permission and role management
const pool = require('../config/database');
const { getUserPermissions, getUserRoles } = require('../middleware/permissions');

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, category 
       FROM permissions 
       ORDER BY category, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

// Get permissions by category
exports.getPermissionsByCategory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         category,
         json_agg(
           json_build_object(
             'id', id,
             'name', name,
             'description', description
           ) ORDER BY name
         ) as permissions
       FROM permissions
       GROUP BY category
       ORDER BY category`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get permissions by category error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.description, r.is_system, r.created_at,
              COUNT(ur.user_id) as user_count,
              COUNT(rp.permission_id) as permission_count
       FROM roles r
       LEFT JOIN user_roles ur ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       GROUP BY r.id, r.name, r.description, r.is_system, r.created_at
       ORDER BY r.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Get role by ID with permissions
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get role details
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    // Get role permissions
    const permissionsResult = await pool.query(
      `SELECT p.id, p.name, p.description, p.category
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = $1
       ORDER BY p.category, p.name`,
      [id]
    );
    
    role.permissions = permissionsResult.rows;
    
    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissionIds = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Check if role already exists
    const existing = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }
    
    // Create role
    const roleResult = await pool.query(
      `INSERT INTO roles (name, description, is_system)
       VALUES ($1, $2, false)
       RETURNING *`,
      [name, description]
    );
    
    const role = roleResult.rows[0];
    
    // Assign permissions
    if (permissionIds.length > 0) {
      const values = permissionIds.map((permId, index) => 
        `($1, $${index + 2}, $${index + 2 + permissionIds.length})`
      ).join(',');
      
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_by)
         VALUES ${values}`,
        [role.id, ...permissionIds, ...permissionIds.map(() => req.user.id)]
      );
    }
    
    res.json({ message: 'Role created successfully', role });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;
    
    // Check if role exists and is not system role
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    if (role.is_system) {
      return res.status(400).json({ error: 'Cannot modify system roles' });
    }
    
    // Update role details
    await pool.query(
      `UPDATE roles 
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3`,
      [name || role.name, description !== undefined ? description : role.description, id]
    );
    
    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove old permissions
      await pool.query(
        'DELETE FROM role_permissions WHERE role_id = $1',
        [id]
      );
      
      // Add new permissions
      if (permissionIds.length > 0) {
        const values = permissionIds.map((permId, index) => 
          `($1, $${index + 2}, $${index + 2 + permissionIds.length})`
        ).join(',');
        
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id, granted_by)
           VALUES ${values}`,
          [id, ...permissionIds, ...permissionIds.map(() => req.user.id)]
        );
      }
    }
    
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists and is not system role
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    if (role.is_system) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }
    
    // Check if any users have this role
    const usersResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );
    
    if (parseInt(usersResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users',
        userCount: parseInt(usersResult.rows[0].count)
      });
    }
    
    // Delete role (CASCADE will delete permissions)
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

// Get user's permissions
exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const permissions = await getUserPermissions(userId);
    const roles = await getUserRoles(userId);
    
    res.json({ 
      userId,
      permissions, 
      roles 
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
};

// Get user's roles
exports.getUserRoles = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const roles = await getUserRoles(userId);
    
    res.json(roles);
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
};

// Assign role to user
exports.assignRoleToUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const roleId = req.body.roleId;
    
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }
    
    // Check if assignment already exists
    const existing = await pool.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already has this role' });
    }
    
    // Assign role
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $3)`,
      [userId, roleId, req.user.id]
    );
    
    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
};

// Remove role from user
exports.removeRoleFromUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const roleId = req.params.roleId || req.body.roleId;
    
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }
    
    // Don't allow removing last role
    const rolesResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE user_id = $1',
      [userId]
    );
    
    if (parseInt(rolesResult.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'Cannot remove user\'s last role' });
    }
    
    // Remove role
    await pool.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    res.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: 'Failed to remove role' });
  }
};

// Get permission statistics
exports.getPermissionStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM permissions) as total_permissions,
        (SELECT COUNT(*) FROM roles) as total_roles,
        (SELECT COUNT(*) FROM user_roles) as total_assignments,
        (SELECT COUNT(DISTINCT category) FROM permissions) as permission_categories
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get permission stats error:', error);
    res.status(500).json({ error: 'Failed to fetch permission statistics' });
  }
};

// Assign permission to role
exports.assignPermissionToRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const { permissionId } = req.body;
    
    if (!roleId || !permissionId) {
      return res.status(400).json({ error: 'Role ID and Permission ID are required' });
    }
    
    // Check if assignment already exists
    const existing = await pool.query(
      'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Permission already assigned to this role' });
    }
    
    // Add permission to role
    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
      [roleId, permissionId]
    );
    
    res.json({ message: 'Permission assigned to role successfully' });
  } catch (error) {
    console.error('Assign permission to role error:', error);
    res.status(500).json({ error: 'Failed to assign permission to role' });
  }
};

// Remove permission from role
exports.removePermissionFromRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const permissionId = req.params.permissionId;
    
    if (!roleId || !permissionId) {
      return res.status(400).json({ error: 'Role ID and Permission ID are required' });
    }
    
    // Remove permission from role
    const result = await pool.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Permission assignment not found' });
    }
    
    res.json({ message: 'Permission removed from role successfully' });
  } catch (error) {
    console.error('Remove permission from role error:', error);
    res.status(500).json({ error: 'Failed to remove permission from role' });
  }
};

// Clone role - Creates a new role with same permissions as source role
exports.cloneRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Check if source role exists
    const sourceRoleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [roleId]
    );
    
    if (sourceRoleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Source role not found' });
    }
    
    // Check if name already exists
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    
    if (existingRole.rows.length > 0) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }
    
    // Create new role
    const newRoleResult = await pool.query(
      `INSERT INTO roles (name, description, is_system)
       VALUES ($1, $2, false)
       RETURNING *`,
      [name, description || `Clone of ${sourceRoleResult.rows[0].name}`]
    );
    
    const newRole = newRoleResult.rows[0];
    
    // Copy permissions from source role
    const permissionsResult = await pool.query(
      'SELECT permission_id FROM role_permissions WHERE role_id = $1',
      [roleId]
    );
    
    if (permissionsResult.rows.length > 0) {
      const permissionIds = permissionsResult.rows.map(row => row.permission_id);
      const values = permissionIds.map((permId, index) => 
        `($1, $${index + 2}, $${index + 2 + permissionIds.length})`
      ).join(',');
      
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_by)
         VALUES ${values}`,
        [newRole.id, ...permissionIds, ...permissionIds.map(() => req.user.id)]
      );
    }
    
    res.json({ 
      message: 'Role cloned successfully', 
      role: newRole,
      copiedPermissions: permissionsResult.rows.length
    });
  } catch (error) {
    console.error('Clone role error:', error);
    res.status(500).json({ error: 'Failed to clone role' });
  }
};

// Rename role - Updates role name with uniqueness check
exports.renameRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    // Check if role exists
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    if (role.is_system) {
      return res.status(400).json({ error: 'Cannot rename system roles' });
    }
    
    // Check if new name already exists (excluding current role)
    const existingRole = await pool.query(
      'SELECT id FROM roles WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name.trim(), id]
    );
    
    if (existingRole.rows.length > 0) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }
    
    // Update role name
    await pool.query(
      'UPDATE roles SET name = $1, updated_at = NOW() WHERE id = $2',
      [name.trim(), id]
    );
    
    res.json({ message: 'Role renamed successfully' });
  } catch (error) {
    console.error('Rename role error:', error);
    res.status(500).json({ error: 'Failed to rename role' });
  }
};

// Check if role can be deleted (no users assigned)
exports.checkRoleDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const role = roleResult.rows[0];
    
    if (role.is_system) {
      return res.status(400).json({ 
        canDelete: false,
        reason: 'Cannot delete system roles'
      });
    }
    
    // Check if any users have this role
    const usersResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );
    
    const userCount = parseInt(usersResult.rows[0].count);
    
    res.json({ 
      canDelete: userCount === 0,
      userCount,
      reason: userCount > 0 ? `Role is assigned to ${userCount} user${userCount > 1 ? 's' : ''}` : null
    });
  } catch (error) {
    console.error('Check role deletion error:', error);
    res.status(500).json({ error: 'Failed to check role deletion status' });
  }
};

module.exports = exports;
