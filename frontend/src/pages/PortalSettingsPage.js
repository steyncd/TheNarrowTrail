// pages/PortalSettingsPage.js - Comprehensive portal management page
import React, { useState } from 'react';
import { Settings, Users, Shield, FileText, Cloud, Sliders, ShieldCheck } from 'lucide-react';
import PermissionGate from '../components/PermissionGate';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

// Import existing components
import UserManagement from '../components/admin/UserManagement';
import RoleManagement from '../components/admin/RoleManagement';
import WeatherSettings from '../components/admin/WeatherSettings';
import ContentManagement from '../components/admin/ContentManagement';
import GeneralSettings from '../components/admin/GeneralSettings';
import DataRetentionDashboard from '../components/admin/DataRetentionDashboard';

const PortalSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, permission: 'users.view', shortLabel: 'Users' },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield, permission: 'users.view', shortLabel: 'Roles' },
    { id: 'popia', label: 'POPIA Compliance', icon: ShieldCheck, permission: 'users.view', shortLabel: 'POPIA' },
    { id: 'content', label: 'Content', icon: FileText, permission: 'feedback.view', shortLabel: 'Content' },
    { id: 'weather', label: 'Weather', icon: Cloud, permission: 'settings.edit', shortLabel: 'Weather' },
    { id: 'general', label: 'General', icon: Sliders, permission: 'settings.edit', shortLabel: 'General' }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <PermissionGate
      permission="settings.view"
      fallback={
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h5>Access Denied</h5>
            <p>You don't have permission to access portal settings.</p>
            <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
              Return to Hikes
            </button>
          </div>
        </div>
      }
    >
      <div>
        <PageHeader
          icon={Settings}
          title="Portal Settings"
          subtitle="Manage users, roles, content, and system configuration"
        />

        {/* Mobile Tab Dropdown */}
        <div className="container-fluid mt-4 d-md-none">
          <div className="dropdown mb-3">
            <button
              className="btn btn-outline-primary dropdown-toggle w-100"
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeTabData && <activeTabData.icon size={18} />}
                {activeTabData?.label}
              </span>
            </button>
            {showMobileMenu && (
              <div className="card mt-2" style={{ border: '1px solid #dee2e6' }}>
                <div className="list-group list-group-flush">
                  {tabs.map(({ id, label, icon: TabIcon, permission }) => (
                    <PermissionGate key={id} permission={permission} hideOnDeny>
                      <button
                        className={`list-group-item list-group-item-action ${activeTab === id ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab(id);
                          setShowMobileMenu(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          border: 'none',
                          borderBottom: '1px solid #dee2e6'
                        }}
                      >
                        <TabIcon size={18} />
                        <span>{label}</span>
                      </button>
                    </PermissionGate>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="container-fluid mt-4 d-none d-md-block">
          <ul className="nav nav-tabs mb-4">
            {tabs.map(({ id, label, icon: TabIcon, permission }) => (
              <PermissionGate key={id} permission={permission} hideOnDeny>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === id ? 'active' : ''}`}
                    onClick={() => setActiveTab(id)}
                  >
                    <TabIcon size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
                    {label}
                  </button>
                </li>
              </PermissionGate>
            ))}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="container-fluid">
          <div className="tab-content">
            {activeTab === 'users' && (
              <PermissionGate permission="users.view" hideOnDeny>
                <UserManagement />
              </PermissionGate>
            )}

            {activeTab === 'roles' && (
              <PermissionGate permission="users.view" hideOnDeny>
                <RoleManagement />
              </PermissionGate>
            )}

            {activeTab === 'popia' && (
              <PermissionGate permission="users.view" hideOnDeny>
                <DataRetentionDashboard />
              </PermissionGate>
            )}

            {activeTab === 'content' && (
              <PermissionGate permission="feedback.view" hideOnDeny>
                <ContentManagement />
              </PermissionGate>
            )}

            {activeTab === 'weather' && (
              <PermissionGate permission="settings.edit" hideOnDeny>
                <WeatherSettings />
              </PermissionGate>
            )}

            {activeTab === 'general' && (
              <PermissionGate permission="settings.edit" hideOnDeny>
                <GeneralSettings />
              </PermissionGate>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default PortalSettingsPage;
