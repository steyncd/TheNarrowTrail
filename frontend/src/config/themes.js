/**
 * Portal Theme Configurations
 * Multiple pre-designed color schemes for the hiking portal
 */

export const THEMES = {
  // Default outdoor theme - earthy greens and blues
  'outdoor-classic': {
    id: 'outdoor-classic',
    name: 'Outdoor Classic',
    description: 'Earthy greens and blues inspired by nature',
    colors: {
      primary: '#4a7c7c',
      primaryDark: '#2d5a7c',
      primaryLight: '#6ab89f',
      secondary: '#4a7c59',
      accent: '#ffd700',
      accentDark: '#d4af37',
    }
  },

  // Mountain theme - grays and blues with snowy accents
  'mountain-peak': {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    description: 'Cool grays and blues with snowy white accents',
    colors: {
      primary: '#5a7d9a',
      primaryDark: '#3d5a73',
      primaryLight: '#7ca3c5',
      secondary: '#6b7c8c',
      accent: '#e8f4f8',
      accentDark: '#c2dce8',
    }
  },

  // Forest theme - deep greens and browns
  'forest-trail': {
    id: 'forest-trail',
    name: 'Forest Trail',
    description: 'Deep forest greens with warm earth tones',
    colors: {
      primary: '#2d5016',
      primaryDark: '#1a3009',
      primaryLight: '#4a7c2d',
      secondary: '#6b4423',
      accent: '#a8c256',
      accentDark: '#8aa342',
    }
  },

  // Desert theme - warm oranges and sandy browns
  'desert-sunset': {
    id: 'desert-sunset',
    name: 'Desert Sunset',
    description: 'Warm desert colors with sunset hues',
    colors: {
      primary: '#d4661f',
      primaryDark: '#b54e13',
      primaryLight: '#e67e2a',
      secondary: '#c97834',
      accent: '#f4a460',
      accentDark: '#d98e47',
    }
  },

  // Ocean theme - blues and teals
  'coastal-blue': {
    id: 'coastal-blue',
    name: 'Coastal Blue',
    description: 'Ocean-inspired blues and teals',
    colors: {
      primary: '#1e88e5',
      primaryDark: '#1565c0',
      primaryLight: '#42a5f5',
      secondary: '#00acc1',
      accent: '#26c6da',
      accentDark: '#00acc1',
    }
  },

  // Alpine theme - purples and blues
  'alpine-meadow': {
    id: 'alpine-meadow',
    name: 'Alpine Meadow',
    description: 'Mountain wildflower purples and sky blues',
    colors: {
      primary: '#7e57c2',
      primaryDark: '#5e35b1',
      primaryLight: '#9575cd',
      secondary: '#5c6bc0',
      accent: '#ab47bc',
      accentDark: '#8e24aa',
    }
  },

  // Autumn theme - warm reds and oranges
  'autumn-leaves': {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    description: 'Warm autumn colors with golden accents',
    colors: {
      primary: '#d84315',
      primaryDark: '#bf360c',
      primaryLight: '#ff6e40',
      secondary: '#f57c00',
      accent: '#ffab40',
      accentDark: '#ff9100',
    }
  },

  // Nordic theme - cool blues and grays
  'nordic-fjord': {
    id: 'nordic-fjord',
    name: 'Nordic Fjord',
    description: 'Cool Scandinavian blues and slate grays',
    colors: {
      primary: '#455a64',
      primaryDark: '#37474f',
      primaryLight: '#607d8b',
      secondary: '#546e7a',
      accent: '#78909c',
      accentDark: '#546e7a',
    }
  },

  // Tropical theme - vibrant greens and blues
  'tropical-paradise': {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Vibrant tropical colors',
    colors: {
      primary: '#00897b',
      primaryDark: '#00695c',
      primaryLight: '#26a69a',
      secondary: '#43a047',
      accent: '#66bb6a',
      accentDark: '#43a047',
    }
  },

  // Canyon theme - red rocks and sandstone
  'canyon-rock': {
    id: 'canyon-rock',
    name: 'Canyon Rock',
    description: 'Red rock and sandstone earth tones',
    colors: {
      primary: '#a0522d',
      primaryDark: '#8b4513',
      primaryLight: '#bc6f42',
      secondary: '#cd853f',
      accent: '#daa520',
      accentDark: '#b8860b',
    }
  },

  // Minimalist theme - clean blacks and whites
  'minimalist-mono': {
    id: 'minimalist-mono',
    name: 'Minimalist Mono',
    description: 'Clean modern monochromatic design',
    colors: {
      primary: '#424242',
      primaryDark: '#212121',
      primaryLight: '#616161',
      secondary: '#757575',
      accent: '#9e9e9e',
      accentDark: '#757575',
    }
  },

  // Faith theme - warm golds and blues
  'faith-journey': {
    id: 'faith-journey',
    name: 'Faith Journey',
    description: 'Warm golds with serene blues for faith-based groups',
    colors: {
      primary: '#3f51b5',
      primaryDark: '#303f9f',
      primaryLight: '#5c6bc0',
      secondary: '#1976d2',
      accent: '#ffc107',
      accentDark: '#ffa000',
    }
  },

  // Adventure theme - bold oranges and greens
  'adventure-seeker': {
    id: 'adventure-seeker',
    name: 'Adventure Seeker',
    description: 'Bold and energetic for thrill-seekers',
    colors: {
      primary: '#ff5722',
      primaryDark: '#e64a19',
      primaryLight: '#ff7043',
      secondary: '#689f38',
      accent: '#ffca28',
      accentDark: '#ffa000',
    }
  },

  // Zen theme - calming greens and tans
  'zen-nature': {
    id: 'zen-nature',
    name: 'Zen Nature',
    description: 'Calming natural tones for peaceful hiking',
    colors: {
      primary: '#7cb342',
      primaryDark: '#689f38',
      primaryLight: '#9ccc65',
      secondary: '#8d6e63',
      accent: '#aed581',
      accentDark: '#9ccc65',
    }
  },

  // Professional theme - corporate blues
  'professional': {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate-friendly blues and grays',
    colors: {
      primary: '#1976d2',
      primaryDark: '#0d47a1',
      primaryLight: '#2196f3',
      secondary: '#424242',
      accent: '#64b5f6',
      accentDark: '#1e88e5',
    }
  }
};

