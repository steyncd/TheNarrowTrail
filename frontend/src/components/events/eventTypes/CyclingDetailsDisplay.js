import React from 'react';
import { Bike, Gauge, Navigation, TrendingUp, Clock } from 'lucide-react';

const CyclingDetailsDisplay = ({ data }) => {
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
      'Challenging': 'danger',
      'Expert': 'danger'
    };
    return (
      <span className={`badge bg-${colors[difficulty] || 'secondary'}`}>
        {difficulty}
      </span>
    );
  };

  const renderRideTypeBadge = (type) => {
    const colors = {
      'Road Cycling': 'primary',
      'Mountain Biking': 'success',
      'Gravel Riding': 'warning',
      'Bikepacking': 'dark',
      'Casual Ride': 'info'
    };
    return (
      <span className={`badge bg-${colors[type] || 'secondary'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="event-type-details cycling-details">
      <div className="row g-4">
        {/* Ride Type */}
        {data.ride_type && (
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
                <Bike size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Ride Type</small>
                {renderRideTypeBadge(data.ride_type)}
              </div>
            </div>
          </div>
        )}

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
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Difficulty</small>
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
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Navigation size={24} className="text-warning" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Distance</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.distance}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Elevation Gain */}
        {data.elevation_gain && (
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center">
              <div className="me-3 flex-shrink-0" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} className="text-success" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Elevation Gain</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.elevation_gain}</strong>
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
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Estimated Duration</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.duration}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Average Speed */}
        {data.average_speed && (
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center">
              <div className="me-3 flex-shrink-0" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gauge size={24} className="text-info" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Average Speed</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.average_speed}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Type */}
      {data.route_type && (
        <div className="mt-3">
          <small className="text-muted d-block">Route Type</small>
          <span className="badge bg-info">{data.route_type}</span>
        </div>
      )}

      {/* Terrain */}
      {data.terrain && data.terrain.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">Terrain</h6>
          <div className="d-flex flex-wrap gap-2">
            {data.terrain.map((terrain, idx) => {
              const terrainName = slugToName(terrain);
              return (
                <span key={idx} className="badge bg-warning text-dark">
                  {terrainName === 'Paved Roads' && '🛣️'}
                  {terrainName === 'Gravel' && '🪨'}
                  {terrainName === 'Dirt Trails' && '🟤'}
                  {terrainName === 'Singletrack' && '🌲'}
                  {terrainName === 'Technical' && '⚠️'}
                  {' '}{terrainName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Bike Type Recommendation */}
      {data.bike_type_recommendation && (
        <div className="mt-3">
          <div className="alert alert-info mb-0">
            <strong>Recommended Bike:</strong> {data.bike_type_recommendation}
          </div>
        </div>
      )}

      {/* Support Vehicle */}
      {data.support_vehicle !== undefined && (
        <div className="mt-3">
          <small className="text-muted d-block">Support Vehicle</small>
          <span className={`badge bg-${data.support_vehicle ? 'success' : 'secondary'}`}>
            {data.support_vehicle ? 'Available' : 'Not Available'}
          </span>
        </div>
      )}

      {/* Refreshment Stops */}
      {data.refreshment_stops && (
        <div className="mt-3">
          <small className="text-muted d-block">Refreshment Stops</small>
          <p className="mb-0">{data.refreshment_stops}</p>
        </div>
      )}
    </div>
  );
};

export default CyclingDetailsDisplay;
