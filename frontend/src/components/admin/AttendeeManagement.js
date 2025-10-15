import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Package, Users, Plus, Eye, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PaymentsSection from '../payments/PaymentsSection';
import ExpensesSection from '../payments/ExpensesSection';

function AttendeeManagement({ hikeId, hikeName, hikeCost, onViewEmergencyContacts, onEditPackingList }) {
  const { token } = useAuth();
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [users, setUsers] = useState([]);
  const [newAttendee, setNewAttendee] = useState({
    user_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hikeId) {
      fetchAttendanceData();
      fetchUsers();
    }
  }, [hikeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAttendanceData = async () => {
    try {
      const [interestedData, attendeesData] = await Promise.all([
        api.getInterestedUsers(hikeId, token),
        api.getAttendees(hikeId, token)
      ]);
      
      // Handle different response formats
      const interestedArray = Array.isArray(interestedData) ? interestedData : 
                             (interestedData?.data ? interestedData.data : []);
      const attendeesArray = Array.isArray(attendeesData) ? attendeesData : 
                            (attendeesData?.data ? attendeesData.data : []);
      
      setInterestedUsers(interestedArray);
      setAttendees(attendeesArray);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await api.getUsers(token);
      // Backend returns { users: [...], pagination: {...} } or just [...]
      const usersArray = Array.isArray(usersData) ? usersData :
                        (usersData?.users ? usersData.users : []);
      setUsers(usersArray);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleAddAttendee = async () => {
    setError('');
    if (!newAttendee.user_id) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    try {
      const result = await api.addAttendee(hikeId, { ...newAttendee, payment_status: 'pending', amount_paid: 0 }, token);
      if (result.success) {
        setNewAttendee({ user_id: '' });
        await fetchAttendanceData();
      } else {
        setError(result.error || 'Failed to add attendee');
      }
    } catch (err) {
      setError('Failed to add attendee');
      console.error('Add attendee error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttendee = async (userId) => {
    if (!window.confirm('Remove this attendee?')) return;

    setLoading(true);
    try {
      const result = await api.removeAttendee(hikeId, userId, token);
      if (result.success) {
        await fetchAttendanceData();
      } else {
        setError(result.error || 'Failed to remove attendee');
      }
    } catch (err) {
      console.error('Remove attendee error:', err);
      setError('Failed to remove attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterestedAsAttendee = async (userId) => {
    setLoading(true);
    try {
      const result = await api.addAttendee(hikeId, { user_id: userId, payment_status: 'unpaid', amount_paid: 0 }, token);
      if (result.success) {
        await fetchAttendanceData();
      } else {
        setError(result.error || 'Failed to add attendee');
      }
    } catch (err) {
      setError('Failed to add attendee');
      console.error('Add interested as attendee error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInterested = async (userId) => {
    if (!window.confirm('Remove this person from interested list?')) return;

    setLoading(true);
    try {
      const result = await api.removeInterest(hikeId, userId, token);
      if (result.success) {
        await fetchAttendanceData();
      } else {
        setError(result.error || 'Failed to remove from interested list');
      }
    } catch (err) {
      console.error('Remove interested error:', err);
      setError('Failed to remove from interested list');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableUsers = () => {
    const attendeeIds = attendees.map(a => a.user_id);
    return users.filter(user => !attendeeIds.includes(user.id));
  };

  if (loading && !interestedUsers.length && !attendees.length) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="attendee-management">
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={16} className="me-2" />
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <Package size={16} className="me-2" />
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {onViewEmergencyContacts && (
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={onViewEmergencyContacts}
                  >
                    <Eye size={14} className="me-1" />
                    View Emergency Contacts
                  </button>
                )}
                {onEditPackingList && (
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={onEditPackingList}
                  >
                    <Package size={14} className="me-1" />
                    Manage Packing List
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <Plus size={16} className="me-2" />
                Add New Attendee
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={newAttendee.user_id}
                    onChange={(e) => setNewAttendee({...newAttendee, user_id: e.target.value})}
                  >
                    <option value="">Select User...</option>
                    {getAvailableUsers().map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleAddAttendee}
                    disabled={loading || !newAttendee.user_id}
                  >
                    <Plus size={14} className="me-1" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Attendees */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <UserCheck size={20} className="me-2" />
            Confirmed Attendees ({attendees.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {attendees.length === 0 ? (
            <div className="p-3 text-center text-muted">
              No confirmed attendees yet
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.user_id}>
                      <td>
                        <Link
                          to={`/admin/users/${attendee.user_id}`}
                          className="text-decoration-none fw-medium"
                        >
                          {attendee.name}
                        </Link>
                      </td>
                      <td>{attendee.email}</td>
                      <td>{attendee.phone || 'Not provided'}</td>
                      <td>
                        <span className="badge bg-success">
                          Confirmed
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveAttendee(attendee.user_id)}
                          disabled={loading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Interested Users */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">
            <Users size={20} className="me-2" />
            Interested Users ({interestedUsers.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {interestedUsers.length === 0 ? (
            <div className="p-3 text-center text-muted">
              No interested users yet
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Interest Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td>
                        <Link
                          to={`/admin/users/${user.user_id}`}
                          className="text-decoration-none fw-medium"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'Not provided'}</td>
                      <td>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleAddInterestedAsAttendee(user.user_id)}
                            disabled={loading}
                            title="Confirm as attendee"
                          >
                            <UserCheck size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleRemoveInterested(user.user_id)}
                            disabled={loading}
                            title="Remove interest"
                          >
                            <Trash2 size={14} />
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

      {/* Payments Section */}
      {attendees.length > 0 && (
        <PaymentsSection
          hikeId={hikeId}
          hikeName={hikeName}
          hikeCost={hikeCost}
          isAdmin={true}
        />
      )}

      {/* Expenses Section */}
      <ExpensesSection
        hikeId={hikeId}
        isAdmin={true}
      />
    </div>
  );
}

export default AttendeeManagement;