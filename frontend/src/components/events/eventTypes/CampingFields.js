import React from 'react';
import './CampingFields.css';

const CAMPING_TYPES = [
  { value: 'bush_camping', label: 'Bush Camping' },
  { value: 'established_campsite', label: 'Established Campsite' },
  { value: 'glamping', label: 'Glamping' },
  { value: 'caravan_park', label: 'Caravan Park' },
  { value: 'backpacking', label: 'Backpacking / Hiking Trail' }
];

const FACILITIES = [
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity (220V)' },
  { value: 'ablutions', label: 'Ablutions / Toilets' },
  { value: 'hot_showers', label: 'Hot Showers' },
  { value: 'braai_facilities', label: 'Braai Facilities' },
  { value: 'wood_available', label: 'Firewood Available' },
  { value: 'shop', label: 'Shop / Kiosk' },
  { value: 'restaurant', label: 'Restaurant' }
];

const VEHICLE_ACCESS = [
  { value: 'direct', label: 'Direct to Site' },
  { value: 'parking_nearby', label: 'Parking Nearby (Walk-in)' },
  { value: '4x4_required', label: '4x4 Required' },
  { value: 'no_vehicle', label: 'No Vehicle Access (Hike-in)' }
];

const CampingFields = ({ data = {}, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleFacility = (facility) => {
    const facilities = data.facilities || [];
    const updated = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    updateField('facilities', updated);
  };

  return (
    <div className="camping-fields">
      <div className="row">
        <div className="col-12">
          <h5 className="section-title">Camping Details</h5>
          <p className="text-muted">Provide specific information about the camping experience</p>
        </div>
      </div>

      <div className="row">
        {/* Camping Type */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              Camping Type <span className="text-danger">*</span>
            </label>
            <select
              value={data.camping_type || ''}
              onChange={(e) => updateField('camping_type', e.target.value)}
              className={`form-control ${errors.camping_type ? 'is-invalid' : ''}`}
            >
              <option value="">Select camping type</option>
              {CAMPING_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.camping_type && (
              <div className="invalid-feedback">{errors.camping_type}</div>
            )}
          </div>
        </div>

        {/* Number of Nights */}
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Number of Nights</label>
            <input
              type="number"
              value={data.nights || ''}
              onChange={(e) => updateField('nights', parseInt(e.target.value) || '')}
              placeholder="2"
              min="1"
              className="form-control"
            />
            <small className="form-text text-muted">Duration</small>
          </div>
        </div>

        {/* Site Capacity */}
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Site Capacity</label>
            <input
              type="number"
              value={data.site_capacity || ''}
              onChange={(e) => updateField('site_capacity', parseInt(e.target.value) || 0)}
              placeholder="6"
              min="1"
              className="form-control"
            />
            <small className="form-text text-muted">People per site</small>
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Facilities Available</label>
            <div className="facilities-grid">
              {FACILITIES.map(facility => (
                <label key={facility.value} className="facility-checkbox">
                  <input
                    type="checkbox"
                    checked={(data.facilities || []).includes(facility.value)}
                    onChange={() => toggleFacility(facility.value)}
                  />
                  <span>{facility.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Camping Fees */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Camping Fees</label>
            <input
              type="text"
              value={data.camping_fees || ''}
              onChange={(e) => updateField('camping_fees', e.target.value)}
              placeholder="e.g., R150 per night"
              className="form-control"
            />
            <small className="form-text text-muted">
              Include pricing information and payment details
            </small>
          </div>
        </div>

        {/* Vehicle Access */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Vehicle Access</label>
            <select
              value={data.vehicle_access || ''}
              onChange={(e) => updateField('vehicle_access', e.target.value)}
              className="form-control"
            >
              <option value="">Select access type</option>
              {VEHICLE_ACCESS.map(access => (
                <option key={access.value} value={access.value}>
                  {access.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Boolean Options */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Additional Options</label>
            <div className="boolean-options">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.fire_allowed || false}
                  onChange={(e) => updateField('fire_allowed', e.target.checked)}
                />
                <span>Fire/Braai Allowed</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.pets_allowed || false}
                  onChange={(e) => updateField('pets_allowed', e.target.checked)}
                />
                <span>Pets Allowed</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.reservation_required || false}
                  onChange={(e) => updateField('reservation_required', e.target.checked)}
                />
                <span>Reservation Required</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Additional Camping Notes</label>
            <textarea
              value={data.additional_notes || ''}
              onChange={(e) => updateField('additional_notes', e.target.value)}
              placeholder="Any other important information about the camping site..."
              rows="3"
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampingFields;
