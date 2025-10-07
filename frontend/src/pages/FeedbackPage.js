// pages/FeedbackPage.js - Admin Feedback and Suggestions Management Page
import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, CheckCircle, Clock, XCircle, Trash2, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FeedbackPage = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('feedback');
  const [feedback, setFeedback] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [suggestionStats, setSuggestionStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Feedback filters
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState('');
  const [feedbackFilterType, setFeedbackFilterType] = useState('');

  // Suggestion filters
  const [suggestionFilterStatus, setSuggestionFilterStatus] = useState('');
  const [suggestionFilterType, setSuggestionFilterType] = useState('');

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
      fetchFeedbackStats();
    } else {
      fetchSuggestions();
      fetchSuggestionStats();
    }
  }, [activeTab, feedbackFilterStatus, feedbackFilterType, suggestionFilterStatus, suggestionFilterType]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = { limit: 100, offset: 0 };
      if (feedbackFilterStatus) params.status = feedbackFilterStatus;
      if (feedbackFilterType) params.type = feedbackFilterType;

      const data = await api.getAllFeedback(params, token);
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const data = await api.getFeedbackStats(token);
      setFeedbackStats(data);
    } catch (err) {
      console.error('Error fetching feedback stats:', err);
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (suggestionFilterStatus) params.status = suggestionFilterStatus;
      if (suggestionFilterType) params.type = suggestionFilterType;

      const data = await api.getAllSuggestions(params, token);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionStats = async () => {
    try {
      const data = await api.getSuggestionStats(token);
      setSuggestionStats(data);
    } catch (err) {
      console.error('Error fetching suggestion stats:', err);
    }
  };

  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      await api.updateFeedbackStatus(id, { status }, token);
      fetchFeedback();
      fetchFeedbackStats();
    } catch (err) {
      console.error('Error updating feedback:', err);
      alert('Failed to update feedback');
    }
  };

  const handleUpdateSuggestionStatus = async (id, status) => {
    try {
      await api.updateSuggestionStatus(id, { status }, token);
      fetchSuggestions();
      fetchSuggestionStats();
    } catch (err) {
      console.error('Error updating suggestion:', err);
      alert('Failed to update suggestion');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await api.deleteFeedback(id, token);
      fetchFeedback();
      fetchFeedbackStats();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback');
    }
  };

  const handleDeleteSuggestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      await api.deleteSuggestion(id, token);
      fetchSuggestions();
      fetchSuggestionStats();
    } catch (err) {
      console.error('Error deleting suggestion:', err);
      alert('Failed to delete suggestion');
    }
  };

  const getFeedbackStatusBadge = (status) => {
    const badges = {
      new: 'bg-primary',
      in_progress: 'bg-warning',
      resolved: 'bg-success',
      dismissed: 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getSuggestionStatusBadge = (status) => {
    const badges = {
      new: 'bg-primary',
      in_progress: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    const badges = {
      bug: 'bg-danger',
      feature: 'bg-info',
      suggestion: 'bg-primary',
      compliment: 'bg-success',
      complaint: 'bg-warning',
      other: 'bg-secondary',
      date_only: 'bg-info',
      destination_only: 'bg-success',
      date_and_destination: 'bg-primary'
    };
    return badges[type] || 'bg-secondary';
  };

  return (
    <div>
      <PageHeader
        icon={MessageSquare}
        title="Feedback & Suggestions"
        subtitle="View and manage user feedback and hike suggestions"
      />

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
            style={{
              background: activeTab === 'feedback' ? (isDark ? 'var(--card-bg)' : 'white') : 'transparent',
              color: activeTab === 'feedback' ? (isDark ? 'var(--text-primary)' : '#212529') : (isDark ? '#aaa' : '#6c757d')
            }}
          >
            <MessageSquare size={18} className="me-2" />
            Feedback
            {feedbackStats && feedbackStats.new_count > 0 && (
              <span className="badge bg-danger ms-2">{feedbackStats.new_count}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
            style={{
              background: activeTab === 'suggestions' ? (isDark ? 'var(--card-bg)' : 'white') : 'transparent',
              color: activeTab === 'suggestions' ? (isDark ? 'var(--text-primary)' : '#212529') : (isDark ? '#aaa' : '#6c757d')
            }}
          >
            <Lightbulb size={18} className="me-2" />
            Hike Suggestions
            {suggestionStats && suggestionStats.new > 0 && (
              <span className="badge bg-danger ms-2">{suggestionStats.new}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <>
          {/* Stats Cards */}
          {feedbackStats && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total</h6>
                    <h3>{feedbackStats.total_feedback}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-primary mb-2">New</h6>
                    <h3>{feedbackStats.new_count}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-warning mb-2">In Progress</h6>
                    <h3>{feedbackStats.in_progress_count}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-success mb-2">Resolved</h6>
                    <h3>{feedbackStats.resolved_count}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-select"
                    value={feedbackFilterStatus}
                    onChange={(e) => setFeedbackFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Filter by Type</label>
                  <select
                    className="form-select"
                    value={feedbackFilterType}
                    onChange={(e) => setFeedbackFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="compliment">Compliment</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              {loading ? (
                <LoadingSpinner />
              ) : feedback.length === 0 ? (
                <p className="text-center text-muted my-4">No feedback found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Message</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <small>{new Date(item.created_at).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <div>
                              <strong>{item.user_name}</strong>
                              <br />
                              <small className="text-muted">{item.user_email}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getTypeBadge(item.feedback_type)}`}>
                              {item.feedback_type}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getFeedbackStatusBadge(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              <p className="mb-0">{item.message.substring(0, 100)}{item.message.length > 100 ? '...' : ''}</p>
                            </div>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleUpdateFeedbackStatus(item.id, 'in_progress')}
                                title="Mark as In Progress"
                              >
                                <Clock size={16} />
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleUpdateFeedbackStatus(item.id, 'dismissed')}
                                title="Dismiss"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteFeedback(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <>
          {/* Stats Cards */}
          {suggestionStats && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total</h6>
                    <h3>{suggestionStats.total}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-primary mb-2">New</h6>
                    <h3>{suggestionStats.new}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-warning mb-2">In Progress</h6>
                    <h3>{suggestionStats.in_progress}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
                  <div className="card-body">
                    <h6 className="text-success mb-2">Approved</h6>
                    <h3>{suggestionStats.approved}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-select"
                    value={suggestionFilterStatus}
                    onChange={(e) => setSuggestionFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Filter by Type</label>
                  <select
                    className="form-select"
                    value={suggestionFilterType}
                    onChange={(e) => setSuggestionFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="date_only">Date Only</option>
                    <option value="destination_only">Destination Only</option>
                    <option value="date_and_destination">Date and Destination</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="card" style={{ background: isDark ? 'var(--card-bg)' : 'white' }}>
            <div className="card-body">
              {loading ? (
                <LoadingSpinner />
              ) : suggestions.length === 0 ? (
                <p className="text-center text-muted my-4">No suggestions found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <small>{new Date(item.created_at).toLocaleDateString()}</small>
                          </td>
                          <td>
                            <div>
                              <strong>{item.user_name}</strong>
                              <br />
                              <small className="text-muted">{item.user_email}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getTypeBadge(item.suggestion_type)}`}>
                              {item.suggestion_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              {item.suggested_date && (
                                <div className="mb-1">
                                  <Calendar size={14} className="me-1" />
                                  <strong>Date:</strong> {new Date(item.suggested_date).toLocaleDateString()}
                                </div>
                              )}
                              {item.destination_name && (
                                <div className="mb-1">
                                  <MapPin size={14} className="me-1" />
                                  <strong>Destination:</strong> {item.destination_name}
                                </div>
                              )}
                              {item.destination_description && (
                                <div className="mb-1">
                                  <small className="text-muted">{item.destination_description.substring(0, 100)}{item.destination_description.length > 100 ? '...' : ''}</small>
                                </div>
                              )}
                              {item.message && (
                                <div className="mt-1">
                                  <small>{item.message.substring(0, 100)}{item.message.length > 100 ? '...' : ''}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getSuggestionStatusBadge(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleUpdateSuggestionStatus(item.id, 'approved')}
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => handleUpdateSuggestionStatus(item.id, 'in_progress')}
                                title="Mark as In Progress"
                              >
                                <Clock size={16} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleUpdateSuggestionStatus(item.id, 'rejected')}
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteSuggestion(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackPage;
