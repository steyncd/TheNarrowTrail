import React, { useState, useEffect } from 'react';
import { User, Calendar, Mountain, Lock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const EditProfileModal = ({ show, onHide, profile, onProfileUpdated }) => {
  const { token } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    bio: '',
    hiking_since: '',
    experience_level: 'beginner',
    preferred_difficulty: 'moderate',
    profile_visibility: 'public'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile && show) {
      setFormData({
        bio: profile.bio || '',
        hiking_since: profile.hiking_since ? profile.hiking_since.split('T')[0] : '',
        experience_level: profile.experience_level || 'beginner',
        preferred_difficulty: profile.preferred_difficulty || 'moderate',
        profile_visibility: profile.profile_visibility || 'public'
      });
      setError(null);
      setSuccess(false);
    }
  }, [profile, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.updateProfile(formData, token);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onProfileUpdated();
          onHide();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const isDark = theme === 'dark';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className={`modal-content ${isDark ? 'bg-dark text-light' : ''}`}>
          <div className="modal-header border-bottom">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <User size={24} />
              Edit Profile
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} id="editProfileForm">
              {/* Bio */}
              <div className="mb-3">
                <label htmlFor="bio" className="form-label d-flex align-items-center gap-2">
                  <FileText size={18} />
                  Bio
                </label>
                <textarea
                  className={`form-control ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your hiking experience..."
                  maxLength="500"
                />
                <small className="text-muted">
                  {formData.bio.length}/500 characters
                </small>
              </div>

              {/* Hiking Since */}
              <div className="mb-3">
                <label htmlFor="hiking_since" className="form-label d-flex align-items-center gap-2">
                  <Calendar size={18} />
                  Hiking Since
                </label>
                <input
                  type="date"
                  className={`form-control ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                  id="hiking_since"
                  name="hiking_since"
                  value={formData.hiking_since}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Experience Level */}
              <div className="mb-3">
                <label htmlFor="experience_level" className="form-label d-flex align-items-center gap-2">
                  <Mountain size={18} />
                  Experience Level
                </label>
                <select
                  className={`form-select ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Preferred Difficulty */}
              <div className="mb-3">
                <label htmlFor="preferred_difficulty" className="form-label d-flex align-items-center gap-2">
                  <Mountain size={18} />
                  Preferred Difficulty
                </label>
                <select
                  className={`form-select ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                  id="preferred_difficulty"
                  name="preferred_difficulty"
                  value={formData.preferred_difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              {/* Profile Visibility */}
              <div className="mb-3">
                <label htmlFor="profile_visibility" className="form-label d-flex align-items-center gap-2">
                  <Lock size={18} />
                  Profile Visibility
                </label>
                <select
                  className={`form-select ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                  id="profile_visibility"
                  name="profile_visibility"
                  value={formData.profile_visibility}
                  onChange={handleChange}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="members_only">Members Only - Only logged-in users</option>
                  <option value="private">Private - Only you can view</option>
                </select>
                <small className="text-muted">
                  Control who can see your profile information
                </small>
              </div>
            </form>
          </div>

          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="editProfileForm"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
