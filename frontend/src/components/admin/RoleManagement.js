import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PermissionService from '../../services/permissionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import './RoleManagement.css';

const RoleManagement = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New state for clone/rename/delete functionality
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllPermissions = async () => {
    try {
      const data = await PermissionService.getAllPermissions(token);
      setAllPermissions(data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PermissionService.getAllRoles(token);
      // Backend returns array directly, not {roles: [...]}
      setRoles(Array.isArray(data) ? data : (data.roles || []));
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = async (role) => {
    try {
      setLoading(true);
      const data = await PermissionService.getRoleById(token, role.id);
      // Backend returns role object directly, not {role: {...}}
      setSelectedRole(data.role || data);
      setShowAddPermission(false);
      setPermissionSearchTerm('');
    } catch (err) {
      console.error('Error fetching role details:', err);
      setError('Failed to load role details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async (permissionId) => {
    if (!selectedRole) return;
    
    try {
      await PermissionService.assignPermissionToRole(token, selectedRole.id, permissionId);
      setSuccessMessage('Permission added successfully');
      setShowAddPermission(false);
      // Refresh role details
      await handleRoleClick(selectedRole);
      // Refresh roles list to update permission counts
      await fetchRoles();
    } catch (err) {
      console.error('Error adding permission:', err);
      setError(err.message || 'Failed to add permission');
    }
  };

  const handleRemovePermission = async (permissionId) => {
    if (!selectedRole) return;
    
    if (!window.confirm('Remove this permission from the role?')) return;
    
    try {
      await PermissionService.removePermissionFromRole(token, selectedRole.id, permissionId);
      setSuccessMessage('Permission removed successfully');
      // Refresh role details
      await handleRoleClick(selectedRole);
      // Refresh roles list to update permission counts
      await fetchRoles();
    } catch (err) {
      console.error('Error removing permission:', err);
      setError(err.message || 'Failed to remove permission');
    }
  };

  const handleCloneRole = async () => {
    if (!selectedRole || !cloneName.trim()) return;
    
    try {
      setActionLoading(true);
      await PermissionService.cloneRole(token, selectedRole.id, cloneName.trim(), cloneDescription.trim());
      setSuccessMessage(`Role cloned successfully as "${cloneName}"`);
      setShowCloneModal(false);
      setCloneName('');
      setCloneDescription('');
      await fetchRoles();
    } catch (err) {
      console.error('Error cloning role:', err);
      setError(err.message || 'Failed to clone role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameRole = async () => {
    if (!selectedRole || !newRoleName.trim()) return;
    
    try {
      setActionLoading(true);
      await PermissionService.renameRole(token, selectedRole.id, newRoleName.trim());
      setSuccessMessage(`Role renamed successfully to "${newRoleName}"`);
      setShowRenameModal(false);
      setNewRoleName('');
      // Update selected role name locally
      setSelectedRole({ ...selectedRole, name: newRoleName.trim() });
      await fetchRoles();
    } catch (err) {
      console.error('Error renaming role:', err);
      setError(err.message || 'Failed to rename role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      setActionLoading(true);
      // Check if role can be deleted
      const checkResult = await PermissionService.checkRoleDeletion(token, selectedRole.id);
      
      if (!checkResult.canDelete) {
        setError(checkResult.reason || 'Cannot delete this role');
        setActionLoading(false);
        return;
      }
      
      if (!window.confirm(`Are you sure you want to delete the role "${selectedRole.name}"? This action cannot be undone.`)) {
        setActionLoading(false);
        return;
      }
      
      await PermissionService.deleteRole(token, selectedRole.id);
      setSuccessMessage(`Role "${selectedRole.name}" deleted successfully`);
      setSelectedRole(null);
      await fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err.message || 'Failed to delete role');
    } finally {
      setActionLoading(false);
    }
  };

  const openCloneModal = () => {
    if (!selectedRole) return;
    setCloneName(`${selectedRole.name} (Copy)`);
    setCloneDescription(selectedRole.description || '');
    setShowCloneModal(true);
  };

  const openRenameModal = () => {
    if (!selectedRole) return;
    setNewRoleName(selectedRole.name);
    setShowRenameModal(true);
  };

  const groupPermissionsByCategory = (permissions) => {
    if (!permissions) return {};
    
    return permissions.reduce((acc, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});
  };

  if (loading && roles.length === 0) {
    return (
      <div className="role-management-container">
        <LoadingSpinner message="Loading roles..." />
      </div>
    );
  }

  if (error && roles.length === 0) {
    return (
      <div className="role-management-container">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchRoles}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Roles List */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Roles ({roles.length})</h5>
            </div>
            <div className="list-group list-group-flush">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`list-group-item list-group-item-action ${
                    selectedRole?.id === role.id ? 'active' : ''
                  }`}
                  onClick={() => handleRoleClick(role)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        <i className="fas fa-user-tag me-2"></i>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </h6>
                      {role.description && (
                        <small className="text-muted d-block">
                          {role.description}
                        </small>
                      )}
                    </div>
                    <span className="badge bg-secondary">
                      {role.permission_count || 0} permissions
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Details */}
        <div className="col-md-8">
          {!selectedRole ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-hand-pointer fa-3x text-muted mb-3"></i>
                <p className="text-muted">
                  Select a role from the list to view its permissions
                </p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-0">
                      <i className="fas fa-shield-alt me-2"></i>
                      {selectedRole.name.charAt(0).toUpperCase() + selectedRole.name.slice(1)}
                    </h5>
                    {selectedRole.description && (
                      <p className="text-muted mb-0 mt-2">
                        {selectedRole.description}
                      </p>
                    )}
                  </div>
                  {!selectedRole.is_system && (
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={openCloneModal}
                        title="Clone this role"
                        disabled={actionLoading}
                      >
                        <i className="fas fa-copy me-1"></i>
                        Clone
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={openRenameModal}
                        title="Rename this role"
                        disabled={actionLoading}
                      >
                        <i className="fas fa-edit me-1"></i>
                        Rename
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleDeleteRole}
                        title="Delete this role"
                        disabled={actionLoading}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <LoadingSpinner message="Loading permissions..." />
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        Permissions ({selectedRole.permissions?.length || 0})
                      </h6>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowAddPermission(!showAddPermission)}
                      >
                        <i className="fas fa-plus me-1"></i>
                        {showAddPermission ? 'Cancel' : 'Add Permission'}
                      </button>
                    </div>

                    {showAddPermission && (
                      <div className="card bg-light mb-3">
                        <div className="card-body">
                          <h6 className="card-title">Add Permission</h6>
                          <p className="text-muted small mb-3">Select a permission to add to this role:</p>
                          
                          {/* Search/Filter Input */}
                          <div className="mb-3">
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="fas fa-search"></i>
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search permissions by name or category..."
                                value={permissionSearchTerm}
                                onChange={(e) => setPermissionSearchTerm(e.target.value)}
                              />
                              {permissionSearchTerm && (
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => setPermissionSearchTerm('')}
                                  title="Clear search"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="available-permissions" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {allPermissions
                              .filter(p => !selectedRole.permissions?.some(rp => rp.id === p.id))
                              .filter(p => {
                                if (!permissionSearchTerm) return true;
                                const searchLower = permissionSearchTerm.toLowerCase();
                                return (
                                  p.name.toLowerCase().includes(searchLower) ||
                                  p.category.toLowerCase().includes(searchLower) ||
                                  (p.description && p.description.toLowerCase().includes(searchLower))
                                );
                              })
                              .map(permission => (
                                <div 
                                  key={permission.id}
                                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                                >
                                  <div>
                                    <div className="fw-bold small">{permission.name}</div>
                                    <small className="text-muted">{permission.description}</small>
                                    <div>
                                      <span className="badge bg-secondary mt-1" style={{ fontSize: '0.7rem' }}>
                                        {permission.category}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleAddPermission(permission.id)}
                                  >
                                    <i className="fas fa-plus"></i> Add
                                  </button>
                                </div>
                              ))}
                            {allPermissions
                              .filter(p => !selectedRole.permissions?.some(rp => rp.id === p.id))
                              .filter(p => {
                                if (!permissionSearchTerm) return true;
                                const searchLower = permissionSearchTerm.toLowerCase();
                                return (
                                  p.name.toLowerCase().includes(searchLower) ||
                                  p.category.toLowerCase().includes(searchLower) ||
                                  (p.description && p.description.toLowerCase().includes(searchLower))
                                );
                              }).length === 0 && (
                              <div className="text-center text-muted py-3">
                                {permissionSearchTerm 
                                  ? `No permissions found matching "${permissionSearchTerm}"`
                                  : 'All permissions are already assigned to this role'
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                      <div className="permissions-grid">
                        {Object.entries(groupPermissionsByCategory(selectedRole.permissions)).map(
                          ([category, permissions]) => (
                            <div key={category} className="permission-category mb-4">
                              <h6 className="text-primary mb-2">
                                <i className="fas fa-folder me-2"></i>
                                {category}
                              </h6>
                              <div className="list-group">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="list-group-item d-flex justify-content-between align-items-start"
                                  >
                                    <div className="flex-grow-1">
                                      <div className="fw-bold">{permission.name}</div>
                                      {permission.description && (
                                        <small className="text-muted">
                                          {permission.description}
                                        </small>
                                      )}
                                    </div>
                                    <div className="d-flex gap-2">
                                      <span className="badge bg-success">
                                        <i className="fas fa-check"></i>
                                      </span>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemovePermission(permission.id)}
                                        title="Remove permission"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        This role has no permissions assigned. Click "Add Permission" to get started.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clone Role Modal */}
      {showCloneModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-copy me-2"></i>
                  Clone Role: {selectedRole?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCloneModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Role Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                    placeholder="Enter name for cloned role"
                    disabled={actionLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cloneDescription}
                    onChange={(e) => setCloneDescription(e.target.value)}
                    placeholder="Enter description for cloned role"
                    disabled={actionLoading}
                  />
                </div>
                <div className="alert alert-info mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  The cloned role will have all the same permissions as "{selectedRole?.name}".
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCloneModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloneRole}
                  disabled={!cloneName.trim() || actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Cloning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy me-2"></i>
                      Clone Role
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Role Modal */}
      {showRenameModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Rename Role: {selectedRole?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRenameModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Role Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter new role name"
                    disabled={actionLoading}
                  />
                </div>
                <div className="alert alert-warning mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  The role name must be unique. Permissions and user assignments will not be affected.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRenameModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRenameRole}
                  disabled={!newRoleName.trim() || actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Renaming...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Rename Role
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
