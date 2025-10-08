import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Calendar, Heart, Settings, Users, Bell, Eye, BarChart3, User, Activity, MessageSquare, DollarSign, Info, FileText, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MobileMenu from './MobileMenu';
import ProfileDropdown from './ProfileDropdown';
import api from '../../services/api';

const Header = () => {
  const { currentUser, logout, token } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [newFeedbackCount, setNewFeedbackCount] = useState(0);
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);
  const profileButtonRef = useRef(null);

  const isAdmin = currentUser?.role === 'admin';

  // Fetch unread counts for admins
  useEffect(() => {
    if (isAdmin && token) {
      fetchUnreadCounts();
      // Refresh counts every 60 seconds
      const interval = setInterval(fetchUnreadCounts, 60000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, token]);

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

  const navLinks = [
    { path: '/landing', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/hikes', label: 'Hikes', icon: Calendar },
    { path: '/my-hikes', label: 'My Hikes', icon: Heart },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Manage', icon: Settings },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/content', label: 'Content', icon: FileText },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/admin/logs', label: 'Logs', icon: Activity },
  ];

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
            <div className="d-flex align-items-center">
              {/* Mobile Menu Toggle */}
              <button
                className="btn btn-link text-white d-lg-none p-0 me-3"
                onClick={() => setShowMobileMenu(true)}
                style={{ textDecoration: 'none' }}
              >
                <Menu size={24} />
              </button>

              {/* Logo */}
              <Link to="/hikes" className="d-flex align-items-center text-decoration-none">
                <img
                  src="https://media-jnb2-1.cdn.whatsapp.net/v/t61.24694-24/531816244_1267185695145803_3816874698378382952_n.jpg?ccb=11-4&oh=01_Q5Aa2gE6eCgVsJ7VS5mA4tUUzfCHqn50KfOgB46uc6VedXqULA&oe=68F0F796&_nc_sid=5e03e0&_nc_cat=111"
                  alt="The Narrow Trail"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid #4a7c7c',
                    objectFit: 'cover'
                  }}
                  className="me-3"
                />
                <div>
                  <h1 className="navbar-brand mb-0 fw-bold text-white" style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>
                    THE NARROW TRAIL
                  </h1>
                  <small className="text-white-50 d-none d-md-block" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    "Small is the gate and narrow the road that leads to life" - Matthew 7:14
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

              {isAdmin && adminLinks.map(link => {
                const Icon = link.icon;
                let badgeCount = 0;
                if (link.path === '/users') badgeCount = pendingUsersCount;
                if (link.path === '/feedback') badgeCount = newFeedbackCount + newSuggestionsCount;

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
            <div className="d-flex align-items-center">
              {/* User Profile Dropdown */}
              <div className="position-relative">
                <button
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
        adminLinks={adminLinks}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default Header;
