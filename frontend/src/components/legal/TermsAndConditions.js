import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../common/PageHeader';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';

function TermsAndConditions() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getPublicContent('terms_conditions');
        setContent(data);
      } catch (err) {
        console.error('Error fetching terms and conditions:', err);
        setError('Failed to load terms and conditions');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const cardBg = isDark ? '#2d2d2d' : '#fff';
  const textColor = isDark ? '#fff' : '#212529';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: '20px' }}>
        <PageHeader
          title="Terms and Conditions"
          subtitle="Membership Agreement for The Narrow Trail"
          icon={FileText}
        />
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="card shadow-sm mb-4" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
            <div className="card-body p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3" style={{ color: textColor }}>Loading terms and conditions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: '20px' }}>
        <PageHeader
          title="Terms and Conditions"
          subtitle="Membership Agreement for The Narrow Trail"
          icon={FileText}
        />
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="card shadow-sm mb-4" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="alert alert-danger">
                <AlertTriangle size={20} className="me-2" />
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = content?.updated_at ? new Date(content.updated_at).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'October 9, 2025';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa', padding: '20px' }}>
      <PageHeader
        title={content?.title || "Terms and Conditions"}
        subtitle="Membership Agreement for The Narrow Trail"
        icon={FileText}
      />

      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card shadow-sm mb-4" style={{ backgroundColor: cardBg, borderRadius: '12px' }}>
          <div className="card-body p-4">
            <div className="alert alert-warning mb-4" style={{ borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                <div>
                  <strong>Important:</strong> Please read these terms carefully before using our services.
                  By registering and using The Narrow Trail platform, you agree to be bound by these terms.<br />
                  <strong>Last Updated:</strong> {lastUpdated}
                </div>
              </div>
            </div>

            <div style={{ color: textColor }}>
              <ReactMarkdown
                components={{
                  h1: ({children, ...props}) => <h2 className="h3 mb-3 mt-4" style={{ color: textColor }} {...props}>{children}</h2>,
                  h2: ({children, ...props}) => <h3 className="h5 mb-3 mt-4" style={{ color: textColor }} {...props}>{children}</h3>,
                  h3: ({children, ...props}) => <h4 className="h6 mb-2 mt-3 text-primary" {...props}>{children}</h4>,
                  p: ({node, ...props}) => <p className="mb-3" style={{ lineHeight: '1.8' }} {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-3" style={{ lineHeight: '1.8' }} {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-3" style={{ lineHeight: '1.8' }} {...props} />,
                  table: ({node, ...props}) => (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-3" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="table-light" {...props} />,
                  strong: ({node, ...props}) => <strong style={{ color: textColor }} {...props} />,
                  hr: ({node, ...props}) => <hr className="my-4" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <div className="alert alert-warning" {...props} />
                  )
                }}
              >
                {content?.content || ''}
              </ReactMarkdown>
            </div>

            <div className="alert alert-info mt-4" style={{ borderRadius: '8px' }}>
              <h6 className="mb-2">Agreement</h6>
              <p className="mb-0 small">
                By clicking "I Agree" during registration or by using the Service, you acknowledge that you have read,
                understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
