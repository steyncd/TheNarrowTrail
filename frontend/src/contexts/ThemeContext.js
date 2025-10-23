import React, { createContext, useContext, useState, useEffect } from 'react';
import { applyThemeColors, THEMES } from '../config/themes';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Light/Dark mode state
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('hiking-portal-mode');
    return savedMode || 'light';
  });

  // Color theme state
  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('hiking-portal-color-theme');
    return savedColorTheme || 'outdoor-classic';
  });

  useEffect(() => {
    // Save mode to localStorage
    localStorage.setItem('hiking-portal-mode', mode);

    // Apply mode attribute to document root
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    // Save color theme to localStorage
    localStorage.setItem('hiking-portal-color-theme', colorTheme);

    // Apply theme colors
    applyThemeColors(colorTheme, mode);
  }, [colorTheme, mode]);

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const changeColorTheme = (themeId) => {
    if (THEMES[themeId]) {
      setColorTheme(themeId);
    }
  };

  const value = {
    mode,
    colorTheme,
    theme: mode, // Backward compatibility
    toggleTheme: toggleMode, // Backward compatibility
    toggleMode,
    changeColorTheme,
    isDark: mode === 'dark',
    currentTheme: THEMES[colorTheme] || THEMES['outdoor-classic']
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
