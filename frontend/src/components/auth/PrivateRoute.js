import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center"
           style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/hikes" replace />;
  }

  return children;
};

export default PrivateRoute;
