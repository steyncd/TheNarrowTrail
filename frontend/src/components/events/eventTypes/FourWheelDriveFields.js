import React from 'react';
import './FourWheelDriveFields.css';

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy - Gravel roads, suitable for stock vehicles' },
  { value: 'moderate', label: 'Moderate - Some rough sections, light modifications recommended' },
  { value: 'difficult', label: 'Difficult - Technical sections, experienced drivers only' },
  { value: 'extreme', label: 'Extreme - Very technical, winching may be required' }
];

const TERRAIN_TYPES = [
  { value: 'sand', label: 'Sand / Dunes' },
  { value: 'rock', label: 'Rock Crawling' },
  { value: 'mud', label: 'Mud' },
  { value: 'water', label: 'Water Crossings' },
  { value: 'mountain', label: 'Mountain Passes' },
  { value: 'mixed', label: 'Mixed Terrain' }
];

const VEHICLE_REQUIREMENTS = [
  { value: 'high_clearance', label: 'High Ground Clearance' },
  { value: 'diff_locks', label: 'Diff Locks' },
  { value: 'low_range', label: 'Low Range Transfer Case' },
  { value: 'mud_tires', label: 'Mud Terrain Tyres' },
  { value: 'recovery_points', label: 'Recovery Points' },
  { value: 'snorkel', label: 'Snorkel' },
  { value: 'winch', label: 'Winch' },
  { value: 'rock_sliders', label: 'Rock Sliders' }
];

const FourWheelDriveFields = ({ data = {}, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleRequirement = (requirement) => {
    const requirements = data.vehicle_requirements || [];
    const updated = requirements.includes(requirement)
      ? requirements.filter(r => r !== requirement)
      : [...requirements, requirement];
    updateField('vehicle_requirements', updated);
  };

  const toggleTerrain = (terrain) => {
    const terrains = data.terrain_types || [];
    const updated = terrains.includes(terrain)
      ? terrains.filter(t => t !== terrain)
      : [...terrains, terrain];
    updateField('terrain_types', updated);
  };

  return (
    <div className="fourwheeldrive-fields">
      <div className="row">
        <div className="col-12">
          <h5 className="section-title">4x4 Excursion Details</h5>
          <p className="text-muted">Provide specific information about the 4x4 route and requirements</p>
        </div>
      </div>

      <div className="row">
        {/* Difficulty */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              Difficulty Level <span className="text-danger">*</span>
            </label>
            <select
              value={data.difficulty || ''}
              onChange={(e) => updateField('difficulty', e.target.value)}
              className={`form-control ${errors.difficulty ? 'is-invalid' : ''}`}
            >
              <option value="">Select difficulty level</option>
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.difficulty && (
              <div className="invalid-feedback">{errors.difficulty}</div>
            )}
          </div>
        </div>

        {/* Distance */}
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Distance</label>
            <input
              type="text"
              value={data.distance || ''}
              onChange={(e) => updateField('distance', e.target.value)}
              placeholder="e.g., 45km"
              className="form-control"
            />
            <small className="form-text text-muted">Total route distance</small>
          </div>
        </div>

        {/* Duration */}
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Estimated Duration</label>
            <input
              type="text"
              value={data.duration || ''}
              onChange={(e) => updateField('duration', e.target.value)}
              placeholder="e.g., 6 hours"
              className="form-control"
            />
            <small className="form-text text-muted">Drive time</small>
          </div>
        </div>
      </div>

      {/* Terrain Types */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Terrain Types</label>
            <div className="terrain-grid">
              {TERRAIN_TYPES.map(terrain => (
                <label key={terrain.value} className="terrain-checkbox">
                  <input
                    type="checkbox"
                    checked={(data.terrain_types || []).includes(terrain.value)}
                    onChange={() => toggleTerrain(terrain.value)}
                  />
                  <span>{terrain.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Requirements */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Vehicle Requirements</label>
            <div className="requirements-grid">
              {VEHICLE_REQUIREMENTS.map(req => (
                <label key={req.value} className="requirement-checkbox">
                  <input
                    type="checkbox"
                    checked={(data.vehicle_requirements || []).includes(req.value)}
                    onChange={() => toggleRequirement(req.value)}
                  />
                  <span>{req.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Number of Vehicles */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Maximum Vehicles</label>
            <input
              type="number"
              value={data.max_vehicles || ''}
              onChange={(e) => updateField('max_vehicles', parseInt(e.target.value) || '')}
              placeholder="10"
              min="1"
              className="form-control"
            />
            <small className="form-text text-muted">Convoy size limit</small>
          </div>
        </div>

        {/* Recovery Equipment */}
        <div className="col-md-8">
          <div className="form-group">
            <label className="form-label">Required Recovery Equipment</label>
            <input
              type="text"
              value={data.recovery_equipment || ''}
              onChange={(e) => updateField('recovery_equipment', e.target.value)}
              placeholder="e.g., Recovery straps, shackles, spade"
              className="form-control"
            />
            <small className="form-text text-muted">Essential safety gear</small>
          </div>
        </div>
      </div>

      {/* Boolean Options */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <div className="boolean-options">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.radio_required || false}
                  onChange={(e) => updateField('radio_required', e.target.checked)}
                />
                <span>CB Radio Required</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.camping_overnight || false}
                  onChange={(e) => updateField('camping_overnight', e.target.checked)}
                />
                <span>Camping Overnight</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.trail_leader_provided || false}
                  onChange={(e) => updateField('trail_leader_provided', e.target.checked)}
                />
                <span>Trail Leader Provided</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Route Notes & Safety Information</label>
            <textarea
              value={data.route_notes || ''}
              onChange={(e) => updateField('route_notes', e.target.value)}
              placeholder="Important route information, obstacles to expect, safety considerations..."
              rows="3"
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourWheelDriveFields;
