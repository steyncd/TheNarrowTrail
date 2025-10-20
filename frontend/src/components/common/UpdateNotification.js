// components/common/UpdateNotification.js
// Banner notification for available app updates

import React from 'react';
import { RefreshCw, X } from 'lucide-react';

const UpdateNotification = ({ onUpdate, onDismiss, latestVersion }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0d6efd',
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <RefreshCw size={20} />
        <div>
          <strong>New Version Available!</strong>
          <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.9 }}>
            A new version of the app has been deployed.
            {latestVersion && latestVersion.buildTime && (
              <span style={{ marginLeft: '8px' }}>
                (Built: {new Date(latestVersion.buildTime).toLocaleString()})
              </span>
            )}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={onUpdate}
          style={{
            backgroundColor: 'white',
            color: '#0d6efd',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <RefreshCw size={16} />
          Refresh Now
        </button>

        <button
          onClick={onDismiss}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          title="Dismiss for 1 hour"
        >
          <X size={16} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateNotification;
