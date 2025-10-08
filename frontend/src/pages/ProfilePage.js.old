// pages/ProfilePage.js - User Profile Page
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, Award, TrendingUp, Edit2, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditProfileModal from '../components/profile/EditProfileModal';
import IntegrationTokens from '../components/profile/IntegrationTokens';

const ProfilePage = () => {
  const { userId } = useParams();
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwnProfile = !userId || parseInt(userId) === currentUser.id;
  const displayUserId = userId || currentUser.id;

  useEffect(() => {
    fetchProfile();
  }, [displayUserId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserProfile(displayUserId, token);
      setProfile(data.user);
      setStats(data.stats);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    setShowEditModal(false);
    fetchProfile();
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">{error || 'Profile not found'}</p>
      </div>
    );
  }

  const experienceLevels = {
    beginner: { label: 'Beginner', color: '#28a745' },
    intermediate: { label: 'Intermediate', color: '#17a2b8' },
    advanced: { label: 'Advanced', color: '#fd7e14' },
    expert: { label: 'Expert', color: '#dc3545' }
  };

  const experienceLevel = experienceLevels[profile.experience_level] || experienceLevels.beginner;

  return (
    <div>
      {/* Profile Header */}
      <div className="card mb-4" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              {/* Profile Photo */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: profile.profile_photo_url
                  ? `url(${profile.profile_photo_url})`
                  : 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                border: '4px solid ' + (theme === 'dark' ? 'var(--border-color)' : '#dee2e6')
              }}>
                {!profile.profile_photo_url && profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="col">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="mb-2">{profile.name}</h2>
                  {profile.bio && (
                    <p className="text-muted mb-2">{profile.bio}</p>
                  )}
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge" style={{ background: experienceLevel.color }}>
                      <Award size={14} className="me-1" />
                      {experienceLevel.label}
                    </span>
                    {profile.preferred_difficulty && (
                      <span className="badge bg-secondary">
                        <TrendingUp size={14} className="me-1" />
                        Prefers {profile.preferred_difficulty}
                      </span>
                    )}
                    {profile.hiking_since && (
                      <span className="badge bg-info">
                        <Calendar size={14} className="me-1" />
                        Hiking since {new Date(profile.hiking_since).getFullYear()}
                      </span>
                    )}
                    {profile.profile_visibility === 'private' && (
                      <span className="badge bg-warning text-dark">
                        <Lock size={14} className="me-1" />
                        Private
                      </span>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit2 size={18} className="me-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <div className="display-4 mb-2 text-success">{stats.hikes_completed}</div>
                <p className="text-muted mb-0">Hikes Completed</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <div className="display-4 mb-2 text-primary">{stats.hikes_upcoming}</div>
                <p className="text-muted mb-0">Upcoming Hikes</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <div className="display-4 mb-2 text-info">{stats.hikes_interested}</div>
                <p className="text-muted mb-0">Interested</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <div className="display-4 mb-2 text-warning">{stats.completion_rate}%</div>
                <p className="text-muted mb-0">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {stats && (
        <div className="row g-4">
          {stats.favorite_difficulty && (
            <div className="col-md-6">
              <div className="card h-100" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
                <div className="card-body">
                  <h6 className="border-bottom pb-2 mb-3">
                    <MapPin size={20} className="me-2" />
                    Hiking Preferences
                  </h6>
                  <p><strong>Favorite Difficulty:</strong> {stats.favorite_difficulty}</p>
                  {stats.favorite_type && (
                    <p className="mb-0"><strong>Favorite Type:</strong> {stats.favorite_type === 'day' ? 'Day Hikes' : 'Multi-Day Adventures'}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {(stats.first_hike_date || stats.last_hike_date) && (
            <div className="col-md-6">
              <div className="card h-100" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
                <div className="card-body">
                  <h6 className="border-bottom pb-2 mb-3">
                    <Calendar size={20} className="me-2" />
                    Hiking Timeline
                  </h6>
                  {stats.first_hike_date && (
                    <p><strong>First Hike:</strong> {new Date(stats.first_hike_date).toLocaleDateString()}</p>
                  )}
                  {stats.last_hike_date && (
                    <p className="mb-0"><strong>Last Hike:</strong> {new Date(stats.last_hike_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integration Tokens (only show for own profile) */}
      {isOwnProfile && (
        <div className="mt-4">
          <IntegrationTokens />
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        show={showEditModal}
        profile={profile}
        onHide={() => setShowEditModal(false)}
        onProfileUpdated={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfilePage;
