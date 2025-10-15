import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import UserNotificationPreferences from './UserNotificationPreferences';
import usePermission from '../../hooks/usePermission';
import PermissionService from '../../services/permissionApi';
import PermissionGate from '../PermissionGate';

function UserManagement() {
  const { currentUser, token } = useAuth();
  const { can } = usePermission();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetUserPassword, setShowResetUserPassword] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Role management state
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'hiker'
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'hiker',
    notifications_email: true,
    notifications_whatsapp: true
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers(token);
      // Backend returns { users: [...], pagination: {...} }
      setUsers(data.users || data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const data = await api.getPendingUsers(token);
      setPendingUsers(data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    setLoading(true);
    try {
      const result = await api.approveUser(userId, token);
      if (result.success) {
        await fetchPendingUsers();
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to approve user');
      }
    } catch (err) {
      console.error('Approve error:', err);
      setError('Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (userId) => {
    setLoading(true);
    try {
      const result = await api.rejectUser(userId, token);
      if (result.success) {
        await fetchPendingUsers();
      } else {
        setError(result.error || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Reject error:', err);
      setError('Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      const result = await api.deleteUser(userId, token);
      if (result.success) {
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setError('');
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required');
      return;
    }

    setLoading(true);
    try {
      const result = await api.addUser(newUser, token);
      if (result.success) {
        setShowAddUser(false);
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'hiker' });
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to add user');
      }
    } catch (err) {
      console.error('Add user error:', err);
      setError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'hiker',
      notifications_email: user.notifications_email ?? true,
      notifications_whatsapp: user.notifications_whatsapp ?? true
    });
    setShowEditUser(true);
    setError('');
  };

  const handleUpdateUser = async () => {
    setError('');
    if (!editUser.name || !editUser.email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const result = await api.updateUser(selectedUser.id, editUser, token);
      if (result.success) {
        setShowEditUser(false);
        setSelectedUser(null);
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setShowResetUserPassword(true);
    setError('');
  };

  const handleResetUserPassword = async () => {
    setError('');
    if (!resetPasswordData.newPassword) {
      setError('Password is required');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await api.resetUserPassword(selectedUser.id, resetPasswordData.newPassword, token);
      if (result.success) {
        setShowResetUserPassword(false);
        setSelectedUser(null);
        alert('Password reset successfully');
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (!window.confirm('Promote this user to admin?')) return;

    setLoading(true);
    try {
      const result = await api.promoteToAdmin(userId, token);
      if (result.success) {
        await fetchUsers();
      } else {
        setError(result.error || 'Failed to promote user');
      }
    } catch (err) {
      console.error('Promote error:', err);
      setError('Failed to promote user');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotificationPreferences = (user) => {
    setSelectedUser(user);
    setShowNotificationPreferences(true);
    setError('');
  };

  const handleCloseNotificationPreferences = () => {
    setShowNotificationPreferences(false);
    setSelectedUser(null);
  };

  const handleSaveNotificationPreferences = () => {
    setShowNotificationPreferences(false);
    setSelectedUser(null);
    // Refresh the users list to show updated data
    fetchUsers();
  };

  // Role management functions
  const handleOpenRoleManagement = async (user) => {
    setSelectedUser(user);
    setShowRoleManagement(true);
    setError('');
    setLoadingRoles(true);
    
    try {
      // Fetch available roles
      const roles = await PermissionService.getAllRoles(token);
      setAvailableRoles(roles);
      
      // Fetch user's current roles
      const userRolesData = await PermissionService.getUserRoles(token, user.id);
      setUserRoles(userRolesData);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load role information');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAssignRole = async (roleId) => {
    if (!selectedUser) return;
    
    setLoadingRoles(true);
    try {
      await PermissionService.assignRole(token, selectedUser.id, roleId);
      // Refresh user roles
      const userRolesData = await PermissionService.getUserRoles(token, selectedUser.id);
      setUserRoles(userRolesData);
      // Refresh users list to update badges
      await fetchUsers();
    } catch (err) {
      console.error('Error assigning role:', err);
      setError('Failed to assign role');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedUser) return;
    
    if (!window.confirm('Remove this role from the user?')) return;
    
    setLoadingRoles(true);
    try {
      await PermissionService.removeRole(token, selectedUser.id, roleId);
      // Refresh user roles
      const userRolesData = await PermissionService.getUserRoles(token, selectedUser.id);
      setUserRoles(userRolesData);
      // Refresh users list to update badges
      await fetchUsers();
    } catch (err) {
      console.error('Error removing role:', err);
      setError('Failed to remove role');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCloseRoleManagement = () => {
    setShowRoleManagement(false);
    setSelectedUser(null);
    setUserRoles([]);
    setAvailableRoles([]);
    setError('');
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !userSearchTerm ||
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.phone.includes(userSearchTerm);
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = userCurrentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="container-fluid">
      {/* Add User Button */}
      {can('users.create') && (
        <div className="mb-3 text-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddUser(true);
              setError('');
            }}
          >
            <Users size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
            Add User
          </button>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

          {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="card border-warning mb-4">
          <div className="card-header bg-warning bg-opacity-10">
            <h5 className="mb-0" style={{fontSize: 'clamp(1rem, 3vw, 1.25rem)'}}>
              Pending Registrations ({pendingUsers.length})
            </h5>
          </div>
          <div className="card-body p-2 p-md-3">
            {pendingUsers.map(user => (
              <div
                key={user.id}
                className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 p-2 p-md-3 bg-light rounded gap-2"
              >
                <div className="flex-grow-1" style={{minWidth: 0}}>
                  <strong className="d-block text-truncate">{user.name}</strong>
                  <small className="text-muted d-block" style={{fontSize: 'clamp(0.7rem, 2vw, 0.875rem)'}}>
                    {user.email}
                  </small>
                  <small className="text-muted d-block" style={{fontSize: 'clamp(0.7rem, 2vw, 0.875rem)'}}>
                    {user.phone}
                  </small>
                </div>
                <div className="d-flex gap-2 w-100 w-sm-auto">
                  <PermissionGate permission="users.approve">
                    <button
                      className="btn btn-sm btn-success flex-grow-1 flex-sm-grow-0"
                      style={{minHeight: '36px', minWidth: '80px'}}
                      onClick={() => handleApproveUser(user.id)}
                      disabled={loading}
                    >
                      {loading ? 'Approving...' : 'Approve'}
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="users.approve">
                    <button
                      className="btn btn-sm btn-danger flex-grow-1 flex-sm-grow-0"
                      style={{minHeight: '36px', minWidth: '70px'}}
                      onClick={() => handleRejectUser(user.id)}
                      disabled={loading}
                    >
                      {loading ? 'Rejecting...' : 'Reject'}
                    </button>
                  </PermissionGate>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0" style={{fontSize: 'clamp(1rem, 3vw, 1.25rem)'}}>Approved Users</h5>
        </div>
        <div className="card-body p-2 p-md-3">
          {/* Filters */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or phone..."
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setUserCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserCurrentPage(1);
                }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="hiker">Hiker</option>
              </select>
            </div>
          </div>

          {/* Desktop view - table */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Assigned Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <Link to={`/profile/${user.id}`} className="text-decoration-none">
                          {user.name}
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={'badge ' + (user.role === 'admin' ? 'bg-primary' : 'bg-secondary')}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.roles && user.roles.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {user.roles.map(role => (
                              <span key={role.id} className="badge bg-info" title={role.description}>
                                {role.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">No roles assigned</span>
                        )}
                      </td>
                      <td>
                        <PermissionGate permission="users.edit">
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => handleOpenEditUser(user)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                        </PermissionGate>
                        <button
                          className="btn btn-sm btn-secondary me-2"
                          onClick={() => handleOpenNotificationPreferences(user)}
                          disabled={loading}
                          title="Manage notification preferences"
                        >
                          Notifications
                        </button>
                        <PermissionGate permission="users.manage_roles">
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleOpenRoleManagement(user)}
                            disabled={loading}
                            title="Manage user roles and permissions"
                          >
                            <UserCog size={14} className="me-1" />
                            Roles
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="users.reset_password">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleOpenResetPassword(user)}
                            disabled={loading}
                          >
                            Reset Password
                          </button>
                        </PermissionGate>
                        {user.role === 'hiker' && (
                          <PermissionGate permission="users.edit">
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => handlePromoteToAdmin(user.id)}
                              disabled={loading}
                            >
                              Promote to Admin
                            </button>
                          </PermissionGate>
                        )}
                        {user.id !== currentUser.id && (
                          <PermissionGate permission="users.delete">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </PermissionGate>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view - cards */}
          <div className="d-md-none">
            {currentUsers.map(user => (
              <div key={user.id} className="card mb-3 shadow-sm">
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{minWidth: 0, flex: 1}}>
                      <h6 className="mb-1 text-truncate">
                        <Link to={`/profile/${user.id}`} className="text-decoration-none">
                          {user.name}
                        </Link>
                      </h6>
                      <small className="text-muted d-block text-truncate" style={{fontSize: '0.75rem'}}>
                        {user.email}
                      </small>
                      <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>{user.phone}</small>
                    </div>
                    <span className={'badge ' + (user.role === 'admin' ? 'bg-primary' : 'bg-secondary')}>
                      {user.role}
                    </span>
                  </div>
                  {/* Show assigned roles */}
                  {user.roles && user.roles.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1" style={{fontSize: '0.7rem'}}>Assigned Roles:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <span key={role.id} className="badge bg-info" style={{fontSize: '0.65rem'}}>
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    <PermissionGate permission="users.edit">
                      <button
                        className="btn btn-sm btn-info"
                        style={{fontSize: '0.75rem', flex: '1 1 45%'}}
                        onClick={() => handleOpenEditUser(user)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                    </PermissionGate>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{fontSize: '0.75rem', flex: '1 1 45%'}}
                      onClick={() => handleOpenNotificationPreferences(user)}
                      disabled={loading}
                    >
                      Notifications
                    </button>
                    <PermissionGate permission="users.manage_roles">
                      <button
                        className="btn btn-sm btn-primary"
                        style={{fontSize: '0.75rem', flex: '1 1 100%'}}
                        onClick={() => handleOpenRoleManagement(user)}
                        disabled={loading}
                      >
                        <UserCog size={12} className="me-1" />
                        Manage Roles
                      </button>
                    </PermissionGate>
                    <PermissionGate permission="users.reset_password">
                      <button
                        className="btn btn-sm btn-warning"
                        style={{fontSize: '0.75rem', flex: '1 1 45%'}}
                        onClick={() => handleOpenResetPassword(user)}
                        disabled={loading}
                      >
                        Reset PW
                      </button>
                    </PermissionGate>
                    {user.role === 'hiker' && (
                      <PermissionGate permission="users.edit">
                        <button
                          className="btn btn-sm btn-primary"
                          style={{fontSize: '0.75rem', flex: '1 1 100%'}}
                          onClick={() => handlePromoteToAdmin(user.id)}
                          disabled={loading}
                        >
                          Promote to Admin
                        </button>
                      </PermissionGate>
                    )}
                    {user.id !== currentUser.id && (
                      <PermissionGate permission="users.delete">
                        <button
                          className="btn btn-sm btn-danger"
                          style={{fontSize: '0.75rem', flex: '1 1 100%'}}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </PermissionGate>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - Always show user count, pagination buttons only if > 1 page */}
          {filteredUsers.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="text-muted small">
                  Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="text-muted small mb-0">Per page:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{width: 'auto'}}
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setUserCurrentPage(1);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            {totalPages > 1 && (
              <div className="btn-group flex-wrap">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={userCurrentPage === 1}
                >
                  Previous
                </button>

                {/* Smart pagination: Show first page, current page range, and last page */}
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  [...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`btn btn-sm ${userCurrentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setUserCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))
                ) : (
                  // Show smart pagination with ellipsis
                  <>
                    {/* First page */}
                    <button
                      className={`btn btn-sm ${userCurrentPage === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setUserCurrentPage(1)}
                    >
                      1
                    </button>

                    {/* Left ellipsis */}
                    {userCurrentPage > 3 && (
                      <button className="btn btn-sm btn-outline-primary" disabled>
                        ...
                      </button>
                    )}

                    {/* Pages around current page */}
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show pages 2 to totalPages-1, but only those within 1 of current page
                      if (page > 1 && page < totalPages && Math.abs(page - userCurrentPage) <= 1) {
                        return (
                          <button
                            key={page}
                            className={`btn btn-sm ${userCurrentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setUserCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      }
                      return null;
                    })}

                    {/* Right ellipsis */}
                    {userCurrentPage < totalPages - 2 && (
                      <button className="btn btn-sm btn-outline-primary" disabled>
                        ...
                      </button>
                    )}

                    {/* Last page */}
                    <button
                      className={`btn btn-sm ${userCurrentPage === totalPages ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setUserCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={userCurrentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
          <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Add New User</h5>
                <button type="button" className="btn-close" onClick={() => { setShowAddUser(false); setError(''); }}></button>
              </div>
              <div className="modal-body px-2 px-md-3 py-3">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="hiker">Hiker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddUser(false); setError(''); }} disabled={loading}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAddUser} disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
          <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Edit User</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditUser(false); setError(''); }}></button>
              </div>
              <div className="modal-body px-2 px-md-3 py-3">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUser.name}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  >
                    <option value="hiker">Hiker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notification Settings</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editEmailNotifications"
                      checked={editUser.notifications_email}
                      onChange={(e) => setEditUser({...editUser, notifications_email: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="editEmailNotifications">
                      Enable Email Notifications
                    </label>
                  </div>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editSMSNotifications"
                      checked={editUser.notifications_whatsapp}
                      onChange={(e) => setEditUser({...editUser, notifications_whatsapp: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="editSMSNotifications">
                      Enable SMS Notifications
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditUser(false); setError(''); }} disabled={loading}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateUser} disabled={loading}>
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetUserPassword && selectedUser && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
          <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
                  Reset Password for {selectedUser.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowResetUserPassword(false); setError(''); }}></button>
              </div>
              <div className="modal-body px-2 px-md-3 py-3">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="alert alert-info">
                  <small>The new password will be sent to the user via email.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowResetUserPassword(false); setError(''); }} disabled={loading}>Cancel</button>
                <button type="button" className="btn btn-warning" onClick={handleResetUserPassword} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotificationPreferences && selectedUser && (
        <UserNotificationPreferences
          user={selectedUser}
          onClose={handleCloseNotificationPreferences}
          onSave={handleSaveNotificationPreferences}
        />
      )}

      {/* Role Management Modal */}
      {showRoleManagement && selectedUser && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
          <div className="modal-dialog modal-lg mx-2 mx-md-auto my-2 my-md-3">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
                  <UserCog size={20} className="me-2" />
                  Manage Roles for {selectedUser.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseRoleManagement}
                ></button>
              </div>
              <div className="modal-body px-2 px-md-3 py-3">
                {error && <div className="alert alert-danger">{error}</div>}
                
                {loadingRoles ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading roles...</p>
                  </div>
                ) : (
                  <>
                    {/* Current Roles Section */}
                    <div className="mb-4">
                      <h6 className="mb-3">Current Roles</h6>
                      {userRoles.length > 0 ? (
                        <div className="list-group">
                          {userRoles.map(role => (
                            <div 
                              key={role.id} 
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong>{role.name}</strong>
                                <br />
                                <small className="text-muted">{role.description}</small>
                              </div>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveRole(role.id)}
                                disabled={loadingRoles}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          No roles assigned yet.
                        </div>
                      )}
                    </div>

                    {/* Available Roles Section */}
                    <div>
                      <h6 className="mb-3">Available Roles</h6>
                      <div className="list-group">
                        {availableRoles
                          .filter(role => !userRoles.find(ur => ur.id === role.id))
                          .map(role => (
                            <div 
                              key={role.id} 
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <strong>{role.name}</strong>
                                <br />
                                <small className="text-muted">{role.description}</small>
                                <br />
                                <small className="text-info">
                                  {role.permission_count} permissions
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleAssignRole(role.id)}
                                disabled={loadingRoles}
                              >
                                Assign
                              </button>
                            </div>
                          ))}
                      </div>
                      {availableRoles.filter(role => !userRoles.find(ur => ur.id === role.id)).length === 0 && (
                        <div className="alert alert-success">
                          All available roles have been assigned!
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseRoleManagement}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
