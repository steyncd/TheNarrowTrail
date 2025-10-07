import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Package, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

function AttendanceModal({ show, onClose, hikeId, hikeName, hikeData, onViewEmergencyContacts, onEditPackingList }) {
  const { token } = useAuth();
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [users, setUsers] = useState([]);
  const [newAttendee, setNewAttendee] = useState({
    user_id: '',
    payment_status: 'unpaid',
    amount_paid: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && hikeId) {
      fetchAttendanceData();
      fetchUsers();
    }
  }, [show, hikeId]);

  const fetchAttendanceData = async () => {
    try {
      const [interestedData, attendeesData] = await Promise.all([
        api.getInterestedUsers(hikeId, token),
        api.getAttendees(hikeId, token)
      ]);
      setInterestedUsers(interestedData);
      setAttendees(attendeesData);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await api.getUsers(token);
      setUsers(usersData);
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
      const result = await api.addAttendee(hikeId, newAttendee, token);
      if (result.success) {
        setNewAttendee({ user_id: '', payment_status: 'unpaid', amount_paid: 0, notes: '' });
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

  const handleUpdateAttendee = async (userId, data) => {
    setLoading(true);
    try {
      const result = await api.updateAttendee(hikeId, userId, data, token);
      if (result.success) {
        await fetchAttendanceData();
      } else {
        setError(result.error || 'Failed to update attendee');
      }
    } catch (err) {
      console.error('Update attendee error:', err);
      setError('Failed to update attendee');
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
      console.error('Add attendee error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
      <div className="modal-dialog modal-xl mx-2 mx-md-auto my-2 my-md-3">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
              {hikeName} - Attendee Management
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-2 px-md-3 py-3">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Hike Details Section */}
            {hikeData && (
              <div className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <p className="mb-2"><strong>Description:</strong> {hikeData.description}</p>
                      <p className="mb-2"><strong>Date:</strong> {new Date(hikeData.date).toLocaleDateString()}</p>
                      <p className="mb-2">
                        <strong>Distance:</strong> {hikeData.distance} | <strong>Difficulty:</strong> {hikeData.difficulty}
                      </p>
                      {hikeData.cost > 0 && <p className="mb-0"><strong>Cost:</strong> R{hikeData.cost}</p>}
                    </div>
                    <div className="col-md-4">
                      {hikeData.image_url && (
                        <img
                          src={hikeData.image_url}
                          alt={hikeData.name}
                          className="img-fluid rounded shadow-sm"
                          style={{maxHeight: '150px', width: '100%', objectFit: 'cover'}}
                        />
                      )}
                      {hikeData.destination_url && (
                        <a
                          href={hikeData.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-info mt-2 w-100"
                        >
                          <MapPin size={14} className="me-1" />
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                          <td>
                            <Link to={`/profile/${user.id}`} className="text-decoration-none">
                              {user.name}
                            </Link>
                          </td>
                          <td className="small">
                            {user.email}<br/>{user.phone}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAddInterestedAsAttendee(user.id)}
                              disabled={loading}
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
                          <td>
                            <Link to={`/profile/${attendee.user_id}`} className="text-decoration-none">
                              {attendee.name}
                            </Link>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={attendee.payment_status}
                              onChange={(e) => handleUpdateAttendee(attendee.user_id, {
                                ...attendee,
                                payment_status: e.target.value
                              })}
                              disabled={loading}
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
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                  handleUpdateAttendee(attendee.user_id, {
                                    ...attendee,
                                    amount_paid: value === '' ? 0 : parseFloat(value) || 0
                                  });
                                }
                              }}
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveAttendee(attendee.user_id)}
                              disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setNewAttendee({...newAttendee, amount_paid: value === '' ? 0 : parseFloat(value) || 0});
                      }
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={handleAddAttendee}
                    disabled={loading}
                  >
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
              onClick={onViewEmergencyContacts}
              disabled={loading || attendees.length === 0}
            >
              <AlertCircle size={16} className="me-1" />
              View Emergency Contacts
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={onEditPackingList}
              disabled={loading}
            >
              <Package size={16} className="me-1" />
              Edit Packing List
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceModal;
