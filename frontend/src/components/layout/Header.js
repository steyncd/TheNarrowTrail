import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Calendar, Heart, Settings, BarChart3, User, Info, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import usePermission from '../../hooks/usePermission';
import MobileMenu from './MobileMenu';
import ProfileDropdown from './ProfileDropdown';
import api from '../../services/api';

const Header = () => {
  const { currentUser, token } = useAuth();
  const { theme } = useTheme();
  const { can, isAdmin: hasAdminRole } = usePermission();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);
  const [brandingSettings, setBrandingSettings] = useState({
    branding_logo_url: '/hiking-logo.png',
    branding_portal_name: 'THE NARROW TRAIL',
    branding_tagline: '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'
  });
  const profileButtonRef = useRef(null);

  // Keep backward compatibility with old isAdmin check - recalculate when permissions change
  const isAdmin = useMemo(() => {
    return currentUser?.role === 'admin' || hasAdminRole();
  }, [currentUser?.role, hasAdminRole]);

  // Fetch public branding settings (no auth required)
  const fetchBrandingSettings = async () => {
    try {
      const settings = await api.getPublicBrandingSettings();
      setBrandingSettings(prevSettings => ({
        ...prevSettings,
        ...settings
      }));
    } catch (err) {
      console.error('Error fetching branding settings:', err);
      // Keep using defaults if fetch fails
    }
  };

  // Fetch unread counts for admins
  const fetchUnreadCounts = async () => {
    try {
      // Fetch pending users
      const usersData = await api.getPendingUsers(token);
      setPendingUsersCount(usersData.pending?.length || 0);

      // Fetch feedback stats
      const feedbackStats = await api.getFeedbackStats(token);
      setNewFeedbackCount(feedbackStats.new_count || 0);

      // Fetch suggestion stats
      const suggestionStats = await api.getSuggestionStats(token);
      setNewSuggestionsCount(suggestionStats.new || 0);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  // Fetch branding settings on mount
  useEffect(() => {
    fetchBrandingSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAdmin && token) {
      fetchUnreadCounts();
      // Refresh counts every 60 seconds
      const interval = setInterval(fetchUnreadCounts, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, token]);

  const navLinks = [
    { path: '/landing', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/hikes', label: 'Events', icon: Calendar },
    { path: '/my-hikes', label: 'My Events', icon: Heart },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  // Admin links with permission requirements
  // Filter admin links based on permissions - recalculate when permissions change
  const filteredAdminLinks = useMemo(() => {
    const links = [
      { path: '/admin/manage-hikes', label: 'Manage Events', icon: Settings, permission: 'hikes.edit' },
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics.view' },
      { path: '/admin/portal-settings', label: 'Portal Settings', icon: Settings, permission: 'settings.view' },
    ];
    return links.filter(link => !link.permission || can(link.permission));
  }, [can]); // Recalculate when permissions change

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className="sticky-top shadow-lg"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #2d5a7c 0%, #1a4d5c 100%)',
          borderBottom: '3px solid #4a7c7c',
          transition: 'all 0.3s ease',
          padding: 0
        }}
      >
        {/* Main Navigation Bar */}
        <nav className="navbar navbar-dark" style={{ padding: '8px 0', margin: 0 }}>
          <div className="container-fluid px-3" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {/* Left: Logo & Brand */}
            <div className="d-flex align-items-center" style={{ flex: '1 1 auto', minWidth: 0 }}>
              {/* Mobile Menu Toggle */}
              <button
                className="btn btn-link text-white d-lg-none p-0 me-2 flex-shrink-0"
                onClick={() => setShowMobileMenu(true)}
                style={{ textDecoration: 'none' }}
              >
                <Menu size={24} />
              </button>

              {/* Logo */}
              <Link to="/hikes" className="d-flex align-items-center text-decoration-none" style={{ minWidth: 0, flex: '1 1 auto' }}>
                <img
                  src={brandingSettings.branding_logo_url || '/hiking-logo.png'}
                  alt={brandingSettings.branding_portal_name || 'The Narrow Trail'}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid #4a7c7c',
                    objectFit: 'cover'
                  }}
                  className="me-2 flex-shrink-0 d-none d-md-block"
                  onError={(e) => {
                    e.target.src = '/hiking-logo.png';
                  }}
                />
                <img
                  src={brandingSettings.branding_logo_url || '/hiking-logo.png'}
                  alt={brandingSettings.branding_portal_name || 'The Narrow Trail'}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #4a7c7c',
                    objectFit: 'cover'
                  }}
                  className="me-2 flex-shrink-0 d-md-none"
                  onError={(e) => {
                    e.target.src = '/hiking-logo.png';
                  }}
                />
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <span className="navbar-brand mb-0 text-white d-none d-sm-inline" style={{ fontWeight: '700', letterSpacing: '1px', fontSize: '1.5rem', fontFamily: "'Russo One', sans-serif", textTransform: 'uppercase' }}>
                    {brandingSettings.branding_portal_name || 'THE NARROW TRAIL'}
                  </span>
                  <span className="navbar-brand mb-0 text-white d-inline d-sm-none" style={{ fontWeight: '700', letterSpacing: '1px', fontSize: '1rem', fontFamily: "'Russo One', sans-serif", textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '150px' }}>
                    {brandingSettings.branding_portal_name || 'THE NARROW TRAIL'}
                  </span>
                  <br className="d-none d-md-block" />
                  <small className="text-white-50 d-none d-md-block" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    {brandingSettings.branding_tagline || '"Small is the gate and narrow the road that leads to life" - Matthew 7:14'}
                  </small>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="d-none d-lg-flex align-items-center gap-1 flex-grow-1 justify-content-center">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="nav-link px-3 py-2"
                    style={{
                      color: isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                      borderBottom: isActive(link.path) ? '3px solid #4a7c7c' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      fontWeight: isActive(link.path) ? '600' : '400'
                    }}
                  >
                    <Icon size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                    {link.label}
                  </Link>
                );
              })}

              {filteredAdminLinks.map(link => {
                const Icon = link.icon;
                let badgeCount = 0;
                if (link.path === '/admin/users') badgeCount = pendingUsersCount;
                if (link.path === '/admin/feedback') badgeCount = newFeedbackCount + newSuggestionsCount;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="nav-link px-3 py-2 position-relative"
                    style={{
                      color: isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                      borderBottom: isActive(link.path) ? '3px solid #4a7c7c' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      fontWeight: isActive(link.path) ? '600' : '400'
                    }}
                  >
                    <Icon size={18} className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                    {link.label}
                    {badgeCount > 0 && (
                      <span
                        className="badge bg-danger rounded-pill ms-1"
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          verticalAlign: 'super'
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: User Profile */}
            <div className="d-flex align-items-center flex-shrink-0">
              {/* User Profile Dropdown */}
              <div className="position-relative">
                <button
                  id="user-profile-button"
                  ref={profileButtonRef}
                  className="btn d-flex align-items-center justify-content-center"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                >
                  <User size={20} />
                </button>

                {/* Dropdown Menu */}
              </div>
            </div>
          </div>
        </nav>

        {/* Inspirational Quote Banner */}
        <div
          className="text-center py-2 px-3"
          style={{
            background: theme === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <p className="mb-0 fw-bold text-white" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
            "Dit bou karakter" - Jan
          </p>
        </div>
      </header>

      {/* Profile Dropdown */}
      <ProfileDropdown
        show={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        buttonRef={profileButtonRef}
      />

      {/* Mobile Menu */}
      <MobileMenu
        show={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        navLinks={navLinks}
        adminLinks={filteredAdminLinks}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default Header;
