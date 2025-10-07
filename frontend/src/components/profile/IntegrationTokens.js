// components/profile/IntegrationTokens.js - Manage long-lived tokens for integrations
import React, { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const IntegrationTokens = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await api.listLongLivedTokens(token);
      setTokens(response.tokens || []);
    } catch (err) {
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!tokenName.trim()) {
      alert('Please enter a name for your token');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.generateLongLivedToken(tokenName, token);

      if (response.success) {
        setGeneratedToken(response.data.token);
        setTokenName('');
        fetchTokens();
      } else {
        alert('Failed to generate token: ' + response.error);
      }
    } catch (err) {
      console.error('Error generating token:', err);
      alert('Failed to generate token');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Token copied to clipboard!');
  };

  const handleRevoke = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.revokeLongLivedToken(id, token);
      if (response.success) {
        fetchTokens();
      } else {
        alert('Failed to revoke token: ' + response.error);
      }
    } catch (err) {
      console.error('Error revoking token:', err);
      alert('Failed to revoke token');
    }
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setGeneratedToken(null);
    setTokenName('');
  };

  return (
    <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">
              <Key size={20} className="me-2" />
              Integration Tokens
            </h5>
            <small className="text-muted">
              Generate long-lived tokens for Home Assistant and other integrations
            </small>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowGenerateModal(true)}
          >
            <Plus size={16} className="me-1" />
            Generate Token
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-4">
            <Key size={48} className="text-muted mb-3" />
            <p className="text-muted">No tokens generated yet</p>
            <p className="small text-muted">
              Generate a token to use with Home Assistant or other integrations
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Token Preview</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>
                      <code className="small">{t.token_preview}</code>
                    </td>
                    <td>
                      <small>{new Date(t.created_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <small>
                        {t.last_used_at
                          ? new Date(t.last_used_at).toLocaleDateString()
                          : 'Never'}
                      </small>
                    </td>
                    <td>
                      <small>{new Date(t.expires_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRevoke(t.id, t.name)}
                        title="Revoke token"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="alert alert-info mt-3 mb-0">
          <AlertCircle size={16} className="me-2" />
          <small>
            <strong>What are integration tokens?</strong> These are long-lived tokens (valid for 1 year)
            that you can use with Home Assistant or other third-party integrations. They won't expire
            like regular login tokens.
          </small>
        </div>
      </div>

      {/* Generate Token Modal */}
      {showGenerateModal && (
        <>
          <div className="modal-backdrop show" onClick={closeGenerateModal} style={{ zIndex: 1040 }} />
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content"
                style={{
                  background: isDark ? '#2d2d2d' : 'white',
                  color: isDark ? 'var(--text-primary)' : '#212529'
                }}
              >
                <div className="modal-header border-bottom">
                  <h5 className="modal-title">
                    {generatedToken ? 'Token Generated!' : 'Generate Integration Token'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeGenerateModal}
                    style={{ filter: isDark ? 'invert(1)' : 'none' }}
                  />
                </div>

                <div className="modal-body">
                  {generatedToken ? (
                    <div>
                      <div className="alert alert-warning">
                        <AlertCircle size={16} className="me-2" />
                        <strong>Save this token!</strong> You won't be able to see it again.
                      </div>

                      <label className="form-label fw-bold">Your Token:</label>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control font-monospace small"
                          value={generatedToken}
                          readOnly
                          style={{
                            background: isDark ? '#1a1a1a' : '#f8f9fa',
                            color: isDark ? 'var(--text-primary)' : '#212529'
                          }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleCopy(generatedToken)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      <div className="alert alert-info">
                        <h6 className="mb-2">How to use this token:</h6>
                        <ol className="mb-0 small">
                          <li>Copy the token above</li>
                          <li>In Home Assistant, go to Settings → Devices & Services</li>
                          <li>Click "+ Add Integration" and search for "The Narrow Trail"</li>
                          <li>Paste this token when prompted</li>
                        </ol>
                        <a
                          href="https://github.com/hiking-portal/homeassistant"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary mt-2"
                        >
                          <ExternalLink size={14} className="me-1" />
                          View Documentation
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted">
                        Give your token a memorable name so you can identify it later.
                      </p>

                      <div className="mb-3">
                        <label className="form-label">Token Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., Home Assistant, Mobile App"
                          value={tokenName}
                          onChange={(e) => setTokenName(e.target.value)}
                          style={{
                            background: isDark ? '#1a1a1a' : 'white',
                            color: isDark ? 'var(--text-primary)' : '#212529',
                            borderColor: isDark ? '#444' : '#ced4da'
                          }}
                        />
                      </div>

                      <div className="alert alert-info small">
                        <AlertCircle size={14} className="me-2" />
                        This token will be valid for 1 year and can be revoked at any time.
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top">
                  {generatedToken ? (
                    <button className="btn btn-primary" onClick={closeGenerateModal}>
                      Done
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-secondary" onClick={closeGenerateModal}>
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={generating || !tokenName.trim()}
                      >
                        {generating ? 'Generating...' : 'Generate Token'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IntegrationTokens;
