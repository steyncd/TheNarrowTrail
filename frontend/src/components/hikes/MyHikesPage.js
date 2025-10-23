import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, AlertCircle, MapPin, Heart, Mountain, Tent, Truck, Bike, Compass } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../common/PageHeader';
import SmartRecommendationsEnhanced from '../recommendations/SmartRecommendationsEnhanced';
import QuickActions from '../dashboard/QuickActions';
import TrendingEvents from '../social/TrendingEvents';

// Event type configuration
const EVENT_TYPE_CONFIG = {
  hiking: {
    icon: Mountain,
    color: '#4CAF50',
    label: 'Hiking'
  },
  camping: {
    icon: Tent,
    color: '#FF9800',
    label: 'Camping'
  },
  '4x4': {
    icon: Truck,
    color: '#795548',
    label: '4x4'
  },
  cycling: {
    icon: Bike,
    color: '#2196F3',
    label: 'Cycling'
  },
  outdoor: {
    icon: Compass,
    color: '#9C27B0',
    label: 'Outdoor'
  }
};

function MyHikesPage() {
  const { token } = useAuth();
  const [myHikes, setMyHikes] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_info: ''
  });
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyHikes = useCallback(async () => {
    try {
      const data = await api.getMyHikes(token);
      setMyHikes(data);
    } catch (err) {
      console.error('Error fetching my hikes:', err);
      setError('Failed to load hikes');
    }
  }, [token]);

  const fetchEmergencyContact = useCallback(async () => {
    try {
      const data = await api.getEmergencyContact(token);
      if (data) {
        setEmergencyContact({
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          medical_info: data.medical_info || ''
        });
      }
    } catch (err) {
      console.error('Error fetching emergency contact:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchMyHikes();
    fetchEmergencyContact();
  }, [fetchMyHikes, fetchEmergencyContact]);

  // Handle hash navigation for smooth scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Wait for content to render
    }
  }, [myHikes]);

  const handleUpdateEmergencyContact = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.updateEmergencyContact({
        emergency_contact_name: emergencyContact.emergency_contact_name,
        emergency_contact_phone: emergencyContact.emergency_contact_phone,
        medical_info: emergencyContact.medical_info
      }, token);

      if (result.success) {
        await fetchEmergencyContact();
        setShowEmergencyContactForm(false);
      } else {
        setError(result.error || 'Failed to update emergency contact');
      }
    } catch (err) {
      setError(err.message || 'Failed to update emergency contact');
    } finally {
      setLoading(false);
    }
  };

  if (!myHikes) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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

  const interestedSoon = myHikes.interested.filter(h => {
    const hikeDate = new Date(h.date);
    return hikeDate >= now && hikeDate <= twoMonthsFromNow;
  });

  const interestedFuture = myHikes.interested.filter(h => {
    const hikeDate = new Date(h.date);
    return hikeDate > twoMonthsFromNow;
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
            </div>
          )}
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="card-title mb-0">{hike.name}</h5>
              {hike.event_type && EVENT_TYPE_CONFIG[hike.event_type] && (() => {
                const EventIcon = EVENT_TYPE_CONFIG[hike.event_type].icon;
                return (
                  <span
                    className="badge d-inline-flex align-items-center gap-1"
                    style={{
                      backgroundColor: EVENT_TYPE_CONFIG[hike.event_type].color,
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    <EventIcon size={14} />
                    {EVENT_TYPE_CONFIG[hike.event_type].label}
                  </span>
                );
              })()}
            </div>
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
            <Link
              to={`/hikes/${hike.id}`}
              className="btn btn-sm btn-outline-success w-100"
              style={{minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderInterestedHike = (hike) => (
    <div key={hike.id} className="col-md-6">
      <div className="card h-100" style={{borderLeft: '4px solid #17a2b8'}}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{hike.name}</h5>
            {hike.event_type && EVENT_TYPE_CONFIG[hike.event_type] && (() => {
              const EventIcon = EVENT_TYPE_CONFIG[hike.event_type].icon;
              return (
                <span
                  className="badge d-inline-flex align-items-center gap-1"
                  style={{
                    backgroundColor: EVENT_TYPE_CONFIG[hike.event_type].color,
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  <EventIcon size={14} />
                  {EVENT_TYPE_CONFIG[hike.event_type].label}
                </span>
              );
            })()}
          </div>
          <p className="card-text">
            <Calendar size={16} className="me-2" />
            {new Date(hike.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <Link
            to={`/hikes/${hike.id}`}
            className="btn btn-sm btn-outline-info w-100"
            style={{minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={Heart}
        title="My Events Dashboard"
        subtitle="Manage your confirmed events and track your interests"
      />

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
              <h4 className="text-success mb-1">{[...myHikes.confirmed, ...myHikes.interested].filter(h => ['hiking', 'camping', '4x4', 'cycling', 'outdoor'].includes(h.event_type)).length}</h4>
              <small className="text-muted">All Types</small>
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

      {/* Quick Actions Dashboard */}
      <div className="mb-4">
        <h4 className="mb-3">Quick Actions</h4>
        <QuickActions />
      </div>

      {/* Trending Events */}
      <div className="mb-4">
        <TrendingEvents limit={5} showDetails={true} />
      </div>

      {/* Smart Recommendations */}
      <div className="mb-4">
        <SmartRecommendationsEnhanced limit={6} showTrending={false} showNew={true} />
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
                onClick={handleUpdateEmergencyContact}
                disabled={loading || !emergencyContact.emergency_contact_name || !emergencyContact.emergency_contact_phone}
              >
                {loading ? 'Saving...' : 'Save Emergency Contact'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmed Hikes */}
      {confirmedSoon.length > 0 && (
        <div className="mb-4" id="confirmed-events">
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

      {/* Interested Hikes */}
      {interestedSoon.length > 0 && (
        <div className="mb-4" id="interested-events">
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

      {myHikes.confirmed.length === 0 && myHikes.interested.length === 0 && (
        <div className="text-center py-5">
          <MapPin size={48} className="text-muted mb-3" />
          <p className="text-muted">No hikes yet. Browse available hikes and express your interest!</p>
        </div>
      )}
    </div>
  );
}

export default MyHikesPage;
