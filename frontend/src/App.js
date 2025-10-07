// App.js - Main Application with React Router
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import PrivateRoute from './components/auth/PrivateRoute';
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import HikesPage from './pages/HikesPage';
import HikeDetailsPage from './pages/HikeDetailsPage';
import MyHikes from './pages/MyHikes';
import PhotosPage from './pages/PhotosPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import FavoritesPage from './pages/FavoritesPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LogsPage from './pages/LogsPage';
import FeedbackPage from './pages/FeedbackPage';
import FeedbackButton from './components/common/FeedbackButton';
import SuggestHikeButton from './components/common/SuggestHikeButton';

// Main App Layout Component
function AppLayout() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // If not authenticated, show landing page
  if (!currentUser) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginForm onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  return (
    <div
      className="min-vh-100"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)',
        transition: 'background 0.3s ease'
      }}
    >
      {/* New Professional Header */}
      <Header />

      {/* Content Area */}
      <div className="container-fluid px-3 pb-5 pt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/hikes" replace />} />
          <Route path="/hikes" element={<HikesPage />} />
          <Route path="/hikes/:hikeId" element={<HikeDetailsPage />} />
          <Route path="/my-hikes" element={<MyHikes />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/landing-preview" element={<LandingPage hideLoginButton />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute adminOnly>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute adminOnly>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute adminOnly>
                <AnalyticsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <PrivateRoute adminOnly>
                <LogsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute adminOnly>
                <FeedbackPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {/* Floating Buttons */}
      <FeedbackButton />
      <SuggestHikeButton />
    </div>
  );
}

// Root App Component
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
