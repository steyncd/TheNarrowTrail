import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, CheckCircle, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import AddHikeForm from '../hikes/AddHikeForm';

function AdminPanel({ showAddHikeForm, setShowAddHikeForm }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [hikes, setHikes] = useState([]);
  const [showEditHikeForm, setShowEditHikeForm] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchHikes = useCallback(async () => {
    try {
      const data = await api.getHikes(token);
      setHikes(data);
    } catch (err) {
      console.error('Error fetching hikes:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchHikes();
  }, [fetchHikes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);



  const handleManageHike = (hike) => {
    navigate(`/manage-hikes/${hike.id}`);
  };

  // Filter hikes based on search and filter criteria
  const filteredHikes = hikes.filter(hike => {
    const matchesSearch = hike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hike.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hike.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || hike.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = new Date(hike.date) >= new Date();
    } else if (dateFilter === 'past') {
      matchesDate = new Date(hike.date) < new Date();
    } else if (dateFilter === 'this-month') {
      const now = new Date();
      const hikeDate = new Date(hike.date);
      matchesDate = hikeDate.getMonth() === now.getMonth() && hikeDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Categorize filtered hikes
  const now = new Date();
  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const upcomingSoon = filteredHikes.filter(h => {
    const hikeDate = new Date(h.date);
    return hikeDate >= now && hikeDate <= twoMonthsFromNow;
  });

  const future = filteredHikes.filter(h => {
    const hikeDate = new Date(h.date);
    return hikeDate > twoMonthsFromNow;
  });

  const past = filteredHikes.filter(h => {
    const hikeDate = new Date(h.date);
    return hikeDate < now;
  });

  const renderManageHike = (hike, isPast = false) => {
    const displayStatus = isPast ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled') : hike.status;

    return (
      <div key={hike.id} className="col-12">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1 me-3" style={{minWidth: 0}}>
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
              <div style={{flexShrink: 0}}>
                <button
                  className="btn btn-sm btn-primary"
                  style={{minHeight: '36px', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}
                  onClick={() => handleManageHike(hike)}
                >
                  <Settings size={16} />
                  Manage
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
      {/* Search and Filter Controls */}
      {hikes.length > 0 && (
        <div className="card mb-4">
          <div className="card-body py-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small mb-1">Search hikes</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="gathering_interest">Gathering Interest</option>
                  <option value="pre_planning">Pre Planning</option>
                  <option value="final_planning">Final Planning</option>
                  <option value="trip_booked">Trip Booked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Date Range</label>
                <select
                  className="form-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
              <div className="col-md-2">
                <div className="text-muted small">
                  {filteredHikes.length} of {hikes.length} hikes
                </div>
              </div>
            </div>
          </div>
        </div>
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


    </div>
  );
}

export default AdminPanel;
