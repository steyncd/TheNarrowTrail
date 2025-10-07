// pages/HikeDetailsPage.js - Shareable Hike Details Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Info, Mountain, Clock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WeatherWidget from '../components/weather/WeatherWidget';

const HikeDetailsPage = () => {
  const { hikeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [hike, setHike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [interestedUsers, setInterestedUsers] = useState([]);

  useEffect(() => {
    fetchHikeDetails();
  }, [hikeId, token]);

  const fetchHikeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hike details (public endpoint)
      const hikeData = await api.getHikeById(hikeId, token);
      setHike(hikeData);

      // If user is logged in, fetch their status and interested users for this hike
      if (token && currentUser) {
        try {
          const status = await api.getHikeStatus(hikeId, token);
          setUserStatus(status);
        } catch (err) {
          console.error('Error fetching user status:', err);
        }

        // Fetch interested users (admin only, but doesn't hurt to try)
        try {
          const users = await api.getInterestedUsers(hikeId, token);
          setInterestedUsers(users);
        } catch (err) {
          // Not an error if user is not admin
          console.log('Could not fetch interested users (may require admin)');
        }
      }
    } catch (err) {
      console.error('Error fetching hike details:', err);
      setError('Failed to load hike details');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.toggleInterest(hike.id, token);
      await fetchHikeDetails();
    } catch (err) {
      console.error('Error toggling interest:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading hike details..." />;
  }

  if (error || !hike) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error || 'Hike not found'}</p>
          <hr />
          <Link to="/hikes" className="btn btn-primary">Browse Hikes</Link>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const difficultyColors = {
    Easy: '#28a745',
    Moderate: '#ffc107',
    Hard: '#dc3545'
  };

  // Use browser's back navigation instead of trying to determine source
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="btn btn-link px-0 mb-3 d-flex align-items-center"
        style={{
          textDecoration: 'none',
          color: isDark ? '#8ab4f8' : '#1a73e8',
          fontSize: '0.95rem',
          fontWeight: '500',
          gap: '0.5rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Hero Image */}
      {hike.image_url && (
        <div className="mb-4" style={{
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <img
            src={hike.image_url}
            alt={hike.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Title and Key Info */}
          <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <h1 className="mb-3">{hike.name}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <span
                  className="badge px-3 py-2"
                  style={{
                    background: difficultyColors[hike.difficulty] || '#6c757d',
                    fontSize: '0.9rem'
                  }}
                >
                  <Mountain size={16} className="me-1" />
                  {hike.difficulty}
                </span>
                <span className="badge bg-info px-3 py-2" style={{ fontSize: '0.9rem' }}>
                  {hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}
                </span>
                <span className="badge bg-secondary px-3 py-2" style={{ fontSize: '0.9rem' }}>
                  {hike.group_type === 'family' ? 'Family Friendly' : 'Mens Only'}
                </span>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <Calendar size={20} className="me-2 text-primary" />
                    <div>
                      <small className="text-muted d-block">Date</small>
                      <strong>{new Date(hike.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {hike.date_is_estimate && <span className="badge bg-info ms-2 small">Estimate</span>}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <MapPin size={20} className="me-2 text-success" />
                    <div>
                      <small className="text-muted d-block">Distance</small>
                      <strong>{hike.distance}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <DollarSign size={20} className="me-2 text-warning" />
                    <div>
                      <small className="text-muted d-block">Cost</small>
                      <strong>R{parseFloat(hike.cost || 0).toFixed(2)}
                      {hike.price_is_estimate && <span className="badge bg-info ms-2 small">Estimate</span>}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {hike.description && (
                <div>
                  <h5 className="mb-3">
                    <Info size={20} className="me-2" />
                    Description
                  </h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{hike.description}</p>
                </div>
              )}

              {/* Link buttons */}
              <div className="mt-3 d-flex flex-wrap gap-2">
                {hike.destination_url && (
                  <a
                    href={hike.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    <MapPin size={16} className="me-2" />
                    View on Map
                  </a>
                )}
                {hike.location_link && (
                  <a
                    href={hike.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                  >
                    <MapPin size={16} className="me-2" />
                    Location
                  </a>
                )}
                {hike.destination_website && (
                  <a
                    href={hike.destination_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-info"
                  >
                    <Info size={16} className="me-2" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Multi-day Details */}
          {hike.type === 'multi' && hike.daily_distances && (
            <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h5 className="mb-3">
                  <Clock size={20} className="me-2" />
                  Daily Itinerary
                </h5>
                <ul className="list-unstyled">
                  {Object.entries(hike.daily_distances).map(([day, distance]) => (
                    <li key={day} className="mb-2">
                      <strong>Day {day}:</strong> {distance}
                    </li>
                  ))}
                </ul>
                {hike.overnight_facilities && (
                  <div className="mt-3">
                    <strong>Overnight Facilities:</strong>
                    <p className="mb-0">{hike.overnight_facilities}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Login Prompt for Non-logged-in Users */}
          {!token && (
            <div className="card mb-4 border-primary" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body text-center">
                <LogIn size={48} className="text-primary mb-3" />
                <h5>Join This Hike</h5>
                <p className="text-muted">Log in to express your interest and get updates</p>
                <Link to="/login" className="btn btn-primary w-100 mb-2">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-outline-primary w-100">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Interest Button for Logged-in Users */}
          {token && currentUser && (
            <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h5 className="mb-3">Your Status</h5>
                <button
                  className={`btn w-100 ${userStatus?.is_interested ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={handleInterestToggle}
                >
                  {userStatus?.is_interested ? 'Interested ✓' : 'Express Interest'}
                </button>
                {userStatus?.is_interested && (
                  <small className="text-muted d-block mt-2 text-center">
                    You've expressed interest in this hike
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Weather Forecast */}
          {token && hike && hike.date && hike.location && (
            <div className="mb-4">
              <WeatherWidget hikeId={hikeId} location={hike.location} date={hike.date} />
            </div>
          )}

          {/* Interest Stats */}
          <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <h5 className="mb-3">
                <Users size={20} className="me-2" />
                Participation
              </h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Interested:</span>
                <strong className="text-info">{hike.interested_count || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Confirmed:</span>
                <strong className="text-success">{hike.confirmed_count || 0}</strong>
              </div>
              {hike.status && (
                <div className="mt-3 pt-3 border-top">
                  <span className={`badge w-100 ${
                    hike.status === 'trip_booked' ? 'bg-success' :
                    hike.status === 'final_planning' ? 'bg-warning' :
                    hike.status === 'pre_planning' ? 'bg-info' :
                    'bg-secondary'
                  }`}>
                    {hike.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Interested Users List */}
              {interestedUsers.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <h6 className="mb-2">Interested Hikers:</h6>
                  <div className="d-flex flex-column gap-2">
                    {interestedUsers.map(user => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="text-decoration-none"
                        style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Users size={14} />
                          <span>{user.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="text-center mt-4 mb-5">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}
        >
          Share This Hike
        </button>
      </div>
    </div>
  );
};

export default HikeDetailsPage;
