import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

function AddHikeForm({ show, onClose, hikeToEdit, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hikeData, setHikeData] = useState({
    name: '',
    date: '',
    difficulty: 'Easy',
    distance: '',
    location: '',
    description: '',
    type: 'day',
    group: 'family',
    status: 'gathering_interest',
    cost: 0,
    image_url: '',
    destination_url: '',
    daily_distances: [],
    overnight_facilities: '',
    price_is_estimate: false,
    date_is_estimate: false,
    location_link: '',
    destination_website: ''
  });

  useEffect(() => {
    if (hikeToEdit) {
      setHikeData({
        name: hikeToEdit.name || '',
        date: hikeToEdit.date ? hikeToEdit.date.split('T')[0] : '',
        difficulty: hikeToEdit.difficulty || 'Easy',
        distance: hikeToEdit.distance || '',
        location: hikeToEdit.location || '',
        description: hikeToEdit.description || '',
        type: hikeToEdit.type || 'day',
        group: hikeToEdit.group_type || 'family',
        status: hikeToEdit.status || 'gathering_interest',
        cost: hikeToEdit.cost || 0,
        image_url: hikeToEdit.image_url || '',
        destination_url: hikeToEdit.destination_url || '',
        daily_distances: hikeToEdit.daily_distances || [],
        overnight_facilities: hikeToEdit.overnight_facilities || '',
        price_is_estimate: hikeToEdit.price_is_estimate || false,
        date_is_estimate: hikeToEdit.date_is_estimate || false,
        location_link: hikeToEdit.location_link || '',
        destination_website: hikeToEdit.destination_website || ''
      });
    } else {
      setHikeData({
        name: '',
        date: '',
        difficulty: 'Easy',
        distance: '',
        location: '',
        description: '',
        type: 'day',
        group: 'family',
        status: 'gathering_interest',
        cost: 0,
        image_url: '',
        destination_url: '',
        daily_distances: [],
        overnight_facilities: '',
        price_is_estimate: false,
        date_is_estimate: false,
        location_link: '',
        destination_website: ''
      });
    }
    setError('');
  }, [hikeToEdit, show]);

  const handleSubmit = async () => {
    setError('');
    if (!hikeData.name || !hikeData.date) {
      setError('Name and date are required');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty strings from daily_distances before sending
      const submissionData = {
        ...hikeData,
        daily_distances: Array.isArray(hikeData.daily_distances)
          ? hikeData.daily_distances.filter(d => d && d.trim())
          : []
      };

      let result;
      if (hikeToEdit) {
        result = await api.updateHike(hikeToEdit.id, submissionData, token);
      } else {
        result = await api.createHike(submissionData, token);
      }

      if (result.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to save hike');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Save hike error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto'}}>
      <div className="modal-dialog modal-lg mx-2 mx-md-auto my-2 my-md-3">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" style={{fontSize: 'clamp(0.9rem, 3vw, 1.25rem)'}}>
              {hikeToEdit ? 'Edit Hike' : 'Add New Hike'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-2 px-md-3 py-3">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Hike Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Hike name"
                  value={hikeData.name}
                  onChange={(e) => setHikeData({...hikeData, name: e.target.value})}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={hikeData.date}
                  onChange={(e) => setHikeData({...hikeData, date: e.target.value})}
                />
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="dateEstimate"
                    checked={hikeData.date_is_estimate}
                    onChange={(e) => setHikeData({...hikeData, date_is_estimate: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="dateEstimate">
                    <small>Date is estimate</small>
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Table Mountain, Cape Town"
                  value={hikeData.location}
                  onChange={(e) => setHikeData({...hikeData, location: e.target.value})}
                />
                <small className="text-muted">City or landmark for weather forecast</small>
              </div>
              <div className="col-md-3">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={hikeData.difficulty}
                  onChange={(e) => setHikeData({...hikeData, difficulty: e.target.value})}
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Distance</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 5km"
                  value={hikeData.distance}
                  onChange={(e) => setHikeData({...hikeData, distance: e.target.value})}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={hikeData.type}
                  onChange={(e) => setHikeData({...hikeData, type: e.target.value})}
                >
                  <option value="day">Day Hike</option>
                  <option value="multi">Multi-Day</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Cost (R)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Cost"
                  value={hikeData.cost}
                  onChange={(e) => setHikeData({...hikeData, cost: parseFloat(e.target.value) || 0})}
                />
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="priceEstimate"
                    checked={hikeData.price_is_estimate}
                    onChange={(e) => setHikeData({...hikeData, price_is_estimate: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="priceEstimate">
                    <small>Price is estimate</small>
                  </label>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Group Type</label>
                <select
                  className="form-select"
                  value={hikeData.group}
                  onChange={(e) => setHikeData({...hikeData, group: e.target.value})}
                >
                  <option value="family">Family Hike</option>
                  <option value="mens">Men's Hike</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={hikeData.status}
                  onChange={(e) => setHikeData({...hikeData, status: e.target.value})}
                >
                  <option value="gathering_interest">Gathering Interest</option>
                  <option value="pre_planning">Pre-Planning</option>
                  <option value="final_planning">Final Planning</option>
                  <option value="trip_booked">Trip Booked</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Description"
                  rows="3"
                  value={hikeData.description}
                  onChange={(e) => setHikeData({...hikeData, description: e.target.value})}
                />
              </div>

              {/* Image and Destination URL */}
              <div className="col-md-6">
                <label className="form-label">Hike Image URL (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/hike-image.jpg"
                  value={hikeData.image_url}
                  onChange={(e) => setHikeData({...hikeData, image_url: e.target.value})}
                />
                <small className="text-muted">Link to an image of the trail or destination</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Destination Website URL (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/trail-info"
                  value={hikeData.destination_url}
                  onChange={(e) => setHikeData({...hikeData, destination_url: e.target.value})}
                />
                <small className="text-muted">Link to trail/park website</small>
              </div>

              {/* Location and Destination Website Links */}
              <div className="col-md-6">
                <label className="form-label">Location Link (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://maps.google.com/..."
                  value={hikeData.location_link}
                  onChange={(e) => setHikeData({...hikeData, location_link: e.target.value})}
                />
                <small className="text-muted">Google Maps or location link</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Destination Official Website (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://park-website.com"
                  value={hikeData.destination_website}
                  onChange={(e) => setHikeData({...hikeData, destination_website: e.target.value})}
                />
                <small className="text-muted">Official park/destination website</small>
              </div>

              {/* Multi-Day Specific Fields */}
              {hikeData.type === 'multi' && (
                <>
                  <div className="col-12">
                    <hr className="my-3" />
                    <h6 className="text-info">Multi-Day Specific Details</h6>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Daily Distances</label>
                    <textarea
                      className="form-control"
                      placeholder="Day 1: 10km to base camp, Day 2: 12km to summit, Day 3: 8km return"
                      rows="2"
                      value={Array.isArray(hikeData.daily_distances) ? hikeData.daily_distances.join(', ') : ''}
                      onChange={(e) => setHikeData({...hikeData, daily_distances: e.target.value.split(',').map(d => d.trim())})}
                    />
                    <small className="text-muted">Separate each day with a comma</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Overnight Facilities</label>
                    <textarea
                      className="form-control"
                      placeholder="Campsite with basic amenities, huts with bunk beds, etc."
                      rows="3"
                      value={hikeData.overnight_facilities}
                      onChange={(e) => setHikeData({...hikeData, overnight_facilities: e.target.value})}
                    />
                    <small className="text-muted">Describe accommodation, camping facilities, amenities, etc.</small>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : (hikeToEdit ? 'Update Hike' : 'Add Hike')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddHikeForm;
