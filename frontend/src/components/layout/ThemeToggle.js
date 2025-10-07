import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn d-flex align-items-center justify-content-center"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        transition: 'all 0.3s ease',
        padding: 0
      }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {theme === 'light' ? (
        <Moon size={20} style={{ transition: 'all 0.3s ease' }} />
      ) : (
        <Sun size={20} style={{ transition: 'all 0.3s ease' }} />
      )}
    </button>
  );
};

export default ThemeToggle;
