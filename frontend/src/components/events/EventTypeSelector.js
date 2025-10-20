import React, { useState, useEffect } from 'react';
import { Mountain, Tent, Truck, Bike, Compass } from 'lucide-react';
import api from '../../services/api';
import './EventTypeSelector.css';

const EVENT_TYPE_ICONS = {
  hiking: Mountain,
  camping: Tent,
  '4x4': Truck,
  cycling: Bike,
  outdoor: Compass
};

const EventTypeSelector = ({
  value,
  onChange,
  disabled = false,
  showIcons = true,
  layout = 'grid'
}) => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const response = await api.getEventTypes(true);

      if (response.success && response.eventTypes) {
        setEventTypes(response.eventTypes);
      } else {
        throw new Error('Failed to load event types');
      }
    } catch (error) {
      console.error('Failed to load event types:', error);
      setError('Failed to load event types. Please try again.');
      // Fallback to default hiking type
      setEventTypes([{
        id: 1,
        name: 'hiking',
        display_name: 'Hiking',
        icon: 'mountain',
        color: '#4CAF50',
        description: 'Hiking trips and trail adventures'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="event-type-selector-loading">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Loading event types...
      </div>
    );
  }

  if (error && eventTypes.length === 0) {
    return (
      <div className="alert alert-warning">
        {error}
        <button
          className="btn btn-sm btn-link"
          onClick={loadEventTypes}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`event-type-selector ${layout}`}>
      {eventTypes.map(type => {
        const Icon = showIcons ? EVENT_TYPE_ICONS[type.name] || Compass : null;
        const isSelected = value === type.name;

        return (
          <button
            key={type.id}
            type="button"
            className={`event-type-button ${isSelected ? 'selected' : ''}`}
            onClick={() => !disabled && onChange(type.name)}
            disabled={disabled}
            style={{
              borderColor: isSelected ? type.color : '#ddd',
              backgroundColor: isSelected ? `${type.color}15` : 'white'
            }}
          >
            {Icon && <Icon size={24} color={type.color} />}
            <span className="event-type-label">{type.display_name}</span>
            {type.description && (
              <span className="event-type-desc">{type.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EventTypeSelector;
