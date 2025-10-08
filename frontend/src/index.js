import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/mobile.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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
