import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileDropdown = ({ show, onClose, buttonRef }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!show || !buttonRef.current || !dropdownRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdown = dropdownRef.current;

    dropdown.style.top = (buttonRect.bottom + 8) + 'px';
    const rightOffset = window.innerWidth - buttonRect.right;
    dropdown.style.left = 'auto';
    dropdown.style.right = Math.max(rightOffset, 16) + 'px';
  }, [show, buttonRef]);

  if (!show) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1040
        }}
      />

      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          background: theme === 'dark' ? '#2d2d2d' : 'white',
          borderRadius: '10px',
          minWidth: '250px',
          width: '280px',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1050,
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          color: theme === 'dark' ? '#fff' : '#212529'
        }}
      >
        <div className="p-3 border-bottom" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="fw-bold">{currentUser?.name}</div>
          <div className="small text-muted">{currentUser?.email}</div>
          <div className="small mt-1">
            <span className="badge bg-primary">{currentUser?.role}</span>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate('/profile');
          }}
          className="btn btn-link w-100 text-start p-3 border-0"
          style={{
            textDecoration: 'none',
            color: theme === 'dark' ? '#fff' : '#212529',
            borderRadius: 0
          }}
        >
          <User size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
          My Profile
        </button>

        <button
          onClick={toggleTheme}
          className="btn btn-link w-100 text-start p-3 border-0"
          style={{
            textDecoration: 'none',
            color: theme === 'dark' ? '#fff' : '#212529',
            borderRadius: 0
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
              Light Mode
            </>
          ) : (
            <>
              <Moon size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
              Dark Mode
            </>
          )}
        </button>

        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="btn btn-link text-danger w-100 text-start p-3 border-0"
          style={{
            textDecoration: 'none',
            borderRadius: '0 0 10px 10px'
          }}
        >
          <LogOut size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
          Logout
        </button>
      </div>
    </>
  );
};

export default ProfileDropdown;
