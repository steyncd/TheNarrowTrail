import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowLeft, Info, Mountain, Tent, Truck, Bike, Compass, Users, TrendingUp, Award, CheckCircle, ArrowRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../auth/LoginForm';
import SignUpForm from '../auth/SignUpForm';
import { getContent } from '../../services/contentApi';
import ReactMarkdown from 'react-markdown';
import LazyImage from '../photos/LazyImage';

// Event type configuration with generic images
const EVENT_TYPE_CONFIG = {
  hiking: {
    icon: Mountain,
    color: '#4CAF50',
    label: 'Hiking',
    genericImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
  },
  camping: {
    icon: Tent,
    color: '#FF9800',
    label: 'Camping',
    genericImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop'
  },
  '4x4': {
    icon: Truck,
    color: '#795548',
    label: '4x4',
    genericImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop'
  },
  cycling: {
    icon: Bike,
    color: '#2196F3',
    label: 'Cycling',
    genericImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop'
  },
  outdoor: {
    icon: Compass,
    color: '#9C27B0',
    label: 'Outdoor',
    genericImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  }
};

const LandingPage = ({ hideLoginButton = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [missionVision, setMissionVision] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [settings, setSettings] = useState({
    show_upcoming_hikes: true,
    show_statistics: true
  });
  const [brandingSettings, setBrandingSettings] = useState({
    branding_logo_url: '/hiking-logo.png',
    branding_portal_name: 'THE NARROW TRAIL',
    branding_tagline: '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'
  });

  useEffect(() => {
    fetchSettings();
    fetchPublicHikes();
    fetchMissionVision();
    fetchStatistics();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/public/branding`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          show_upcoming_hikes: data.branding_show_upcoming_hikes !== 'false',
          show_statistics: data.branding_show_statistics !== 'false'
        });
        setBrandingSettings({
          branding_logo_url: data.branding_logo_url || '/hiking-logo.png',
          branding_portal_name: data.branding_portal_name || 'THE NARROW TRAIL',
          branding_tagline: data.branding_tagline || '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchMissionVision = async () => {
    try {
      const content = await getContent('mission_vision');
      setMissionVision(content);
    } catch (err) {
      console.error('Error fetching mission & vision:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/public/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchPublicHikes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/hikes/public`);
      if (response.ok) {
        const data = await response.json();
        setHikes(data);
      }
    } catch (err) {
      console.error('Fetch public hikes error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showLoginModal && !showSignUp) {
    return <LoginForm onClose={() => setShowLoginModal(false)} onShowSignUp={() => setShowSignUp(true)} />;
  }

  if (showSignUp) {
    return <SignUpForm onBack={() => { setShowSignUp(false); setShowLoginModal(true); }} />;
  }

  return (
    <>
      <style>{`
        body, html {
          margin: 0 !important;
          padding: 0 !important;
        }
        #root {
          margin: 0 !important;
          padding: 0 !important;
        }
        .landing-page-container {
          margin: 0 !important;
          padding: 0 !important;
        }
        .landing-navbar-wrapper {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw !important;
          margin-right: -50vw !important;
        }
        .landing-nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 768px) {
          .landing-nav-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .landing-nav-logo {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .landing-nav-logo img {
            width: 40px !important;
            height: 40px !important;
            margin-right: 10px !important;
            flex-shrink: 0;
          }
          .landing-nav-logo .navbar-brand {
            font-size: 1.2rem !important;
          }
          .landing-nav-buttons {
            display: flex;
            justify-content: center;
            gap: 8px !important;
          }
          .landing-nav-buttons .btn {
            font-size: 0.85rem !important;
            padding: 0.5rem 1rem !important;
            flex: 1;
            max-width: 150px;
          }
        }
      `}</style>
      <div className="landing-page-container min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)', margin: 0, padding: 0}}>
        {/* Navbar - hide if user is logged in */}
        {!currentUser && (
          <div className="landing-navbar-wrapper">
            <nav
              className="navbar navbar-dark shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderBottom: '3px solid #4a7c7c',
                padding: '12px 16px',
                margin: 0,
                width: '100%'
              }}
            >
          <div className="landing-nav-content">
            <div className="d-flex align-items-center landing-nav-logo">
              <LazyImage
                src={brandingSettings.branding_logo_url || '/hiking-logo.png'}
                alt={brandingSettings.branding_portal_name || 'Portal Logo'}
                style={{width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover', border: '2px solid #4a7c7c'}}
                placeholder="/hiking-logo.png"
              />
              <div>
                <span className="navbar-brand mb-0 text-white" style={{fontWeight: '700', letterSpacing: '1px', fontSize: '1.5rem', fontFamily: "'Russo One', sans-serif", textTransform: 'uppercase'}}>
                  {brandingSettings.branding_portal_name}
                </span>
                <br />
                <small className="text-white-50 d-none d-sm-block" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>
                  {brandingSettings.branding_tagline}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 landing-nav-buttons">
              <button
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: '500'}}
                onClick={() => navigate('/about')}
              >
                <Info size={16} />
                About Us
              </button>
              {hideLoginButton ? (
                <button
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600'}}
                  onClick={() => navigate('/hikes')}
                >
                  <ArrowLeft size={18} />
                  Return to App
                </button>
              ) : (
                <button
                  className="btn btn-sm"
                  style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600'}}
                  onClick={() => setShowLoginModal(true)}
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </nav>
          </div>
        )}

      {/* Modern Hero Section */}
      <div className="position-relative" style={{
        minHeight: '600px',
        background: 'linear-gradient(135deg, rgba(45, 90, 124, 0.95) 0%, rgba(74, 124, 89, 0.95) 100%)',
        overflow: 'hidden'
      }}>
        {/* Hero Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&h=1080&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0
        }} />

        <div className="container position-relative" style={{ zIndex: 1, paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
              {/* Main Headline */}
              <h1 className="display-4 fw-bold text-white mb-3" style={{ lineHeight: '1.2', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                Adventure Awaits.<br />
                <span style={{ color: '#ffd700' }}>Faith Connects Us.</span>
              </h1>

              {/* Value Proposition */}
              <p className="lead text-white mb-4" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', opacity: 0.95 }}>
                Experience the beauty of God's creation together with fellow believers. Get outdoors, enjoy meaningful fellowship, and talk about what truly matters — away from the noise of everyday life.
              </p>

              {/* Statistics Ticker */}
              {statistics && (
                <div className="d-flex flex-wrap gap-4 mb-4 justify-content-center justify-content-lg-start">
                  <div className="text-white">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{statistics.total_hikers}+</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Hikers</div>
                  </div>
                  <div className="text-white">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{statistics.completed_hikes}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Adventures</div>
                  </div>
                  <div className="text-white">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{statistics.total_distance_km}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>KM Hiked</div>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <button
                  className="btn btn-lg btn-light fw-bold shadow-lg"
                  style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem' }}
                  onClick={() => {
                    if (currentUser) {
                      navigate('/hikes');
                    } else {
                      const hikesSection = document.getElementById('upcoming-events');
                      if (hikesSection) hikesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Calendar size={20} className="me-2" />
                  Browse Adventures
                </button>
                {!currentUser && (
                  <button
                    className="btn btn-lg btn-outline-light fw-bold"
                    style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', borderWidth: '2px' }}
                    onClick={() => setShowLoginModal(true)}
                  >
                    Join Community
                  </button>
                )}
              </div>

              {/* Trust Badge */}
              <div className="mt-4 text-white d-flex align-items-center gap-2 justify-content-center justify-content-lg-start" style={{ opacity: 0.9 }}>
                <CheckCircle size={18} style={{ color: '#ffd700' }} />
                <span style={{ fontSize: '0.9rem' }}>Join {statistics?.total_hikers || 500}+ outdoor enthusiasts</span>
              </div>
            </div>

            {/* Hero Visual - Next Event Preview Card */}
            <div className="col-lg-5">
              {hikes.length > 0 && (() => {
                const nextHike = hikes.find(h => new Date(h.date) > new Date()) || hikes[0];
                const EventIcon = EVENT_TYPE_CONFIG[nextHike.event_type || 'hiking']?.icon || Mountain;

                return (
                  <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    {/* Next Adventure Badge */}
                    <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 2 }}>
                      <span className="badge bg-warning text-dark px-3 py-2 fw-bold" style={{ fontSize: '0.85rem' }}>
                        <TrendingUp size={14} className="me-1" />
                        NEXT ADVENTURE
                      </span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <LazyImage
                        src={nextHike.image_url || EVENT_TYPE_CONFIG[nextHike.event_type || 'hiking']?.genericImage}
                        alt={nextHike.name}
                        style={{ height: '250px', width: '100%', objectFit: 'cover' }}
                        placeholder={EVENT_TYPE_CONFIG[nextHike.event_type || 'hiking']?.genericImage}
                      />
                    </div>

                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge" style={{ background: EVENT_TYPE_CONFIG[nextHike.event_type || 'hiking']?.color }}>
                          <EventIcon size={14} className="me-1" />
                          {EVENT_TYPE_CONFIG[nextHike.event_type || 'hiking']?.label}
                        </span>
                        {nextHike.event_type_data?.difficulty && (
                          <span className={`badge ${
                            nextHike.event_type_data.difficulty === 'Easy' ? 'bg-success' :
                            nextHike.event_type_data.difficulty === 'Moderate' ? 'bg-warning text-dark' :
                            'bg-danger'
                          }`}>{nextHike.event_type_data.difficulty}</span>
                        )}
                      </div>

                      <h4 className="mb-3 fw-bold">{nextHike.name}</h4>

                      <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex align-items-center text-muted">
                          <Calendar size={16} className="me-2" />
                          <span style={{ fontSize: '0.95rem' }}>
                            {new Date(nextHike.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {nextHike.location && (
                          <div className="d-flex align-items-center text-muted">
                            <MapPin size={16} className="me-2" />
                            <span style={{ fontSize: '0.95rem' }}>{nextHike.location}</span>
                          </div>
                        )}
                        {nextHike.confirmed_count > 0 && (
                          <div className="d-flex align-items-center text-success fw-bold">
                            <Users size={16} className="me-2" />
                            <span style={{ fontSize: '0.95rem' }}>{nextHike.confirmed_count} confirmed</span>
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-primary w-100 fw-bold"
                        style={{ padding: '0.75rem', borderRadius: '10px' }}
                        onClick={() => navigate(`/hikes/${nextHike.id}`)}
                      >
                        View Details
                        <ArrowRight size={18} className="ms-2" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5 pt-5">
        {/* Why Join Us Section */}
        <div className="row mb-5">
          <div className="col-12 text-center mb-4">
            <h2 className="fw-bold text-white" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
              Why Join The Narrow Trail?
            </h2>
            <p className="text-white-50" style={{ fontSize: '1.1rem' }}>
              More than just outdoor adventures
            </p>
          </div>

          <div className="col-md-4 mb-4 mb-md-0">
            <div className="card border-0 h-100 shadow" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <Users size={32} style={{ color: 'white' }} />
                </div>
                <h4 className="fw-bold mb-3">Fellowship</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  "Where two or three gather in His name, hearts are strengthened and faith is shared." (Matthew 18:20)
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4 mb-md-0">
            <div className="card border-0 h-100 shadow" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a7c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <Mountain size={32} style={{ color: 'white' }} />
                </div>
                <h4 className="fw-bold mb-3">Adventure</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  "Step out in faith, discover God's creation, and find renewal away from the noise of the world."
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 h-100 shadow" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3" style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c6a4a 0%, #2d5a7c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <Award size={32} style={{ color: 'white' }} />
                </div>
                <h4 className="fw-bold mb-3">Growth</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  "In the stillness of nature, draw near to God and let Him transform you from glory to glory." (2 Corinthians 3:18)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Adventures Section */}
        {settings.show_upcoming_hikes && (
          <>
            <div className="row mb-4" id="upcoming-events">
              <div className="col-12 text-center">
                <h2 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                  Upcoming Adventures
                </h2>
                <p className="text-white-50" style={{ fontSize: '1.1rem' }}>
                  Join us on the trail
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : hikes.length === 0 ? (
              <div className="card bg-white bg-opacity-75">
                <div className="card-body text-center py-5">
                  <p className="text-muted mb-0">No upcoming hikes at the moment. Check back soon!</p>
                </div>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {hikes.slice(0, 6).map(hike => {
                const hikeDate = new Date(hike.date);
                const isPast = hikeDate < new Date();
                if (isPast) return null;

                const EventIcon = EVENT_TYPE_CONFIG[hike.event_type || 'hiking']?.icon || Mountain;
                const targetAudienceTag = hike.tags?.find(tag => tag.category === 'target_audience');

                return (
                  <div key={hike.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow border-0 d-flex flex-column" style={{borderRadius: '20px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.98)'}}>
                      {/* Simplified Image */}
                      <div style={{position: 'relative'}}>
                        <LazyImage
                          src={hike.image_url || EVENT_TYPE_CONFIG[hike.event_type || 'hiking']?.genericImage}
                          alt={hike.name}
                          style={{height: '220px', width: '100%', objectFit: 'cover'}}
                          placeholder={EVENT_TYPE_CONFIG[hike.event_type || 'hiking']?.genericImage}
                        />
                        {/* Event Type Badge */}
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge d-inline-flex align-items-center gap-1 shadow" style={{
                            backgroundColor: EVENT_TYPE_CONFIG[hike.event_type || 'hiking'].color,
                            fontSize: '0.8rem',
                            padding: '6px 12px'
                          }}>
                            <EventIcon size={14} />
                            {EVENT_TYPE_CONFIG[hike.event_type || 'hiking'].label}
                          </span>
                        </div>
                        {/* Target Audience Tag */}
                        {targetAudienceTag && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge shadow" style={{
                              backgroundColor: targetAudienceTag.color || '#9C27B0',
                              fontSize: '0.8rem',
                              padding: '6px 12px'
                            }}>
                              {targetAudienceTag.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-body flex-grow-1 d-flex flex-column p-4">
                        {/* Title */}
                        <h5 className="fw-bold mb-3">{hike.name}</h5>

                        {/* Key Info Only */}
                        <div className="d-flex flex-column gap-2 mb-3">
                          <div className="d-flex align-items-center text-muted">
                            <Calendar size={16} className="me-2 flex-shrink-0" />
                            <span style={{ fontSize: '0.95rem' }}>
                              {hikeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {hike.location && (
                            <div className="d-flex align-items-center text-muted">
                              <MapPin size={16} className="me-2 flex-shrink-0" />
                              <span style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {hike.location}
                              </span>
                            </div>
                          )}
                          {hike.confirmed_count > 0 && (
                            <div className="d-flex align-items-center text-success">
                              <Users size={16} className="me-2 flex-shrink-0" />
                              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                                {hike.confirmed_count} going
                              </span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button - pushed to bottom */}
                        <div className="mt-auto">
                          <button
                            className="btn btn-primary w-100 fw-bold"
                            style={{ padding: '0.75rem', borderRadius: '10px' }}
                            onClick={() => navigate(`/hikes/${hike.id}`)}
                          >
                            View Details
                            <ArrowRight size={18} className="ms-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>

                {/* View All Button */}
                {hikes.length > 6 && (
                  <div className="row mt-4">
                    <div className="col-12 text-center">
                      <button
                        className="btn btn-lg btn-outline-light fw-bold"
                        style={{ padding: '1rem 3rem', borderRadius: '50px', borderWidth: '2px' }}
                        onClick={() => navigate('/hikes')}
                      >
                        View All Adventures
                        <ArrowRight size={20} className="ms-2" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Mission & Vision Section */}
          {missionVision && (
            <div className="row mt-5 mb-4">
              <div className="col-12">
                <div className="card border-0" style={{
                  borderRadius: '15px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <div className="card-body p-4">
                    <div className="mission-vision-content">
                      <ReactMarkdown>
                        {missionVision.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {!hideLoginButton && (
            <div className="text-center mt-5">
              <div className="card bg-white bg-opacity-90 shadow-lg border-0 d-inline-block" style={{borderRadius: '15px', maxWidth: '600px'}}>
                <div className="card-body p-4">
                  <h3 className="mb-3">Ready to Hit the Trail?</h3>
                  <p className="text-muted mb-4">
                    Join our community of hikers and outdoor enthusiasts. Sign up or log in to view full hike details, RSVP, coordinate carpools, and more!
                  </p>
                  <button
                    className="btn btn-lg btn-primary"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Final CTA Section */}
      {!currentUser && !hideLoginButton && (
        <div className="py-5" style={{ background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.25) 0%, rgba(45, 90, 124, 0.25) 100%)' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="display-5 fw-bold text-white mb-3">
                  Don't Miss the Next Adventure
                </h2>
                <p className="lead text-white-50 mb-4">
                  Join our community today and start exploring God's creation with fellow believers
                </p>
                <button
                  className="btn btn-lg btn-warning fw-bold shadow-lg me-3"
                  style={{ padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.1rem' }}
                  onClick={() => setShowLoginModal(true)}
                >
                  <Users size={22} className="me-2" />
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default LandingPage;
