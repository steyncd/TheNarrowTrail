import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, ExternalLink, Printer, Users, DollarSign, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CommentsSection from './CommentsSection';
import CarpoolSectionEnhanced from './CarpoolSectionEnhanced';
import PackingList from './PackingList';
import ShareButtons from '../common/ShareButtons';
import HikePrintView from './HikePrintView';

const HikeDetailsModal = ({ hike, onClose }) => {
  // eslint-disable-next-line no-unused-vars
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [hikeStatus, setHikeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [attendees, setAttendees] = useState([]);

  const fetchHikeStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHikeStatus(hike.id, token);
      setHikeStatus(data);
    } catch (err) {
      console.error('Fetch hike status error:', err);
    } finally {
      setLoading(false);
    }
  }, [hike.id, token]);

  const fetchAttendees = useCallback(async () => {
    try {
      const data = await api.getAttendees(hike.id, token);
      setAttendees(data);
    } catch (err) {
      console.error('Fetch attendees error:', err);
    }
  }, [hike.id, token]);

  useEffect(() => {
    fetchHikeStatus();
    fetchAttendees();
  }, [fetchHikeStatus, fetchAttendees]);

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const handleConfirmAttendance = async () => {
    setLoading(true);
    try {
      await api.confirmAttendance(hike.id, token);
      await fetchHikeStatus();
    } catch (err) {
      console.error('Confirm attendance error:', err);
      alert(err.response?.data?.error || 'Failed to confirm attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAttendance = async () => {
    if (!window.confirm('Are you sure you want to cancel your attendance?')) {
      return;
    }
    setLoading(true);
    try {
      await api.cancelAttendance(hike.id, token);
      await fetchHikeStatus();
    } catch (err) {
      console.error('Cancel attendance error:', err);
      alert(err.response?.data?.error || 'Failed to cancel attendance');
    } finally {
      setLoading(false);
    }
  };

  if (showPrintView) {
    return <HikePrintView hike={hike} attendees={attendees} />;
  }

  return (
    <div className="modal show d-block no-print" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1050}}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div
          className="modal-content"
          style={{
            background: theme === 'dark' ? 'var(--card-bg)' : 'white',
            color: theme === 'dark' ? 'var(--text-primary)' : '#212529'
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title">{hike.name}</h5>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={handlePrint}
                title="Print"
              >
                <Printer size={18} />
              </button>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }}
              ></button>
            </div>
          </div>

          <div className="modal-body">
            {loading && !hikeStatus ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      Info
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                      onClick={() => setActiveTab('comments')}
                    >
                      Comments
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'carpool' ? 'active' : ''}`}
                      onClick={() => setActiveTab('carpool')}
                    >
                      Carpool
                    </button>
                  </li>
                  {hikeStatus?.attendance_status === 'confirmed' && (
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'packing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('packing')}
                      >
                        Packing List
                      </button>
                    </li>
                  )}
                </ul>

                {/* Info Tab */}
                {activeTab === 'info' && (
                  <div>
                    {/* Thumbnail Image */}
                    {hike.image_url && (
                      <div className="mb-4" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                          src={hike.image_url}
                          alt={hike.name}
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {hikeStatus && hikeStatus.attendance_status && (
                      <div className="mb-4">
                        {hikeStatus.attendance_status === 'confirmed' && (
                          <div className="alert alert-success">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>You're confirmed for this hike!</strong>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleCancelAttendance}
                                disabled={loading}
                              >
                                {loading ? 'Cancelling...' : 'Cancel Attendance'}
                              </button>
                            </div>
                          </div>
                        )}
                        {hikeStatus.attendance_status === 'interested' && (
                          <div className="alert alert-info">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>You've expressed interest in this hike.</strong>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={handleConfirmAttendance}
                                disabled={loading}
                              >
                                {loading ? 'Confirming...' : 'Confirm Attendance'}
                              </button>
                            </div>
                          </div>
                        )}
                        {hikeStatus.attendance_status === 'cancelled' && (
                          <div className="alert alert-warning">
                            <strong>You cancelled your attendance for this hike.</strong>
                          </div>
                        )}
                        {hikeStatus.attendance_status === 'attended' && (
                          <div className="alert alert-success">
                            <strong>You attended this hike ✓</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Details Grid */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <Calendar size={20} className="me-2 text-primary" />
                              <strong>Date</strong>
                            </div>
                            <p className="mb-0">{new Date(hike.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <MapPin size={20} className="me-2 text-success" />
                              <strong>Distance</strong>
                            </div>
                            <p className="mb-0">{hike.distance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <Info size={20} className="me-2 text-warning" />
                              <strong>Difficulty</strong>
                            </div>
                            <span className="badge bg-warning text-dark">{hike.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <Users size={20} className="me-2 text-info" />
                              <strong>Group Type</strong>
                            </div>
                            <p className="mb-0">{hike.group_type === 'family' ? 'Family' : "Men's Group"}</p>
                          </div>
                        </div>
                      </div>
                      {hike.cost > 0 && (
                        <div className="col-md-6">
                          <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-2">
                                <DollarSign size={20} className="me-2 text-success" />
                                <strong>Cost</strong>
                              </div>
                              <p className="mb-0 text-success fw-bold">R{hike.cost}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="card h-100" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <Info size={20} className="me-2 text-secondary" />
                              <strong>Type</strong>
                            </div>
                            <span className="badge bg-info">{hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="card" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                              <Info size={20} className="me-2 text-primary" />
                              <strong>Status</strong>
                            </div>
                            <span className={`badge ${
                              hike.status === 'trip_booked' ? 'bg-success' :
                              hike.status === 'final_planning' ? 'bg-primary' :
                              hike.status === 'pre_planning' ? 'bg-warning' :
                              hike.status === 'cancelled' ? 'bg-secondary' : 'bg-info'
                            }`}>
                              {(hike.status || 'gathering_interest').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {attendees.length > 0 && (
                              <span className="ms-2 text-muted">
                                {attendees.filter(a => a.attendance_status === 'confirmed').length} confirmed, {attendees.filter(a => a.attendance_status === 'interested').length} interested
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {hike.description && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">Description</h6>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{hike.description}</p>
                      </div>
                    )}

                    {hike.type === 'multi' && hike.daily_distances && hike.daily_distances.length > 0 && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">Daily Distances</h6>
                        <div className="list-group">
                          {hike.daily_distances.map((distance, idx) => (
                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6' }}>
                              <strong>Day {idx + 1}</strong>
                              <span>{distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hike.overnight_facilities && (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3">Overnight Facilities</h6>
                        <div className="card" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa', border: 'none' }}>
                          <div className="card-body">
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{hike.overnight_facilities}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {hike.destination_url && (
                      <div className="mb-4">
                        <a href={hike.destination_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100">
                          <ExternalLink size={16} className="me-2" />
                          View Destination Info
                        </a>
                      </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mb-3">
                      <h6 className="border-bottom pb-2 mb-3">Share This Hike</h6>
                      <ShareButtons hike={hike} />
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <CommentsSection hikeId={hike.id} />
                )}

                {/* Carpool Tab */}
                {activeTab === 'carpool' && (
                  <CarpoolSectionEnhanced hikeId={hike.id} hikeLocation={hike.location} />
                )}

                {/* Packing List Tab */}
                {activeTab === 'packing' && hikeStatus?.is_confirmed && (
                  <PackingList hikeId={hike.id} />
                )}
              </>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                navigate(`/hikes/${hike.id}`);
                onClose();
              }}
            >
              <ArrowRight size={18} className="me-2" />
              View Full Details
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HikeDetailsModal;
