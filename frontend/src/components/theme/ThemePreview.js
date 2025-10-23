import React from 'react';
import { THEMES } from '../../config/themes';

/**
 * ThemePreview - Shows a visual preview of a color theme
 */
const ThemePreview = ({ themeId, selected, onClick }) => {
  const theme = THEMES[themeId];

  if (!theme) return null;

  return (
    <div
      onClick={onClick}
      className={`card ${selected ? 'border-primary' : ''}`}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div className="card-body p-3">
        {/* Theme name and description */}
        <div className="mb-2">
          <div className="d-flex align-items-center justify-content-between">
            <strong className="d-block mb-1">{theme.name}</strong>
            {selected && (
              <span className="badge bg-primary">Selected</span>
            )}
          </div>
          <small className="text-muted">{theme.description}</small>
        </div>

        {/* Color swatches */}
        <div className="d-flex gap-1 mb-2">
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: theme.colors.primary,
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            title="Primary"
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: theme.colors.primaryDark,
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            title="Primary Dark"
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: theme.colors.secondary,
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            title="Secondary"
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: theme.colors.accent,
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            title="Accent"
          />
        </div>

        {/* Sample UI elements */}
        <div className="mt-2">
          <button
            className="btn btn-sm w-100 mb-1"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none'
            }}
          >
            Sample Button
          </button>
          <div
            className="p-2 rounded"
            style={{
              backgroundColor: theme.colors.accent + '20',
              color: theme.colors.primaryDark,
              fontSize: '0.75rem',
              border: `1px solid ${theme.colors.accent}`
            }}
          >
            Sample Badge
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ThemeGrid - Shows a grid of all available themes
 */
export const ThemeGrid = ({ currentTheme, onSelectTheme }) => {
  return (
    <div className="row g-3 mb-3">
      {Object.keys(THEMES).map(themeId => (
        <div key={themeId} className="col-md-6 col-lg-4">
          <ThemePreview
            themeId={themeId}
            selected={currentTheme === themeId}
            onClick={() => onSelectTheme(themeId)}
          />
        </div>
      ))}
    </div>
  );
};

export default ThemePreview;
