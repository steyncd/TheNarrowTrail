import React, { useState } from 'react';
import { Download, Share2, Bell, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { usePWA, usePWANotifications, useWebShare, useNetworkStatus } from '../../hooks/usePWA';
import { useTheme } from '../../contexts/ThemeContext';

const PWAUtilities = () => {
  const [showUtilities, setShowUtilities] = useState(false);
  const { isInstalled, isInstallable, install } = usePWA();
  const { permission, requestPermission, showNotification } = usePWANotifications();
  const { share } = useWebShare();
  const { isOnline, connectionType } = useNetworkStatus();
  const { theme } = useTheme();

  if (isInstalled) {
    return null; // Don't show utilities if already installed
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      console.log('PWA installed successfully');
    }
  };

  const handleNotificationRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      showNotification('Notifications Enabled!', {
        body: 'You\'ll now receive updates about new hikes and events.',
        tag: 'notification-enabled'
      });
    }
  };

  const handleShare = async () => {
    await share({
      title: 'The Narrow Trail - Hiking Adventures',
      text: 'Join us for amazing hiking adventures in beautiful locations!',
      url: window.location.origin
    });
  };

  const buttonStyle = {
    position: 'fixed',
    bottom: '140px', // Position above the other two buttons (20px + 48px + 10px gap + 48px + 14px gap)
    right: '20px',
    width: '48px', // Match other button sizes
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#2d5016',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(45, 80, 22, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999, // Lower than feedback/suggest buttons
    transition: 'all 0.3s ease',
  };

  const utilityPanelStyle = {
    position: 'fixed',
    bottom: '200px', // Position above the button (140px + 48px button + 12px gap)
    right: '20px',
    width: '280px',
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
    zIndex: 998, // Lower than button
    padding: '20px',
    color: theme === 'dark' ? '#fff' : '#212529',
  };

  const utilityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  };

  return (
    <>
      {/* PWA Utilities Button */}
      <button
        onClick={() => setShowUtilities(!showUtilities)}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(45, 80, 22, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.3)';
        }}
        title="PWA Features"
      >
        <Smartphone size={24} />
      </button>

      {/* Utilities Panel */}
      {showUtilities && (
        <div style={utilityPanelStyle}>
          <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '600' }}>
            App Features
          </h4>

          {/* Connection Status */}
          <div style={utilityItemStyle}>
            {isOnline ? <Wifi size={20} color="#28a745" /> : <WifiOff size={20} color="#dc3545" />}
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {connectionType !== 'unknown' && `Connection: ${connectionType}`}
              </div>
            </div>
          </div>

          {/* Install App */}
          {isInstallable && (
            <div
              style={utilityItemStyle}
              onClick={handleInstall}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              <Download size={20} color="#2d5016" />
              <div>
                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                  Install App
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Get faster loading and offline access
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {permission !== 'granted' && (
            <div
              style={utilityItemStyle}
              onClick={handleNotificationRequest}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              <Bell size={20} color="#ffc107" />
              <div>
                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                  Enable Notifications
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Get notified about new hikes
                </div>
              </div>
            </div>
          )}

          {/* Share */}
          <div
            style={{ ...utilityItemStyle, borderBottom: 'none' }}
            onClick={handleShare}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <Share2 size={20} color="#17a2b8" />
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                Share App
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Tell friends about The Narrow Trail
              </div>
            </div>
          </div>

          {/* PWA Status */}
          <div style={{ marginTop: '16px', fontSize: '0.8rem', opacity: 0.7, textAlign: 'center' }}>
            {isInstalled ? '✅ App Installed' : '📱 Web App Ready'}
          </div>
        </div>
      )}
    </>
  );
};

export default PWAUtilities;