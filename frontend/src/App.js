// App.js - Main Application with React Router (OPTIMIZED WITH LAZY LOADING)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { PermissionProvider } from './contexts/PermissionContext';
import PrivateRoute from './components/auth/PrivateRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initMobileDiagnostics } from './utils/mobileDiagnostics';
import { setupChunkErrorHandler } from './utils/chunkErrorHandler';

// PERFORMANCE OPTIMIZATION: Eager load critical components for first paint
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import FeedbackButton from './components/common/FeedbackButton';
import SuggestHikeButton from './components/common/SuggestHikeButton';
import OfflineIndicator from './components/common/OfflineIndicator';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import PWAUtilities from './components/common/PWAUtilities';
import UpdateNotification from './components/common/UpdateNotification';
import { useVersionCheck } from './hooks/useVersionCheck';
import PushNotificationPrompt from './components/common/PushNotificationPrompt';
import useWelcomeTour from './hooks/useWelcomeTour';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Redirect component that properly handles route parameters
function EventEditRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/hikes/edit/${id}`} replace />;
}

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
const UserRoleManagementPage = lazy(() => import('./pages/UserRoleManagementPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const PaymentsAdminPage = lazy(() => import('./pages/PaymentsAdminPage'));
const PaymentDetailsPage = lazy(() => import('./pages/PaymentDetailsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContentManagementPage = lazy(() => import('./pages/ContentManagementPage'));
const DataRetentionAdminPage = lazy(() => import('./pages/DataRetentionAdminPage'));
const DataRetentionPage = lazy(() => import('./pages/DataRetentionPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));
const ManageHikesPage = lazy(() => import('./pages/ManageHikesPage'));
const HikeManagementPage = lazy(() => import('./pages/HikeManagementPage'));
const AddEventPage = lazy(() => import('./pages/AddEventPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const WeatherSettingsPage = lazy(() => import('./pages/WeatherSettingsPage'));
const PortalSettingsPage = lazy(() => import('./pages/PortalSettingsPage'));

// Legal pages
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./components/legal/TermsAndConditions'));

// PWA handler pages
const ShareTargetPage = lazy(() => import('./pages/ShareTargetPage'));
const GPXHandlerPage = lazy(() => import('./pages/GPXHandlerPage'));

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

      {/* PWA enhancements - show for all users */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PWAUtilities />

      {/* Mobile Bottom Navigation - only show if user is logged in */}
      {currentUser && <MobileBottomNav />}
    </div>
  );
}

// Private Route Wrapper (requires authentication)
function PrivateRouteWrapper({ children }) {
  const { theme } = useTheme();
  const { currentUser, token } = useAuth();

  // Check if user should see welcome tour (first login after sign-up)
  const [showWelcomeTour, setShowWelcomeTour] = React.useState(false);

  React.useEffect(() => {
    const checkWelcomeTourSetting = async () => {
      if (currentUser) {
        // Check if welcome tour is enabled in portal settings
        try {
          const settings = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/settings/registration_show_onboarding_tour`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (settings.ok) {
            const data = await settings.json();
            const tourEnabled = data.setting_value === 'true' || data.setting_value === true;

            if (!tourEnabled) {
              return; // Tour disabled in settings
            }
          }
        } catch (err) {
          console.log('Could not fetch tour setting, defaulting to enabled');
        }

        const tourCompleted = localStorage.getItem('welcome_tour_completed');
        const sessionCount = parseInt(localStorage.getItem('session_count') || '0');

        // Show tour on first session after login
        if (!tourCompleted && sessionCount === 1) {
          setTimeout(() => setShowWelcomeTour(true), 1000);
        }
      }
    };

    checkWelcomeTourSetting();
  }, [currentUser, token]);

  // Activate welcome tour
  useWelcomeTour(showWelcomeTour);

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

      {/* Push Notification Prompt */}
      <PushNotificationPrompt />

      {/* PWA enhancements - show for all users */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PWAUtilities />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
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
  // Initialize mobile diagnostics and chunk error handler on app start
  React.useEffect(() => {
    initMobileDiagnostics();
    setupChunkErrorHandler(); // Automatically reload on chunk errors
  }, []);

  // Version checking for automatic updates
  const { updateAvailable, latestVersion, refreshApp, dismissUpdate } = useVersionCheck();

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <PermissionProvider>
              <SocketProvider>
          {/* Show update notification banner when new version is available */}
          {updateAvailable && (
            <UpdateNotification
              onUpdate={refreshApp}
              onDismiss={dismissUpdate}
              latestVersion={latestVersion}
            />
          )}

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
            <Route
              path="/profile/:userId"
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
              element={<Navigate to="/admin/manage-hikes" replace />}
            />
            <Route
              path="/admin/manage-hikes"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <ManageHikesPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/hikes/add"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <AddEventPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/hikes/edit/:id"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <EditEventPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            {/* Legacy routes - redirect to new paths */}
            <Route path="/events/add" element={<Navigate to="/admin/hikes/add" replace />} />
            <Route path="/events/edit/:id" element={<EventEditRedirect />} />
            <Route
              path="/manage-hikes/:hikeId"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <HikeManagementPage />
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
                      <UserRoleManagementPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            {/* Redirect /admin/roles to /admin/users (consolidated page) */}
            <Route path="/admin/roles" element={<Navigate to="/admin/users" replace />} />
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
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <FeedbackPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/payments/:hikeId"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <PaymentDetailsPage />
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
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <ContentManagementPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/data-retention"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <DataRetentionAdminPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/weather-settings"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <WeatherSettingsPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/portal-settings"
              element={
                <PrivateRoute requireAdmin>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <PortalSettingsPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />
            
            {/* User data retention page */}
            <Route
              path="/data-retention"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <DataRetentionPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />

            {/* User notification preferences page */}
            <Route
              path="/notification-preferences"
              element={
                <PrivateRoute>
                  <PrivateRouteWrapper>
                    <Suspense fallback={<LazyLoadFallback />}>
                      <NotificationPreferencesPage />
                    </Suspense>
                  </PrivateRouteWrapper>
                </PrivateRoute>
              }
            />

            {/* About page - accessible to all */}
            <Route
              path="/about"
              element={
                <PublicRouteWrapper>
                  <Suspense fallback={<LazyLoadFallback />}>
                    <AboutPage />
                  </Suspense>
                </PublicRouteWrapper>
              }
            />

            {/* PWA Handler Routes */}
            <Route
              path="/share"
              element={
                <Suspense fallback={<LazyLoadFallback />}>
                  <ShareTargetPage />
                </Suspense>
              }
            />
            <Route
              path="/open-gpx"
              element={
                <Suspense fallback={<LazyLoadFallback />}>
                  <GPXHandlerPage />
                </Suspense>
              }
            />
            <Route
              path="/hike"
              element={
                <Suspense fallback={<LazyLoadFallback />}>
                  <HikeDetailsPage />
                </Suspense>
              }
            />

            {/* Legal pages - accessible to all */}
            <Route
              path="/privacy-policy"
              element={
                <PrivateRouteWrapper>
                  <Suspense fallback={<LazyLoadFallback />}>
                    <PrivacyPolicy />
                  </Suspense>
                </PrivateRouteWrapper>
              }
            />
            <Route
              path="/terms"
              element={
                <PrivateRouteWrapper>
                  <Suspense fallback={<LazyLoadFallback />}>
                    <TermsAndConditions />
                  </Suspense>
                </PrivateRouteWrapper>
              }
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </SocketProvider>
          </PermissionProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
