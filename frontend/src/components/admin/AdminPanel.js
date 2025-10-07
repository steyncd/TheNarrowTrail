import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import AddHikeForm from '../hikes/AddHikeForm';
import AttendanceModal from '../hikes/AttendanceModal';
import BulkActions from './BulkActions';
import PageHeader from '../common/PageHeader';

function AdminPanel() {
  const { token } = useAuth();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddHikeForm, setShowAddHikeForm] = useState(false);
  const [showEditHikeForm, setShowEditHikeForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [selectedHikes, setSelectedHikes] = useState([]);

  useEffect(() => {
    fetchHikes();
  }, []);

  const fetchHikes = async () => {
    try {
      const data = await api.getHikes(token);
      setHikes(data);
    } catch (err) {
      console.error('Error fetching hikes:', err);
    }
  };

  const handleDeleteHike = async (id) => {
    if (!window.confirm('Delete this hike?')) return;

    setLoading(true);
    try {
      const result = await api.deleteHike(id, token);
      if (result.success) {
        await fetchHikes();
      } else {
        alert(result.error || 'Failed to delete hike');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete hike');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditHike = (hike) => {
    setSelectedHike(hike);
    setShowEditHikeForm(true);
  };

  const handleOpenAttendance = (hike) => {
    setSelectedHike(hike);
    setShowAttendanceModal(true);
  };

  const handleViewEmergencyContacts = async () => {
    // This would open another modal or navigate to emergency contacts view
    // For now, we'll just alert
    alert('Emergency contacts feature - implement modal as needed');
  };

  const handleEditPackingList = async () => {
    // This would open the packing list editor modal
    // For now, we'll just alert
    alert('Packing list editor - implement modal as needed');
  };

  const handleSelectAll = () => {
    setSelectedHikes(hikes.map(h => h.id));
  };

  const handleDeselectAll = () => {
    setSelectedHikes([]);
  };

  const handleToggleHikeSelection = (hikeId) => {
    if (selectedHikes.includes(hikeId)) {
      setSelectedHikes(selectedHikes.filter(id => id !== hikeId));
    } else {
      setSelectedHikes([...selectedHikes, hikeId]);
    }
  };

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
    const isSelected = selectedHikes.includes(hike.id);

    return (
      <div key={hike.id} className="col-12">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-start gap-3 flex-grow-1 me-3" style={{minWidth: 0}}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleHikeSelection(hike.id)}
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div className="flex-grow-1" style={{minWidth: 0}}>
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
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2" style={{flexShrink: 0}}>
                <button
                  className="btn btn-sm btn-success"
                  style={{minHeight: '36px', minWidth: '90px'}}
                  onClick={() => handleOpenAttendance(hike)}
                  disabled={loading}
                >
                  View Details
                </button>
                <button
                  className="btn btn-sm btn-info"
                  style={{minHeight: '36px', minWidth: '60px'}}
                  onClick={() => handleOpenEditHike(hike)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  style={{minHeight: '36px', minWidth: '70px'}}
                  onClick={() => handleDeleteHike(hike.id)}
                  disabled={loading}
                >
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
    <div>
      <PageHeader
        icon={Settings}
        title="Manage Hikes"
        subtitle="Add, edit, and manage all hiking events"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setShowAddHikeForm(true)}
          >
            Add Hike
          </button>
        }
      />

      {/* Bulk Actions */}
      {hikes.length > 0 && (
        <BulkActions
          hikes={hikes}
          selectedHikes={selectedHikes}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSelectionChange={setSelectedHikes}
        />
      )}

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

      {hikes.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No hikes created yet. Click "Add Hike" to get started.</p>
        </div>
      )}

      {/* Add Hike Modal */}
      <AddHikeForm
        show={showAddHikeForm}
        onClose={() => setShowAddHikeForm(false)}
        onSuccess={fetchHikes}
      />

      {/* Edit Hike Modal */}
      <AddHikeForm
        show={showEditHikeForm}
        onClose={() => {
          setShowEditHikeForm(false);
          setSelectedHike(null);
        }}
        hikeToEdit={selectedHike}
        onSuccess={fetchHikes}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        show={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedHike(null);
        }}
        hikeId={selectedHike?.id}
        hikeName={selectedHike?.name}
        hikeData={selectedHike}
        onViewEmergencyContacts={handleViewEmergencyContacts}
        onEditPackingList={handleEditPackingList}
      />
    </div>
  );
}

export default AdminPanel;
