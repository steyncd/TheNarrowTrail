import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import EventTypeSelector from '../components/events/EventTypeSelector';
import TagSelector from '../components/events/TagSelector';
import HikingFields from '../components/events/eventTypes/HikingFields';
import CampingFields from '../components/events/eventTypes/CampingFields';
import FourWheelDriveFields from '../components/events/eventTypes/FourWheelDriveFields';
import OutdoorEventFields from '../components/events/eventTypes/OutdoorEventFields';
import CyclingFields from '../components/events/eventTypes/CyclingFields';
import { ArrowLeft } from 'lucide-react';

function AddEventPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Event type and tagging state
  const [eventType, setEventType] = useState('hiking');
  const [eventTypeData, setEventTypeData] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);

  const [eventData, setEventData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    status: 'gathering_interest',
    cost: 0,
    image_url: '',
    price_is_estimate: false,
    date_is_estimate: false,
    location_link: '',
    destination_website: '',
    gps_coordinates: '',
    registration_deadline: '',
    payment_deadline: '',
    registration_closed: false,
    pay_at_venue: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate common fields
    if (!eventData.name || !eventData.date) {
      setError('Event name and date are required');
      return;
    }

    // Validate target audience tag (compulsory)
    const hasTargetAudienceTag = selectedTags.some(tag => tag.category === 'target_audience');
    if (!hasTargetAudienceTag) {
      setError('Please select at least one target audience tag (Family Friendly, Mens Only, Ladies Only, etc.)');
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
        ...eventData,
        event_type: eventType,
        event_type_data: eventTypeData,
        // Ensure empty datetime fields are sent as null, not empty strings
        registration_deadline: eventData.registration_deadline || null,
        payment_deadline: eventData.payment_deadline || null
      };

      const result = await api.createHike(submissionData, token);

      if (result.success) {
        const eventId = result.id || result.hike?.id;

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

        // Navigate to manage events or event details
        navigate('/admin/manage-hikes');
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Create event error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="mb-0">Add New Event</h2>
          </div>

          {/* Form Card */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Event Type Selector */}
                <div className="mb-4">
                  <h6 className="mb-2">Event Type *</h6>
                  <EventTypeSelector
                    value={eventType}
                    onChange={setEventType}
                    disabled={loading}
                  />
                </div>

                {/* Common Fields for ALL Event Types */}
                <div className="row g-3 mb-4">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label">Event Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Event name"
                      value={eventData.name}
                      onChange={(e) => setEventData({...eventData, name: e.target.value})}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="col-md-6">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={eventData.date}
                      onChange={(e) => setEventData({...eventData, date: e.target.value})}
                      disabled={loading}
                      required
                    />
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dateEstimate"
                        checked={eventData.date_is_estimate}
                        onChange={(e) => setEventData({...eventData, date_is_estimate: e.target.checked})}
                        disabled={loading}
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
                      value={eventData.location}
                      onChange={(e) => setEventData({...eventData, location: e.target.value})}
                      disabled={loading}
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
                      value={eventData.cost}
                      onChange={(e) => setEventData({...eventData, cost: parseFloat(e.target.value) || 0})}
                      disabled={loading}
                    />
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="priceEstimate"
                        checked={eventData.price_is_estimate}
                        onChange={(e) => setEventData({...eventData, price_is_estimate: e.target.checked})}
                        disabled={loading}
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
                      value={eventData.status}
                      onChange={(e) => setEventData({...eventData, status: e.target.value})}
                      disabled={loading}
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
                      value={eventData.description}
                      onChange={(e) => setEventData({...eventData, description: e.target.value})}
                      disabled={loading}
                    />
                  </div>

                  {/* Event Image URL */}
                  <div className="col-md-6">
                    <label className="form-label">Event Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/image.jpg"
                      value={eventData.image_url}
                      onChange={(e) => setEventData({...eventData, image_url: e.target.value})}
                      disabled={loading}
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
                      value={eventData.gps_coordinates}
                      onChange={(e) => setEventData({...eventData, gps_coordinates: e.target.value})}
                      disabled={loading}
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
                      value={eventData.location_link}
                      onChange={(e) => setEventData({...eventData, location_link: e.target.value})}
                      disabled={loading}
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
                      value={eventData.destination_website}
                      onChange={(e) => setEventData({...eventData, destination_website: e.target.value})}
                      disabled={loading}
                    />
                    <small className="text-muted">Official event/destination website</small>
                  </div>
                </div>

                {/* Registration & Payment Settings */}
                <div className="mb-4">
                  <h6 className="mb-3">Registration & Payment Settings</h6>
                  <div className="row g-3">
                    {/* Registration Deadline */}
                    <div className="col-md-6">
                      <label className="form-label">Registration Deadline</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={eventData.registration_deadline}
                        onChange={(e) => setEventData({...eventData, registration_deadline: e.target.value})}
                        disabled={loading}
                      />
                      <small className="text-muted">Last date/time for registration</small>
                    </div>

                    {/* Payment Deadline */}
                    <div className="col-md-6">
                      <label className="form-label">Payment Deadline</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={eventData.payment_deadline}
                        onChange={(e) => setEventData({...eventData, payment_deadline: e.target.value})}
                        disabled={loading}
                      />
                      <small className="text-muted">Last date/time for payment</small>
                    </div>

                    {/* Registration Closed */}
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="registrationClosed"
                          checked={eventData.registration_closed}
                          onChange={(e) => setEventData({...eventData, registration_closed: e.target.checked})}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="registrationClosed">
                          <strong>Close Registration</strong>
                        </label>
                      </div>
                      <small className="text-muted">Manually close registration regardless of deadline</small>
                    </div>

                    {/* Pay at Venue */}
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="payAtVenue"
                          checked={eventData.pay_at_venue}
                          onChange={(e) => setEventData({...eventData, pay_at_venue: e.target.checked})}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="payAtVenue">
                          <strong>Pay at Venue/Destination</strong>
                        </label>
                      </div>
                      <small className="text-muted">Payment will be made directly at the venue</small>
                    </div>
                  </div>
                </div>

                {/* Event Type-Specific Fields */}
                <div className="mb-4">
                  <h6 className="mb-3">Event-Specific Details</h6>
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
                <div className="mb-4">
                  <h6 className="mb-2">Tags *</h6>
                  <p className="text-muted small">
                    Add tags to help users find your event. <strong className="text-danger">At least one target audience tag is required</strong> (Family Friendly, Mens Only, Ladies Only, etc.).
                  </p>
                  <TagSelector
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                    allowCustom={true}
                    maxTags={10}
                  />
                </div>

                {/* Form Actions */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEventPage;
