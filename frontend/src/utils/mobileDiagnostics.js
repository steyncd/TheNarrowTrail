// Mobile device detection and diagnostics
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: window.screen ? window.screen.width : 'unknown',
    screenHeight: window.screen ? window.screen.height : 'unknown',
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
    isMobile: isMobileDevice(),
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;    
      } catch (e) {
        return false;
      }
    })(),
    indexedDB: !!window.indexedDB,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window
  };
};

export const logDeviceInfo = () => {
  const deviceInfo = getDeviceInfo();
  console.log('Device Info:', deviceInfo);
  
  // Store device info for debugging
  try {
    localStorage.setItem('deviceInfo', JSON.stringify({
      ...deviceInfo,
      timestamp: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Could not store device info in localStorage:', e);
  }
  
  return deviceInfo;
};

export const checkMobileCompatibility = () => {
  const issues = [];
  
  // Check for common mobile compatibility issues
  if (!window.fetch) {
    issues.push('fetch API not supported');
  }
  
  if (!window.Promise) {
    issues.push('Promises not supported');
  }
  
  if (!window.Map) {
    issues.push('Map not supported');
  }
  
  if (!window.Set) {
    issues.push('Set not supported');
  }
  
  if (!Array.prototype.includes) {
    issues.push('Array.includes not supported');
  }
  
  if (!Object.assign) {
    issues.push('Object.assign not supported');
  }
  
  if (!window.requestAnimationFrame) {
    issues.push('requestAnimationFrame not supported');
  }
  
  if (issues.length > 0) {
    console.warn('Mobile compatibility issues detected:', issues);
    try {
      localStorage.setItem('compatibilityIssues', JSON.stringify({
        issues,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }));
    } catch (e) {
      console.warn('Could not store compatibility issues:', e);
    }
  }
  
  return issues;
};

// Initialize diagnostics
export const initMobileDiagnostics = () => {
  logDeviceInfo();
  const compatibilityIssues = checkMobileCompatibility();
  
  console.log('Mobile diagnostics initialized');
  console.log('Is mobile device:', isMobileDevice());
  console.log('Compatibility issues:', compatibilityIssues);
  
  return {
    deviceInfo: getDeviceInfo(),
    compatibilityIssues
  };
};