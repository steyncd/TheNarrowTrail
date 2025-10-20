import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Edit, Mail, Settings, Calendar, MapPin, Clock, DollarSign, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import PageHeader from '../components/common/PageHeader';

import EmergencyContactsModal from '../components/admin/EmergencyContactsModal';
import PackingListEditorModal from '../components/admin/PackingListEditorModal';
import EmailAttendeesModal from '../components/admin/EmailAttendeesModal';
import AttendeeManagement from '../components/admin/AttendeeManagement';

const HikeManagementPage = () => {
  const { hikeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // State
  const [hike, setHike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attendees');

  // Modal states
  const [showEmergencyContactsModal, setShowEmergencyContactsModal] = useState(false);
  const [showPackingListModal, setShowPackingListModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHikeDetails();
  }, [hikeId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHikeDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getHikeById(hikeId, token);
      setHike(data);
    } catch (err) {
      setError('Failed to load event details');
      console.error('Fetch hike error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Handle both development and production URLs
    navigate('/admin/manage-hikes', { replace: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await api.deleteHike(hikeId, token);
      alert('Event deleted successfully!');
      navigate('/admin/manage-hikes');
    } catch (err) {
      console.error('Delete event error:', err);
      alert(err.response?.data?.error || 'Failed to delete event');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !hike) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error || 'Event not found'}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            <ArrowLeft size={16} className="me-1" />
            Back to Manage Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={hike.name}
        subtitle={`${formatDate(hike.date)} • ${hike.difficulty} • ${hike.distance}`}
        icon={Settings}
        action={
          <button className="btn btn-outline-primary" onClick={handleBack}>
            <ArrowLeft size={16} className="me-1" />
            Back to Manage Events
          </button>
        }
      />

      <div className="container-fluid py-4">
        {/* Hike Overview Card */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <h5 className="card-title mb-3">Event Overview</h5>
                <div className="row">
                  <div className="col-sm-6 mb-2">
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-primary" />
                      <strong>Date:</strong>
                      <span className="ms-2">{formatDate(hike.date)}</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-2">
                    <div className="d-flex align-items-center">
                      <Clock size={16} className="me-2 text-primary" />
                      <strong>Time:</strong>
                      <span className="ms-2">{hike.meeting_time || 'TBA'}</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-2">
                    <div className="d-flex align-items-center">
                      <MapPin size={16} className="me-2 text-primary" />
                      <strong>Location:</strong>
                      <span className="ms-2">{hike.meeting_point || 'TBA'}</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-2">
                    <div className="d-flex align-items-center">
                      <DollarSign size={16} className="me-2 text-primary" />
                      <strong>Cost:</strong>
                      <span className="ms-2">R{hike.cost || 0}</span>
                    </div>
                  </div>
                </div>
                {hike.description && (
                  <div className="mt-3">
                    <strong>Description:</strong>
                    <p className="mt-1 text-muted">{hike.description}</p>
                  </div>
                )}
              </div>
              <div className="col-md-4">
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/events/edit/${hikeId}`, { state: { from: 'manage-events' } })}
                  >
                    <Edit size={16} className="me-1" />
                    Edit Event Details
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <Mail size={16} className="me-1" />
                    Email Attendees
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => setShowEmergencyContactsModal(true)}
                  >
                    Emergency Contacts
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPackingListModal(true)}
                  >
                    Manage Packing List
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 size={16} className="me-1" />
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card mb-4">
          <div className="card-header p-0">
            <ul className="nav nav-tabs nav-fill" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'attendees' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attendees')}
                  type="button"
                >
                  <Users size={18} className="me-2" />
                  Manage Attendees
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'attendees' && (
            <div className="tab-pane fade show active">
              <AttendeeManagement
                hikeId={parseInt(hikeId)}
                hikeName={hike?.name}
                hikeCost={hike?.cost}
                onViewEmergencyContacts={() => setShowEmergencyContactsModal(true)}
                onEditPackingList={() => setShowPackingListModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEmergencyContactsModal && (
        <EmergencyContactsModal
          show={showEmergencyContactsModal}
          onClose={() => setShowEmergencyContactsModal(false)}
          hikeId={parseInt(hikeId)}
          hikeName={hike.name}
        />
      )}

      {showPackingListModal && (
        <PackingListEditorModal
          show={showPackingListModal}
          onClose={() => setShowPackingListModal(false)}
          hikeId={parseInt(hikeId)}
          hikeName={hike.name}
        />
      )}

      {showEmailModal && hike && (
        <EmailAttendeesModal
          hike={hike}
          onClose={() => setShowEmailModal(false)}
          onSuccess={(message) => {
            alert(message);
            setShowEmailModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <Trash2 size={20} className="me-2" />
                  Delete Event
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger d-flex align-items-start">
                  <div className="me-2">⚠️</div>
                  <div>
                    <strong>Warning: This action cannot be undone!</strong>
                    <p className="mb-0 mt-2">
                      Deleting this event will permanently remove:
                    </p>
                    <ul className="mt-2 mb-0">
                      <li>All event details and data</li>
                      <li>All attendee registrations</li>
                      <li>All comments and interactions</li>
                      <li>All payment records</li>
                      <li>All carpool arrangements</li>
                    </ul>
                  </div>
                </div>
                <p className="mb-0">
                  Are you absolutely sure you want to delete "<strong>{hike?.name}</strong>"?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                >
                  <Trash2 size={16} className="me-2" />
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HikeManagementPage;