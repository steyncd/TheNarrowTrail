import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../services/api';
import LoginForm from '../auth/LoginForm';
import SignUpForm from '../auth/SignUpForm';
import LazyImage from '../photos/LazyImage';

const PublicHeader = ({ hideLoginButton = false }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [brandingSettings, setBrandingSettings] = useState({
    branding_logo_url: '/hiking-logo.png',
    branding_portal_name: 'THE NARROW TRAIL',
    branding_tagline: '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'
  });

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings/public/branding`);
      if (response.ok) {
        const data = await response.json();
        setBrandingSettings({
          branding_logo_url: data.branding_logo_url || '/hiking-logo.png',
          branding_portal_name: data.branding_portal_name || 'THE NARROW TRAIL',
          branding_tagline: data.branding_tagline || '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'
        });
      }
    } catch (err) {
      console.error('Error fetching branding settings:', err);
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
        .public-navbar-wrapper {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw !important;
          margin-right: -50vw !important;
        }
        .public-nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 768px) {
          .public-nav-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .public-nav-logo {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .public-nav-logo img {
            width: 40px !important;
            height: 40px !important;
            margin-right: 10px !important;
            flex-shrink: 0;
          }
          .public-nav-logo .navbar-brand {
            font-size: 1.2rem !important;
          }
          .public-nav-buttons {
            display: flex;
            justify-content: center;
            gap: 8px !important;
          }
          .public-nav-buttons .btn {
            font-size: 0.85rem !important;
            padding: 0.5rem 1rem !important;
            flex: 1;
            max-width: 150px;
          }
        }
      `}</style>
      <div className="public-navbar-wrapper">
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
          <div className="public-nav-content">
            <div
              className="d-flex align-items-center public-nav-logo"
              style={{cursor: 'pointer'}}
              onClick={() => navigate('/')}
            >
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
            <div className="d-flex align-items-center gap-2 public-nav-buttons">
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
    </>
  );
};

export default PublicHeader;
