import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import RoleManagement from '../components/admin/RoleManagement';
import PermissionGate from '../components/PermissionGate';
import { Navigate } from 'react-router-dom';

const RolesPage = () => {
  const { theme } = useTheme();

  return (
    <PermissionGate 
      permission="users.manage_roles"
      fallback={<Navigate to="/hikes" replace />}
    >
      <div 
        className="container-fluid py-4"
        style={{
          minHeight: '100vh',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <RoleManagement />
      </div>
    </PermissionGate>
  );
};

export default RolesPage;
