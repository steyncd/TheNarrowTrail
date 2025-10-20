import React from 'react';
import './OutdoorEventFields.css';

const ACTIVITY_TYPES = [
  { value: 'mountain_biking', label: 'Mountain Biking' },
  { value: 'rock_climbing', label: 'Rock Climbing' },
  { value: 'kayaking', label: 'Kayaking / Canoeing' },
  { value: 'trail_running', label: 'Trail Running' },
  { value: 'bird_watching', label: 'Bird Watching' },
  { value: 'photography', label: 'Nature Photography' },
  { value: 'stargazing', label: 'Stargazing' },
  { value: 'geocaching', label: 'Geocaching' },
  { value: 'other', label: 'Other Activity' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner - No experience required' },
  { value: 'intermediate', label: 'Intermediate - Some experience helpful' },
  { value: 'advanced', label: 'Advanced - Experienced participants only' }
];

const OutdoorEventFields = ({ data = {}, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="outdoor-event-fields">
      <div className="row">
        <div className="col-12">
          <h5 className="section-title">Outdoor Event Details</h5>
          <p className="text-muted">Provide specific information about this outdoor activity</p>
        </div>
      </div>

      <div className="row">
        {/* Activity Type */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              Activity Type <span className="text-danger">*</span>
            </label>
            <select
              value={data.activity_type || ''}
              onChange={(e) => updateField('activity_type', e.target.value)}
              className={`form-control ${errors.activity_type ? 'is-invalid' : ''}`}
            >
              <option value="">Select activity type</option>
              {ACTIVITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.activity_type && (
              <div className="invalid-feedback">{errors.activity_type}</div>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <select
              value={data.difficulty || ''}
              onChange={(e) => updateField('difficulty', e.target.value)}
              className="form-control"
            >
              <option value="">Select difficulty level</option>
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Activity Name (if Other selected) */}
      {data.activity_type === 'other' && (
        <div className="row">
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">
                Activity Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={data.custom_activity_name || ''}
                onChange={(e) => updateField('custom_activity_name', e.target.value)}
                placeholder="Specify the activity"
                className={`form-control ${errors.custom_activity_name ? 'is-invalid' : ''}`}
              />
              {errors.custom_activity_name && (
                <div className="invalid-feedback">{errors.custom_activity_name}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Duration */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input
              type="text"
              value={data.duration || ''}
              onChange={(e) => updateField('duration', e.target.value)}
              placeholder="e.g., 3 hours"
              className="form-control"
            />
            <small className="form-text text-muted">Estimated time</small>
          </div>
        </div>

        {/* Physical Level */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Physical Level Required</label>
            <select
              value={data.physical_level || ''}
              onChange={(e) => updateField('physical_level', e.target.value)}
              className="form-control"
            >
              <option value="">Select level</option>
              <option value="low">Low - Minimal physical activity</option>
              <option value="moderate">Moderate - Some fitness required</option>
              <option value="high">High - Good fitness required</option>
              <option value="very_high">Very High - Excellent fitness required</option>
            </select>
          </div>
        </div>

        {/* Max Participants */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Max Participants</label>
            <input
              type="number"
              value={data.max_participants || ''}
              onChange={(e) => updateField('max_participants', parseInt(e.target.value) || '')}
              placeholder="20"
              min="1"
              className="form-control"
            />
            <small className="form-text text-muted">Group size limit</small>
          </div>
        </div>
      </div>

      {/* Equipment Required */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Equipment Required</label>
            <textarea
              value={data.equipment_required || ''}
              onChange={(e) => updateField('equipment_required', e.target.value)}
              placeholder="List any equipment participants need to bring (e.g., bicycle, helmet, water bottle...)"
              rows="2"
              className="form-control"
            />
            <small className="form-text text-muted">What participants should bring</small>
          </div>
        </div>
      </div>

      {/* Boolean Options */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Event Options</label>
            <div className="boolean-options">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.equipment_provided || false}
                  onChange={(e) => updateField('equipment_provided', e.target.checked)}
                />
                <span>Equipment Provided / Available for Rent</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.guide_included || false}
                  onChange={(e) => updateField('guide_included', e.target.checked)}
                />
                <span>Professional Guide Included</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.refreshments_included || false}
                  onChange={(e) => updateField('refreshments_included', e.target.checked)}
                />
                <span>Refreshments Included</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Activity Details */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Activity Description & What to Expect</label>
            <textarea
              value={data.activity_details || ''}
              onChange={(e) => updateField('activity_details', e.target.value)}
              placeholder="Describe the activity, what participants will do, highlights, safety considerations..."
              rows="4"
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutdoorEventFields;
