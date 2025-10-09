import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../auth/LoginForm';
import SignUpForm from '../auth/SignUpForm';
import { getContent } from '../../services/contentApi';
import ReactMarkdown from 'react-markdown';

const LandingPage = ({ hideLoginButton = false }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [missionVision, setMissionVision] = useState(null);

  useEffect(() => {
    fetchPublicHikes();
    fetchMissionVision();
  }, []);

  const fetchMissionVision = async () => {
    try {
      const content = await getContent('mission_vision');
      setMissionVision(content);
    } catch (err) {
      console.error('Error fetching mission & vision:', err);
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
          .landing-nav-buttons {
            justify-content: center !important;
            width: 100%;
          }
          .landing-nav-logo {
            text-align: center;
          }
          .landing-nav-logo img {
            margin: 0 auto 10px auto;
            display: block;
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
              <img
                src="https://media-jnb2-1.cdn.whatsapp.net/v/t61.24694-24/531816244_1267185695145803_3816874698378382952_n.jpg?ccb=11-4&oh=01_Q5Aa2gE6eCgVsJ7VS5mA4tUUzfCHqn50KfOgB46uc6VedXqULA&oe=68F0F796&_nc_sid=5e03e0&_nc_cat=111"
                alt="Group"
                style={{width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover', border: '2px solid #4a7c7c'}}
              />
              <div>
                <span className="navbar-brand mb-0 text-white" style={{fontWeight: '700', letterSpacing: '1px', fontSize: '1.5rem', fontFamily: "'Russo One', sans-serif"}}>
                  THE NARROW TRAIL
                </span>
                <br />
                <small className="text-white-50 d-none d-sm-block" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>
                  "Small is the gate and narrow the road that leads to life" - Matthew 7:14
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

      <div className="container pb-5 pt-0">
        {/* Hero Section */}
        <div className="text-center mb-5 pt-5">
          <h1 className="display-4 fw-bold text-white mb-3">Join Us on The Narrow Trail</h1>
          <p className="lead text-white-50 mb-4">
            Experience the beauty of God's creation together with fellow believers. It's a wonderful opportunity to get outdoors, enjoy meaningful fellowship, and talk about what truly matters — away from the noise of everyday life.
          </p>
        </div>

        {/* Quote Box */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0" style={{
              borderRadius: '15px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="card-body p-4">
                <div className="text-center">
                  <p className="mb-1" style={{
                    fontStyle: 'italic',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: '500',
                    fontSize: '1.1rem'
                  }}>
                    "Dit bou karakter" - Jan
                  </p>
                  <small style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem'}}>
                    Remember: Dit is maklikker as wat dit lyk
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Hikes */}
        <div className="row mb-3">
          <div className="col-12">
            <h2 className="text-white mb-4">
              <Calendar size={28} className="me-2" />
              Upcoming Adventures
            </h2>
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
          <div className="row g-4">
            {hikes.slice(0, 6).map(hike => {
              const hikeDate = new Date(hike.date);
              const isPast = hikeDate < new Date();
              if (isPast) return null;

              return (
                <div key={hike.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-lg border-0" style={{borderRadius: '15px', overflow: 'hidden'}}>
                    {hike.image_url && (
                      <img
                        src={hike.image_url}
                        alt={hike.name}
                        className="card-img-top"
                        style={{height: '200px', objectFit: 'cover'}}
                      />
                    )}
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{hike.name}</h5>
                        <div className="d-flex flex-column gap-1 align-items-end">
                          <span className={`badge ${
                            hike.difficulty === 'Easy' ? 'bg-success' :
                            hike.difficulty === 'Moderate' ? 'bg-warning text-dark' :
                            'bg-danger'
                          }`}>{hike.difficulty}</span>
                          {hike.status && (
                            <span className={`badge ${
                              hike.status === 'trip_booked' ? 'bg-success' :
                              hike.status === 'pre_planning' ? 'bg-info' :
                              hike.status === 'cancelled' ? 'bg-danger' :
                              'bg-secondary'
                            }`} style={{ fontSize: '0.7rem' }}>
                              {hike.status === 'trip_booked' ? 'Trip Booked' :
                               hike.status === 'pre_planning' ? 'Pre-Planning' :
                               hike.status === 'gathering_interest' ? 'Gathering Interest' :
                               hike.status === 'cancelled' ? 'Cancelled' :
                               hike.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="card-text text-muted small mb-3" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {hike.description}
                      </p>

                      {/* Type and Group Badges */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-info">
                          {hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}
                        </span>
                        <span className="badge bg-secondary">
                          {hike.group_type === 'family' ? 'Family' : "Men's"}
                        </span>
                        {hike.cost > 0 && (
                          <span className="badge bg-success" title={hike.price_is_estimate ? "Estimated price" : "Confirmed price"}>
                            R{hike.cost}{hike.price_is_estimate && ' ~'}
                          </span>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <Calendar size={14} className="me-2" />
                          <span title={hike.date_is_estimate ? "Estimated date" : "Confirmed date"}>
                            {hikeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            {hike.date_is_estimate && <span className="ms-1" style={{ fontStyle: 'italic', opacity: 0.7 }}>~</span>}
                          </span>
                        </div>
                        {hike.time && (
                          <div className="d-flex align-items-center text-muted small mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{hike.time}</span>
                          </div>
                        )}
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <MapPin size={14} className="me-2" />
                          <span>{hike.distance}</span>
                        </div>
                        {hike.location && (
                          <div className="d-flex align-items-center text-muted small mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>{hike.location}</span>
                          </div>
                        )}
                      </div>
                      {(hike.interested_count > 0 || hike.confirmed_count > 0) && (
                        <div className="d-flex gap-2 mb-2">
                          {hike.interested_count > 0 && (
                            <span className="badge bg-info">
                              {hike.interested_count} interested
                            </span>
                          )}
                          {hike.confirmed_count > 0 && (
                            <span className="badge bg-success">
                              {hike.confirmed_count} confirmed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="card-footer bg-light border-0">
                      <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => navigate(`/hikes/${hike.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
    </>
  );
};

export default LandingPage;
