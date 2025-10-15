import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import PaymentsSection from '../components/payments/PaymentsSection';
import api from '../services/api';

function PaymentDetailsPage() {
  const { hikeId } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [hike, setHike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHikeDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getHikeById(hikeId, token);
      setHike(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching hike details:', error);
      setError('Failed to load hike details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [hikeId, token]);

  useEffect(() => {
    if (token && hikeId) {
      fetchHikeDetails();
    }
  }, [hikeId, token, fetchHikeDetails]);

  if (loading) {
    return (
      <div className="container-fluid px-4 py-3">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading hike details...</span>
          </div>
          <p className="mt-3">Loading hike payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4 py-3">
        <div className="alert alert-danger" role="alert">
          <h5>Error Loading Hike Details</h5>
          <p>{error}</p>
          <button className="btn btn-danger me-2" onClick={fetchHikeDetails}>
            Retry
          </button>
          <Link to="/admin/manage-hikes" className="btn btn-outline-secondary">
            Back to Manage Hikes
          </Link>
        </div>
      </div>
    );
  }

  if (!hike) {
    return (
      <div className="container-fluid px-4 py-3">
        <div className="alert alert-warning" role="alert">
          <h5>Hike Not Found</h5>
          <p>The requested hike could not be found.</p>
          <Link to="/admin/manage-hikes" className="btn btn-outline-primary">
            Back to Manage Hikes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link 
            to="/admin/manage-hikes" 
            className="btn btn-outline-secondary me-3"
            title="Back to Manage Hikes"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="mb-1">Payment Details</h2>
            <p className="text-muted mb-0">Manage payments for this hike</p>
          </div>
        </div>
      </div>

      {/* Hike Summary */}
      <div className={`card ${isDark ? 'bg-dark' : 'bg-light'} mb-4`}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <h4 className="card-title mb-3">{hike.title}</h4>
              <div className="d-flex align-items-center mb-2">
                <Calendar size={16} className="text-muted me-2" />
                <span>{new Date(hike.date).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <MapPin size={16} className="text-muted me-2" />
                <span>{hike.location}</span>
              </div>
              <div className="d-flex align-items-center">
                <Users size={16} className="text-muted me-2" />
                <span>{hike.maxParticipants} max participants</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="text-end">
                <div className="d-flex align-items-center justify-content-end mb-2">
                  <DollarSign size={16} className="text-success me-2" />
                  <span className="h5 mb-0">R {parseFloat(hike.cost || 0).toLocaleString()}</span>
                </div>
                <small className="text-muted">Cost per person</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Management Section */}
      <PaymentsSection 
        hikeId={hikeId} 
        hikeCost={hike.cost} 
        isAdmin={true}
      />
    </div>
  );
}

export default PaymentDetailsPage;