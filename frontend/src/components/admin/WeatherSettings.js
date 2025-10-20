// components/admin/WeatherSettings.js - Weather API configuration panel
import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudRain, Sun, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

const WeatherSettings = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    weather_api_enabled: 'true',
    weather_api_primary: 'visualcrossing',
    weather_api_fallback: 'weatherapi'
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cardBg = theme === 'dark' ? '#2d2d2d' : '#ffffff';
  const textColor = theme === 'dark' ? '#e0e0e0' : '#212529';
  const mutedColor = theme === 'dark' ? '#999' : '#6c757d';

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getSettingsByCategory('weather', token);
      
      const settingsObj = response.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {});
      
      setSettings(settingsObj);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load weather settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadProviders = useCallback(async () => {
    try {
      const response = await api.getWeatherProviders(token);
      setProviders(response);
    } catch (err) {
      console.error('Error loading providers:', err);
    }
  }, [token]);

  useEffect(() => {
    loadSettings();
    loadProviders();
  }, [loadSettings, loadProviders]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      await api.updateSettingsBatch(settingsArray, token);
      
      setSuccess('Weather settings saved successfully! Changes take effect immediately.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async (providerId) => {
    try {
      setTesting(providerId);
      setTestResults(prev => ({ ...prev, [providerId]: null }));

      const response = await api.testWeatherProvider(
        providerId,
        'Table Mountain, Cape Town',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        token
      );

      setTestResults(prev => ({
        ...prev,
        [providerId]: response
      }));
    } catch (err) {
      console.error('Error testing provider:', err);
      setTestResults(prev => ({
        ...prev,
        [providerId]: {
          success: false,
          error: err.message
        }
      }));
    } finally {
      setTesting(null);
    }
  };

  const getProviderIcon = (providerId) => {
    if (providerId === 'visualcrossing') return Sun;
    if (providerId === 'weatherapi') return CloudRain;
    return Cloud;
  };

  if (loading) {
    return (
      <div className="card" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Loading weather settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertTriangle size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <Check size={18} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Global Enable/Disable */}
      <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
          <h5 className="mb-0">
            <CloudRain size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
            Weather System Status
          </h5>
        </div>
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="weatherEnabled"
              checked={settings.weather_api_enabled === 'true'}
              onChange={(e) => handleSettingChange('weather_api_enabled', e.target.checked ? 'true' : 'false')}
              style={{ cursor: 'pointer', width: '48px', height: '24px' }}
            />
            <label className="form-check-label ms-2" htmlFor="weatherEnabled" style={{ cursor: 'pointer' }}>
              <strong>Enable Weather Forecasts</strong>
              <br />
              <small style={{ color: mutedColor }}>Show weather information on hike pages</small>
            </label>
          </div>
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
          <h5 className="mb-0">
            <Cloud size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
            Weather Provider Configuration
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label"><strong>Primary Weather Provider</strong></label>
              <select
                className="form-select"
                value={settings.weather_api_primary}
                onChange={(e) => handleSettingChange('weather_api_primary', e.target.value)}
              >
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                    {provider.isConfigured ? ' ✓' : ' (Not Configured)'}
                  </option>
                ))}
              </select>
              <div className="form-text">
                Primary API used for weather requests. Best coverage for South Africa.
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label"><strong>Fallback Provider</strong></label>
              <select
                className="form-select"
                value={settings.weather_api_fallback}
                onChange={(e) => handleSettingChange('weather_api_fallback', e.target.value)}
              >
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                    {provider.isConfigured ? ' ✓' : ' (Not Configured)'}
                  </option>
                ))}
              </select>
              <div className="form-text">
                Automatic fallback if primary provider fails.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Status & Testing */}
      <div className="card mb-4" style={{ backgroundColor: cardBg, color: textColor }}>
        <div className="card-header" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
          <h5 className="mb-0">
            <RefreshCw size={20} className="me-2" style={{ verticalAlign: 'text-bottom' }} />
            Provider Status & Testing
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">
            Test each provider to verify API connectivity and response time. Test location: Table Mountain, Cape Town (7 days from now).
          </p>

          {providers.map(provider => {
            const Icon = getProviderIcon(provider.id);
            const isPrimary = settings.weather_api_primary === provider.id;
            const isFallback = settings.weather_api_fallback === provider.id;
            const testResult = testResults[provider.id];

            return (
              <div
                key={provider.id}
                className="card mb-3"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  borderLeft: `4px solid ${provider.isConfigured ? '#28a745' : '#dc3545'}`
                }}
              >
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <Icon size={24} className="me-3" />
                        <div>
                          <h6 className="mb-0">
                            {provider.name}
                            {isPrimary && (
                              <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>Primary</span>
                            )}
                            {isFallback && (
                              <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7rem' }}>Fallback</span>
                            )}
                          </h6>
                          <small style={{ color: mutedColor }}>
                            {provider.freeLimit} | {provider.forecastDays} day forecast
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="text-center">
                        {provider.isConfigured ? (
                          <span className="badge bg-success">
                            <Check size={14} className="me-1" />
                            Configured
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <X size={14} className="me-1" />
                            Not Configured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <button
                        className="btn btn-sm btn-outline-primary w-100"
                        onClick={() => handleTestProvider(provider.id)}
                        disabled={testing === provider.id || !provider.isConfigured}
                      >
                        {testing === provider.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Testing...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={14} className="me-2" />
                            Test
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResult && (
                    <div className="mt-3 p-2" style={{ backgroundColor: cardBg, borderRadius: '4px' }}>
                      {testResult.success ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-success">
                              <Check size={16} className="me-1" />
                              Test Successful
                            </span>
                            <small style={{ color: mutedColor }}>
                              Response time: {testResult.responseTime}ms
                            </small>
                          </div>
                          {testResult.weather && (
                            <small>
                              <strong>{testResult.weather.location?.name || 'Location'}:</strong>{' '}
                              {testResult.weather.temperature}°C, {testResult.weather.weather || testResult.weather.description || testResult.weather.conditions || 'N/A'}
                            </small>
                          )}
                        </div>
                      ) : (
                        <div className="text-danger">
                          <X size={16} className="me-1" />
                          Test Failed: {testResult.error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Setup Instructions for Unconfigured */}
                  {!provider.isConfigured && (
                    <div className="alert alert-warning mt-3 mb-0" role="alert">
                      <small>
                        <strong>Setup Required:</strong> Add <code>{provider.apiKeyEnvVar}</code> to Google Secret Manager
                      </small>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-primary px-4"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Saving...
            </>
          ) : (
            <>
              <Check size={18} className="me-2" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WeatherSettings;
