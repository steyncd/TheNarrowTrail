// App.js - Main Application with React Router (OPTIMIZED WITH LAZY LOADING)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import PrivateRoute from './components/auth/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// PERFORMANCE OPTIMIZATION: Eager load critical components for first paint
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import FeedbackButton from './components/common/FeedbackButton';
import SuggestHikeButton from './components/common/SuggestHikeButton';

// PERFORMANCE OPTIMIZATION: Lazy load all pages to reduce initial bundle size
// Pages are only loaded when user navigates to them
const HikesPage = lazy(() => import('./pages/HikesPage'));
const HikeDetailsPage = lazy(() => import('./pages/HikeDetailsPage'));
const MyHikes = lazy(() => import('./pages/MyHikes'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Admin pages - also lazy loaded for optimal bundle size
const AdminPage = lazy(() => import('./pages/AdminPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const PaymentsAdminPage = lazy(() => import('./pages/PaymentsAdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContentManagementPage = lazy(() => import('./pages/ContentManagementPage'));

// Public Route Wrapper (allows access without authentication)
function PublicRouteWrapper({ children }) {
  const { theme } = useTheme();
  const { currentUser } = useAuth();

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
      {/* Show header if user is logged in */}
      {currentUser && <Header />}

      <div className="container-fluid px-3 pb-5">
        {children}
      </div>

      {/* Show floating buttons if user is logged in */}
      {currentUser && (
        <>
          <FeedbackButton />
          <SuggestHikeButton />
        </>
      )}
    </div>
  );
}

// Private Route Wrapper (requires authentication)
function PrivateRouteWrapper({ children }) {
  const { theme } = useTheme();

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
      <Header />

      <div className="container-fluid px-3 pb-5 pt-4">
        {children}
      </div>

      <FeedbackButton />
      <SuggestHikeButton />
    </div>
  );
}

// Loading fallback component for lazy loaded routes
function LazyLoadFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <LoadingSpinner size="large" message="Loading page..." />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRouteWrapper>
                  <LandingPage />
                </PublicRouteWrapper>
              }
            />
            <Route
              path="/landing"
              element={
                <PublicRouteWrapper>
                  <LandingPage />
                </PublicRouteWrapper>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRouteWrapper>
                  <LoginForm />
                </PublicRouteWrapper>
              }
            />

            {/* Protected Routes with Lazy Loading */}
            <Route
              path="/hikes"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <HikesPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/hikes/:hikeId"
              element={
                <PublicRouteWrapper>
                  <Suspense fallback={<LazyLoadFallback />}>
                    <HikeDetailsPage />
                  </Suspense>
                </PublicRouteWrapper>
              }
            />
            <Route
              path="/my-hikes"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <MyHikes />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <CalendarPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/photos"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <PhotosPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <FavoritesPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <ProfilePage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />

            {/* Admin Routes with Lazy Loading */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <AdminPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <UsersPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <NotificationsPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <AnalyticsPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <LogsPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <FeedbackPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <PaymentsAdminPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <ContentManagementPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />

            {/* About page - accessible to all */}
            <Route
              path="/about"
              element={
                <PrivateRouteWrapper>
                  <Suspense fallback={<LazyLoadFallback />}>
                    <AboutPage />
                  </Suspense>
                </PrivateRouteWrapper>
              }
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
