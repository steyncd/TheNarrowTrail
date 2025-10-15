import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Zap, Wifi } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay (don't be immediately annoying)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleDismissIOS = () => {
    setShowIOSInstructions(false);
  };

  // Don't show if already installed or dismissed
  if (isInstalled || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  // Don't show on desktop unless there's a deferred prompt
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const modalStyle = {
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
    color: theme === 'dark' ? '#fff' : '#212529',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  };

  const features = [
    { icon: Zap, text: 'Faster loading' },
    { icon: Wifi, text: 'Works offline' },
    { icon: Smartphone, text: 'Native app feel' },
  ];

  if (showIOSInstructions) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <button
            onClick={handleDismissIOS}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#fff' : '#212529',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#2d5016',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Smartphone size={30} color="white" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>
              Install The Narrow Trail
            </h3>
            <p style={{ margin: 0, color: theme === 'dark' ? '#adb5bd' : '#6c757d', fontSize: '0.875rem' }}>
              Add to your home screen for the best experience
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>How to install on iOS:</h4>
            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
              <li style={{ marginBottom: '8px' }}>
                Tap the <strong>Share</strong> button at the bottom of your browser
              </li>
              <li style={{ marginBottom: '8px' }}>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </li>
              <li style={{ marginBottom: '8px' }}>
                Tap <strong>"Add"</strong> in the top right corner
              </li>
              <li>
                The app will appear on your home screen!
              </li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <feature.icon size={16} color="#2d5016" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: theme === 'dark' ? '#fff' : '#212529',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#2d5016',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Monitor size={30} color="white" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>
            Install The Narrow Trail
          </h3>
          <p style={{ margin: 0, color: theme === 'dark' ? '#adb5bd' : '#6c757d', fontSize: '0.875rem' }}>
            Get the full app experience with faster loading, offline access, and more
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {features.map((feature, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <feature.icon size={16} color="#2d5016" />
              </div>
              <span style={{ fontSize: '0.875rem' }}>{feature.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#444' : '#dee2e6'}`,
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#fff' : '#212529',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            style={{
              flex: 2,
              padding: '12px 16px',
              border: 'none',
              backgroundColor: '#2d5016',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Download size={16} />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;