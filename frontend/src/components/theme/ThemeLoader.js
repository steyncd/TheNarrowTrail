import { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ThemeLoader - Loads theme settings from backend
 * This component doesn't render anything, it just loads the theme
 */
const ThemeLoader = () => {
  const { changeColorTheme } = useTheme();
  const { token } = useAuth();

  useEffect(() => {
    const loadThemeFromSettings = async () => {
      try {
        // Load color theme from backend settings
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/settings/branding_color_theme`,
          {
            headers: token ? {
              'Authorization': `Bearer ${token}`
            } : {}
          }
        );

        if (response.ok) {
          const data = await response.json();
          const themeId = data.setting_value || 'outdoor-classic';

          // Only change theme if it's different from current
          const currentThemeId = localStorage.getItem('hiking-portal-color-theme');
          if (currentThemeId !== themeId) {
            changeColorTheme(themeId);
          }
        }
      } catch (error) {
        console.error('Error loading theme from settings:', error);
        // Fallback to default theme
        changeColorTheme('outdoor-classic');
      }
    };

    loadThemeFromSettings();
  }, [token, changeColorTheme]);

  return null; // This component doesn't render anything
};

export default ThemeLoader;
