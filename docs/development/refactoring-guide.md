# Hiking Portal Refactoring Guide

## Completed Components

### 1. Core Infrastructure
- **✅ contexts/AuthContext.js** - Authentication context with login, logout, register, password reset
- **✅ services/api.js** - Centralized API service with all endpoints
- **✅ components/auth/LoginForm.js** - Login modal with verse banner
- **✅ components/auth/SignUpForm.js** - Registration form
- **✅ components/auth/ForgotPassword.js** - Password reset flow
- **✅ components/auth/PrivateRoute.js** - Protected route wrapper
- **✅ components/landing/LandingPage.js** - Public landing page
- **✅ components/layout/Navbar.js** - Top navigation bar

## Components Still Needed

### 2. Hike Components (HIGH PRIORITY)

#### HikesList.js
Location: `components/hikes/HikesList.js`
- Displays all hikes grouped by: Next 2 Months, Future Adventures, Past Hikes
- Uses HikeCard for each hike
- Fetches hikes using `api.getHikes(token)`

#### HikeCard.js
Location: `components/hikes/HikeCard.js`
Props: `{ hike, isPast, onViewDetails, onToggleInterest, loading }`
- Shows hike info, difficulty badge, date, distance, type, group, cost, status
- "BOOKED!" banner if user is confirmed
- Buttons: "View Details", "I'm Interested!"

#### HikeDetailsModal.js (USER VIEW)
Location: `components/hikes/HikeDetailsModal.js`
- Tabbed interface: Info, Comments, Carpool, Packing List
- Shows user's status (interested/confirmed)
- "Confirm Attendance" button for confirmed users
- Integrates CommentsSection, CarpoolSection, PackingList components

#### AddHikeForm.js (ADMIN)
Location: `components/hikes/AddHikeForm.js`
- Form fields: name, date, difficulty, distance, description
- Type: day/multi-day, Group: family/mens
- Status, cost, image_url, destination_url
- Daily distances array for multi-day hikes
- Overnight facilities textarea

#### AttendanceModal.js (ADMIN)
Location: `components/hikes/AttendanceModal.js`
- Shows interested users and confirmed attendees
- Add/remove attendees
- Track payment status and amounts
- Admin actions: view emergency contacts, default packing list

#### MyHikesPage.js
Location: `components/hikes/MyHikesPage.js`
- Stats cards: Total, Multi-Day, Confirmed, Interested
- Emergency contact form section
- Lists of confirmed and interested hikes

#### PackingList.js
Location: `components/hikes/PackingList.js`
- Checkbox list of packing items
- Auto-saves on toggle
- Fetches from `api.getPackingList(hikeId, token)`

#### CarpoolSection.js
Location: `components/hikes/CarpoolSection.js`
- Carpool offers (driver, location, seats, time)
- Carpool requests (requester, pickup location)
- Forms to add offers/requests

#### CommentsSection.js
Location: `components/hikes/CommentsSection.js`
- List of comments with author and timestamp
- Add comment textarea
- Delete button for own comments or admin

### 3. Admin Components

#### AdminPanel.js
Location: `components/admin/AdminPanel.js`
- Main admin dashboard
- Add hike button → AddHikeForm
- List of hikes with edit/delete/view attendance buttons

#### UserManagement.js
Location: `components/admin/UserManagement.js`
- Pending users section (approve/reject)
- User list with search and role filter
- Add/edit/delete users
- Reset user password
- Promote to admin

#### NotificationPanel.js
Location: `components/admin/NotificationPanel.js`
- Notification log (recent notifications)
- Test notification form (email/whatsapp)

### 4. Photo Components

#### PhotoGallery.js
Location: `components/photos/PhotoGallery.js`
- Grid of photos with hike name, date, uploader
- Delete button (own photos or admin)

#### PhotoUpload.js
Location: `components/photos/PhotoUpload.js`
- Form: hike name, date, image URL
- Upload button

### 5. Updated App.js

Location: `frontend/src/App.js`

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './components/landing/LandingPage';
import HikesPage from './pages/HikesPage';
import PhotosPage from './pages/PhotosPage';
import MyHikesPage from './pages/MyHikesPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';