/**
 * Apply theme colors to the document root
 */
export const applyThemeColors = (themeId, mode = 'light') => {
  const theme = THEMES[themeId] || THEMES['outdoor-classic'];
  const root = document.documentElement;

  // Apply theme-specific colors
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--theme-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-accent-dark', theme.colors.accentDark);

  // Update Bootstrap primary color variable
  root.style.setProperty('--bs-primary', theme.colors.primary);
  root.style.setProperty('--bs-primary-rgb', hexToRgb(theme.colors.primary));

  // Apply light/dark mode specific colors
  if (mode === 'dark') {
    root.style.setProperty('--bg-primary', '#1a1a1a');
    root.style.setProperty('--bg-secondary', '#2d2d2d');
    root.style.setProperty('--bg-tertiary', '#3a3a3a');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#b0b0b0');
    root.style.setProperty('--text-muted', '#808080');
    root.style.setProperty('--border-color', '#404040');
    root.style.setProperty('--card-bg', '#2d2d2d');
    root.style.setProperty('--card-hover-bg', '#3a3a3a');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f8f9fa');
    root.style.setProperty('--bg-tertiary', '#e9ecef');
    root.style.setProperty('--text-primary', '#212529');
    root.style.setProperty('--text-secondary', '#6c757d');
    root.style.setProperty('--text-muted', '#adb5bd');
    root.style.setProperty('--border-color', '#dee2e6');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--card-hover-bg', '#f8f9fa');
  }

  // Gradient using theme colors
  root.style.setProperty('--gradient-start', theme.colors.primaryDark);
  root.style.setProperty('--gradient-end', theme.colors.secondary);
};

/**
 * Helper function to convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '74, 124, 124'; // fallback
}

/**
 * Get theme list for selection dropdown
 */
export const getThemeList = () => {
  return Object.values(THEMES).map(theme => ({
    value: theme.id,
    label: theme.name,
    description: theme.description
  }));
};

/**
 * Get theme by ID
 */
export const getTheme = (themeId) => {
  return THEMES[themeId] || THEMES['outdoor-classic'];
};
