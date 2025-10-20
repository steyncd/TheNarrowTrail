import React from 'react';
import { Mountain, Gauge, Calendar, Users, Navigation } from 'lucide-react';

const HikingDetailsDisplay = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const renderDifficultyBadge = (difficulty) => {
    const colors = {
      'Easy': 'success',
      'Moderate': 'warning',
      'Challenging': 'danger',
      'Strenuous': 'danger'
    };
    return (
      <span className={`badge bg-${colors[difficulty] || 'secondary'}`}>
        {difficulty}
      </span>
    );
  };

  const renderHikeTypeBadge = (type) => {
    const colors = {
      'Day Hike': 'info',
      'Overnight': 'primary',
      'Multi-Day': 'primary',
      'Backpacking': 'dark'
    };
    return (
      <span className={`badge bg-${colors[type] || 'secondary'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="event-type-details hiking-details">
      <div className="row g-4">
        {/* Difficulty */}
        {data.difficulty && (
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
                <Gauge size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Difficulty</small>
                {renderDifficultyBadge(data.difficulty)}
              </div>
            </div>
          </div>
        )}

        {/* Hike Type */}
        {data.hike_type && (
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
                <Mountain size={24} className="text-success" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Hike Type</small>
                {renderHikeTypeBadge(data.hike_type)}
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

        {/* Group Type removed - now using target audience tags in main event display */}
      </div>

      {/* Multi-Day Specific Fields */}
      {(data.hike_type === 'Multi-Day' || data.hike_type === 'Overnight' || data.hike_type === 'Backpacking') && (
        <div className="mt-4">
          <h5 className="mb-3">
            <Calendar size={20} className="me-2" />
            Multi-Day Information
          </h5>

          {/* Number of Days */}
          {data.number_of_days && (
            <div className="mb-3">
              <small className="text-muted d-block">Number of Days</small>
              <strong>{data.number_of_days} days</strong>
            </div>
          )}

          {/* Daily Distances */}
          {data.daily_distances && (
            <div className="mb-3">
              <small className="text-muted d-block">Daily Distances</small>
              <p className="mb-0">{data.daily_distances}</p>
            </div>
          )}

          {/* Overnight Facilities */}
          {data.overnight_facilities && (
            <div className="mb-3">
              <small className="text-muted d-block">Overnight Facilities</small>
              <p className="mb-0">{data.overnight_facilities}</p>
            </div>
          )}

          {/* Accommodation Type */}
          {data.accommodation_type && (
            <div className="mb-3">
              <small className="text-muted d-block">Accommodation</small>
              <span className="badge bg-info">{data.accommodation_type}</span>
            </div>
          )}

          {/* Meals Provided */}
          {data.meals_provided && data.meals_provided.length > 0 && (
            <div className="mb-3">
              <small className="text-muted d-block">Meals Provided</small>
              <div>
                {data.meals_provided.map((meal, idx) => (
                  <span key={idx} className="badge bg-success me-1">
                    {meal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HikingDetailsDisplay;
