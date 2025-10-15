// pages/NotificationsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../components/admin/NotificationPanel';
import PermissionGate from '../components/PermissionGate';

const NotificationsPage = () => {
  const navigate = useNavigate();
  
  return (
    <PermissionGate 
      permission="notifications.send"
      fallback={
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h5>Access Denied</h5>
            <p>You don't have permission to send notifications.</p>
            <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
              Return to Hikes
            </button>
          </div>
        </div>
      }
    >
      <NotificationPanel />
    </PermissionGate>
  );
};

export default NotificationsPage;
