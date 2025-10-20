import React from 'react';
import './HikingFields.css';

const HikingFields = ({ data = {}, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="hiking-fields">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Difficulty *</label>
          <select
            className={`form-select ${errors.difficulty ? 'is-invalid' : ''}`}
            value={data.difficulty || 'Moderate'}
            onChange={(e) => updateField('difficulty', e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Difficult">Difficult</option>
            <option value="Strenuous">Strenuous</option>
          </select>
          {errors.difficulty && (
            <div className="invalid-feedback">{errors.difficulty}</div>
          )}
          <small className="text-muted">Physical difficulty level</small>
        </div>

        <div className="col-md-4">
          <label className="form-label">Hike Type *</label>
          <select
            className={`form-select ${errors.hike_type ? 'is-invalid' : ''}`}
            value={data.hike_type || 'day'}
            onChange={(e) => updateField('hike_type', e.target.value)}
          >
            <option value="day">Day Hike</option>
            <option value="multi">Multi-Day Hike</option>
          </select>
          {errors.hike_type && (
            <div className="invalid-feedback">{errors.hike_type}</div>
          )}
          <small className="text-muted">Duration of the hike</small>
        </div>

        <div className="col-md-4">
          <label className="form-label">Distance</label>
          <input
            type="text"
            className={`form-control ${errors.distance ? 'is-invalid' : ''}`}
            placeholder="e.g., 12km"
            value={data.distance || ''}
            onChange={(e) => updateField('distance', e.target.value)}
          />
          {errors.distance && (
            <div className="invalid-feedback">{errors.distance}</div>
          )}
          <small className="text-muted">Total hiking distance</small>
        </div>

        {/* Multi-Day Specific Fields */}
        {data.hike_type === 'multi' && (
          <>
            <div className="col-12">
              <hr className="my-2" />
              <h6 className="text-info mb-3">Multi-Day Hike Details</h6>
            </div>

            <div className="col-12">
              <label className="form-label">Daily Distances</label>
              <textarea
                className="form-control"
                placeholder="Day 1: 10km to base camp, Day 2: 12km to summit, Day 3: 8km return"
                rows="2"
                value={Array.isArray(data.daily_distances) ? data.daily_distances.join(', ') : ''}
                onChange={(e) => updateField('daily_distances', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
              />
              <small className="text-muted">Separate each day with a comma</small>
            </div>

            <div className="col-12">
              <label className="form-label">Overnight Facilities</label>
              <textarea
                className="form-control"
                placeholder="Campsite with basic amenities, mountain huts with bunk beds, etc."
                rows="3"
                value={data.overnight_facilities || ''}
                onChange={(e) => updateField('overnight_facilities', e.target.value)}
              />
              <small className="text-muted">Describe accommodation, camping facilities, amenities, etc.</small>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HikingFields;
