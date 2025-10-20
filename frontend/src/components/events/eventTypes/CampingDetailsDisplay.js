import React from 'react';
import { Tent, Home, Utensils, Droplet, Zap, Moon } from 'lucide-react';

const CampingDetailsDisplay = ({ data }) => {
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

  const renderCampingTypeBadge = (type) => {
    const colors = {
      'Tent Camping': 'success',
      'Caravan/RV': 'primary',
      'Glamping': 'warning',
      'Backyard Camping': 'info'
    };
    return (
      <span className={`badge bg-${colors[type] || 'secondary'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="event-type-details camping-details">
      <div className="row g-4">
        {/* Camping Type */}
        {data.camping_type && (
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
                <Tent size={24} className="text-success" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Camping Type</small>
                {renderCampingTypeBadge(data.camping_type)}
              </div>
            </div>
          </div>
        )}

        {/* Number of Nights */}
        {data.number_of_nights && (
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
                <Moon size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Duration</small>
                <strong style={{ fontSize: '0.95rem' }}>{data.number_of_nights} night{data.number_of_nights > 1 ? 's' : ''}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Site Type */}
        {data.site_type && (
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
                <Home size={24} className="text-info" />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Site Type</small>
                <span className="badge bg-info">{data.site_type}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Facilities Available */}
      {data.facilities && data.facilities.length > 0 && (
        <div className="mt-4">
          <h6 className="mb-3">
            <Zap size={18} className="me-2" />
            Available Facilities
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {data.facilities.map((facility, idx) => {
              const facilityName = slugToName(facility);
              return (
                <span key={idx} className="badge bg-success">
                  {facilityName === 'Toilets' && '🚻'}
                  {facilityName === 'Showers' && '🚿'}
                  {facilityName === 'Electricity' && '⚡'}
                  {facilityName === 'Water' && '💧'}
                  {facilityName === 'Braai Bbq' && '🔥'}
                  {facilityName === 'Kitchen' && '🍳'}
                  {facilityName === 'Wifi' && '📶'}
                  {facilityName === 'Swimming Pool' && '🏊'}
                  {' '}{facilityName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Meals Provided */}
      {data.meals_provided && data.meals_provided.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">
            <Utensils size={18} className="me-2" />
            Meals Provided
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {data.meals_provided.map((meal, idx) => (
              <span key={idx} className="badge bg-warning text-dark">
                {slugToName(meal)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Water Availability */}
      {data.water_availability && (
        <div className="mt-3">
          <div className="d-flex align-items-center">
            <Droplet size={18} className="text-info me-2" />
            <div>
              <small className="text-muted d-block">Water Availability</small>
              <p className="mb-0">{data.water_availability}</p>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Provided */}
      {data.equipment_provided && data.equipment_provided.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">Equipment Provided</h6>
          <div className="d-flex flex-wrap gap-2">
            {data.equipment_provided.map((item, idx) => (
              <span key={idx} className="badge bg-secondary">
                {slugToName(item)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampingDetailsDisplay;
