import React from 'react';
import './CyclingFields.css';

const RIDE_TYPES = [
  { value: 'road', label: 'Road Cycling' },
  { value: 'mountain', label: 'Mountain Biking (MTB)' },
  { value: 'gravel', label: 'Gravel Riding' },
  { value: 'bmx', label: 'BMX' },
  { value: 'touring', label: 'Bike Touring' },
  { value: 'casual', label: 'Casual / Leisure Ride' }
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy - Flat, suitable for beginners' },
  { value: 'moderate', label: 'Moderate - Some hills, regular fitness needed' },
  { value: 'difficult', label: 'Difficult - Steep climbs, good fitness required' },
  { value: 'expert', label: 'Expert - Very challenging, excellent fitness required' }
];

const TERRAIN_TYPES = [
  { value: 'paved_road', label: 'Paved Road' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'singletrack', label: 'Singletrack' },
  { value: 'fireroad', label: 'Fire Road / Jeep Track' },
  { value: 'mixed', label: 'Mixed Terrain' },
  { value: 'technical', label: 'Technical Trails' }
];

const CyclingFields = ({ data = {}, onChange, errors = {} }) => {
  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const toggleTerrain = (terrain) => {
    const terrains = data.terrain_types || [];
    const updated = terrains.includes(terrain)
      ? terrains.filter(t => t !== terrain)
      : [...terrains, terrain];
    updateField('terrain_types', updated);
  };

  return (
    <div className="cycling-fields">
      <div className="row">
        <div className="col-12">
          <h5 className="section-title">Cycling Event Details</h5>
          <p className="text-muted">Provide specific information about this cycling event</p>
        </div>
      </div>

      <div className="row">
        {/* Ride Type */}
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              Ride Type <span className="text-danger">*</span>
            </label>
            <select
              value={data.ride_type || ''}
              onChange={(e) => updateField('ride_type', e.target.value)}
              className={`form-control ${errors.ride_type ? 'is-invalid' : ''}`}
            >
              <option value="">Select ride type</option>
              {RIDE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.ride_type && (
              <div className="invalid-feedback">{errors.ride_type}</div>
            )}
          </div>
        </div>

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
      </div>

      <div className="row">
        {/* Distance */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Distance</label>
            <input
              type="text"
              value={data.distance || ''}
              onChange={(e) => updateField('distance', e.target.value)}
              placeholder="e.g., 45km"
              className="form-control"
            />
            <small className="form-text text-muted">Total ride distance</small>
          </div>
        </div>

        {/* Elevation Gain */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Elevation Gain</label>
            <input
              type="text"
              value={data.elevation_gain || ''}
              onChange={(e) => updateField('elevation_gain', e.target.value)}
              placeholder="e.g., 850m"
              className="form-control"
            />
            <small className="form-text text-muted">Total climbing</small>
          </div>
        </div>

        {/* Estimated Duration */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Estimated Duration</label>
            <input
              type="text"
              value={data.duration || ''}
              onChange={(e) => updateField('duration', e.target.value)}
              placeholder="e.g., 3 hours"
              className="form-control"
            />
            <small className="form-text text-muted">Ride time</small>
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

      <div className="row">
        {/* Average Speed */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Average Pace</label>
            <input
              type="text"
              value={data.average_pace || ''}
              onChange={(e) => updateField('average_pace', e.target.value)}
              placeholder="e.g., 20 km/h"
              className="form-control"
            />
            <small className="form-text text-muted">Expected average speed</small>
          </div>
        </div>

        {/* Max Participants */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Max Riders</label>
            <input
              type="number"
              value={data.max_riders || ''}
              onChange={(e) => updateField('max_riders', parseInt(e.target.value) || '')}
              placeholder="20"
              min="1"
              className="form-control"
            />
            <small className="form-text text-muted">Group size limit</small>
          </div>
        </div>

        {/* Route Type */}
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Route Type</label>
            <select
              value={data.route_type || ''}
              onChange={(e) => updateField('route_type', e.target.value)}
              className="form-control"
            >
              <option value="">Select route type</option>
              <option value="loop">Loop / Circuit</option>
              <option value="out_and_back">Out and Back</option>
              <option value="point_to_point">Point to Point</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Required */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Required Equipment</label>
            <textarea
              value={data.equipment_required || ''}
              onChange={(e) => updateField('equipment_required', e.target.value)}
              placeholder="e.g., Mountain bike, helmet, spare tube, water bottles..."
              rows="2"
              className="form-control"
            />
            <small className="form-text text-muted">What riders need to bring</small>
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
                  checked={data.support_vehicle || false}
                  onChange={(e) => updateField('support_vehicle', e.target.checked)}
                />
                <span>Support Vehicle Provided</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.mechanical_support || false}
                  onChange={(e) => updateField('mechanical_support', e.target.checked)}
                />
                <span>Mechanical Support Available</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.refreshments_included || false}
                  onChange={(e) => updateField('refreshments_included', e.target.checked)}
                />
                <span>Refreshments Included</span>
              </label>

              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={data.sweep_rider || false}
                  onChange={(e) => updateField('sweep_rider', e.target.checked)}
                />
                <span>Sweep Rider (No one left behind)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Route Notes */}
      <div className="row">
        <div className="col-12">
          <div className="form-group">
            <label className="form-label">Route Notes & Safety Information</label>
            <textarea
              value={data.route_notes || ''}
              onChange={(e) => updateField('route_notes', e.target.value)}
              placeholder="Important route information, points of interest, safety considerations, traffic warnings..."
              rows="3"
              className="form-control"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyclingFields;
