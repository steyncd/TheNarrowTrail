// pages/HikeDetailsPage.js - Shareable Event Details Page (OPTIMIZED)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Info, Mountain, Tent, Truck, Bike, Compass, Clock, LogIn, ArrowLeft, MessageSquare, Package, Car, Send, Trash2, Edit, Share2, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WeatherWidget from '../components/weather/WeatherWidget';
import Map from '../components/common/Map';
import PaymentsSection from '../components/payments/PaymentsSection';
import HikingDetailsDisplay from '../components/events/eventTypes/HikingDetailsDisplay';
import CampingDetailsDisplay from '../components/events/eventTypes/CampingDetailsDisplay';
import FourWheelDriveDetailsDisplay from '../components/events/eventTypes/FourWheelDriveDetailsDisplay';
import CyclingDetailsDisplay from '../components/events/eventTypes/CyclingDetailsDisplay';
import OutdoorDetailsDisplay from '../components/events/eventTypes/OutdoorDetailsDisplay';

const HikeDetailsPage = () => {
  const { hikeId } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [hike, setHike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [packingList, setPackingList] = useState({ items: [] });
  const [carpoolOffers, setCarpoolOffers] = useState([]);
  const [carpoolRequests, setCarpoolRequests] = useState([]);
  const [showOfferRideModal, setShowOfferRideModal] = useState(false);
  const [showRequestRideModal, setShowRequestRideModal] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    departure_location: '',
    available_seats: 1,
    departure_time: '',
    notes: ''
  });
  const [requestFormData, setRequestFormData] = useState({
    pickup_location: '',
    notes: ''
  });
  const [submittingCarpool, setSubmittingCarpool] = useState(false);

  useEffect(() => {
    fetchHikeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hikeId]);

  const fetchHikeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hike details (public endpoint)
      const hikeData = await api.getHikeById(hikeId, token);
      setHike(hikeData);

      // If user is logged in, fetch all data in PARALLEL for better performance
      if (token) {
        // Run all API calls in parallel using Promise.allSettled to avoid blocking
        const [
          statusResult,
          usersResult,
          commentsResult,
          packingResult,
          carpoolOffersResult,
          carpoolRequestsResult
        ] = await Promise.allSettled([
          api.getHikeStatus(hikeId, token),
          api.getInterestedUsers(hikeId, token),
          api.getComments(hikeId, token),
          api.getPackingList(hikeId, token),
          api.getCarpoolOffers(hikeId, token),
          api.getCarpoolRequests(hikeId, token)
        ]);

        // Process results - only update state if successful
        if (statusResult.status === 'fulfilled') {
          setUserStatus(statusResult.value);
        }

        if (usersResult.status === 'fulfilled') {
          setInterestedUsers(usersResult.value);
        }

        if (commentsResult.status === 'fulfilled') {
          setComments(commentsResult.value);
        }

        if (packingResult.status === 'fulfilled') {
          const packingData = packingResult.value;
          // Handle different response formats
          if (packingData.items && typeof packingData.items === 'object' && !Array.isArray(packingData.items)) {
            if (packingData.items.items && Array.isArray(packingData.items.items)) {
              setPackingList({ items: packingData.items.items });
            } else {
              setPackingList({ items: [] });
            }
          } else {
            setPackingList(packingData);
          }
        }

        if (carpoolOffersResult.status === 'fulfilled') {
          setCarpoolOffers(carpoolOffersResult.value);
        }

        if (carpoolRequestsResult.status === 'fulfilled') {
          setCarpoolRequests(carpoolRequestsResult.value);
        }
      }
    } catch (err) {
      console.error('Error fetching hike details:', err);
      setError('Failed to load hike details');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.toggleInterest(hike.id, token);
      await fetchHikeDetails();
    } catch (err) {
      console.error('Error toggling interest:', err);
      alert(err.response?.data?.error || 'Failed to toggle interest');
    }
  };

  const handleConfirmAttendance = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.confirmAttendance(hike.id, token);
      await fetchHikeDetails();
    } catch (err) {
      console.error('Error confirming attendance:', err);
      const errorMessage = err.response?.data?.error || 'Failed to confirm attendance';
      alert(errorMessage);
    }
  };

  const handleCancelAttendance = async () => {
    if (!token || !window.confirm('Are you sure you want to cancel your attendance?')) {
      return;
    }

    try {
      await api.cancelAttendance(hike.id, token);
      await fetchHikeDetails();
    } catch (err) {
      console.error('Error cancelling attendance:', err);
      const errorMessage = err.response?.data?.error || 'Failed to cancel attendance';
      alert(errorMessage);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.addComment(hikeId, newComment, token);
      setNewComment('');
      const commentsData = await api.getComments(hikeId, token);
      setComments(commentsData);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(hikeId, commentId, token);
      const commentsData = await api.getComments(hikeId, token);
      setComments(commentsData);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handlePackingItemToggle = async (itemIndex) => {
    const updatedItems = packingList.items.map((item, index) =>
      index === itemIndex ? { ...item, checked: !item.checked } : item
    );
    setPackingList({ items: updatedItems });

    try {
      await api.updatePackingList(hikeId, { items: updatedItems }, token);
    } catch (err) {
      console.error('Error updating packing list:', err);
    }
  };

  const handleSubmitOfferRide = async (e) => {
    e.preventDefault();
    setSubmittingCarpool(true);
    try {
      await api.submitCarpoolOffer(hikeId, offerFormData, token);
      // Refresh carpool data
      const offers = await api.getCarpoolOffers(hikeId, token);
      setCarpoolOffers(offers);
      // Reset form and close modal
      setOfferFormData({
        departure_location: '',
        available_seats: 1,
        departure_time: '',
        notes: ''
      });
      setShowOfferRideModal(false);
      alert('Ride offer submitted successfully!');
    } catch (err) {
      console.error('Error submitting ride offer:', err);
      alert(err.response?.data?.error || 'Failed to submit ride offer');
    } finally {
      setSubmittingCarpool(false);
    }
  };

  const handleSubmitRequestRide = async (e) => {
    e.preventDefault();
    setSubmittingCarpool(true);
    try {
      await api.submitCarpoolRequest(hikeId, requestFormData, token);
      // Refresh carpool data
      const requests = await api.getCarpoolRequests(hikeId, token);
      setCarpoolRequests(requests);
      // Reset form and close modal
      setRequestFormData({
        pickup_location: '',
        notes: ''
      });
      setShowRequestRideModal(false);
      alert('Ride request submitted successfully!');
    } catch (err) {
      console.error('Error submitting ride request:', err);
      alert(err.response?.data?.error || 'Failed to submit ride request');
    } finally {
      setSubmittingCarpool(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading event details..." />;
  }

  if (error || !hike) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error || 'Hike not found'}</p>
          <hr />
          <Link to="/hikes" className="btn btn-primary">Browse Hikes</Link>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const difficultyColors = {
    Easy: '#28a745',
    Moderate: '#ffc107',
    Hard: '#dc3545'
  };

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
      genericImage: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&h=800&fit=crop'
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

  const eventType = hike?.event_type || 'hiking';
  const EventTypeIcon = EVENT_TYPE_CONFIG[eventType]?.icon || Mountain;
  const eventTypeColor = EVENT_TYPE_CONFIG[eventType]?.color || '#4CAF50';
  const eventTypeLabel = EVENT_TYPE_CONFIG[eventType]?.label || 'Event';

  // Registration closed logic
  const isRegistrationClosed = hike?.registration_closed ||
    (hike?.registration_deadline && new Date(hike.registration_deadline) < new Date());

  const isRegistrationClosingSoon = hike?.registration_deadline &&
    !isRegistrationClosed &&
    (new Date(hike.registration_deadline) - new Date()) < 7 * 24 * 60 * 60 * 1000; // 7 days

  const isPaymentDueSoon = hike?.payment_deadline &&
    new Date(hike.payment_deadline) > new Date() &&
    (new Date(hike.payment_deadline) - new Date()) < 7 * 24 * 60 * 60 * 1000; // 7 days

  // Navigate back - to landing page if not logged in, otherwise browser back
  const handleBack = () => {
    if (!token) {
      navigate('/landing');
    } else {
      navigate(-1);
    }
  };

  const handleShare = () => {
    const shareUrl = `https://www.thenarrowtrail.co.za/hikes/${hikeId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="btn btn-link px-0 mb-3 d-flex align-items-center"
        style={{
          textDecoration: 'none',
          color: isDark ? '#8ab4f8' : '#1a73e8',
          fontSize: '0.95rem',
          fontWeight: '500',
          gap: '0.5rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Registration Status Banner */}
      {isRegistrationClosed && (
        <div className="alert alert-danger d-flex align-items-center mb-4" style={{
          borderRadius: '12px',
          border: '2px solid #dc3545',
          backgroundColor: isDark ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
          padding: '1rem 1.5rem'
        }}>
          <XCircle size={24} className="me-3 flex-shrink-0" />
          <div>
            <h5 className="mb-1" style={{ fontWeight: '700', color: '#dc3545' }}>Registration Closed</h5>
            <p className="mb-0" style={{ fontSize: '0.9rem' }}>
              {hike.registration_deadline
                ? `Registration closed on ${new Date(hike.registration_deadline).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`
                : 'Registration is closed for this event'}
            </p>
          </div>
        </div>
      )}

      {isRegistrationClosingSoon && (
        <div className="alert alert-warning d-flex align-items-center mb-4" style={{
          borderRadius: '12px',
          border: '2px solid #ffc107',
          backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
          padding: '1rem 1.5rem'
        }}>
          <AlertCircle size={24} className="me-3 flex-shrink-0" />
          <div>
            <h5 className="mb-1" style={{ fontWeight: '700', color: '#856404' }}>Registration Closing Soon!</h5>
            <p className="mb-0" style={{ fontSize: '0.9rem' }}>
              Register by {new Date(hike.registration_deadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="mb-4" style={{
        height: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0'
      }}>
        <img
          src={hike.image_url || EVENT_TYPE_CONFIG[eventType]?.genericImage}
          alt={hike.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => {
            // If image fails to load, show a colored placeholder
            const config = EVENT_TYPE_CONFIG[eventType];
            e.target.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, ${config.color}dd 0%, ${config.color}88 100%);
              color: white;
            `;
            placeholder.innerHTML = `<div style="text-align: center;"><div style="font-size: 3rem; margin-bottom: 0.5rem;">🏔️</div><div style="font-size: 1.2rem; font-weight: 600;">${config.label}</div></div>`;
            e.target.parentElement.appendChild(placeholder);
          }}
        />
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Title and Key Info */}
          <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="mb-0">{hike.name}</h1>
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/admin/hikes/edit/${hikeId}`, { state: { from: 'event-details' } })}
                  >
                    <Edit size={16} className="me-2" />
                    Edit
                  </button>
                )}
              </div>

              {/* Event Type Badge & Tags */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span
                  className="badge px-3 py-2"
                  style={{
                    background: eventTypeColor,
                    fontSize: '0.9rem'
                  }}
                >
                  <EventTypeIcon size={16} className="me-1" />
                  {eventTypeLabel}
                </span>

                {/* Tags Display */}
                {hike.tags && hike.tags.length > 0 && hike.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="badge px-3 py-2"
                    style={{
                      backgroundColor: tag.color || '#6366F1',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span style={{ opacity: 0.7, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {tag.category}:
                    </span>
                    <span>{tag.name}</span>
                  </span>
                ))}
              </div>

              <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3 flex-shrink-0" style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(13, 110, 253, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={24} className="text-primary" />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Date</small>
                      <strong className="d-block" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {new Date(hike.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </strong>
                      {hike.date_is_estimate && <span className="badge bg-info mt-1" style={{ fontSize: '0.7rem' }}>Estimate</span>}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3 flex-shrink-0" style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(25, 135, 84, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={24} className="text-success" />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Location</small>
                      <strong className="d-block" style={{ fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{hike.location || 'TBA'}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="me-3 flex-shrink-0" style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarSign size={24} className="text-warning" />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Cost</small>
                      <strong className="d-block" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>R{parseFloat(hike.cost || 0).toFixed(2)}</strong>
                      {hike.price_is_estimate && <span className="badge bg-info mt-1" style={{ fontSize: '0.7rem' }}>Estimate</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration & Payment Deadlines */}
              {(hike.registration_deadline || hike.payment_deadline || hike.pay_at_venue) && (
                <>
                  <div style={{
                    height: '1px',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    margin: '2rem 0'
                  }} />

                  <div className="mb-4">
                    <h5 className="mb-3">
                      <Clock size={20} className="me-2" />
                      Registration & Payment
                    </h5>
                    <div className="row g-3">
                      {hike.registration_deadline && (
                        <div className="col-md-6">
                          <div className="p-3" style={{
                            backgroundColor: isRegistrationClosed
                              ? (isDark ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)')
                              : isRegistrationClosingSoon
                                ? (isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)')
                                : (isDark ? 'rgba(25, 135, 84, 0.2)' : 'rgba(25, 135, 84, 0.1)'),
                            borderRadius: '8px',
                            border: isRegistrationClosed
                              ? '2px solid #dc3545'
                              : isRegistrationClosingSoon
                                ? '2px solid #ffc107'
                                : '2px solid #198754'
                          }}>
                            <div className="d-flex align-items-start">
                              {isRegistrationClosed ? (
                                <XCircle size={20} className="me-2 mt-1 flex-shrink-0" style={{ color: '#dc3545' }} />
                              ) : isRegistrationClosingSoon ? (
                                <AlertCircle size={20} className="me-2 mt-1 flex-shrink-0" style={{ color: '#ffc107' }} />
                              ) : (
                                <CheckCircle size={20} className="me-2 mt-1 flex-shrink-0" style={{ color: '#198754' }} />
                              )}
                              <div>
                                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                                  Registration Deadline
                                </small>
                                <strong className="d-block" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                  {new Date(hike.registration_deadline).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </strong>
                                {isRegistrationClosed && (
                                  <span className="badge bg-danger mt-1" style={{ fontSize: '0.7rem' }}>Closed</span>
                                )}
                                {isRegistrationClosingSoon && !isRegistrationClosed && (
                                  <span className="badge bg-warning mt-1" style={{ fontSize: '0.7rem' }}>Closing Soon</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {hike.payment_deadline && (
                        <div className="col-md-6">
                          <div className="p-3" style={{
                            backgroundColor: isPaymentDueSoon
                              ? (isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)')
                              : (isDark ? 'rgba(13, 110, 253, 0.2)' : 'rgba(13, 110, 253, 0.1)'),
                            borderRadius: '8px',
                            border: isPaymentDueSoon ? '2px solid #ffc107' : '2px solid #0d6efd'
                          }}>
                            <div className="d-flex align-items-start">
                              {isPaymentDueSoon ? (
                                <AlertCircle size={20} className="me-2 mt-1 flex-shrink-0" style={{ color: '#ffc107' }} />
                              ) : (
                                <DollarSign size={20} className="me-2 mt-1 flex-shrink-0" style={{ color: '#0d6efd' }} />
                              )}
                              <div>
                                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                                  Payment Deadline
                                </small>
                                <strong className="d-block" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                  {new Date(hike.payment_deadline).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </strong>
                                {isPaymentDueSoon && (
                                  <span className="badge bg-warning mt-1" style={{ fontSize: '0.7rem' }}>Due Soon</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {hike.pay_at_venue && (
                        <div className="col-12">
                          <div className="alert alert-info mb-0 d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                            <Info size={18} className="me-2 flex-shrink-0" />
                            <span><strong>Payment at Venue:</strong> Payment will be collected directly at the destination</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Divider */}
              {hike.event_type_data && (
                <div style={{
                  height: '1px',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  margin: '2rem 0'
                }} />
              )}

              {/* Event-Type-Specific Details */}
              {hike.event_type_data && (
                <div className="mb-4">
                  {eventType === 'hiking' && <HikingDetailsDisplay data={hike.event_type_data} />}
                  {eventType === 'camping' && <CampingDetailsDisplay data={hike.event_type_data} />}
                  {eventType === '4x4' && <FourWheelDriveDetailsDisplay data={hike.event_type_data} />}
                  {eventType === 'cycling' && <CyclingDetailsDisplay data={hike.event_type_data} />}
                  {eventType === 'outdoor' && <OutdoorDetailsDisplay data={hike.event_type_data} />}
                </div>
              )}

              {/* Divider */}
              {hike.description && (
                <div style={{
                  height: '1px',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  margin: '2rem 0'
                }} />
              )}

              {hike.description && (
                <div>
                  <h5 className="mb-3">
                    <Info size={20} className="me-2" />
                    Description
                  </h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{hike.description}</p>
                </div>
              )}

              {/* Link buttons */}
              <div className="mt-3 d-flex flex-wrap gap-2">
                {hike.destination_url && (
                  <a
                    href={hike.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    <MapPin size={16} className="me-2" />
                    View on Map
                  </a>
                )}
                {hike.location_link && (
                  <a
                    href={hike.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                  >
                    <MapPin size={16} className="me-2" />
                    Location
                  </a>
                )}
                {hike.destination_website && (
                  <a
                    href={hike.destination_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-info"
                  >
                    <Info size={16} className="me-2" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          {(hike.gps_coordinates || hike.location_link) && (
            <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h5 className="mb-3">
                  <MapPin size={20} className="me-2" />
                  Location
                </h5>
                <Map
                  gpsCoordinates={hike.gps_coordinates}
                  locationLink={hike.location_link}
                  height="350px"
                />
              </div>
            </div>
          )}

          {/* Comments Section */}
          {token && (
            <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h5 className="mb-3">
                  <MessageSquare size={20} className="me-2" />
                  Comments
                </h5>

                {/* Comments List */}
                <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {comments.length === 0 ? (
                    <p className="text-muted">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="fw-bold" style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}>
                              {comment.user_name}
                            </span>
                            <small className="text-muted ms-2">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </small>
                          </div>
                          {currentUser && comment.user_id === currentUser.id && (
                            <button
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="mb-0 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="mt-3">
                  <textarea
                    className="form-control mb-2"
                    rows="3"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send size={16} className="me-2" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Packing List Section - Only for hiking and camping */}
          {token && (eventType === 'hiking' || eventType === 'camping') && packingList.items && packingList.items.length > 0 && (
            <div className="card mb-4" style={{
              background: isDark ? 'var(--card-bg)' : 'white',
              borderColor: isDark ? 'var(--border-color)' : '#dee2e6'
            }}>
              <div className="card-body">
                <h5 className="mb-3" style={{ color: isDark ? 'var(--text-primary)' : '#212529' }}>
                  <Package size={20} className="me-2" />
                  Packing List
                </h5>
                <div className="list-group list-group-flush">
                  {packingList.items.map((item, index) => (
                    <div key={index} className="list-group-item bg-transparent border-0 px-0 py-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={item.checked || false}
                          onChange={() => handlePackingItemToggle(index)}
                          id={`packing-${index}`}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`packing-${index}`}
                          style={{
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: isDark ? '#ffffff' : '#212529',
                            cursor: 'pointer'
                          }}
                        >
                          {item.name}
                          {item.category && (
                            <span className="badge bg-secondary ms-2 small">{item.category}</span>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Tracking Section */}
          {token && (
            <div className="mb-4">
              <PaymentsSection
                hikeId={hikeId}
                hikeCost={hike.cost}
                isAdmin={currentUser?.role === 'admin'}
              />
            </div>
          )}

          {/* Lift Club Section */}
          {token && (
            <div className="card mb-4" style={{
              background: isDark ? 'var(--card-bg)' : 'white',
              borderColor: isDark ? 'var(--border-color)' : '#dee2e6'
            }}>
              <div className="card-body">
                <h5 className="mb-3" style={{ color: isDark ? 'var(--text-primary)' : '#212529' }}>
                  <Car size={20} className="me-2" />
                  Lift Club
                </h5>

                {/* Carpool Offers */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 text-success">Offering Rides</h6>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => setShowOfferRideModal(true)}
                    >
                      Offer a Ride
                    </button>
                  </div>

                  {carpoolOffers.length === 0 ? (
                    <p className="text-muted small">No ride offers yet.</p>
                  ) : (
                    carpoolOffers.map(offer => (
                      <div key={offer.id} className="mb-3 p-3 border rounded" style={{
                        borderColor: isDark ? 'var(--border-color)' : '#dee2e6',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'
                      }}>
                        <div>
                          <span className="fw-bold d-block mb-2" style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}>
                            {offer.driver_name}
                          </span>
                          <div className="mb-1">
                            <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                              <MapPin size={14} className="me-1" />
                              From: {offer.departure_location}
                            </small>
                          </div>
                          <div className="mb-1">
                            <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                              Available Seats: <strong style={{ color: isDark ? '#ffffff' : '#212529' }}>{offer.available_seats}</strong>
                            </small>
                          </div>
                          {offer.departure_time && (
                            <div className="mb-1">
                              <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                                <Clock size={14} className="me-1" />
                                Departure: {offer.departure_time}
                              </small>
                            </div>
                          )}
                          {offer.driver_phone && (
                            <div className="mb-1">
                              <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                                📞 {offer.driver_phone}
                              </small>
                            </div>
                          )}
                          {offer.notes && (
                            <p className="mb-0 mt-2 small" style={{ color: isDark ? '#ffffff' : '#212529' }}>
                              {offer.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Carpool Requests */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 text-info">Looking for Rides</h6>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => setShowRequestRideModal(true)}
                    >
                      Request a Ride
                    </button>
                  </div>

                  {carpoolRequests.length === 0 ? (
                    <p className="text-muted small">No ride requests yet.</p>
                  ) : (
                    carpoolRequests.map(request => (
                      <div key={request.id} className="mb-3 p-3 border rounded" style={{
                        borderColor: isDark ? 'var(--border-color)' : '#dee2e6',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'
                      }}>
                        <span className="fw-bold d-block mb-2" style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}>
                          {request.requester_name || request.user_name}
                        </span>
                        <div className="mb-1">
                          <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                            <MapPin size={14} className="me-1" />
                            Pickup: {request.pickup_location || request.departure_location}
                          </small>
                        </div>
                        {request.notes && (
                          <p className="mb-0 mt-2 small" style={{ color: isDark ? '#ffffff' : '#212529' }}>
                            {request.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Share Button Card */}
          <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white', border: '2px solid #0d6efd' }}>
            <div className="card-body text-center">
              <Share2 size={32} className="text-primary mb-2" />
              <h5 className="mb-2">Share This Event</h5>
              <p className="text-muted small mb-3">Spread the word with fellow adventurers</p>
              <button
                className="btn btn-primary w-100 shadow-sm"
                onClick={handleShare}
                style={{
                  fontWeight: '600',
                  padding: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Share2 size={18} className="me-2" />
                Copy Link
              </button>
            </div>
          </div>

          {/* Login Prompt for Non-logged-in Users */}
          {!token && (
            <div className="card mb-4 border-primary" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body text-center">
                <LogIn size={48} className="text-primary mb-3" />
                <h5>Join This Hike</h5>
                <p className="text-muted">Log in to express your interest and get updates</p>
                <Link to={`/login?redirect=/hikes/${hikeId}`} className="btn btn-primary w-100 mb-2">
                  Log in to view more information
                </Link>
                <Link to="/register" className="btn btn-outline-primary w-100">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Interest and Attendance for Logged-in Users */}
          {token && currentUser && (
            <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
              <div className="card-body">
                <h5 className="mb-3">Your Status</h5>

                {/* Registration Closed Warning */}
                {isRegistrationClosed && !userStatus?.attendance_status && (
                  <div className="alert alert-danger mb-3" style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                    <XCircle size={16} className="me-2" style={{ verticalAlign: 'text-top' }} />
                    Registration is closed for this event
                  </div>
                )}

                {/* Show based on attendance_status */}
                {!userStatus?.attendance_status && (
                  <>
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={handleInterestToggle}
                      disabled={isRegistrationClosed}
                      title={isRegistrationClosed ? 'Registration is closed for this event' : 'Express your interest in this event'}
                    >
                      {isRegistrationClosed ? 'Registration Closed' : 'Express Interest'}
                    </button>
                  </>
                )}

                {userStatus?.attendance_status === 'interested' && (
                  <>
                    <button
                      className="btn btn-success w-100 mb-2"
                      onClick={handleInterestToggle}
                    >
                      Interested ✓
                    </button>
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleConfirmAttendance}
                      disabled={isRegistrationClosed}
                      title={isRegistrationClosed ? 'Registration is closed - cannot confirm attendance' : 'Confirm your attendance'}
                    >
                      {isRegistrationClosed ? 'Registration Closed' : 'Confirm Attendance'}
                    </button>
                    {!isRegistrationClosed && (
                      <small className="text-muted d-block mt-2 text-center">
                        You've expressed interest. Confirm to secure your spot!
                      </small>
                    )}
                    {isRegistrationClosed && (
                      <small className="text-danger d-block mt-2 text-center">
                        Registration closed - cannot confirm attendance
                      </small>
                    )}
                  </>
                )}

                {userStatus?.attendance_status === 'confirmed' && (
                  <>
                    <button
                      className="btn btn-success w-100 mb-2"
                      onClick={handleConfirmAttendance}
                    >
                      Attendance Confirmed ✓
                    </button>
                    <button
                      className="btn btn-outline-danger w-100"
                      onClick={handleCancelAttendance}
                    >
                      Cancel Attendance
                    </button>
                    <small className="text-success d-block mt-2 text-center fw-bold">
                      You're confirmed for this hike!
                    </small>
                  </>
                )}

                {userStatus?.attendance_status === 'cancelled' && (
                  <>
                    <div className="alert alert-warning mb-2">
                      You cancelled your attendance
                    </div>
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={handleInterestToggle}
                      disabled={isRegistrationClosed}
                      title={isRegistrationClosed ? 'Registration is closed for this event' : 'Express interest again'}
                    >
                      {isRegistrationClosed ? 'Registration Closed' : 'Express Interest Again'}
                    </button>
                    {isRegistrationClosed && (
                      <small className="text-danger d-block mt-2 text-center">
                        Registration is closed - cannot re-register
                      </small>
                    )}
                  </>
                )}

                {userStatus?.attendance_status === 'attended' && (
                  <div className="alert alert-success mb-0">
                    You attended this hike ✓
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weather Forecast - Relevant for all event types */}
          {token && hike && hike.date && hike.location && (
            <div className="mb-4">
              <WeatherWidget
                hikeId={hikeId}
                location={hike.location}
                date={hike.date}
                eventType={eventType}
                eventLabel={eventTypeLabel}
              />
            </div>
          )}

          {/* Interest Stats */}
          <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <h5 className="mb-3">
                <Users size={20} className="me-2" />
                Participation
              </h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Interested:</span>
                <strong className="text-info">{hike.interested_count || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Confirmed:</span>
                <strong className="text-success">{hike.confirmed_count || 0}</strong>
              </div>
              {hike.status && (
                <div className="mt-3 pt-3 border-top">
                  <span className={`badge w-100 ${
                    hike.status === 'trip_booked' ? 'bg-success' :
                    hike.status === 'final_planning' ? 'bg-warning' :
                    hike.status === 'pre_planning' ? 'bg-info' :
                    'bg-secondary'
                  }`}>
                    {hike.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Confirmed Users List */}
              {interestedUsers.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <h6 className="mb-2">Confirmed Hikers:</h6>
                  <div className="d-flex flex-column gap-2">
                    {interestedUsers.map(user => (
                      <div
                        key={user.id}
                        className="d-flex align-items-center gap-2"
                        style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}
                      >
                        <Users size={14} />
                        <span>{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="text-center mt-4 mb-5">
        <button
          className="btn btn-primary btn-lg shadow"
          onClick={handleShare}
          style={{
            fontWeight: '600',
            padding: '15px 40px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Share2 size={20} className="me-2" />
          Share This Event
        </button>
      </div>

      {/* Offer Ride Modal */}
      {showOfferRideModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', paddingTop: '80px' }} onClick={() => setShowOfferRideModal(false)}>
          <div className="modal-dialog my-3" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ background: isDark ? 'var(--card-bg)' : 'white', color: isDark ? 'var(--text-primary)' : '#212529' }}>
              <div className="modal-header" style={{ borderColor: isDark ? 'var(--border-color)' : '#dee2e6' }}>
                <h5 className="modal-title">
                  <Car size={20} className="me-2" />
                  Offer a Ride
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOfferRideModal(false)}
                  style={{ filter: isDark ? 'invert(1)' : 'none' }}
                ></button>
              </div>
              <form onSubmit={handleSubmitOfferRide}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Departure Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Pretoria CBD, Centurion Mall"
                      value={offerFormData.departure_location}
                      onChange={(e) => setOfferFormData({ ...offerFormData, departure_location: e.target.value })}
                      required
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Available Seats *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={offerFormData.available_seats}
                      onChange={(e) => setOfferFormData({ ...offerFormData, available_seats: parseInt(e.target.value) })}
                      required
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Departure Time (optional)</label>
                    <input
                      type="time"
                      className="form-control"
                      value={offerFormData.departure_time}
                      onChange={(e) => setOfferFormData({ ...offerFormData, departure_time: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes (optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Any additional information..."
                      value={offerFormData.notes}
                      onChange={(e) => setOfferFormData({ ...offerFormData, notes: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ borderColor: isDark ? 'var(--border-color)' : '#dee2e6' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowOfferRideModal(false)}
                    disabled={submittingCarpool}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submittingCarpool}
                  >
                    {submittingCarpool ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Ride Modal */}
      {showRequestRideModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', paddingTop: '80px' }} onClick={() => setShowRequestRideModal(false)}>
          <div className="modal-dialog my-3" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ background: isDark ? 'var(--card-bg)' : 'white', color: isDark ? 'var(--text-primary)' : '#212529' }}>
              <div className="modal-header" style={{ borderColor: isDark ? 'var(--border-color)' : '#dee2e6' }}>
                <h5 className="modal-title">
                  <Car size={20} className="me-2" />
                  Request a Ride
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRequestRideModal(false)}
                  style={{ filter: isDark ? 'invert(1)' : 'none' }}
                ></button>
              </div>
              <form onSubmit={handleSubmitRequestRide}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Pickup Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Pretoria CBD, Centurion Mall"
                      value={requestFormData.pickup_location}
                      onChange={(e) => setRequestFormData({ ...requestFormData, pickup_location: e.target.value })}
                      required
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes (optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Any additional information (e.g., preferred pickup time)..."
                      value={requestFormData.notes}
                      onChange={(e) => setRequestFormData({ ...requestFormData, notes: e.target.value })}
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isDark ? 'white' : '#212529',
                        borderColor: isDark ? 'var(--border-color)' : '#ced4da'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ borderColor: isDark ? 'var(--border-color)' : '#dee2e6' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRequestRideModal(false)}
                    disabled={submittingCarpool}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info"
                    disabled={submittingCarpool}
                  >
                    {submittingCarpool ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HikeDetailsPage;
