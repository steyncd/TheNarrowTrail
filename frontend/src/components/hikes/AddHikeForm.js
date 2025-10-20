import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import EventTypeSelector from '../events/EventTypeSelector';
import TagSelector from '../events/TagSelector';
import HikingFields from '../events/eventTypes/HikingFields';
import CampingFields from '../events/eventTypes/CampingFields';
import FourWheelDriveFields from '../events/eventTypes/FourWheelDriveFields';
import OutdoorEventFields from '../events/eventTypes/OutdoorEventFields';
import CyclingFields from '../events/eventTypes/CyclingFields';

function AddHikeForm({ show, onClose, hikeToEdit, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpxFile, setGpxFile] = useState(null);
  const [gpxData, setGpxData] = useState(null);
  const [processingGpx, setProcessingGpx] = useState(false);

  // Event type and tagging state
  const [eventType, setEventType] = useState('hiking');
  const [eventTypeData, setEventTypeData] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);

  const [hikeData, setHikeData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    group: 'family',
    status: 'gathering_interest',
    cost: 0,
    image_url: '',
    price_is_estimate: false,
    date_is_estimate: false,
    location_link: '',
    destination_website: '',
    gps_coordinates: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (hikeToEdit) {
        setHikeData({
          name: hikeToEdit.name || '',
          date: hikeToEdit.date ? hikeToEdit.date.split('T')[0] : '',
          location: hikeToEdit.location || '',
          description: hikeToEdit.description || '',
          group: hikeToEdit.group_type || 'family',
          status: hikeToEdit.status || 'gathering_interest',
          cost: hikeToEdit.cost || 0,
          image_url: hikeToEdit.image_url || '',
          price_is_estimate: hikeToEdit.price_is_estimate || false,
          date_is_estimate: hikeToEdit.date_is_estimate || false,
          location_link: hikeToEdit.location_link || '',
          destination_website: hikeToEdit.destination_website || '',
          gps_coordinates: hikeToEdit.gps_coordinates || ''
        });

        // Load event type and tags
        if (hikeToEdit.event_type) {
          setEventType(hikeToEdit.event_type);
        }
        if (hikeToEdit.event_type_data) {
          setEventTypeData(hikeToEdit.event_type_data);
        }

        // Load tags for this event
        if (hikeToEdit.id) {
          try {
            const tagsResponse = await api.getEventTags(hikeToEdit.id);
            if (tagsResponse.success && tagsResponse.tags) {
              setSelectedTags(tagsResponse.tags);
            }
          } catch (error) {
            console.error('Failed to load event tags:', error);
          }
        }
      } else {
        setHikeData({
          name: '',
          date: '',
          location: '',
          description: '',
          group: 'family',
          status: 'gathering_interest',
          cost: 0,
          image_url: '',
          price_is_estimate: false,
          date_is_estimate: false,
          location_link: '',
          destination_website: '',
          gps_coordinates: ''
        });
        setEventType('hiking');
        setEventTypeData({});
        setSelectedTags([]);
      }
      setError('');
    };

    if (show) {
      loadData();
    }
  }, [hikeToEdit, show]);

  const handleGpxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.gpx')) {
      setError('Please select a valid GPX file');
      return;
    }

    setGpxFile(file);
    setProcessingGpx(true);
    setError('');

    try {
      const fileContent = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid GPX file format');
      }

      // Extract metadata
      const metadata = xmlDoc.querySelector('metadata');
      const gpxName = metadata?.querySelector('name')?.textContent || file.name.replace('.gpx', '');
      const gpxDescription = metadata?.querySelector('desc')?.textContent || '';

      // Extract track points
      const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt')).map(point => ({
        lat: parseFloat(point.getAttribute('lat')),
        lon: parseFloat(point.getAttribute('lon')),
        ele: parseFloat(point.querySelector('ele')?.textContent || 0)
      }));

      if (trackPoints.length === 0) {
        throw new Error('No track points found in GPX file');
      }

      // Calculate statistics
      const stats = calculateTrackStats(trackPoints);

      // Format GPS coordinates (first point)
      const firstPoint = trackPoints[0];
      const gpsCoords = `${firstPoint.lat.toFixed(6)}, ${firstPoint.lon.toFixed(6)}`;

      // Update form data with GPX information
      setHikeData(prev => ({
        ...prev,
        name: prev.name || gpxName,
        description: prev.description || gpxDescription,
        distance: `${stats.distance.toFixed(1)} km`,
        gps_coordinates: gpsCoords
      }));

      setGpxData({
        name: gpxName,
        description: gpxDescription,
        trackPoints,
        stats
      });

    } catch (err) {
      console.error('GPX parsing error:', err);
      setError(err.message || 'Failed to process GPX file');
      setGpxFile(null);
      setGpxData(null);
    } finally {
      setProcessingGpx(false);
    }
  };

  const calculateTrackStats = (points) => {
    let totalDistance = 0;
    let totalElevationGain = 0;
    let totalElevationLoss = 0;
    let minElevation = points[0]?.ele || 0;
    let maxElevation = points[0]?.ele || 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = toRad(curr.lat - prev.lat);
      const dLon = toRad(curr.lon - prev.lon);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(prev.lat)) * Math.cos(toRad(curr.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;

      // Calculate elevation changes
      const elevDiff = curr.ele - prev.ele;
      if (elevDiff > 0) {
        totalElevationGain += elevDiff;
      } else {
        totalElevationLoss += Math.abs(elevDiff);
      }

      // Track min/max elevation
      minElevation = Math.min(minElevation, curr.ele);
      maxElevation = Math.max(maxElevation, curr.ele);
    }

    return {
      distance: totalDistance,
      elevationGain: Math.round(totalElevationGain),
      elevationLoss: Math.round(totalElevationLoss),
      minElevation: Math.round(minElevation),
      maxElevation: Math.round(maxElevation)
    };
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const clearGpxData = () => {
    setGpxFile(null);
    setGpxData(null);
  };

  const handleSubmit = async () => {
    setError('');

    // Validate common fields
    if (!hikeData.name || !hikeData.date) {
      setError('Event name and date are required');
      return;
    }

    // Validate event-type-specific required fields
    if (eventType === 'hiking') {
      if (!eventTypeData.difficulty) {
        setError('Difficulty is required for hiking events');
        return;
      }
      if (!eventTypeData.hike_type) {
        setError('Hike type (day/multi-day) is required for hiking events');
        return;
      }
    } else if (eventType === 'camping') {
      if (!eventTypeData.camping_type) {
        setError('Camping type is required for camping events');
        return;
      }
    } else if (eventType === '4x4') {
      if (!eventTypeData.difficulty) {
        setError('Difficulty level is required for 4x4 excursions');
        return;
      }
    } else if (eventType === 'cycling') {
      if (!eventTypeData.ride_type) {
        setError('Ride type is required for cycling events');
        return;
      }
      if (!eventTypeData.difficulty) {
        setError('Difficulty level is required for cycling events');
        return;
      }
    } else if (eventType === 'outdoor') {
      if (!eventTypeData.activity_type) {
        setError('Activity type is required for outdoor events');
        return;
      }
      if (eventTypeData.activity_type === 'other' && !eventTypeData.custom_activity_name) {
        setError('Please specify the activity name');
        return;
      }
    }

    setLoading(true);
    try {
      const submissionData = {
        ...hikeData,
        event_type: eventType,
        event_type_data: eventTypeData
      };

      let result;
      if (hikeToEdit) {
        result = await api.updateHike(hikeToEdit.id, submissionData, token);
      } else {
        result = await api.createHike(submissionData, token);
      }

      if (result.success) {
        const eventId = hikeToEdit ? hikeToEdit.id : (result.id || result.hike?.id);

        // Save tags if any are selected
        if (selectedTags.length > 0 && eventId) {
          try {
            const tagIds = selectedTags.map(tag => tag.id);
            await api.addEventTags(eventId, tagIds, token);
          } catch (tagError) {
            console.error('Failed to save tags:', tagError);
            // Don't fail the entire operation if tags fail
          }
        }

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to save event');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Save event error:', err);
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
              {hikeToEdit ? 'Edit Event' : 'Add New Event'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-2 px-md-3 py-3">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Event Type Selector */}
            <div className="mb-4">
              <h6 className="mb-2">Event Type</h6>
              <EventTypeSelector
                value={eventType}
                onChange={setEventType}
                disabled={loading}
              />
            </div>

            {/* Common Fields for ALL Event Types */}
            <div className="row g-3">
              {/* Name */}
              <div className="col-md-6">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Event name"
                  value={hikeData.name}
                  onChange={(e) => setHikeData({...hikeData, name: e.target.value})}
                />
              </div>

              {/* Date */}
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

              {/* Location */}
              <div className="col-md-6">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Table Mountain, Cape Town"
                  value={hikeData.location}
                  onChange={(e) => setHikeData({...hikeData, location: e.target.value})}
                />
                <small className="text-muted">City or landmark</small>
              </div>

              {/* Cost */}
              <div className="col-md-6">
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

              {/* Status */}
              <div className="col-12">
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

              {/* Description */}
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Describe the event..."
                  rows="3"
                  value={hikeData.description}
                  onChange={(e) => setHikeData({...hikeData, description: e.target.value})}
                />
              </div>

              {/* Event Image URL */}
              <div className="col-md-6">
                <label className="form-label">Event Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={hikeData.image_url}
                  onChange={(e) => setHikeData({...hikeData, image_url: e.target.value})}
                />
                <small className="text-muted">Link to event image</small>
              </div>

              {/* GPS Coordinates */}
              <div className="col-md-6">
                <label className="form-label">GPS Coordinates</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="-33.9249, 18.4241"
                  value={hikeData.gps_coordinates}
                  onChange={(e) => setHikeData({...hikeData, gps_coordinates: e.target.value})}
                />
                <small className="text-muted">Latitude, longitude</small>
              </div>

              {/* Location Link */}
              <div className="col-md-6">
                <label className="form-label">Location Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://maps.google.com/..."
                  value={hikeData.location_link}
                  onChange={(e) => setHikeData({...hikeData, location_link: e.target.value})}
                />
                <small className="text-muted">Google Maps or location link</small>
              </div>

              {/* Official Website URL */}
              <div className="col-md-6">
                <label className="form-label">Official Website URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://official-website.com"
                  value={hikeData.destination_website}
                  onChange={(e) => setHikeData({...hikeData, destination_website: e.target.value})}
                />
                <small className="text-muted">Official event/destination website</small>
              </div>
            </div>

            {/* Event Type-Specific Fields */}
            <div className="mt-4">
              {eventType === 'hiking' && (
                <HikingFields
                  data={eventTypeData}
                  onChange={setEventTypeData}
                />
              )}

              {eventType === 'camping' && (
                <CampingFields
                  data={eventTypeData}
                  onChange={setEventTypeData}
                />
              )}

              {eventType === '4x4' && (
                <FourWheelDriveFields
                  data={eventTypeData}
                  onChange={setEventTypeData}
                />
              )}

              {eventType === 'cycling' && (
                <CyclingFields
                  data={eventTypeData}
                  onChange={setEventTypeData}
                />
              )}

              {eventType === 'outdoor' && (
                <OutdoorEventFields
                  data={eventTypeData}
                  onChange={setEventTypeData}
                />
              )}
            </div>

            {/* Tags Section */}
            <div className="mt-4 mb-3">
              <h6 className="mb-2">Tags</h6>
              <p className="text-muted small">
                Add tags to help users find your event. Select from existing tags or create custom ones.
              </p>
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                allowCustom={true}
                maxTags={10}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : (hikeToEdit ? 'Update Event' : 'Add Event')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddHikeForm;
