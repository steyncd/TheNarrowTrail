import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Eye, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const MobileMenu = ({ show, onClose, navLinks, adminLinks, isAdmin }) => {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1060,
          animation: 'fadeIn 0.3s ease'
        }}
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div
        className="position-fixed top-0 start-0 h-100 shadow-lg"
        style={{
          width: '280px',
          maxWidth: '80vw',
          background: theme === 'dark'
            ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(180deg, #2d5a7c 0%, #1a4d5c 100%)',
          zIndex: 1070,
          overflowY: 'auto',
          animation: 'slideInLeft 0.3s ease'
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="text-white">
            <div className="fw-bold">{currentUser?.name}</div>
            <div className="small text-white-50">{currentUser?.email}</div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-link text-white p-0"
            style={{ textDecoration: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Avatar Section */}
        <div className="p-4 text-center border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '32px',
              color: 'white',
              margin: '0 auto',
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          >
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="mt-3">
            <span className="badge bg-primary">{currentUser?.role}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3">
          <div className="mb-3">
            <div className="text-white-50 small fw-bold mb-2 px-2">MAIN MENU</div>
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className="d-flex align-items-center gap-3 text-white text-decoration-none p-3 rounded mb-1"
                  style={{
                    transition: 'all 0.3s ease',
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="mb-3">
              <div className="text-white-50 small fw-bold mb-2 px-2">ADMIN</div>
              {adminLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className="d-flex align-items-center gap-3 text-white text-decoration-none p-3 rounded mb-1"
                    style={{
                      transition: 'all 0.3s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Account Section */}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-white-50 small fw-bold mb-2 px-2">ACCOUNT</div>
            <button
              onClick={() => {
                onClose();
                navigate('/landing-preview');
              }}
              className="d-flex align-items-center gap-3 text-white text-decoration-none p-3 rounded mb-1 w-100 border-0 text-start"
              style={{
                transition: 'all 0.3s ease',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Eye size={20} />
              <span>Preview Landing Page</span>
            </button>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="d-flex align-items-center gap-3 text-danger text-decoration-none p-3 rounded mb-1 w-100 border-0 text-start"
              style={{
                transition: 'all 0.3s ease',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </>
  );
};

export default MobileMenu;
