import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to backend for logging (optional)
    try {
      // You could send error info to your backend here
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage for debugging
      localStorage.setItem('lastError', JSON.stringify(errorData));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with debugging information
      return (
        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            Something went wrong
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Error Details:</h4>
            <p style={{ color: '#6c757d' }}>
              <strong>Message:</strong> {this.state.error && this.state.error.message}
            </p>
            <p style={{ color: '#6c757d' }}>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
            <p style={{ color: '#6c757d' }}>
              <strong>URL:</strong> {window.location.href}
            </p>
          </div>

          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Stack (Click to expand)
            </summary>
            <pre style={{
              background: '#fff',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {this.state.error && this.state.error.stack}
            </pre>
          </details>

          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Component Stack (Click to expand)
            </summary>
            <pre style={{
              background: '#fff',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px'
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Reload Page
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;