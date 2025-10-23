import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * LockedContentTeaser - Shows a teaser for content that requires confirmation
 * Mobile-first design with clear call-to-action
 */
const LockedContentTeaser = ({
  icon: Icon,
  title,
  description,
  benefits = [],
  onConfirm
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="card" style={{
      background: isDark ? 'var(--card-bg)' : 'white',
      borderColor: isDark ? 'var(--border-color)' : '#dee2e6'
    }}>
      <div className="card-body text-center py-5">
        {/* Lock Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isDark ? 'rgba(255, 193, 7, 0.15)' : 'rgba(255, 193, 7, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Lock size={40} style={{ color: '#ffc107' }} />
        </div>

        {/* Icon and Title */}
        <div className="mb-3">
          {Icon && (
            <Icon size={24} className="me-2" style={{
              color: isDark ? '#8ab4f8' : '#0d6efd',
              verticalAlign: 'middle'
            }} />
          )}
          <h4 className="d-inline" style={{
            color: isDark ? 'var(--text-primary)' : '#212529'
          }}>
            {title}
          </h4>
        </div>

        {/* Description */}
        <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>
          {description}
        </p>

        {/* Benefits List */}
        {benefits.length > 0 && (
          <div className="mb-4">
            <p className="small text-muted mb-2" style={{ fontWeight: '600' }}>
              Unlock to:
            </p>
            <ul className="list-unstyled">
              {benefits.map((benefit, index) => (
                <li key={index} className="mb-2" style={{
                  color: isDark ? '#aaa' : '#6c757d'
                }}>
                  <CheckCircle size={16} className="me-2" style={{
                    color: '#198754',
                    verticalAlign: 'middle'
                  }} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call to Action */}
        <button
          className="btn btn-primary btn-lg"
          onClick={onConfirm}
          style={{
            minWidth: '200px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Confirm Attendance to Unlock
        </button>

        <p className="small text-muted mt-3 mb-0">
          Express your interest first, then confirm to access all features
        </p>
      </div>
    </div>
  );
};

export default LockedContentTeaser;
