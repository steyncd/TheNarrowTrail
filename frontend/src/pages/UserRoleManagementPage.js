import React, { useState } from 'react';
import { Users, Shield, FileCheck } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import UserManagement from '../components/admin/UserManagement';
import RoleManagement from '../components/admin/RoleManagement';
import ConsentManagement from '../components/admin/ConsentManagement';
import PermissionGate from '../components/PermissionGate';
import { useNavigate } from 'react-router-dom';

function UserRoleManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <PermissionGate 
      permission="users.view"
      fallback={
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h5>Access Denied</h5>
            <p>You don't have permission to manage users and roles.</p>
            <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
              Return to Hikes
            </button>
          </div>
        </div>
      }
    >
      <div>
        <PageHeader
          icon={Users}
          title="User & Role Management"
          description="Manage users, roles, permissions, and consent"
        />

        {/* Tab Navigation */}
        <div className="container-fluid mt-4">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                <Shield size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
                Roles & Permissions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'consent' ? 'active' : ''}`}
                onClick={() => setActiveTab('consent')}
              >
                <FileCheck size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
                POPIA Consent
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'roles' && <RoleManagement />}
            {activeTab === 'consent' && <ConsentManagement />}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

export default UserRoleManagementPage;