// Layout
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center"
           style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
      <Navbar />

      <div className="container-fluid px-2 px-md-3 py-3 py-md-4">
        {/* Inspirational Quote Banner */}
        <div className="alert border-0 shadow-sm mb-3 mb-md-4 p-2 p-md-3"
             style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                     borderRadius: '10px', borderLeft: '4px solid #4a7c7c'}}>
          <div className="row align-items-center g-2">
            <div className="col-md-8 d-none d-md-block">
              <p className="mb-1" style={{fontStyle: 'italic', color: '#1a1a1a', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)'}}>
                <strong>"Dit bou karakter"</strong> - Jan
              </p>
              <small className="text-muted" style={{fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)'}}>
                Remember: Dit is maklikker as wat dit lyk
              </small>
            </div>
            <div className="col-12 d-md-none text-center">
              <small style={{fontSize: '0.85rem', color: '#5a7c3d', fontStyle: 'italic', fontWeight: '500'}}>
                "Small is the gate and narrow the road" - Matthew 7:14
              </small>
            </div>
            <div className="col-md-4 text-end d-none d-md-block">
              <small style={{fontSize: '0.85rem', color: '#5a7c3d', fontStyle: 'italic', fontWeight: '500'}}>
                "Small is the gate and narrow the road" - Matthew 7:14
              </small>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/hikes" replace />} />
          <Route path="/hikes" element={
            <PrivateRoute>
              <HikesPage />
            </PrivateRoute>
          } />
          <Route path="/photos" element={
            <PrivateRoute>
              <PhotosPage />
            </PrivateRoute>
          } />
          <Route path="/my-hikes" element={
            <PrivateRoute>
              <MyHikesPage />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminPage />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute adminOnly>
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute adminOnly>
              <NotificationsPage />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Page Components Needed

Create these page components in `frontend/src/pages/`:

### HikesPage.js
- Navigation tabs at top
- Renders HikesList component
- Admin: Shows "Add Hike" button

### PhotosPage.js
- Renders PhotoUpload and PhotoGallery

### MyHikesPage.js
- Renders MyHikesPage component from hikes folder

### AdminPage.js
- Renders AdminPanel component

### UsersPage.js
- Renders UserManagement component

### NotificationsPage.js
- Renders NotificationPanel component

## Key Patterns to Maintain

### 1. State Management
- Use `useState` for local component state
- Use `useAuth()` hook for auth state
- Pass callbacks as props for parent updates

### 2. API Calls
```javascript
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getHikes(token);
      setData(result);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
};
```

### 3. Modal Pattern
```javascript
const [showModal, setShowModal] = useState(false);

{showModal && (
  <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
    <div className="modal-dialog">
      <div className="modal-content">
        {/* Modal content */}
        <button onClick={() => setShowModal(false)}>Close</button>
      </div>
    </div>
  </div>
)}
```

### 4. Bootstrap Styling
Maintain all existing Bootstrap classes and inline styles from original App.js.

## Installation Requirements

Add React Router to package.json:
```bash
npm install react-router-dom
```

## Testing Checklist

- [ ] Landing page shows public hikes
- [ ] Login/signup flow works
- [ ] Password reset works
- [ ] Authenticated users see hikes list
- [ ] Users can express interest in hikes
- [ ] Users can view hike details modal
- [ ] Users can comment on hikes
- [ ] Users can create carpool offers/requests
- [ ] Users can use packing list
- [ ] Users can view "My Hikes" dashboard
- [ ] Users can upload photos
- [ ] Admin can create/edit/delete hikes
- [ ] Admin can manage users
- [ ] Admin can send test notifications
- [ ] Admin can view emergency contacts
- [ ] All navigation tabs work
- [ ] All modals open/close correctly
- [ ] Loading states work
- [ ] Error handling works

## Next Steps

1. Install react-router-dom: `npm install react-router-dom`
2. Create all page components in `pages/` folder
3. Create remaining hike components
4. Create admin components
5. Create photo components
6. Replace old App.js with new modular version
7. Test all functionality
8. Remove old App.js after verification

## Important Notes

- **API_URL**: Already configured in services/api.js
- **Token**: Available via `useAuth()` hook
- **Icons**: Using lucide-react (already imported in original)
- **Styling**: Keep all Bootstrap classes and inline gradient styles
- **Bible Verse**: "Small is the gate and narrow the road that leads to life" - Matthew 7:14
- **Phrases**: "Dit bou karakter" - Jan, "Dit is maklikker as wat dit lyk"
