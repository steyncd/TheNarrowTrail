import React, { useState, useEffect } from 'react';
import { Calendar, LogOut, Users, Image as ImageIcon, Settings, Bell, User, MapPin, Heart, CheckCircle, AlertCircle, Clock, Package, Plus, Trash2 } from 'lucide-react';

const API_URL = 'https://hiking-portal-api-554106646136.us-central1.run.app';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('hikes');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: token + new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [hikes, setHikes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [testNotification, setTestNotification] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: ''
  });
  
  const [newHike, setNewHike] = useState({
    name: '', date: '', difficulty: 'Easy', distance: '',
    description: '', type: 'day', cost: 0, group: 'family', status: 'gathering_interest',
    image_url: '', destination_url: '', daily_distances: [], overnight_facilities: ''
  });
  const [showEditHike, setShowEditHike] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [editHikeData, setEditHikeData] = useState({
    name: '', date: '', difficulty: 'Easy', distance: '',
    description: '', type: 'day', cost: 0, group: 'family', status: 'gathering_interest',
    image_url: '', destination_url: '', daily_distances: [], overnight_facilities: ''
  });
  const [showHikeDetails, setShowHikeDetails] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [newAttendee, setNewAttendee] = useState({
    user_id: '',
    payment_status: 'unpaid',
    amount_paid: 0,
    notes: ''
  });
  const [photoUpload, setPhotoUpload] = useState({ hikeName: '', date: '', url: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetUserPassword, setShowResetUserPassword] = useState(false);
  const [showAddHikeForm, setShowAddHikeForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'hiker'
  });
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'hiker',
    notifications_email: true,
    notifications_whatsapp: true
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showHikerHikeDetails, setShowHikerHikeDetails] = useState(false);
  const [hikerHikeStatus, setHikerHikeStatus] = useState(null);

  // My Hikes Dashboard
  const [myHikes, setMyHikes] = useState(null);

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Carpooling
  const [carpoolOffers, setCarpoolOffers] = useState([]);
  const [carpoolRequests, setCarpoolRequests] = useState([]);
  const [showCarpoolOfferForm, setShowCarpoolOfferForm] = useState(false);
  const [showCarpoolRequestForm, setShowCarpoolRequestForm] = useState(false);
  const [carpoolOfferData, setCarpoolOfferData] = useState({
    departure_location: '',
    available_seats: 1,
    departure_time: '',
    notes: ''
  });
  const [carpoolRequestData, setCarpoolRequestData] = useState({
    pickup_location: '',
    notes: ''
  });

  // Packing List
  const [packingList, setPackingList] = useState({ items: [] });

  // Emergency Contact
  const [emergencyContact, setEmergencyContact] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_info: ''
  });
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);

  // Hike Details Tab
  const [hikeDetailsTab, setHikeDetailsTab] = useState('info');

  // Admin Emergency Contacts
  const [showEmergencyContactsModal, setShowEmergencyContactsModal] = useState(false);
  const [emergencyContactsList, setEmergencyContactsList] = useState([]);

  // Admin Default Packing List
  const [showDefaultPackingListModal, setShowDefaultPackingListModal] = useState(false);
  const [defaultPackingListItems, setDefaultPackingListItems] = useState([]);
  const [newPackingItem, setNewPackingItem] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    }

    // Check for email verification token in URL
    const params = new URLSearchParams(window.location.search);
    const verificationToken = params.get('token');
    if (verificationToken && window.location.pathname === '/verify-email') {
      handleEmailVerification(verificationToken);
    }
  }, [token]);

  // Debug: Track showHikerHikeDetails state changes
  useEffect(() => {
    console.log('🔍 showHikerHikeDetails state changed to:', showHikerHikeDetails);
    console.log('🔍 selectedHike:', selectedHike);
    if (!showHikerHikeDetails) {
      console.trace('❌ Modal closed - stack trace:');
    }
  }, [showHikerHikeDetails, selectedHike]);

  const handleEmailVerification = async (verificationToken) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/verify-email/' + verificationToken);
      const data = await response.json();

      if (response.ok) {
        setResetSuccess(data.message || 'Email verified successfully!');
        // Clear the token from URL
        window.history.replaceState({}, document.title, '/');
      } else {
        setError(data.error || 'Email verification failed');
      }
    } catch (err) {
      setError('Connection error during email verification');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await fetch(API_URL + '/api/hikes', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(userData);
        fetchHikes();
        fetchPhotos();
        fetchMyHikes();
        if (userData.role === 'admin') {
          fetchPendingUsers();
          fetchUsers();
          fetchNotifications();
        }
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const fetchHikes = async () => {
    try {
      const response = await fetch(API_URL + '/api/hikes', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setHikes(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch(API_URL + '/api/photos', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error('Fetch photos error:', err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(API_URL + '/api/admin/pending-users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setPendingUsers(data);
    } catch (err) {
      console.error('Fetch pending users error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL + '/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(API_URL + '/api/admin/notifications', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const fetchMyHikes = async () => {
    try {
      const response = await fetch(API_URL + '/api/my-hikes', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      setMyHikes(data);
    } catch (err) {
      console.error('Fetch my hikes error:', err);
    }
  };

  const fetchComments = async (hikeId) => {
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/comments', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
      setComments([]);
    }
  };

  const addComment = async (hikeId) => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/comments', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: newComment })
      });
      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (hikeId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    setLoading(true);
    try {
      await fetch(API_URL + '/api/hikes/' + hikeId + '/comments/' + commentId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Delete comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarpooling = async (hikeId) => {
    try {
      const [offersRes, requestsRes] = await Promise.all([
        fetch(API_URL + '/api/hikes/' + hikeId + '/carpool-offers', {
          headers: { 'Authorization': 'Bearer ' + token }
        }),
        fetch(API_URL + '/api/hikes/' + hikeId + '/carpool-requests', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);
      if (offersRes.ok && requestsRes.ok) {
        const offers = await offersRes.json();
        const requests = await requestsRes.json();
        setCarpoolOffers(offers);
        setCarpoolRequests(requests);
      } else {
        setCarpoolOffers([]);
        setCarpoolRequests([]);
      }
    } catch (err) {
      console.error('Fetch carpooling error:', err);
      setCarpoolOffers([]);
      setCarpoolRequests([]);
    }
  };

  const submitCarpoolOffer = async (hikeId) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/carpool-offers', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(carpoolOfferData)
      });
      if (response.ok) {
        const data = await response.json();
        setCarpoolOffers([...carpoolOffers, data]);
        setCarpoolOfferData({ departure_location: '', available_seats: 1, departure_time: '', notes: '' });
        setShowCarpoolOfferForm(false);
      }
    } catch (err) {
      console.error('Submit carpool offer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitCarpoolRequest = async (hikeId) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/carpool-requests', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(carpoolRequestData)
      });
      if (response.ok) {
        const data = await response.json();
        const existing = carpoolRequests.find(r => r.user_id === currentUser.id);
        if (existing) {
          setCarpoolRequests(carpoolRequests.map(r => r.user_id === currentUser.id ? data : r));
        } else {
          setCarpoolRequests([...carpoolRequests, data]);
        }
        setCarpoolRequestData({ pickup_location: '', notes: '' });
        setShowCarpoolRequestForm(false);
      }
    } catch (err) {
      console.error('Submit carpool request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackingList = async (hikeId) => {
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/packing-list', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setPackingList(data);
      } else {
        setPackingList({ items: [] });
      }
    } catch (err) {
      console.error('Fetch packing list error:', err);
      setPackingList({ items: [] });
    }
  };

  const togglePackingItem = async (hikeId, index) => {
    const updatedItems = [...packingList.items];
    updatedItems[index].checked = !updatedItems[index].checked;
    setPackingList({ items: updatedItems });

    try {
      await fetch(API_URL + '/api/hikes/' + hikeId + '/packing-list', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (err) {
      console.error('Update packing list error:', err);
    }
  };

  const fetchEmergencyContact = async () => {
    try {
      const response = await fetch(API_URL + '/api/profile/emergency-contact', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        const data = await response.json();
        setEmergencyContact(data);
      } else {
        // If 404 or other error, set empty emergency contact
        setEmergencyContact({
          emergency_contact_name: '',
          emergency_contact_phone: '',
          medical_info: ''
        });
      }
    } catch (err) {
      console.error('Fetch emergency contact error:', err);
      setEmergencyContact({
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_info: ''
      });
    }
  };

  const fetchHikeEmergencyContacts = async (hikeId) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/emergency-contacts', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      if (response.ok) {
        setEmergencyContactsList(data);
        setShowEmergencyContactsModal(true);
      } else {
        alert(data.error || 'Failed to fetch emergency contacts');
      }
    } catch (err) {
      console.error('Fetch emergency contacts error:', err);
      alert('Failed to fetch emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultPackingList = async (hikeId) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + hikeId + '/default-packing-list', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      if (response.ok) {
        setDefaultPackingListItems(data.items || []);
        setShowDefaultPackingListModal(true);
      } else {
        alert(data.error || 'Failed to fetch default packing list');
      }
    } catch (err) {
      console.error('Fetch default packing list error:', err);
      alert('Failed to fetch default packing list');
    } finally {
      setLoading(false);
    }
  };

  const saveDefaultPackingList = async () => {
    if (!selectedHike) return;
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/hikes/' + selectedHike.id + '/default-packing-list', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ items: defaultPackingListItems })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Default packing list updated successfully!');
        setShowDefaultPackingListModal(false);
      } else {
        alert(data.error || 'Failed to update default packing list');
      }
    } catch (err) {
      console.error('Save default packing list error:', err);
      alert('Failed to save default packing list');
    } finally {
      setLoading(false);
    }
  };

  const addDefaultPackingItem = () => {
    if (newPackingItem.trim()) {
      setDefaultPackingListItems([...defaultPackingListItems, { name: newPackingItem.trim() }]);
      setNewPackingItem('');
    }
  };

  const removeDefaultPackingItem = (index) => {
    setDefaultPackingListItems(defaultPackingListItems.filter((_, i) => i !== index));
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setHikes([]);
    setShowLoginModal(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetSuccess('');
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess('Password reset code sent! Check your email.');
        setResetStep(2);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          token: resetToken,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess('Password reset successful! You can now sign in.');
        setTimeout(() => {
          setShowResetPassword(false);
          setResetStep(1);
          setResetEmail('');
          setResetToken('');
          setNewPassword('');
          setConfirmPassword('');
          setResetSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setResetSuccess('');

    if (!signUpData.name || !signUpData.email || !signUpData.phone || !signUpData.password) {
      setError('All fields are required');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          phone: signUpData.phone,
          password: signUpData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(data.message || 'Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          setShowSignUp(false);
          setSignUpData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
          });
          setResetSuccess('');
        }, 5000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = async (hikeId) => {
    setLoading(true);
    try {
      await fetch(API_URL + '/api/hikes/' + hikeId + '/interest', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchHikes();
      // Refresh hike details if modal is open
      if (showHikerHikeDetails && selectedHike?.id === hikeId) {
        await openHikerHikeDetails(selectedHike);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmAttendance = async (hikeId) => {
    setLoading(true);
    try {
      await fetch(API_URL + '/api/hikes/' + hikeId + '/confirm-attendance', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchHikes();
      // Refresh hike details if modal is open
      if (showHikerHikeDetails && selectedHike?.id === hikeId) {
        await openHikerHikeDetails(selectedHike);
      }
    } catch (err) {
      console.error('Confirm attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openHikerHikeDetails = async (hike) => {
    console.log('openHikerHikeDetails called for hike:', hike.id, hike.name);

    // Set loading state and show modal immediately
    setLoading(true);
    setSelectedHike(hike);
    setError('');
    setHikeDetailsTab('info');
    setShowHikerHikeDetails(true); // Show modal immediately with loading state
    console.log('✅ Called setShowHikerHikeDetails(true)');

    // Clear previous data
    setHikerHikeStatus(null);
    setComments([]);
    setCarpoolOffers([]);
    setCarpoolRequests([]);
    setPackingList({ items: [] });

    try {
      console.log('Fetching hike status from API...');
      const response = await fetch(API_URL + '/api/hikes/' + hike.id + '/my-status', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error('Failed to fetch hike status');
      }

      const data = await response.json();
      console.log('Hike status data received:', data);
      setHikerHikeStatus(data);

      // Fetch additional tab data - wrap in try-catch to prevent errors from breaking modal
      try {
        await fetchComments(hike.id);
      } catch (e) {
        console.error('Failed to fetch comments:', e);
      }
      try {
        await fetchCarpooling(hike.id);
      } catch (e) {
        console.error('Failed to fetch carpooling:', e);
      }
      try {
        await fetchPackingList(hike.id);
      } catch (e) {
        console.error('Failed to fetch packing list:', e);
      }
    } catch (err) {
      console.error('Fetch hike status error:', err);
      setError('Failed to load hike details: ' + err.message);
      setShowHikerHikeDetails(false); // Close modal on error
      alert('Failed to load hike details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addHike = async () => {
    if (!newHike.name || !newHike.date) {
      alert('Please fill in name and date');
      return;
    }
    setLoading(true);
    try {
      // Filter out empty strings from daily_distances before sending
      const hikeData = {
        ...newHike,
        daily_distances: newHike.daily_distances.filter(d => d)
      };
      await fetch(API_URL + '/api/hikes', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hikeData)
      });
      setNewHike({
        name: '', date: '', difficulty: 'Easy', distance: '',
        description: '', type: 'day', cost: 0, group: 'family', status: 'gathering_interest',
        image_url: '', destination_url: '', daily_distances: [], overnight_facilities: ''
      });
      await fetchHikes();
    } catch (err) {
      console.error('Add hike error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHike = async (id) => {
    if (!window.confirm('Delete this hike?')) return;
    setLoading(true);
    try {
      await fetch(API_URL + '/api/hikes/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchHikes();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditHike = (hike) => {
    setSelectedHike(hike);
    setEditHikeData({
      name: hike.name,
      date: hike.date ? hike.date.split('T')[0] : '',
      difficulty: hike.difficulty,
      distance: hike.distance,
      description: hike.description || '',
      type: hike.type,
      cost: hike.cost || 0,
      group: hike.group_type,
      status: hike.status || 'gathering_interest',
      image_url: hike.image_url || '',
      destination_url: hike.destination_url || '',
      daily_distances: hike.daily_distances || [],
      overnight_facilities: hike.overnight_facilities || ''
    });
    setShowEditHike(true);
    setError('');
  };

  const openHikeDetails = async (hike) => {
    setSelectedHike(hike);
    setShowHikeDetails(true);
    setError('');
    try {
      const [interestedRes, attendeesRes] = await Promise.all([
        fetch(API_URL + '/api/hikes/' + hike.id + '/interested', {
          headers: { 'Authorization': 'Bearer ' + token }
        }),
        fetch(API_URL + '/api/hikes/' + hike.id + '/attendees', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);
      const interestedData = await interestedRes.json();
      const attendeesData = await attendeesRes.json();
      setInterestedUsers(interestedData);
      setAttendees(attendeesData);
    } catch (err) {
      console.error('Fetch hike details error:', err);
    }
  };

  const addAttendee = async () => {
    setError('');
    if (!newAttendee.user_id) {
      setError('Please select a user');
      return;
    }
    try {
      await fetch(API_URL + '/api/hikes/' + selectedHike.id + '/attendees', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAttendee)
      });
      setNewAttendee({ user_id: '', payment_status: 'unpaid', amount_paid: 0, notes: '' });
      await openHikeDetails(selectedHike);
    } catch (err) {
      setError('Failed to add attendee');
      console.error('Add attendee error:', err);
    }
  };

  const updateAttendee = async (userId, data) => {
    try {
      await fetch(API_URL + '/api/hikes/' + selectedHike.id + '/attendees/' + userId, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      await openHikeDetails(selectedHike);
    } catch (err) {
      console.error('Update attendee error:', err);
    }
  };

  const removeAttendee = async (userId) => {
    if (!window.confirm('Remove this attendee?')) return;
    try {
      await fetch(API_URL + '/api/hikes/' + selectedHike.id + '/attendees/' + userId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await openHikeDetails(selectedHike);
    } catch (err) {
      console.error('Remove attendee error:', err);
    }
  };

  const editHike = async () => {
    setError('');
    if (!editHikeData.name || !editHikeData.date) {
      setError('Name and date are required');
      return;
    }
    setLoading(true);
    try {
      // Filter out empty strings from daily_distances before sending
      const hikeData = {
        ...editHikeData,
        daily_distances: editHikeData.daily_distances.filter(d => d)
      };
      const response = await fetch(API_URL + '/api/hikes/' + selectedHike.id, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hikeData)
      });
      const data = await response.json();
      if (response.ok) {
        setShowEditHike(false);
        setSelectedHike(null);
        await fetchHikes();
        alert('Hike updated successfully!');
      } else {
        setError(data.error || 'Failed to update hike');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Edit hike error:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    setLoading(true);
    try {
      await fetch(API_URL + '/api/admin/approve-user/' + userId, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchPendingUsers();
      await fetchUsers();
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async (userId) => {
    setLoading(true);
    try {
      await fetch(API_URL + '/api/admin/reject-user/' + userId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchPendingUsers();
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await fetch(API_URL + '/api/admin/users/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async () => {
    if (!photoUpload.hikeName || !photoUpload.url) {
      alert('Please fill in hike name and URL');
      return;
    }
    setLoading(true);
    try {
      await fetch(API_URL + '/api/photos', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hike_name: photoUpload.hikeName,
          date: photoUpload.date || new Date().toISOString().split('T')[0],
          url: photoUpload.url
        })
      });
      setPhotoUpload({ hikeName: '', date: '', url: '' });
      await fetchPhotos();
    } catch (err) {
      console.error('Add photo error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    setLoading(true);
    try {
      await fetch(API_URL + '/api/photos/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      await fetchPhotos();
    } catch (err) {
      console.error('Delete photo error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    setError('');
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (response.ok) {
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'hiker' });
        setShowAddUser(false);
        await fetchUsers();
        alert('User created successfully!');
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Add user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const editUser = async () => {
    setError('');
    if (!editUserData.name || !editUserData.email || !editUserData.phone) {
      setError('Name, email, and phone are required');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/admin/users/' + selectedUser.id, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUserData)
      });
      const data = await response.json();
      if (response.ok) {
        setShowEditUser(false);
        setSelectedUser(null);
        await fetchUsers();
        alert('User updated successfully!');
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Edit user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async () => {
    setError('');
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      setError('Both password fields are required');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (resetPasswordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/admin/users/' + selectedUser.id + '/reset-password', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: resetPasswordData.newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setShowResetUserPassword(false);
        setSelectedUser(null);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        alert('Password reset successfully! User will receive an email with the new password.');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Reset user password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      notifications_email: user.notifications_email !== false,
      notifications_whatsapp: user.notifications_whatsapp !== false
    });
    setShowEditUser(true);
    setError('');
  };

  const openResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setShowResetUserPassword(true);
    setError('');
  };

  const promoteToAdmin = async (userId) => {
    if (!window.confirm('Promote this user to admin?')) return;
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/admin/users/' + userId + '/promote', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUsers();
        alert('User promoted to admin successfully!');
      } else {
        alert(data.error || 'Failed to promote user');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
      console.error('Promote user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setError('');
    if (!testNotification.recipient || !testNotification.message) {
      setError('Recipient and message are required');
      return;
    }
    if (testNotification.type === 'email' && !testNotification.subject) {
      setError('Subject is required for email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/admin/test-notification', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testNotification)
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setTestNotification({ type: 'email', recipient: '', subject: '', message: '' });
        await fetchNotifications();
      } else {
        setError(data.error || 'Failed to send test notification');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Test notification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Landing Page State
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch public hikes for landing page
  useEffect(() => {
    if (!currentUser && hikes.length === 0) {
      const fetchPublicHikes = async () => {
        try {
          setLoading(true);
          const response = await fetch(API_URL + '/api/hikes/public');
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
      fetchPublicHikes();
    }
  }, [currentUser]);

  if (!currentUser) {
    // If login modal is requested, show it
    if (showLoginModal) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden px-3 py-4" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
          {/* Background decorative elements */}
          <div className="d-none d-md-block" style={{position: 'absolute', top: '10%', left: '5%', opacity: '0.15', fontSize: '8rem'}}>⛰️</div>
          <div className="d-none d-md-block" style={{position: 'absolute', bottom: '10%', right: '5%', opacity: '0.15', fontSize: '6rem'}}>🥾</div>

          <div className="card shadow-lg border-0" style={{maxWidth: '550px', width: '100%', borderRadius: '20px', overflow: 'hidden', position: 'relative'}}>
          {/* Verse Banner - Prominent */}
          <div className="text-center py-2 py-md-3 px-2" style={{background: 'linear-gradient(135deg, #8b7355 0%, #6b5644 100%)', borderBottom: '2px solid #d4a574', position: 'relative'}}>
            <p className="mb-0 text-white" style={{fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', fontStyle: 'italic', fontWeight: '500', letterSpacing: '0.5px'}}>
              "Small is the gate and narrow the road that leads to life"
            </p>
            <small className="text-white-50" style={{fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)'}}>Matthew 7:14</small>
          </div>

          {/* Card Header with Group Image */}
          <div className="text-center p-3 p-md-4" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderBottom: '3px solid #4a7c7c', position: 'relative'}}>
            {/* Back Button */}
            <button
              className="btn btn-sm position-absolute top-0 start-0 mt-2 ms-2"
              onClick={() => setShowLoginModal(false)}
              style={{
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '600',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px'
              }}
            >
              ← Back
            </button>
            <img
              src="https://media-jnb2-1.cdn.whatsapp.net/v/t61.24694-24/531816244_1267185695145803_3816874698378382952_n.jpg?ccb=11-4&oh=01_Q5Aa2gE6eCgVsJ7VS5mA4tUUzfCHqn50KfOgB46uc6VedXqULA&oe=68F0F796&_nc_sid=5e03e0&_nc_cat=111"
              alt="The Narrow Trail Group"
              style={{width: 'clamp(70px, 20vw, 100px)', height: 'clamp(70px, 20vw, 100px)', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4a7c7c', marginBottom: '1rem'}}
            />
            <h1 className="fw-bold text-white mb-2" style={{fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', letterSpacing: '2px', fontFamily: "'Russo One', sans-serif"}}>THE NARROW TRAIL</h1>
            <p className="text-white-50 small mb-0" style={{fontSize: 'clamp(0.7rem, 2vw, 0.875rem)', fontStyle: 'italic'}}>
              Hiking and trekking and stap and gesels and stuff
            </p>
          </div>

          <div className="card-body p-3 p-md-4">
            {/* Inspirational Banner */}
            <div className="alert alert-light border-0 text-center mb-4" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '10px'}}>
              <small className="d-block" style={{fontStyle: 'italic', color: '#1a1a1a', fontWeight: '500'}}>
                "Dit bou karakter" - Jan
              </small>
            </div>

            <div className="text-center mb-4">
              <p className="text-muted mb-0">
                {showSignUp
                  ? 'Create your account'
                  : !showResetPassword
                  ? 'Sign in to view upcoming hikes'
                  : resetStep === 1
                  ? 'Enter your email to reset password'
                  : 'Enter reset code and new password'
                }
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {resetSuccess && (
              <div className="alert alert-success" role="alert">
                {resetSuccess}
              </div>
            )}

            {showSignUp ? (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+27..."
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100"
                    style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600', padding: '12px', borderRadius: '10px'}}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Sign Up'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setShowSignUp(false);
                      setError('');
                      setResetSuccess('');
                    }}
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </>
            ) : !showResetPassword ? (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100"
                    style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600', padding: '12px', borderRadius: '10px'}}
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setShowResetPassword(true);
                      setResetStep(1);
                      setError('');
                      setResetSuccess('');
                    }}
                  >
                    Forgot password?
                  </button>
                  <span className="mx-2">•</span>
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setShowSignUp(true);
                      setError('');
                      setResetSuccess('');
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </>
            ) : resetStep === 1 ? (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetStep(1);
                      setError('');
                      setResetSuccess('');
                      setResetEmail('');
                    }}
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                  <div className="mb-3">
                    <label className="form-label">Reset Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit code from email"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      maxLength="6"
                      required
                    />
                    <small className="text-muted">Check your email for the reset code</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setResetStep(1);
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                  >
                    Back to email entry
                  </button>
                  <span className="mx-2">•</span>
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetStep(1);
                      setError('');
                      setResetSuccess('');
                      setResetEmail('');
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      );
    }

    // Landing Page - Show hikes preview without authentication
    return (
      <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        {/* Navbar */}
        <nav className="navbar navbar-dark shadow-lg" style={{background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)', borderBottom: '3px solid #4a7c7c'}}>
          <div className="container-fluid px-3">
            <div className="d-flex align-items-center">
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
                <small className="text-white-50" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>
                  "Small is the gate and narrow the road that leads to life" - Matthew 7:14
                </small>
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600'}}
              onClick={() => setShowLoginModal(true)}
            >
              Login / Sign Up
            </button>
          </div>
        </nav>

        <div className="container py-5">
          {/* Hero Section */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-white mb-3">Join Us on The Narrow Trail</h1>
            <p className="lead text-white-50 mb-4">
              Experience the beauty of nature with fellow adventurers. Hiking and trekking and stap and gesels and stuff.
            </p>
            <div className="alert alert-light d-inline-block" style={{background: 'rgba(255,255,255,0.95)', borderRadius: '10px', border: 'none'}}>
              <p className="mb-0" style={{fontStyle: 'italic', color: '#1a1a1a', fontWeight: '500'}}>
                "Dit bou karakter" - Jan
              </p>
              <small className="text-muted">Remember: Dit is maklikker as wat dit lyk</small>
            </div>
          </div>

          {/* Upcoming Hikes */}
          <div className="row mb-4">
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
                          <span className="badge bg-warning text-dark">{hike.difficulty}</span>
                        </div>
                        <p className="card-text text-muted small mb-3">{hike.description}</p>
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span>
                            <Calendar size={14} className="me-1" />
                            {hikeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>
                            <MapPin size={14} className="me-1" />
                            {hike.distance}
                          </span>
                        </div>
                      </div>
                      <div className="card-footer bg-light border-0">
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => setShowLoginModal(true)}
                        >
                          Login to Join
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Call to Action */}
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
      <nav className="navbar navbar-dark shadow-lg" style={{background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)', borderBottom: '3px solid #4a7c7c'}}>
        <div className="container-fluid px-2 px-md-3">
          <div className="d-flex align-items-center flex-grow-1" style={{minWidth: 0}}>
            <img
              src="https://media-jnb2-1.cdn.whatsapp.net/v/t61.24694-24/531816244_1267185695145803_3816874698378382952_n.jpg?ccb=11-4&oh=01_Q5Aa2gE6eCgVsJ7VS5mA4tUUzfCHqn50KfOgB46uc6VedXqULA&oe=68F0F796&_nc_sid=5e03e0&_nc_cat=111"
              alt="Group"
              style={{width: 'clamp(35px, 8vw, 50px)', height: 'clamp(35px, 8vw, 50px)', borderRadius: '50%', marginRight: 'clamp(8px, 2vw, 15px)', objectFit: 'cover', border: '2px solid #4a7c7c', flexShrink: 0}}
            />
            <div style={{minWidth: 0, overflow: 'hidden'}}>
              <span className="navbar-brand mb-0 text-white d-block text-truncate" style={{fontWeight: '700', letterSpacing: '1px', fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', fontFamily: "'Russo One', sans-serif"}}>
                THE NARROW TRAIL
              </span>
              <small className="text-white-50 d-none d-md-inline" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>
                "Small is the gate and narrow the road that leads to life" - Matthew 7:14
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2" style={{flexShrink: 0}}>
            <span className="d-none d-lg-inline me-2 small text-white-50 text-truncate" style={{maxWidth: '200px'}}>
              {currentUser.email} ({currentUser.role})
            </span>
            <button className="btn btn-sm" style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)'}} onClick={handleLogout}>
              <LogOut size={16} className="me-1" />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-2 px-md-3 py-3 py-md-4">
        {/* Inspirational Quote Banner */}
        <div className="alert border-0 shadow-sm mb-3 mb-md-4 p-2 p-md-3" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', borderRadius: '10px', borderLeft: '4px solid #4a7c7c'}}>
          <div className="row align-items-center g-2">
            {/* Desktop view - show all phrases */}
            <div className="col-md-8 d-none d-md-block">
              <p className="mb-1" style={{fontStyle: 'italic', color: '#1a1a1a', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)'}}>
                <strong>"Dit bou karakter"</strong> - Jan
              </p>
              <small className="text-muted" style={{fontSize: 'clamp(0.7rem, 1.5vw, 0.875rem)'}}>Remember: Dit is maklikker as wat dit lyk</small>
            </div>
            {/* Mobile view - show only verse */}
            <div className="col-12 d-md-none text-center">
              <small style={{fontSize: '0.85rem', color: '#5a7c3d', fontStyle: 'italic', fontWeight: '500'}}>
                "Small is the gate and narrow the road" - Matthew 7:14
              </small>
            </div>
            {/* Desktop view - verse on the right */}
            <div className="col-md-4 text-end d-none d-md-block">
              <small style={{fontSize: '0.85rem', color: '#5a7c3d', fontStyle: 'italic', fontWeight: '500'}}>
                "Small is the gate and narrow the road" - Matthew 7:14
              </small>
            </div>
          </div>
        </div>

        <div className="nav nav-tabs mb-3 mb-md-4 border-0 flex-nowrap overflow-auto pb-2" style={{gap: 'clamp(5px, 1vw, 10px)', scrollbarWidth: 'thin'}}>
          <li className="nav-item flex-shrink-0">
            <button
              className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'hikes' ? '' : '')}
              style={activeTab === 'hikes' ?
                {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
              onClick={() => setActiveTab('hikes')}
            >
              <Calendar size={14} className="me-1" />
              <span className="d-none d-sm-inline">Hikes</span>
              <span className="d-inline d-sm-none">🥾</span>
            </button>
          </li>
          <li className="nav-item flex-shrink-0">
            <button
              className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'photos' ? '' : '')}
              style={activeTab === 'photos' ?
                {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
              onClick={() => setActiveTab('photos')}
            >
              <ImageIcon size={14} className="me-1" />
              <span className="d-none d-sm-inline">Photos</span>
              <span className="d-inline d-sm-none">📷</span>
            </button>
          </li>
          <li className="nav-item flex-shrink-0">
            <button
              className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'myHikes' ? '' : '')}
              style={activeTab === 'myHikes' ?
                {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
              onClick={() => { setActiveTab('myHikes'); fetchMyHikes(); fetchEmergencyContact(); }}
            >
              <User size={14} className="me-1" />
              <span className="d-none d-sm-inline">My Hikes</span>
              <span className="d-inline d-sm-none">👤</span>
            </button>
          </li>
          {currentUser.role === 'admin' && (
            <>
              <li className="nav-item flex-shrink-0">
                <button
                  className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'manage' ? '' : '')}
                  style={activeTab === 'manage' ?
                    {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                    {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
                  onClick={() => setActiveTab('manage')}
                >
                  <Settings size={14} className="me-1 d-none d-sm-inline" />
                  <span className="d-none d-sm-inline">Manage</span>
                  <span className="d-inline d-sm-none">⚙️</span>
                </button>
              </li>
              <li className="nav-item flex-shrink-0">
                <button
                  className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'users' ? '' : '')}
                  style={activeTab === 'users' ?
                    {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                    {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={14} className="me-1 d-none d-sm-inline" />
                  <span className="d-none d-sm-inline">Users {pendingUsers.length > 0 && '(' + pendingUsers.length + ')'}</span>
                  <span className="d-inline d-sm-none">👥{pendingUsers.length > 0 && '(' + pendingUsers.length + ')'}</span>
                </button>
              </li>
              <li className="nav-item flex-shrink-0">
                <button
                  className={'nav-link border-0 px-2 px-md-3 py-2 ' + (activeTab === 'notifications' ? '' : '')}
                  style={activeTab === 'notifications' ?
                    {background: 'linear-gradient(135deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px rgba(74, 124, 124, 0.3)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'} :
                    {background: 'rgba(255,255,255,0.8)', color: '#1a1a1a', borderRadius: '8px', fontWeight: '500', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', whiteSpace: 'nowrap'}}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={14} className="me-1 d-none d-sm-inline" />
                  <span className="d-none d-sm-inline">Notifications</span>
                  <span className="d-inline d-sm-none">🔔</span>
                </button>
              </li>
            </>
          )}
        </div>

        {activeTab === 'hikes' && (
          <div>
            <h2 className="mb-4">Hikes</h2>
            {hikes.length === 0 ? (
              <div className="card">
                <div className="card-body text-center text-muted py-5">
                  No hikes scheduled
                </div>
              </div>
            ) : (
              <>
                {(() => {
                  const now = new Date();
                  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // ~2 months

                  const upcomingSoon = hikes.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate >= now && hikeDate <= twoMonthsFromNow;
                  });

                  const future = hikes.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate > twoMonthsFromNow;
                  });

                  const past = hikes.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate < now;
                  });

                  const renderHike = (hike, isPast = false) => {
                    const isInterested = hike.interested_users && hike.interested_users.includes(currentUser.id);
                    const isConfirmed = hike.confirmed_users && hike.confirmed_users.includes(currentUser.id);
                    const displayStatus = isPast ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled') : hike.status;

                    return (
                    <div key={hike.id} className="col-12">
                      <div className="card shadow-sm" style={{overflow: 'hidden'}}>
                        {isConfirmed && (
                          <div style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            letterSpacing: '1px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                            position: 'relative'
                          }}>
                            <CheckCircle size={16} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                            BOOKED!
                            <span style={{
                              fontSize: '1.2rem',
                              marginLeft: '8px'
                            }}>🎉</span>
                          </div>
                        )}
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="card-title">{hike.name}</h5>
                              <p className="card-text text-muted">{hike.description}</p>
                            </div>
                            <span className="badge bg-warning text-dark">{hike.difficulty}</span>
                          </div>
                          
                          <div className="d-flex flex-wrap gap-2 mb-3 small text-muted">
                            <span className="text-nowrap"><Calendar size={16} className="me-1" />{new Date(hike.date).toLocaleDateString()}</span>
                            <span className="text-nowrap">Distance: {hike.distance}</span>
                            <span className="badge bg-info">{hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}</span>
                            <span className="badge bg-secondary">{hike.group_type === 'family' ? 'Family' : "Men's"}</span>
                            {hike.cost > 0 && <span className="text-success fw-bold">R{hike.cost}</span>}
                            <span className={'badge ' +
                              (displayStatus === 'completed' ? 'bg-success' :
                               displayStatus === 'cancelled' ? 'bg-secondary' :
                               displayStatus === 'trip_booked' ? 'bg-success' :
                               displayStatus === 'final_planning' ? 'bg-primary' :
                               displayStatus === 'pre_planning' ? 'bg-warning' : 'bg-secondary')}>
                              {(displayStatus || 'gathering_interest').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>

                          {!isPast ? (
                            <div className="d-flex flex-column flex-sm-row gap-2">
                              <button
                                onClick={() => openHikerHikeDetails(hike)}
                                className="btn btn-outline-primary flex-grow-1"
                                style={{minHeight: '44px'}}
                                disabled={loading}
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => toggleInterest(hike.id)}
                                className={'btn flex-grow-1 ' + (isInterested ? 'btn-secondary' : 'btn-success')}
                                style={{minHeight: '44px'}}
                                disabled={loading}
                              >
                                {loading ? 'Loading...' : (isInterested ? 'Remove Interest' : "I'm Interested!")}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openHikerHikeDetails(hike)}
                              className="btn btn-outline-secondary w-100"
                              style={{minHeight: '44px'}}
                              disabled={loading}
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  };

                  return (
                    <>
                      {upcomingSoon.length > 0 && (
                        <div className="mb-5">
                          <h4 className="mb-3 text-primary">
                            <Clock size={20} className="me-2" />
                            Next 2 Months
                          </h4>
                          <div className="row g-4">
                            {upcomingSoon.map(hike => renderHike(hike, false))}
                          </div>
                        </div>
                      )}

                      {future.length > 0 && (
                        <div className="mb-5">
                          <h4 className="mb-3 text-info">
                            <Calendar size={20} className="me-2" />
                            Future Adventures
                          </h4>
                          <div className="row g-4">
                            {future.map(hike => renderHike(hike, false))}
                          </div>
                        </div>
                      )}

                      {past.length > 0 && (
                        <div className="mb-5">
                          <h4 className="mb-3 text-muted">
                            <CheckCircle size={20} className="me-2" />
                            Past Hikes
                          </h4>
                          <div className="row g-4">
                            {past.map(hike => renderHike(hike, true))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}

            {/* Hiker Hike Details Modal */}
            {(() => {
              console.log('🎯 Modal render check - showHikerHikeDetails:', showHikerHikeDetails, 'selectedHike:', selectedHike);
              return showHikerHikeDetails && selectedHike;
            })() && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                {console.log('🚀 MODAL IS RENDERING!')}
                <div className="modal-dialog modal-xl mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header" style={{background: 'linear-gradient(90deg, #2d5016 0%, #4d7c3d 100%)'}}>
                      <h5 className="modal-title text-white" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
                        {hikerHikeStatus ? hikerHikeStatus.hike.name : selectedHike.name}
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => { setShowHikerHikeDetails(false); setHikeDetailsTab('info'); }}></button>
                    </div>

                    {/* BOOKED Banner */}
                    {hikerHikeStatus && hikerHikeStatus.isConfirmed && (
                      <div style={{
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        padding: '8px 16px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        letterSpacing: '1px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                        borderBottom: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        <CheckCircle size={16} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                        YOU'RE BOOKED!
                        <span style={{fontSize: '1.2rem', marginLeft: '8px'}}>🎉</span>
                      </div>
                    )}

                    {/* Tabs */}
                    <ul className="nav nav-tabs px-2 px-md-3 pt-2 mb-0 flex-nowrap overflow-auto" style={{scrollbarWidth: 'thin'}}>
                      <li className="nav-item flex-shrink-0">
                        <button className={'nav-link px-2 px-md-3 ' + (hikeDetailsTab === 'info' ? 'active' : '')} style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'}} onClick={() => setHikeDetailsTab('info')}>
                          Info
                        </button>
                      </li>
                      <li className="nav-item flex-shrink-0">
                        <button className={'nav-link px-2 px-md-3 ' + (hikeDetailsTab === 'comments' ? 'active' : '')} style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'}} onClick={() => setHikeDetailsTab('comments')}>
                          Comments ({comments.length})
                        </button>
                      </li>
                      <li className="nav-item flex-shrink-0">
                        <button className={'nav-link px-2 px-md-3 ' + (hikeDetailsTab === 'carpool' ? 'active' : '')} style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'}} onClick={() => setHikeDetailsTab('carpool')}>
                          Carpooling
                        </button>
                      </li>
                      <li className="nav-item flex-shrink-0">
                        <button className={'nav-link px-2 px-md-3 ' + (hikeDetailsTab === 'packing' ? 'active' : '')} style={{fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'}} onClick={() => setHikeDetailsTab('packing')}>
                          Packing List
                        </button>
                      </li>
                    </ul>

                    <div className="modal-body px-2 px-md-3 py-3">
                      {error && <div className="alert alert-danger">{error}</div>}

                      {/* Loading State */}
                      {!hikerHikeStatus && !error && (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3 text-muted">Loading hike details...</p>
                        </div>
                      )}

                      {/* INFO TAB */}
                      {hikerHikeStatus && hikeDetailsTab === 'info' && (
                        <>

                      {/* Hike Information */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-3 text-muted">Hike Information</h6>
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <strong>Date:</strong> {new Date(hikerHikeStatus.hike.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="col-md-6 mb-2">
                              <strong>Difficulty:</strong> <span className="badge bg-warning text-dark">{hikerHikeStatus.hike.difficulty}</span>
                            </div>
                            <div className="col-md-6 mb-2">
                              <strong>Distance:</strong> {hikerHikeStatus.hike.distance}
                            </div>
                            <div className="col-md-6 mb-2">
                              <strong>Type:</strong> <span className="badge bg-info">{hikerHikeStatus.hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}</span>
                            </div>
                            <div className="col-md-6 mb-2">
                              <strong>Group:</strong> <span className="badge bg-secondary">{hikerHikeStatus.hike.group_type === 'family' ? 'Family' : "Men's"}</span>
                            </div>
                            {hikerHikeStatus.hike.cost > 0 && (
                              <div className="col-md-6 mb-2">
                                <strong>Cost:</strong> <span className="text-success fw-bold">R{hikerHikeStatus.hike.cost}</span>
                              </div>
                            )}
                            <div className="col-md-12 mb-2">
                              <strong>Status:</strong> <span className={'badge ' +
                                (hikerHikeStatus.hike.status === 'trip_booked' ? 'bg-success' :
                                 hikerHikeStatus.hike.status === 'final_planning' ? 'bg-primary' :
                                 hikerHikeStatus.hike.status === 'pre_planning' ? 'bg-warning' : 'bg-secondary')}>
                                {(hikerHikeStatus.hike.status || 'gathering_interest').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <div className="col-12">
                              <strong>Description:</strong>
                              <p className="mt-2">{hikerHikeStatus.hike.description}</p>
                            </div>

                            {/* Image and Destination URL (All Hikes) */}
                            {hikerHikeStatus.hike.destination_url && (
                              <div className="col-12 mb-2">
                                <strong>Destination Website:</strong>
                                <br />
                                <a href={hikerHikeStatus.hike.destination_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info mt-1">
                                  <MapPin size={14} className="me-1" />
                                  Visit Destination Website
                                </a>
                              </div>
                            )}
                            {hikerHikeStatus.hike.image_url && (
                              <div className="col-12 mt-3">
                                <strong>Hike Image:</strong>
                                <br />
                                <img src={hikerHikeStatus.hike.image_url} alt={hikerHikeStatus.hike.name} className="img-fluid rounded mt-2 shadow" style={{maxHeight: '400px', width: '100%', objectFit: 'cover'}} />
                              </div>
                            )}

                            {/* Multi-Day Specific Details */}
                            {hikerHikeStatus.hike.type === 'multi' && (
                              <>
                                <div className="col-12">
                                  <hr className="my-2" />
                                  <strong className="text-info">Multi-Day Hike Information:</strong>
                                </div>
                                {hikerHikeStatus.hike.daily_distances && Array.isArray(hikerHikeStatus.hike.daily_distances) && hikerHikeStatus.hike.daily_distances.length > 0 && (
                                  <div className="col-12 mb-2">
                                    <strong>Daily Distances:</strong>
                                    <ul className="mt-1 mb-0">
                                      {hikerHikeStatus.hike.daily_distances.map((dist, idx) => (
                                        <li key={idx}>{dist}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {hikerHikeStatus.hike.overnight_facilities && (
                                  <div className="col-12 mb-2">
                                    <strong>Overnight Facilities:</strong>
                                    <p className="mt-1 mb-0 text-muted">{hikerHikeStatus.hike.overnight_facilities}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Participation Stats */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-3 text-muted">Participation</h6>
                          <div className="row text-center">
                            <div className="col-6">
                              <div className="border rounded p-3">
                                <h3 className="text-primary mb-0">{hikerHikeStatus.interestedCount}</h3>
                                <small className="text-muted">People Interested</small>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="border rounded p-3">
                                <h3 className="text-success mb-0">{hikerHikeStatus.confirmedCount}</h3>
                                <small className="text-muted">Confirmed Attendees</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Your Status */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-3 text-muted">Your Status</h6>
                          <div className="d-flex gap-2 align-items-center mb-3">
                            <span className="me-2">Interest:</span>
                            {hikerHikeStatus.isInterested ? (
                              <span className="badge bg-success">✓ You've expressed interest</span>
                            ) : (
                              <span className="badge bg-secondary">Not interested yet</span>
                            )}
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <span className="me-2">Attendance:</span>
                            {hikerHikeStatus.isConfirmed ? (
                              <span className="badge bg-success">✓ You're confirmed to attend</span>
                            ) : (
                              <span className="badge bg-secondary">Not confirmed yet</span>
                            )}
                          </div>
                          {hikerHikeStatus.isConfirmed && hikerHikeStatus.attendeeInfo && (
                            <div className="mt-3 p-3 bg-light rounded">
                              <strong>Payment Status:</strong> <span className={'badge ms-2 ' +
                                (hikerHikeStatus.attendeeInfo.payment_status === 'paid' ? 'bg-success' :
                                 hikerHikeStatus.attendeeInfo.payment_status === 'partial' ? 'bg-warning' : 'bg-secondary')}>
                                {hikerHikeStatus.attendeeInfo.payment_status}
                              </span>
                              {hikerHikeStatus.attendeeInfo.amount_paid > 0 && (
                                <div className="mt-2">
                                  <strong>Amount Paid:</strong> R{hikerHikeStatus.attendeeInfo.amount_paid}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-grid gap-2">
                        <button
                          onClick={() => toggleInterest(selectedHike.id)}
                          className={'btn ' + (hikerHikeStatus.isInterested ? 'btn-outline-secondary' : 'btn-success')}
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : (hikerHikeStatus.isInterested ? 'Remove Interest' : "Express Interest")}
                        </button>
                        <button
                          onClick={() => confirmAttendance(selectedHike.id)}
                          className={'btn ' + (hikerHikeStatus.isConfirmed ? 'btn-outline-danger' : 'btn-primary')}
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : (hikerHikeStatus.isConfirmed ? 'Cancel Attendance' : "Confirm I'm Attending")}
                        </button>
                      </div>
                      </>
                      )}

                      {/* COMMENTS TAB */}
                      {hikerHikeStatus && hikeDetailsTab === 'comments' && (
                        <div>
                          <h5 className="mb-3">Comments</h5>

                          {/* Add Comment Form */}
                          <div className="card mb-3">
                            <div className="card-body">
                              <textarea
                                className="form-control mb-2"
                                rows="3"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                              ></textarea>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => addComment(selectedHike.id)}
                                disabled={loading || !newComment.trim()}
                              >
                                {loading ? 'Posting...' : 'Post Comment'}
                              </button>
                            </div>
                          </div>

                          {/* Comments List */}
                          {comments.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                              <p>No comments yet. Be the first to comment!</p>
                            </div>
                          ) : (
                            <div className="list-group">
                              {comments.map(comment => (
                                <div key={comment.id} className="list-group-item">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                      <strong>{comment.user_name}</strong>
                                      <small className="text-muted ms-2">
                                        {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                                      </small>
                                      <p className="mb-0 mt-2">{comment.comment}</p>
                                    </div>
                                    {(currentUser.role === 'admin' || comment.user_id === currentUser.id) && (
                                      <button
                                        className="btn btn-sm btn-outline-danger ms-2"
                                        onClick={() => deleteComment(selectedHike.id, comment.id)}
                                        disabled={loading}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* CARPOOLING TAB */}
                      {hikerHikeStatus && hikeDetailsTab === 'carpool' && (
                        <div>
                          <h5 className="mb-3">Carpooling Coordination</h5>

                          {/* Carpool Offers */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0">Ride Offers</h6>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => { setCarpoolOfferData({ departure_location: '', available_seats: 1, departure_time: '', notes: '' }); setShowCarpoolOfferForm(true); }}
                              >
                                Offer a Ride
                              </button>
                            </div>

                            {showCarpoolOfferForm && (
                              <div className="card mb-3">
                                <div className="card-body">
                                  <h6>Offer a Ride</h6>
                                  <div className="row g-2">
                                    <div className="col-md-6">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Departure location"
                                        value={carpoolOfferData.departure_location}
                                        onChange={(e) => setCarpoolOfferData({...carpoolOfferData, departure_location: e.target.value})}
                                      />
                                    </div>
                                    <div className="col-md-3">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="Available seats"
                                        min="1"
                                        value={carpoolOfferData.available_seats}
                                        onChange={(e) => setCarpoolOfferData({...carpoolOfferData, available_seats: parseInt(e.target.value) || 1})}
                                      />
                                    </div>
                                    <div className="col-md-3">
                                      <input
                                        type="time"
                                        className="form-control form-control-sm"
                                        value={carpoolOfferData.departure_time}
                                        onChange={(e) => setCarpoolOfferData({...carpoolOfferData, departure_time: e.target.value})}
                                      />
                                    </div>
                                    <div className="col-12">
                                      <textarea
                                        className="form-control form-control-sm"
                                        rows="2"
                                        placeholder="Additional notes"
                                        value={carpoolOfferData.notes}
                                        onChange={(e) => setCarpoolOfferData({...carpoolOfferData, notes: e.target.value})}
                                      ></textarea>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <button
                                      className="btn btn-success btn-sm me-2"
                                      onClick={() => submitCarpoolOffer(selectedHike.id)}
                                      disabled={loading || !carpoolOfferData.departure_location}
                                    >
                                      {loading ? 'Submitting...' : 'Submit Offer'}
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setShowCarpoolOfferForm(false)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {carpoolOffers.length === 0 ? (
                              <p className="text-muted small">No ride offers yet.</p>
                            ) : (
                              <div className="list-group mb-3">
                                {carpoolOffers.map(offer => (
                                  <div key={offer.id} className="list-group-item">
                                    <div className="d-flex justify-content-between">
                                      <div>
                                        <strong>{offer.driver_name}</strong>
                                        <p className="mb-1 small">
                                          <MapPin size={14} className="me-1" />
                                          From: {offer.departure_location}
                                        </p>
                                        <p className="mb-1 small">
                                          <Users size={14} className="me-1" />
                                          Available seats: {offer.available_seats}
                                        </p>
                                        {offer.departure_time && (
                                          <p className="mb-1 small">
                                            <Clock size={14} className="me-1" />
                                            Departure: {offer.departure_time}
                                          </p>
                                        )}
                                        {offer.notes && <p className="mb-0 small text-muted">{offer.notes}</p>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Carpool Requests */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0">Ride Requests</h6>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => { setCarpoolRequestData({ pickup_location: '', notes: '' }); setShowCarpoolRequestForm(true); }}
                              >
                                Request a Ride
                              </button>
                            </div>

                            {showCarpoolRequestForm && (
                              <div className="card mb-3">
                                <div className="card-body">
                                  <h6>Request a Ride</h6>
                                  <div className="row g-2">
                                    <div className="col-12">
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Pickup location"
                                        value={carpoolRequestData.pickup_location}
                                        onChange={(e) => setCarpoolRequestData({...carpoolRequestData, pickup_location: e.target.value})}
                                      />
                                    </div>
                                    <div className="col-12">
                                      <textarea
                                        className="form-control form-control-sm"
                                        rows="2"
                                        placeholder="Additional notes"
                                        value={carpoolRequestData.notes}
                                        onChange={(e) => setCarpoolRequestData({...carpoolRequestData, notes: e.target.value})}
                                      ></textarea>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <button
                                      className="btn btn-info btn-sm me-2"
                                      onClick={() => submitCarpoolRequest(selectedHike.id)}
                                      disabled={loading || !carpoolRequestData.pickup_location}
                                    >
                                      {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setShowCarpoolRequestForm(false)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {carpoolRequests.length === 0 ? (
                              <p className="text-muted small">No ride requests yet.</p>
                            ) : (
                              <div className="list-group">
                                {carpoolRequests.map(request => (
                                  <div key={request.id} className="list-group-item">
                                    <strong>{request.requester_name}</strong>
                                    <p className="mb-1 small">
                                      <MapPin size={14} className="me-1" />
                                      Pickup location: {request.pickup_location}
                                    </p>
                                    {request.notes && <p className="mb-0 small text-muted">{request.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PACKING LIST TAB */}
                      {hikerHikeStatus && hikeDetailsTab === 'packing' && (
                        <div>
                          <h5 className="mb-3">Packing List</h5>
                          <p className="text-muted small">Check off items as you pack them. Your list is saved automatically.</p>

                          {packingList.items.length === 0 ? (
                            <div className="text-center py-4">
                              <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="list-group">
                              {packingList.items.map((item, index) => (
                                <div key={index} className="list-group-item">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={item.checked}
                                      onChange={() => togglePackingItem(selectedHike.id, index)}
                                      disabled={loading}
                                      id={`packing-${index}`}
                                    />
                                    <label className={'form-check-label ' + (item.checked ? 'text-decoration-line-through text-muted' : '')} htmlFor={`packing-${index}`}>
                                      {item.name}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowHikerHikeDetails(false)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Modal */}
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <h2 className="mb-4">Photo Gallery</h2>
            
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Upload Photo</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Hike name"
                      value={photoUpload.hikeName}
                      onChange={(e) => setPhotoUpload({...photoUpload, hikeName: e.target.value})}
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="date"
                      className="form-control"
                      value={photoUpload.date}
                      onChange={(e) => setPhotoUpload({...photoUpload, date: e.target.value})}
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Image URL"
                      value={photoUpload.url}
                      onChange={(e) => setPhotoUpload({...photoUpload, url: e.target.value})}
                    />
                  </div>
                </div>
                <button className="btn btn-success mt-3" onClick={addPhoto} disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>

            <div className="row g-4">
              {photos.map(photo => (
                <div key={photo.id} className="col-md-4">
                  <div className="card">
                    <img src={photo.url} className="card-img-top" alt={photo.hike_name} style={{height: '200px', objectFit: 'cover'}} />
                    <div className="card-body">
                      <h6 className="card-title">{photo.hike_name}</h6>
                      <p className="card-text small text-muted">
                        {new Date(photo.date).toLocaleDateString()}<br />
                        By {photo.uploaded_by}
                      </p>
                      {(currentUser.role === 'admin' || photo.uploaded_by === currentUser.email) && (
                        <button className="btn btn-sm btn-danger" onClick={() => deletePhoto(photo.id)} disabled={loading}>
                          {loading ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'myHikes' && (
          <div>
            <h2 className="mb-4">My Hikes Dashboard</h2>

            {!myHikes ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card text-center" style={{borderTop: '3px solid #2d5016'}}>
                      <div className="card-body py-2">
                        <h4 className="text-success mb-1">{myHikes.confirmed.length + myHikes.interested.length}</h4>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card text-center" style={{borderTop: '3px solid #4d7c3d'}}>
                      <div className="card-body py-2">
                        <h4 className="text-success mb-1">{[...myHikes.confirmed, ...myHikes.interested].filter(h => h.type === 'multi').length}</h4>
                        <small className="text-muted">Multi-Day</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card text-center" style={{borderTop: '3px solid #6d9c5d'}}>
                      <div className="card-body py-2">
                        <h4 className="text-success mb-1">{myHikes.confirmed.length}</h4>
                        <small className="text-muted">Confirmed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card text-center" style={{borderTop: '3px solid #8dbc7d'}}>
                      <div className="card-body py-2">
                        <h4 className="text-info mb-1">{myHikes.interested.length}</h4>
                        <small className="text-muted">Interested</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="card mb-4" style={{borderLeft: '4px solid #dc3545'}}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="card-title mb-1">
                          <AlertCircle size={20} className="me-2 text-danger" />
                          Emergency Contact Information
                        </h5>
                        <p className="text-muted small mb-0">
                          {emergencyContact.emergency_contact_name
                            ? `${emergencyContact.emergency_contact_name} - ${emergencyContact.emergency_contact_phone}`
                            : 'Not set - Please add emergency contact details'}
                        </p>
                      </div>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setShowEmergencyContactForm(!showEmergencyContactForm)}
                      >
                        {showEmergencyContactForm ? 'Cancel' : (emergencyContact.emergency_contact_name ? 'Update' : 'Add')}
                      </button>
                    </div>

                    {/* Inline Emergency Contact Form */}
                    {showEmergencyContactForm && (
                      <div className="border-top pt-3">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                          <label className="form-label">Emergency Contact Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={emergencyContact.emergency_contact_name || ''}
                            onChange={(e) => setEmergencyContact({...emergencyContact, emergency_contact_name: e.target.value})}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Emergency Contact Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={emergencyContact.emergency_contact_phone || ''}
                            onChange={(e) => setEmergencyContact({...emergencyContact, emergency_contact_phone: e.target.value})}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Medical Information (Optional)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Allergies, medical conditions, medications, etc."
                            value={emergencyContact.medical_info || ''}
                            onChange={(e) => setEmergencyContact({...emergencyContact, medical_info: e.target.value})}
                          />
                        </div>
                        <button
                          className="btn btn-danger w-100"
                          onClick={async () => {
                            setLoading(true);
                            setError('');
                            try {
                              const response = await fetch(API_URL + '/api/profile/emergency-contact', {
                                method: 'PUT',
                                headers: {
                                  'Authorization': 'Bearer ' + token,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  emergency_contact_name: emergencyContact.emergency_contact_name,
                                  emergency_contact_phone: emergencyContact.emergency_contact_phone,
                                  medical_info: emergencyContact.medical_info
                                })
                              });
                              if (!response.ok) throw new Error('Failed to update emergency contact');
                              await fetchEmergencyContact();
                              setShowEmergencyContactForm(false);
                            } catch (err) {
                              setError(err.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading || !emergencyContact.emergency_contact_name || !emergencyContact.emergency_contact_phone}
                        >
                          {loading ? 'Saving...' : 'Save Emergency Contact'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirmed Hikes */}
                {(() => {
                  const now = new Date();
                  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

                  const confirmedSoon = myHikes.confirmed.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate >= now && hikeDate <= twoMonthsFromNow;
                  });

                  const confirmedFuture = myHikes.confirmed.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate > twoMonthsFromNow;
                  });

                  const confirmedPast = myHikes.confirmed.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate < now;
                  });

                  const renderConfirmedHike = (hike, isPast = false) => {
                    const displayStatus = isPast ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled') : hike.status;

                    return (
                      <div key={hike.id} className="col-md-6">
                        <div className="card h-100" style={{borderLeft: '4px solid #28a745', overflow: 'hidden'}}>
                          {!isPast && (
                            <div style={{
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              color: 'white',
                              padding: '8px 16px',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              letterSpacing: '1px',
                              textAlign: 'center',
                              boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                              position: 'relative'
                            }}>
                              <CheckCircle size={16} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                              BOOKED!
                              <span style={{fontSize: '1.2rem', marginLeft: '8px'}}>🎉</span>
                            </div>
                          )}
                          <div className="card-body">
                            <h5 className="card-title">{hike.name}</h5>
                            <p className="card-text">
                              <Calendar size={16} className="me-2" />
                              {new Date(hike.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className={'badge ' + (
                                displayStatus === 'completed' ? 'bg-success' :
                                displayStatus === 'cancelled' ? 'bg-secondary' :
                                hike.payment_status === 'paid' ? 'bg-success' :
                                hike.payment_status === 'partial' ? 'bg-warning' : 'bg-danger'
                              )}>
                                {isPast ? displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1) :
                                 hike.payment_status === 'paid' ? 'Paid' :
                                 hike.payment_status === 'partial' ? 'Partial Payment' : 'Payment Pending'}
                              </span>
                              {hike.cost > 0 && !isPast && (
                                <span className="text-muted">
                                  R{parseFloat(hike.amount_paid || 0).toFixed(2)} / R{parseFloat(hike.cost).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <button
                              className="btn btn-sm btn-outline-success w-100"
                              style={{minHeight: '40px'}}
                              onClick={() => {
                                setActiveTab('hikes');
                                setTimeout(() => openHikerHikeDetails(hike), 100);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {confirmedSoon.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3">
                            <CheckCircle size={20} className="me-2 text-success" />
                            Confirmed - Next 2 Months
                          </h4>
                          <div className="row g-3">
                            {confirmedSoon.map(hike => renderConfirmedHike(hike, false))}
                          </div>
                        </div>
                      )}

                      {confirmedFuture.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3">
                            <CheckCircle size={20} className="me-2 text-success" />
                            Confirmed - Future
                          </h4>
                          <div className="row g-3">
                            {confirmedFuture.map(hike => renderConfirmedHike(hike, false))}
                          </div>
                        </div>
                      )}

                      {confirmedPast.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3 text-muted">
                            <CheckCircle size={20} className="me-2" />
                            Confirmed - Past
                          </h4>
                          <div className="row g-3">
                            {confirmedPast.map(hike => renderConfirmedHike(hike, true))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Interested Hikes */}
                {(() => {
                  const now = new Date();
                  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

                  const interestedSoon = myHikes.interested.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate >= now && hikeDate <= twoMonthsFromNow;
                  });

                  const interestedFuture = myHikes.interested.filter(h => {
                    const hikeDate = new Date(h.date);
                    return hikeDate > twoMonthsFromNow;
                  });

                  // Don't show past interested hikes - they're not relevant anymore

                  const renderInterestedHike = (hike) => (
                    <div key={hike.id} className="col-md-6">
                      <div className="card h-100" style={{borderLeft: '4px solid #17a2b8'}}>
                        <div className="card-body">
                          <h5 className="card-title">{hike.name}</h5>
                          <p className="card-text">
                            <Calendar size={16} className="me-2" />
                            {new Date(hike.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <button
                            className="btn btn-sm btn-outline-info w-100"
                            style={{minHeight: '40px'}}
                            onClick={() => {
                              setActiveTab('hikes');
                              setTimeout(() => openHikerHikeDetails(hike), 100);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {interestedSoon.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3">
                            <Heart size={20} className="me-2 text-info" />
                            Interested - Next 2 Months
                          </h4>
                          <div className="row g-3">
                            {interestedSoon.map(renderInterestedHike)}
                          </div>
                        </div>
                      )}

                      {interestedFuture.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3">
                            <Heart size={20} className="me-2 text-info" />
                            Interested - Future
                          </h4>
                          <div className="row g-3">
                            {interestedFuture.map(renderInterestedHike)}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {myHikes.confirmed.length === 0 && myHikes.interested.length === 0 && (
                  <div className="text-center py-5">
                    <MapPin size={48} className="text-muted mb-3" />
                    <p className="text-muted">No hikes yet. Browse available hikes and express your interest!</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'manage' && currentUser.role === 'admin' && (
          <div>
            <h2 className="mb-4">Manage Hikes</h2>
            
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Add New Hike</h5>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddHikeForm(!showAddHikeForm)}
                  >
                    {showAddHikeForm ? 'Hide Form' : 'Show Form'}
                  </button>
                </div>
                {showAddHikeForm && (
                <>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Hike name"
                      value={newHike.name}
                      onChange={(e) => setNewHike({...newHike, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="date"
                      className="form-control"
                      value={newHike.date}
                      onChange={(e) => setNewHike({...newHike, date: e.target.value})}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={newHike.difficulty}
                      onChange={(e) => setNewHike({...newHike, difficulty: e.target.value})}
                    >
                      <option>Easy</option>
                      <option>Moderate</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Distance (e.g., 5km)"
                      value={newHike.distance}
                      onChange={(e) => setNewHike({...newHike, distance: e.target.value})}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={newHike.type}
                      onChange={(e) => setNewHike({...newHike, type: e.target.value})}
                    >
                      <option value="day">Day Hike</option>
                      <option value="multi">Multi-Day</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Cost (R)"
                      value={newHike.cost}
                      onChange={(e) => setNewHike({...newHike, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={newHike.group}
                      onChange={(e) => setNewHike({...newHike, group: e.target.value})}
                    >
                      <option value="family">Family Hike</option>
                      <option value="mens">Men's Hike</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <select
                      className="form-select"
                      value={newHike.status}
                      onChange={(e) => setNewHike({...newHike, status: e.target.value})}
                    >
                      <option value="gathering_interest">Gathering Interest</option>
                      <option value="pre_planning">Pre-Planning</option>
                      <option value="final_planning">Final Planning</option>
                      <option value="trip_booked">Trip Booked</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      placeholder="Description"
                      rows="3"
                      value={newHike.description}
                      onChange={(e) => setNewHike({...newHike, description: e.target.value})}
                    />
                  </div>

                  {/* Image and Destination URL (All Hikes) */}
                  <div className="col-md-6">
                    <label className="form-label">Hike Image URL (optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/hike-image.jpg"
                      value={newHike.image_url}
                      onChange={(e) => setNewHike({...newHike, image_url: e.target.value})}
                    />
                    <small className="text-muted">Link to an image of the trail or destination</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Destination Website URL (optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/trail-info"
                      value={newHike.destination_url}
                      onChange={(e) => setNewHike({...newHike, destination_url: e.target.value})}
                    />
                    <small className="text-muted">Link to trail/park website</small>
                  </div>

                  {/* Multi-Day Specific Fields */}
                  {newHike.type === 'multi' && (
                    <>
                      <div className="col-12">
                        <hr className="my-3" />
                        <h6 className="text-info">📅 Multi-Day Specific Details</h6>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Daily Distances</label>
                        <textarea
                          className="form-control"
                          placeholder="Day 1: 10km to base camp, Day 2: 12km to summit, Day 3: 8km return"
                          rows="2"
                          value={Array.isArray(newHike.daily_distances) ? newHike.daily_distances.join(', ') : ''}
                          onChange={(e) => setNewHike({...newHike, daily_distances: e.target.value.split(',').map(d => d.trim())})}
                        />
                        <small className="text-muted">Separate each day with a comma</small>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Overnight Facilities</label>
                        <textarea
                          className="form-control"
                          placeholder="Campsite with basic amenities, huts with bunk beds, etc."
                          rows="3"
                          value={newHike.overnight_facilities}
                          onChange={(e) => setNewHike({...newHike, overnight_facilities: e.target.value})}
                        />
                        <small className="text-muted">Describe accommodation, camping facilities, amenities, etc.</small>
                      </div>
                    </>
                  )}
                </div>
                  <button className="btn btn-success mt-3 w-100 w-md-auto" style={{minHeight: '44px'}} onClick={addHike} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Hike'}
                  </button>
                </>
                )}
              </div>
            </div>

            {(() => {
              const now = new Date();
              const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

              const upcomingSoon = hikes.filter(h => {
                const hikeDate = new Date(h.date);
                return hikeDate >= now && hikeDate <= twoMonthsFromNow;
              });

              const future = hikes.filter(h => {
                const hikeDate = new Date(h.date);
                return hikeDate > twoMonthsFromNow;
              });

              const past = hikes.filter(h => {
                const hikeDate = new Date(h.date);
                return hikeDate < now;
              });

              const renderManageHike = (hike, isPast = false) => {
                const displayStatus = isPast ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled') : hike.status;

                return (
                  <div key={hike.id} className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1 me-3" style={{minWidth: 0}}>
                            <h5>{hike.name}</h5>
                            <p className="text-muted mb-2" style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.5em',
                              maxHeight: '3em'
                            }}>{hike.description}</p>
                            <div className="small text-muted">
                              <span className="me-3">{new Date(hike.date).toLocaleDateString()}</span>
                              <span className="me-3">{hike.distance}</span>
                              <span className="badge bg-warning text-dark me-2">{hike.difficulty}</span>
                              <span className="badge bg-info me-2">{hike.type === 'day' ? 'Day' : 'Multi-Day'}</span>
                              <span className="badge bg-secondary me-2">{hike.group_type === 'family' ? 'Family' : "Men's"}</span>
                              <span className={'badge me-2 ' +
                                (displayStatus === 'completed' ? 'bg-success' :
                                 displayStatus === 'cancelled' ? 'bg-secondary' :
                                 displayStatus === 'trip_booked' ? 'bg-success' :
                                 displayStatus === 'final_planning' ? 'bg-primary' :
                                 displayStatus === 'pre_planning' ? 'bg-warning' : 'bg-secondary')}>
                                {(displayStatus || 'gathering_interest').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className="badge bg-dark">
                                {hike.interested_users ? hike.interested_users.length : 0} interested
                              </span>
                            </div>
                          </div>
                          <div className="d-flex flex-column flex-sm-row gap-2" style={{flexShrink: 0}}>
                            <button className="btn btn-sm btn-success" style={{minHeight: '36px', minWidth: '90px'}} onClick={() => openHikeDetails(hike)} disabled={loading}>
                              View Details
                            </button>
                            <button className="btn btn-sm btn-info" style={{minHeight: '36px', minWidth: '60px'}} onClick={() => openEditHike(hike)} disabled={loading}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger" style={{minHeight: '36px', minWidth: '70px'}} onClick={() => deleteHike(hike.id)} disabled={loading}>
                              {loading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {upcomingSoon.length > 0 && (
                    <div className="mb-5">
                      <h4 className="mb-3 text-primary">
                        <Clock size={20} className="me-2" />
                        Next 2 Months
                      </h4>
                      <div className="row g-4">
                        {upcomingSoon.map(hike => renderManageHike(hike, false))}
                      </div>
                    </div>
                  )}

                  {future.length > 0 && (
                    <div className="mb-5">
                      <h4 className="mb-3 text-info">
                        <Calendar size={20} className="me-2" />
                        Future Hikes
                      </h4>
                      <div className="row g-4">
                        {future.map(hike => renderManageHike(hike, false))}
                      </div>
                    </div>
                  )}

                  {past.length > 0 && (
                    <div className="mb-5">
                      <h4 className="mb-3 text-muted">
                        <CheckCircle size={20} className="me-2" />
                        Past Hikes
                      </h4>
                      <div className="row g-4">
                        {past.map(hike => renderManageHike(hike, true))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Hike Details Modal */}
            {showHikeDetails && selectedHike && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog modal-xl mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>{selectedHike.name} - Attendee Management</h5>
                      <button type="button" className="btn-close" onClick={() => setShowHikeDetails(false)}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      {/* Hike Details Section */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-8">
                              <p className="mb-2"><strong>Description:</strong> {selectedHike.description}</p>
                              <p className="mb-2"><strong>Date:</strong> {new Date(selectedHike.date).toLocaleDateString()}</p>
                              <p className="mb-2"><strong>Distance:</strong> {selectedHike.distance} | <strong>Difficulty:</strong> {selectedHike.difficulty}</p>
                              {selectedHike.cost > 0 && <p className="mb-0"><strong>Cost:</strong> R{selectedHike.cost}</p>}
                            </div>
                            <div className="col-md-4">
                              {selectedHike.image_url && (
                                <img src={selectedHike.image_url} alt={selectedHike.name} className="img-fluid rounded shadow-sm" style={{maxHeight: '150px', width: '100%', objectFit: 'cover'}} />
                              )}
                              {selectedHike.destination_url && (
                                <a href={selectedHike.destination_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info mt-2 w-100">
                                  <MapPin size={14} className="me-1" />
                                  Visit Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        {/* Interested Users */}
                        <div className="col-md-6">
                          <h6>Interested Users ({interestedUsers.length})</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Contact</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {interestedUsers.map(user => (
                                  <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td className="small">{user.email}<br/>{user.phone}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => {
                                          setNewAttendee({...newAttendee, user_id: user.id});
                                          addAttendee();
                                        }}
                                      >
                                        Add to Attendees
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {interestedUsers.length === 0 && (
                                  <tr>
                                    <td colSpan="3" className="text-center text-muted">No interested users yet</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Confirmed Attendees */}
                        <div className="col-md-6">
                          <h6>Confirmed Attendees ({attendees.length})</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Payment</th>
                                  <th>Amount</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {attendees.map(attendee => (
                                  <tr key={attendee.user_id}>
                                    <td>{attendee.name}</td>
                                    <td>
                                      <select
                                        className="form-select form-select-sm"
                                        value={attendee.payment_status}
                                        onChange={(e) => updateAttendee(attendee.user_id, {...attendee, payment_status: e.target.value})}
                                      >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        className="form-control form-control-sm"
                                        style={{width: '80px'}}
                                        value={attendee.amount_paid}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Allow empty, numbers, and decimal point
                                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            updateAttendee(attendee.user_id, {...attendee, amount_paid: value === '' ? 0 : parseFloat(value) || 0});
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => removeAttendee(attendee.user_id)}
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {attendees.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="text-center text-muted">No confirmed attendees yet</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Add Attendee Manually */}
                      <div className="mt-3">
                        <h6>Add Attendee Manually</h6>
                        <div className="row g-2">
                          <div className="col-md-4">
                            <select
                              className="form-select form-select-sm"
                              value={newAttendee.user_id}
                              onChange={(e) => setNewAttendee({...newAttendee, user_id: e.target.value})}
                            >
                              <option value="">Select User...</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-3">
                            <select
                              className="form-select form-select-sm"
                              value={newAttendee.payment_status}
                              onChange={(e) => setNewAttendee({...newAttendee, payment_status: e.target.value})}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              className="form-control form-control-sm"
                              placeholder="Amount"
                              value={newAttendee.amount_paid}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty, numbers, and decimal point
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  setNewAttendee({...newAttendee, amount_paid: value === '' ? 0 : parseFloat(value) || 0});
                                }
                              }}
                            />
                          </div>
                          <div className="col-md-2">
                            <button className="btn btn-sm btn-primary w-100" onClick={addAttendee}>
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-danger me-auto"
                        onClick={() => fetchHikeEmergencyContacts(selectedHike.id)}
                        disabled={loading || attendees.length === 0}
                      >
                        <AlertCircle size={16} className="me-1" />
                        {loading ? 'Loading...' : 'View Emergency Contacts'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => fetchDefaultPackingList(selectedHike.id)}
                        disabled={loading}
                      >
                        <Package size={16} className="me-1" />
                        Edit Packing List
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowHikeDetails(false)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Hike Modal */}
            {showEditHike && selectedHike && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog modal-lg mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Edit Hike</h5>
                      <button type="button" className="btn-close" onClick={() => { setShowEditHike(false); setError(''); }}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      {error && <div className="alert alert-danger">{error}</div>}
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Hike Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editHikeData.name}
                            onChange={(e) => setEditHikeData({...editHikeData, name: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editHikeData.date}
                            onChange={(e) => setEditHikeData({...editHikeData, date: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Difficulty</label>
                          <select
                            className="form-select"
                            value={editHikeData.difficulty}
                            onChange={(e) => setEditHikeData({...editHikeData, difficulty: e.target.value})}
                          >
                            <option>Easy</option>
                            <option>Moderate</option>
                            <option>Hard</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Distance</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., 5km"
                            value={editHikeData.distance}
                            onChange={(e) => setEditHikeData({...editHikeData, distance: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            value={editHikeData.type}
                            onChange={(e) => setEditHikeData({...editHikeData, type: e.target.value})}
                          >
                            <option value="day">Day Hike</option>
                            <option value="multi">Multi-Day</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Cost (R)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editHikeData.cost}
                            onChange={(e) => setEditHikeData({...editHikeData, cost: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Group Type</label>
                          <select
                            className="form-select"
                            value={editHikeData.group}
                            onChange={(e) => setEditHikeData({...editHikeData, group: e.target.value})}
                          >
                            <option value="family">Family Hike</option>
                            <option value="mens">Men's Hike</option>
                          </select>
                        </div>
                        <div className="col-md-9">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={editHikeData.status}
                            onChange={(e) => setEditHikeData({...editHikeData, status: e.target.value})}
                          >
                            <option value="gathering_interest">Gathering Interest</option>
                            <option value="pre_planning">Pre-Planning</option>
                            <option value="final_planning">Final Planning</option>
                            <option value="trip_booked">Trip Booked</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editHikeData.description}
                            onChange={(e) => setEditHikeData({...editHikeData, description: e.target.value})}
                          />
                        </div>

                        {/* Image and Destination URL (All Hikes) */}
                        <div className="col-md-6">
                          <label className="form-label">Hike Image URL (optional)</label>
                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://example.com/hike-image.jpg"
                            value={editHikeData.image_url || ''}
                            onChange={(e) => setEditHikeData({...editHikeData, image_url: e.target.value})}
                          />
                          <small className="text-muted">Link to an image of the trail or destination</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Destination Website URL (optional)</label>
                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://example.com/trail-info"
                            value={editHikeData.destination_url || ''}
                            onChange={(e) => setEditHikeData({...editHikeData, destination_url: e.target.value})}
                          />
                          <small className="text-muted">Link to trail/park website</small>
                        </div>

                        {/* Multi-Day Specific Fields */}
                        {editHikeData.type === 'multi' && (
                          <>
                            <div className="col-12">
                              <hr className="my-3" />
                              <h6 className="text-info">📅 Multi-Day Specific Details</h6>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Daily Distances</label>
                              <textarea
                                className="form-control"
                                rows="2"
                                placeholder="Day 1: 10km to base camp, Day 2: 12km to summit, Day 3: 8km return"
                                value={Array.isArray(editHikeData.daily_distances) ? editHikeData.daily_distances.join(', ') : ''}
                                onChange={(e) => setEditHikeData({...editHikeData, daily_distances: e.target.value.split(',').map(d => d.trim())})}
                              />
                              <small className="text-muted">Separate each day with a comma</small>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Overnight Facilities</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Campsite with basic amenities, huts with bunk beds, etc."
                                value={editHikeData.overnight_facilities || ''}
                                onChange={(e) => setEditHikeData({...editHikeData, overnight_facilities: e.target.value})}
                              />
                              <small className="text-muted">Describe accommodation, camping facilities, amenities, etc.</small>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowEditHike(false); setError(''); }} disabled={loading}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={editHike} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contacts Modal (Admin) */}
            {showEmergencyContactsModal && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog modal-lg mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header" style={{background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)'}}>
                      <h5 className="modal-title text-white" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
                        <AlertCircle size={20} className="me-2" />
                        Emergency Contacts - {selectedHike?.name}
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowEmergencyContactsModal(false)}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      <div className="alert alert-warning">
                        <strong>Confidential Information:</strong> This information is for emergency use only.
                      </div>

                      {emergencyContactsList.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <AlertCircle size={48} className="mb-3" />
                          <p>No attendees have provided emergency contact information yet.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Attendee</th>
                                <th>Contact</th>
                                <th>Emergency Contact</th>
                                <th>Emergency Phone</th>
                                <th>Medical Info</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emergencyContactsList.map(person => (
                                <tr key={person.user_id}>
                                  <td>
                                    <strong>{person.name}</strong>
                                  </td>
                                  <td>
                                    <div className="small">
                                      <div>{person.email}</div>
                                      <div className="text-muted">{person.phone}</div>
                                    </div>
                                  </td>
                                  <td>
                                    {person.emergency_contact_name || <span className="text-muted">Not provided</span>}
                                  </td>
                                  <td>
                                    {person.emergency_contact_phone || <span className="text-muted">Not provided</span>}
                                  </td>
                                  <td>
                                    {person.medical_info ? (
                                      <small>{person.medical_info}</small>
                                    ) : (
                                      <span className="text-muted">None</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowEmergencyContactsModal(false)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default Packing List Modal (Admin) */}
            {showDefaultPackingListModal && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog modal-lg mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header" style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)'}}>
                      <h5 className="modal-title text-white" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
                        <Package size={20} className="me-2" />
                        Edit Default Packing List - {selectedHike?.name}
                      </h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowDefaultPackingListModal(false)}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      <div className="alert alert-info">
                        <strong>Note:</strong> This default list will be shown to all participants when they first view their packing list for this hike.
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Add Item</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter item name"
                            value={newPackingItem}
                            onChange={(e) => setNewPackingItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addDefaultPackingItem()}
                          />
                          <button className="btn btn-primary" onClick={addDefaultPackingItem}>
                            <Plus size={16} className="me-1" />
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="border rounded p-3" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {defaultPackingListItems.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            <Package size={48} className="mb-3" />
                            <p>No items yet. Add items above to create the default packing list.</p>
                          </div>
                        ) : (
                          <ul className="list-group">
                            {defaultPackingListItems.map((item, index) => (
                              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{item.name}</span>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeDefaultPackingItem(index)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowDefaultPackingListModal(false)}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={saveDefaultPackingList} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Default List'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2">
              <h2 className="mb-0" style={{fontSize: 'clamp(1.2rem, 4vw, 1.75rem)'}}>User Management</h2>
              <div className="d-flex gap-2">
                <button className="btn btn-secondary" onClick={() => { fetchUsers(); fetchPendingUsers(); }} disabled={loading} style={{minHeight: '38px'}}>
                  <span className="d-none d-sm-inline">🔄 Refresh</span>
                  <span className="d-inline d-sm-none">🔄</span>
                </button>
                <button className="btn btn-primary" onClick={() => { setShowAddUser(true); setError(''); }} style={{minHeight: '38px'}}>
                  <span className="d-none d-sm-inline">+ Add User</span>
                  <span className="d-inline d-sm-none">+</span>
                </button>
              </div>
            </div>

            {pendingUsers.length > 0 && (
              <div className="card border-warning mb-4">
                <div className="card-header bg-warning bg-opacity-10">
                  <h5 className="mb-0" style={{fontSize: 'clamp(1rem, 3vw, 1.25rem)'}}>
                    Pending Registrations ({pendingUsers.length})
                  </h5>
                </div>
                <div className="card-body p-2 p-md-3">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 p-2 p-md-3 bg-light rounded gap-2">
                      <div className="flex-grow-1" style={{minWidth: 0}}>
                        <strong className="d-block text-truncate">{user.name}</strong>
                        <small className="text-muted d-block" style={{fontSize: 'clamp(0.7rem, 2vw, 0.875rem)'}}>{user.email}</small>
                        <small className="text-muted d-block" style={{fontSize: 'clamp(0.7rem, 2vw, 0.875rem)'}}>{user.phone}</small>
                      </div>
                      <div className="d-flex gap-2 w-100 w-sm-auto">
                        <button className="btn btn-sm btn-success flex-grow-1 flex-sm-grow-0" style={{minHeight: '36px', minWidth: '80px'}} onClick={() => approveUser(user.id)} disabled={loading}>
                          {loading ? 'Approving...' : 'Approve'}
                        </button>
                        <button className="btn btn-sm btn-danger flex-grow-1 flex-sm-grow-0" style={{minHeight: '36px', minWidth: '70px'}} onClick={() => rejectUser(user.id)} disabled={loading}>
                          {loading ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0" style={{fontSize: 'clamp(1rem, 3vw, 1.25rem)'}}>Approved Users</h5>
              </div>
              <div className="card-body p-2 p-md-3">
                {/* Filters */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, or phone..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setUserCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserCurrentPage(1);
                      }}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="hiker">Hiker</option>
                    </select>
                  </div>
                </div>
                {(() => {
                  // Filter users
                  const filteredUsers = users.filter(user => {
                    const matchesSearch = !userSearchTerm ||
                      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.phone.includes(userSearchTerm);
                    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
                    return matchesSearch && matchesRole;
                  });

                  // Paginate
                  const indexOfLastUser = userCurrentPage * usersPerPage;
                  const indexOfFirstUser = indexOfLastUser - usersPerPage;
                  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
                  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

                  return (
                    <>
                      {/* Desktop view - table */}
                      <div className="d-none d-lg-block">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>
                              <span className={'badge ' + (user.role === 'admin' ? 'bg-primary' : 'bg-secondary')}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-info me-2" onClick={() => openEditUser(user)} disabled={loading}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-warning me-2" onClick={() => openResetPassword(user)} disabled={loading}>
                                Reset Password
                              </button>
                              {user.role === 'hiker' && (
                                <button className="btn btn-sm btn-primary me-2" onClick={() => promoteToAdmin(user.id)} disabled={loading}>
                                  {loading ? 'Promoting...' : 'Promote to Admin'}
                                </button>
                              )}
                              {user.id !== currentUser.id && (
                                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(user.id)} disabled={loading}>
                                  {loading ? 'Deleting...' : 'Delete'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                      {/* Mobile view - cards */}
                      <div className="d-lg-none">
                        {currentUsers.map(user => (
                    <div key={user.id} className="card mb-3 shadow-sm">
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div style={{minWidth: 0, flex: 1}}>
                            <h6 className="mb-1 text-truncate">{user.name}</h6>
                            <small className="text-muted d-block text-truncate" style={{fontSize: '0.75rem'}}>{user.email}</small>
                            <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>{user.phone}</small>
                          </div>
                          <span className={'badge ' + (user.role === 'admin' ? 'bg-primary' : 'bg-secondary')}>
                            {user.role}
                          </span>
                        </div>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          <button className="btn btn-sm btn-info" style={{fontSize: '0.75rem', flex: '1 1 45%'}} onClick={() => openEditUser(user)} disabled={loading}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-warning" style={{fontSize: '0.75rem', flex: '1 1 45%'}} onClick={() => openResetPassword(user)} disabled={loading}>
                            Reset PW
                          </button>
                          {user.role === 'hiker' && (
                            <button className="btn btn-sm btn-primary" style={{fontSize: '0.75rem', flex: '1 1 100%'}} onClick={() => promoteToAdmin(user.id)} disabled={loading}>
                              {loading ? 'Promoting...' : 'Promote to Admin'}
                            </button>
                          )}
                          {user.id !== currentUser.id && (
                            <button className="btn btn-sm btn-danger" style={{fontSize: '0.75rem', flex: '1 1 100%'}} onClick={() => deleteUser(user.id)} disabled={loading}>
                              {loading ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="text-muted small">
                            Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                          </div>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={userCurrentPage === 1}
                            >
                              Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                              <button
                                key={i + 1}
                                className={`btn btn-sm ${userCurrentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setUserCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={userCurrentPage === totalPages}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Add New User</h5>
                      <button type="button" className="btn-close" onClick={() => { setShowAddUser(false); setError(''); }}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      {error && <div className="alert alert-danger">{error}</div>}
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option value="hiker">Hiker</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowAddUser(false); setError(''); }} disabled={loading}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={addUser} disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {showEditUser && selectedUser && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Edit User</h5>
                      <button type="button" className="btn-close" onClick={() => { setShowEditUser(false); setError(''); }}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      {error && <div className="alert alert-danger">{error}</div>}
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editUserData.name}
                          onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={editUserData.email}
                          onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={editUserData.phone}
                          onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          value={editUserData.role}
                          onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                        >
                          <option value="hiker">Hiker</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="notifyEmail"
                            checked={editUserData.notifications_email}
                            onChange={(e) => setEditUserData({...editUserData, notifications_email: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="notifyEmail">
                            Email Notifications
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="notifyWhatsApp"
                            checked={editUserData.notifications_whatsapp}
                            onChange={(e) => setEditUserData({...editUserData, notifications_whatsapp: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="notifyWhatsApp">
                            WhatsApp Notifications
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowEditUser(false); setError(''); }} disabled={loading}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={editUser} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Password Modal */}
            {showResetUserPassword && selectedUser && (
              <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
                <div className="modal-dialog mx-2 mx-md-auto my-2 my-md-3">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>Reset Password for {selectedUser.name}</h5>
                      <button type="button" className="btn-close" onClick={() => { setShowResetUserPassword(false); setError(''); }}></button>
                    </div>
                    <div className="modal-body px-2 px-md-3 py-3">
                      {error && <div className="alert alert-danger">{error}</div>}
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={resetPasswordData.newPassword}
                          onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={resetPasswordData.confirmPassword}
                          onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                        />
                      </div>
                      <div className="alert alert-info">
                        <small>The new password will be sent to the user via email.</small>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => { setShowResetUserPassword(false); setError(''); }} disabled={loading}>Cancel</button>
                      <button type="button" className="btn btn-warning" onClick={resetUserPassword} disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && currentUser.role === 'admin' && (
          <div>
            <h2 className="mb-4">Notifications</h2>

            {/* Test Notification */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Test Notification</h5>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={testNotification.type}
                      onChange={(e) => setTestNotification({...testNotification, type: e.target.value, subject: '', message: ''})}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div className="col-md-9">
                    <label className="form-label">Recipient</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={testNotification.type === 'email' ? 'email@example.com' : '+27123456789'}
                      value={testNotification.recipient}
                      onChange={(e) => setTestNotification({...testNotification, recipient: e.target.value})}
                    />
                  </div>
                  {testNotification.type === 'email' && (
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        value={testNotification.subject}
                        onChange={(e) => setTestNotification({...testNotification, subject: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={testNotification.message}
                      onChange={(e) => setTestNotification({...testNotification, message: e.target.value})}
                    />
                  </div>
                </div>
                <button className="btn btn-primary mt-3" onClick={sendTestNotification} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Test Notification'}
                </button>
              </div>
            </div>

            {/* Notification Log */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Notification Log (Last 100)</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Recipient</th>
                        <th>Subject/Message</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No notifications sent yet</td>
                        </tr>
                      ) : (
                        notifications.map(notif => (
                          <tr key={notif.id}>
                            <td className="small">{new Date(notif.sent_at).toLocaleString()}</td>
                            <td>
                              <span className={'badge ' + (notif.type === 'email' ? 'bg-info' : 'bg-success')}>
                                {notif.type}
                              </span>
                            </td>
                            <td className="small">{notif.recipient}</td>
                            <td className="small" style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {notif.subject || notif.message}
                            </td>
                            <td>
                              <span className={'badge ' +
                                (notif.status === 'sent' ? 'bg-success' :
                                 notif.status === 'failed' ? 'bg-danger' : 'bg-warning')}>
                                {notif.status}
                              </span>
                              {notif.error && (
                                <small className="text-danger d-block" title={notif.error}>
                                  {notif.error.substring(0, 50)}...
                                </small>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Footer - Show phrases on mobile only */}
        <div className="d-md-none mt-4 pt-3 border-top">
          <div className="text-center">
            <p className="mb-2" style={{fontStyle: 'italic', color: '#1a1a1a', fontSize: '0.85rem'}}>
              <strong>"Dit bou karakter"</strong> - Jan
            </p>
            <small className="text-muted" style={{fontSize: '0.75rem'}}>Remember: Dit is maklikker as wat dit lyk</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;