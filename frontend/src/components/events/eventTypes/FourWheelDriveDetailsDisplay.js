import React from 'react';
import { Truck, Gauge, Navigation, Shield, Wrench } from 'lucide-react';

const FourWheelDriveDetailsDisplay = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Convert slug to human-readable name
  const slugToName = (slug) => {
    return slug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderDifficultyBadge = (difficulty) => {
    const colors = {
      'Easy': 'success',
      'Moderate': 'warning',
      'Difficult': 'danger',
      'Extreme': 'danger'
    };
    return (
      <span className={`badge bg-${colors[difficulty] || 'secondary'}`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="event-type-details 4x4-details">
      <div className="row g-4">
        {/* Difficulty */}
        {data.difficulty && (
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center">
              <div className="me-3 flex-shrink-0" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gauge size={24} className="text-danger" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Trail Difficulty</small>
                {renderDifficultyBadge(data.difficulty)}
              </div>
            </div>
          </div>
        )}

        {/* Distance */}
        {data.distance && (
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center">
              <div className="me-3 flex-shrink-0" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Navigation size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Distance</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.distance}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Duration */}
        {data.duration && (
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center">
              <div className="me-3 flex-shrink-0" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(121, 85, 72, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck size={24} style={{ color: '#795548' }} />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Duration</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.duration}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terrain Types */}
      {data.terrain_types && data.terrain_types.length > 0 && (
        <div className="mt-4">
          <h6 className="mb-3">
            <Navigation size={18} className="me-2" />
            Terrain Types
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {data.terrain_types.map((terrain, idx) => {
              const terrainName = slugToName(terrain);
              return (
                <span key={idx} className="badge bg-warning text-dark">
                  {terrainName === 'Sand' && '🏜️'}
                  {terrainName === 'Mud' && '🟤'}
                  {terrainName === 'Rock' && '🪨'}
                  {terrainName === 'Water Crossings' && '🌊'}
                  {terrainName === 'Steep Inclines' && '⛰️'}
                  {terrainName === 'Forest' && '🌲'}
                  {terrainName === 'Mountain' && '⛰️'}
                  {' '}{terrainName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Vehicle Requirements */}
      {data.vehicle_requirements && data.vehicle_requirements.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">
            <Shield size={18} className="me-2" />
            Vehicle Requirements
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {data.vehicle_requirements.map((req, idx) => (
              <span key={idx} className="badge bg-danger">
                {slugToName(req)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Required Equipment */}
      {data.required_equipment && data.required_equipment.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">
            <Wrench size={18} className="me-2" />
            Required Equipment
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {data.required_equipment.map((item, idx) => (
              <span key={idx} className="badge bg-secondary">
                {slugToName(item)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Points */}
      {data.recovery_points && (
        <div className="mt-3">
          <div className="alert alert-info mb-0">
            <strong>Recovery Points:</strong> {data.recovery_points}
          </div>
        </div>
      )}

      {/* Technical Notes */}
      {data.technical_notes && (
        <div className="mt-3">
          <h6 className="mb-2">Technical Notes</h6>
          <p className="text-muted mb-0">{data.technical_notes}</p>
        </div>
      )}
    </div>
  );
};

export default FourWheelDriveDetailsDisplay;
