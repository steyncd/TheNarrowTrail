// components/profile/UserPreferences.js - User Preference Questions for Better Recommendations
import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Mountain, Calendar, TrendingUp, Users, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const UserPreferences = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState({
    preferred_event_types: [],
    preferred_difficulties: [],
    preferred_group_types: [],
    preferred_distances: [],
    preferred_cycling_distances: [],
    hiking_frequency: '',
    preferred_days: [],
    max_travel_distance: '',
    budget_range: '',
    interests: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const data = await api.getUserPreferences(token);
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Fetch preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await api.updateUserPreferences(preferences, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save preferences error:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayValue = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const updateValue = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const cardStyle = {
    background: theme === 'dark' ? 'var(--card-bg)' : 'white',
    border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
  };

  const buttonStyle = (isActive) => ({
    background: isActive
      ? theme === 'dark' ? 'var(--primary-color)' : '#4a7c7c'
      : theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    color: isActive ? 'white' : theme === 'dark' ? 'var(--text-color)' : '#333',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  if (loading) {
    return (
      <div className="card" style={cardStyle}>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm" style={cardStyle}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">
            <Settings size={20} className="me-2" />
            Event Preferences
          </h5>
          {saved && (
            <span className="badge bg-success">
              <CheckCircle size={14} className="me-1" />
              Saved!
            </span>
          )}
        </div>

        <p className="text-muted mb-4">
          Help us personalize your experience by sharing your event preferences. We'll use this to recommend events that match your interests!
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Event Types */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <Mountain size={18} className="me-2" />
            What types of events interest you?
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['hiking', '4x4_excursions', 'camping', 'cycling', 'rock_climbing', 'any_outdoor_activities'].map(type => (
              <button
                key={type}
                type="button"
                style={buttonStyle(preferences.preferred_event_types.includes(type))}
                onClick={() => toggleArrayValue('preferred_event_types', type)}
              >
                {type === '4x4_excursions' ? '4x4 Excursions' :
                 type === 'any_outdoor_activities' ? 'Any Outdoor Activities' :
                 type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Levels */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <TrendingUp size={18} className="me-2" />
            Which difficulty levels do you prefer?
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'].map(level => (
              <button
                key={level}
                type="button"
                style={buttonStyle(preferences.preferred_difficulties.includes(level))}
                onClick={() => toggleArrayValue('preferred_difficulties', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Group Types */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <Users size={18} className="me-2" />
            What group settings do you enjoy?
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['family', 'mens_only', 'solo', 'couples', 'group_outings'].map(type => (
              <button
                key={type}
                type="button"
                style={buttonStyle(preferences.preferred_group_types.includes(type))}
                onClick={() => toggleArrayValue('preferred_group_types', type)}
              >
                {type === 'mens_only' ? 'Mens Only' :
                 type === 'group_outings' ? 'Group Outings' :
                 type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Preferences */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <MapPin size={18} className="me-2" />
            Preferred hiking distances
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['short', 'medium', 'long', 'ultra'].map(dist => (
              <button
                key={dist}
                type="button"
                style={buttonStyle(preferences.preferred_distances.includes(dist))}
                onClick={() => toggleArrayValue('preferred_distances', dist)}
              >
                {dist === 'short' && 'Short (< 10km)'}
                {dist === 'medium' && 'Medium (10-20km)'}
                {dist === 'long' && 'Long (20-40km)'}
                {dist === 'ultra' && 'Ultra (> 40km)'}
              </button>
            ))}
          </div>
        </div>

        {/* Cycling Distance Preferences */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <MapPin size={18} className="me-2" />
            Preferred cycling distances
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['short', 'medium', 'long', 'ultra'].map(dist => (
              <button
                key={dist}
                type="button"
                style={buttonStyle(preferences.preferred_cycling_distances.includes(dist))}
                onClick={() => toggleArrayValue('preferred_cycling_distances', dist)}
              >
                {dist === 'short' && 'Short (< 20km)'}
                {dist === 'medium' && 'Medium (20-50km)'}
                {dist === 'long' && 'Long (50-100km)'}
                {dist === 'ultra' && 'Ultra (> 100km)'}
              </button>
            ))}
          </div>
        </div>

        {/* Hiking Frequency */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <Calendar size={18} className="me-2" />
            How often do you want to attend events?
          </label>
          <select
            className="form-select"
            value={preferences.hiking_frequency}
            onChange={(e) => updateValue('hiking_frequency', e.target.value)}
            style={{
              background: theme === 'dark' ? 'var(--input-bg)' : 'white',
              color: theme === 'dark' ? 'var(--text-color)' : '#333',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}
          >
            <option value="">Select frequency...</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Monthly</option>
            <option value="occasionally">Occasionally</option>
          </select>
        </div>

        {/* Preferred Days */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <Clock size={18} className="me-2" />
            Which days work best for you?
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <button
                key={day}
                type="button"
                style={buttonStyle(preferences.preferred_days.includes(day))}
                onClick={() => toggleArrayValue('preferred_days', day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Max Travel Distance */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            <MapPin size={18} className="me-2" />
            Maximum travel distance to event location
          </label>
          <select
            className="form-select"
            value={preferences.max_travel_distance}
            onChange={(e) => updateValue('max_travel_distance', e.target.value)}
            style={{
              background: theme === 'dark' ? 'var(--input-bg)' : 'white',
              color: theme === 'dark' ? 'var(--text-color)' : '#333',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}
          >
            <option value="">No preference</option>
            <option value="50">Within 50km</option>
            <option value="100">Within 100km</option>
            <option value="200">Within 200km</option>
            <option value="500">Within 500km</option>
            <option value="unlimited">Any distance</option>
          </select>
        </div>

        {/* Budget Range */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            Typical budget per event
          </label>
          <select
            className="form-select"
            value={preferences.budget_range}
            onChange={(e) => updateValue('budget_range', e.target.value)}
            style={{
              background: theme === 'dark' ? 'var(--input-bg)' : 'white',
              color: theme === 'dark' ? 'var(--text-color)' : '#333',
              border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
            }}
          >
            <option value="">No preference</option>
            <option value="budget">Budget (R0-R300)</option>
            <option value="moderate">Moderate (R300-R600)</option>
            <option value="premium">Premium (R600-R1000)</option>
            <option value="luxury">Luxury (R1000+)</option>
          </select>
        </div>

        {/* Specific Interests */}
        <div className="mb-4">
          <label className="form-label fw-bold">
            Specific interests or features you look for
          </label>
          <div className="d-flex flex-wrap gap-2">
            {['wildlife', 'photography', 'waterfalls', 'mountains', 'coastal', 'bushveld'].map(interest => (
              <button
                key={interest}
                type="button"
                style={buttonStyle(preferences.interests.includes(interest))}
                onClick={() => toggleArrayValue('interests', interest)}
              >
                {interest.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="d-grid mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="me-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
