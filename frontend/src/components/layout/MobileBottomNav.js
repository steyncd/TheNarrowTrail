import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, CheckSquare, Star, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { path: '/hikes', icon: Home, label: 'Events' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/my-hikes', icon: CheckSquare, label: 'My Events' },
    { path: '/favorites', icon: Star, label: 'Favorites' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="mobile-bottom-nav d-md-none"
      style={{
        background: theme === 'dark' ? 'var(--card-bg)' : '#ffffff',
        borderTop: `1px solid ${theme === 'dark' ? 'var(--border-color)' : '#dee2e6'}`,
        boxShadow: theme === 'dark'
          ? '0 -2px 10px rgba(0,0,0,0.3)'
          : '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            className={`mobile-bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
            style={{
              color: active
                ? '#4a7c7c'
                : theme === 'dark' ? '#999' : '#666'
            }}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span className="mobile-bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
