// pages/ProfilePage.js - User Profile Page
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Award, TrendingUp, Edit2, Lock, Camera, Mountain, Activity, Phone, Mail, Heart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileSkeleton } from '../components/common/Skeleton';
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    setPhotoError(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;

        const response = await api.updateProfile({ profile_photo_url: base64String }, token);

        if (response.success) {
          fetchProfile();
        } else {
          setPhotoError(response.error || 'Failed to upload photo');
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setPhotoError('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  const calculateBadges = () => {
    if (!stats) return [];

    const badges = [];

    // Completion badges
    if (stats.hikes_completed >= 50) badges.push({ name: 'Trail Master', icon: '🏆', color: 'gold', description: '50+ hikes completed' });
    else if (stats.hikes_completed >= 25) badges.push({ name: 'Seasoned Hiker', icon: '🥈', color: 'silver', description: '25+ hikes completed' });
    else if (stats.hikes_completed >= 10) badges.push({ name: 'Mountain Explorer', icon: '🥉', color: 'bronze', description: '10+ hikes completed' });
    else if (stats.hikes_completed >= 5) badges.push({ name: 'Trail Enthusiast', icon: '⭐', color: 'blue', description: '5+ hikes completed' });

    // Completion rate badges
    if (stats.completion_rate >= 90) badges.push({ name: 'Committed', icon: '💯', color: 'green', description: '90%+ completion rate' });

    // Upcoming badges
    if (stats.hikes_upcoming >= 5) badges.push({ name: 'Adventure Planner', icon: '📅', color: 'purple', description: '5+ upcoming hikes' });

    return badges;
  };

  if (loading) {
    return <ProfileSkeleton />;
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
  const badges = calculateBadges();

  return (
    <div className="container mt-4">
      {/* Profile Header */}
      <div className="card mb-4" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              {/* Profile Photo */}
              <div className="position-relative">
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
                  {uploadingPhoto && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle">
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <label
                    htmlFor="photo-upload"
                    className="btn btn-primary btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center"
                    style={{ bottom: 0, right: 0, width: '36px', height: '36px', padding: 0, cursor: 'pointer' }}
                  >
                    <Camera size={18} />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingPhoto}
                    />
                  </label>
                )}
              </div>
              {photoError && (
                <small className="text-danger d-block mt-2 text-center">{photoError}</small>
              )}
            </div>
            <div className="col">
              <div className="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                  <h2 className="mb-2">{profile.name}</h2>
                  {profile.email && isOwnProfile && (
                    <p className="text-muted mb-1">
                      <Mail size={16} className="me-1" style={{ verticalAlign: 'text-top' }} />
                      {profile.email}
                    </p>
                  )}
                  {profile.phone && isOwnProfile && (
                    <p className="text-muted mb-2">
                      <Phone size={16} className="me-1" style={{ verticalAlign: 'text-top' }} />
                      {profile.phone}
                    </p>
                  )}
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
                    className="btn btn-outline-primary mt-2 mt-md-0"
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

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="card mb-4" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
          <div className="card-body">
            <h5 className="card-title mb-3">
              <Award size={20} className="me-2" />
              Achievements
            </h5>
            <div className="d-flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="text-center p-3 rounded"
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    minWidth: '120px'
                  }}
                  title={badge.description}
                >
                  <div style={{ fontSize: '32px' }}>{badge.icon}</div>
                  <div className="fw-bold small mt-2">{badge.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <Mountain size={32} className="text-success mb-2" />
                <div className="display-4 mb-2 text-success">{stats.hikes_completed}</div>
                <p className="text-muted mb-0">Hikes Completed</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <Calendar size={32} className="text-primary mb-2" />
                <div className="display-4 mb-2 text-primary">{stats.hikes_upcoming}</div>
                <p className="text-muted mb-0">Upcoming Hikes</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <Heart size={32} className="text-info mb-2" />
                <div className="display-4 mb-2 text-info">{stats.hikes_interested}</div>
                <p className="text-muted mb-0">Interested</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card h-100 text-center" style={{ background: theme === 'dark' ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <Activity size={32} className="text-warning mb-2" />
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
