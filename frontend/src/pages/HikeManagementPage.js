import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Edit, Mail, Settings, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import PageHeader from '../components/common/PageHeader';

import EmergencyContactsModal from '../components/admin/EmergencyContactsModal';
import PackingListEditorModal from '../components/admin/PackingListEditorModal';
import EmailAttendeesModal from '../components/admin/EmailAttendeesModal';
import AddHikeForm from '../components/hikes/AddHikeForm';
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
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchHikeDetails();
  }, [hikeId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHikeDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getHikeById(hikeId, token);
      setHike(data);
    } catch (err) {
      setError('Failed to load hike details');
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

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading hike details...</p>
        </div>
      </div>
    );
  }

  if (error || !hike) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error || 'Hike not found'}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            <ArrowLeft size={16} className="me-1" />
            Back to Manage Hikes
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
            Back to Manage Hikes
          </button>
        }
      />

      <div className="container-fluid py-4">
        {/* Hike Overview Card */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <h5 className="card-title mb-3">Hike Overview</h5>
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
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit size={16} className="me-1" />
                    Edit Hike Details
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
      {showEditForm && (
        <AddHikeForm
          show={showEditForm}
          hikeToEdit={hike}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchHikeDetails();
          }}
        />
      )}



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
    </div>
  );
};

export default HikeManagementPage;