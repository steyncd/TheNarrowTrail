import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/mobile.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // Store error for debugging
  localStorage.setItem('unhandledRejection', JSON.stringify({
    reason: event.reason ? event.reason.toString() : 'Unknown error',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }));
});

// Global error handler for JavaScript errors
window.addEventListener('error', event => {
  console.error('Global JavaScript error:', event.error);
  // Store error for debugging
  localStorage.setItem('globalError', JSON.stringify({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? event.error.toString() : 'Unknown error',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }));
});

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback error display
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; margin: 20px; border-radius: 8px;">
        <h2 style="color: #dc3545;">Failed to Load Application</h2>
        <p>There was an error loading the hiking portal application.</p>
        <details>
          <summary style="cursor: pointer; font-weight: bold;">Error Details</summary>
          <pre style="background: #fff; padding: 10px; border: 1px solid #ccc; border-radius: 4px; overflow: auto; font-size: 12px; margin-top: 10px;">${error.toString()}</pre>
        </details>
        <p style="margin-top: 20px;">
          <strong>User Agent:</strong> ${navigator.userAgent}
        </p>
        <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Reload Page
        </button>
        <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Clear Storage & Reload
        </button>
      </div>
    `;
  }
}

// Register service worker for PWA capabilities
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Content is cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('New content available! Please refresh.');
    // Optional: Show update notification to user
    if (window.confirm('New version available! Refresh to update?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }
});
