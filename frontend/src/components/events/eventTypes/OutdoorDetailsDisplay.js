import React from 'react';
import { Compass, Gauge, Clock, Users, AlertTriangle } from 'lucide-react';

const OutdoorDetailsDisplay = ({ data }) => {
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

  return (
    <div className="event-type-details outdoor-details">
      <div className="row g-4">
        {/* Activity Type */}
        {data.activity_type && (
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
                <Compass size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Activity Type</small>
                <span className="badge bg-primary">{data.activity_type}</span>
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

        {/* Duration */}
        {data.duration && (
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
                <Clock size={24} className="text-info" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Duration</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.duration}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Participant Limit */}
        {data.participant_limit && (
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
                <Users size={24} className="text-success" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Participant Limit</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.participant_limit} people</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Equipment Needed */}
      {data.equipment_needed && data.equipment_needed.length > 0 && (
        <div className="mt-4">
          <h6 className="mb-2">Required Equipment</h6>
          <div className="d-flex flex-wrap gap-2">
            {data.equipment_needed.map((item, idx) => (
              <span key={idx} className="badge bg-secondary">
                {slugToName(item)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Required */}
      {data.skills_required && data.skills_required.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">Skills Required</h6>
          <div className="d-flex flex-wrap gap-2">
            {data.skills_required.map((skill, idx) => (
              <span key={idx} className="badge bg-info">
                {slugToName(skill)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Physical Requirements */}
      {data.physical_requirements && (
        <div className="mt-3">
          <small className="text-muted d-block">Physical Requirements</small>
          <p className="mb-0">{data.physical_requirements}</p>
        </div>
      )}

      {/* Safety Considerations */}
      {data.safety_considerations && (
        <div className="mt-3">
          <div className="alert alert-warning mb-0">
            <div className="d-flex align-items-start">
              <AlertTriangle size={18} className="me-2 mt-1" />
              <div>
                <strong>Safety Considerations</strong>
                <p className="mb-0 mt-1">{data.safety_considerations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructor/Guide */}
      {data.instructor_guide && (
        <div className="mt-3">
          <small className="text-muted d-block">Instructor/Guide</small>
          <p className="mb-0">{data.instructor_guide}</p>
        </div>
      )}

      {/* Certification Provided */}
      {data.certification_provided !== undefined && (
        <div className="mt-3">
          <small className="text-muted d-block">Certification</small>
          <span className={`badge bg-${data.certification_provided ? 'success' : 'secondary'}`}>
            {data.certification_provided ? 'Certification Provided' : 'No Certification'}
          </span>
        </div>
      )}
    </div>
  );
};

export default OutdoorDetailsDisplay;
