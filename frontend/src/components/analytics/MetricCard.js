import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`card h-100 ${isDark ? 'bg-dark text-light' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`p-2 rounded bg-${color} bg-opacity-10`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
        </div>
        <h3 className="mb-1">{value}</h3>
        <p className="text-muted mb-1">{title}</p>
        {subtitle && (
          <small className="text-muted">{subtitle}</small>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
