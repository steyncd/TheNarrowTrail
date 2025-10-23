import React, { memo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Heart, AlertCircle, XCircle, Sparkles, Mountain, Tent, Truck, Bike, Compass } from 'lucide-react';
import useFavorites from '../../hooks/useFavorites';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../contexts/SocketContext';

// Event type configuration with generic images
const EVENT_TYPE_CONFIG = {
  hiking: {
    icon: Mountain,
    color: '#4CAF50',
    label: 'Hiking',
    genericImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
  },
  camping: {
    icon: Tent,
    color: '#FF9800',
    label: 'Camping',
    genericImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop'
  },
  '4x4': {
    icon: Truck,
    color: '#795548',
    label: '4x4',
    genericImage: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&h=800&fit=crop'
  },
  cycling: {
    icon: Bike,
    color: '#2196F3',
    label: 'Cycling',
    genericImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop'
  },
  outdoor: {
    icon: Compass,
    color: '#9C27B0',
    label: 'Outdoor',
    genericImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  }
};

// PERFORMANCE OPTIMIZATION: Memoized component to prevent unnecessary re-renders
// Only re-renders when hike data or user interest status changes
const HikeCard = memo(({ hike, isPast, onViewDetails, onToggleInterest, loading, currentUserId }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const { on, off } = useSocket();
  const navigate = useNavigate();

  // Detect mobile view
  const isMobile = window.innerWidth <= 767;

  // Local state for real-time interest counts
  // eslint-disable-next-line no-unused-vars
  const [interestedCount, setInterestedCount] = useState(hike.interested_users ? hike.interested_users.length : 0);
  const [confirmedCount, setConfirmedCount] = useState(hike.confirmed_users ? hike.confirmed_users.length : 0);

  const isInterested = hike.interested_users && hike.interested_users.includes(currentUserId);
  const isConfirmed = hike.confirmed_users && hike.confirmed_users.includes(currentUserId);
  const displayStatus = isPast
    ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled')
    : hike.status;

  // Listen for real-time interest updates via WebSocket
  useEffect(() => {
    const handleInterestUpdate = (data) => {
      // Only update if this is the same hike
      if (data.hikeId === hike.id) {
        setInterestedCount(data.interestedCount);
        setConfirmedCount(data.confirmedCount);
      }
    };

    on('interest:updated', handleInterestUpdate);

    return () => {
      off('interest:updated', handleInterestUpdate);
    };
  }, [hike.id, on, off]);

  // Update counts when hike prop changes
  useEffect(() => {
    setInterestedCount(hike.interested_users ? hike.interested_users.length : 0);
    setConfirmedCount(hike.confirmed_users ? hike.confirmed_users.length : 0);
  }, [hike.interested_users, hike.confirmed_users]);
  const maxCapacity = hike.max_capacity || 20; // Assume default capacity
  const occupancyRate = confirmedCount / maxCapacity;
  const isFewSpotsLeft = occupancyRate > 0.7 && occupancyRate < 1.0;
  const isFull = occupancyRate >= 1.0;
  const isCancelled = hike.status === 'cancelled';
  const isNew = !isPast && new Date() - new Date(hike.created_at || hike.date) < 7 * 24 * 60 * 60 * 1000;

  // Registration closed logic
  const isRegistrationClosed = hike.registration_closed ||
    (hike.registration_deadline && new Date(hike.registration_deadline) < new Date());

  const isRegistrationClosingSoon = hike.registration_deadline &&
    !isRegistrationClosed &&
    (new Date(hike.registration_deadline) - new Date()) < 7 * 24 * 60 * 60 * 1000; // 7 days

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(hike.id);
  };

  const handleCardClick = () => {
    // On mobile, navigate directly to detail page
    // On desktop, show modal
    if (isMobile) {
      navigate(`/hikes/${hike.id}`);
    } else {
      onViewDetails(hike);
    }
  };

  return (
    <div className="col-md-6 col-lg-4">
      <div
        className="card shadow-sm h-100 d-flex flex-column"
        style={{
          overflow: 'hidden',
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 8px 16px rgba(0,0,0,0.4)'
            : '0 8px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme === 'dark'
            ? '0 2px 4px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.12)';
        }}
      >
        {/* Thumbnail Image */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
        }}>
          {/* Corner Ribbon for Event Status */}
          {(() => {
            // Determine which status ribbon to show (priority order)
            let ribbonConfig = null;

            // Priority 1: Registration Closed (overrides status)
            if (isRegistrationClosed && !isPast) {
              ribbonConfig = {
                text: 'CLOSED',
                icon: XCircle,
                gradient: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                shadow: 'rgba(220, 53, 69, 0.5)'
              };
            }
            // Priority 2: User's booking status (if confirmed)
            else if (isConfirmed && !isPast) {
              ribbonConfig = {
                text: 'BOOKED',
                icon: CheckCircle,
                gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                shadow: 'rgba(40, 167, 69, 0.5)'
              };
            }
            // Priority 3: Event Status
            else if (!isPast) {
              switch (hike.status) {
                case 'trip_booked':
                  ribbonConfig = {
                    text: 'TRIP BOOKED',
                    icon: CheckCircle,
                    gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    shadow: 'rgba(40, 167, 69, 0.5)'
                  };
                  break;
                case 'cancelled':
                  ribbonConfig = {
                    text: 'CANCELLED',
                    icon: XCircle,
                    gradient: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                    shadow: 'rgba(108, 117, 125, 0.5)'
                  };
                  break;
                case 'final_planning':
                  ribbonConfig = {
                    text: 'FINAL PLANNING',
                    icon: CheckCircle,
                    gradient: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    shadow: 'rgba(0, 123, 255, 0.5)'
                  };
                  break;
                case 'pre_planning':
                  ribbonConfig = {
                    text: 'PRE PLANNING',
                    icon: AlertCircle,
                    gradient: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                    shadow: 'rgba(255, 193, 7, 0.5)'
                  };
                  break;
                case 'gathering_interest':
                  // Don't show ribbon for gathering interest (default state)
                  ribbonConfig = null;
                  break;
                default:
                  ribbonConfig = null;
              }
            }
            // Past events
            else if (isPast && hike.status === 'trip_booked') {
              ribbonConfig = {
                text: 'COMPLETED',
                icon: CheckCircle,
                gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                shadow: 'rgba(40, 167, 69, 0.5)'
              };
            }

            // Render ribbon if we have config
            if (ribbonConfig) {
              const RibbonIcon = ribbonConfig.icon;
              return (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '-35px',
                  background: ribbonConfig.gradient,
                  color: 'white',
                  padding: '5px 40px',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  transform: 'rotate(45deg)',
                  boxShadow: `0 3px 10px ${ribbonConfig.shadow}`,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <RibbonIcon size={12} />
                  {ribbonConfig.text}
                </div>
              );
            }
            return null;
          })()}
          <img
            src={hike.image_url || EVENT_TYPE_CONFIG[hike.event_type || 'hiking']?.genericImage}
            alt={hike.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            onError={(e) => {
              // If image fails to load, show a colored placeholder with icon
              const eventType = hike.event_type || 'hiking';
              const config = EVENT_TYPE_CONFIG[eventType];
              e.target.style.display = 'none';
              const placeholder = document.createElement('div');
              placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, ${config.color}dd 0%, ${config.color}88 100%);
                color: white;
              `;
              placeholder.innerHTML = `<div style="text-align: center;"><div style="font-size: 3rem; margin-bottom: 0.5rem;">🏔️</div><div style="font-size: 1rem; font-weight: 600;">${config.label}</div></div>`;
              e.target.parentElement.appendChild(placeholder);
            }}
          />
            {/* Badges Overlay on Image (Top Left) - Event Type, Status, and Target Audience */}
            {(hike.event_type || hike.tags?.find(tag => tag.category === 'target_audience') || (!isPast && (isNew || isFewSpotsLeft || isFull || isCancelled))) && (
              <div className="position-absolute top-0 start-0 d-flex flex-column align-items-start gap-2 p-2">
                {/* Row 1: Event Type Badge */}
                {hike.event_type && EVENT_TYPE_CONFIG[hike.event_type] && (() => {
                  const EventIcon = EVENT_TYPE_CONFIG[hike.event_type].icon;
                  return (
                    <span
                      className="badge d-flex align-items-center gap-1"
                      style={{
                        background: EVENT_TYPE_CONFIG[hike.event_type].color,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      <EventIcon size={14} />
                      {EVENT_TYPE_CONFIG[hike.event_type].label}
                    </span>
                  );
                })()}

                {/* Row 2: Target Audience Badge */}
                {hike.tags && (() => {
                  const targetAudienceTag = hike.tags.find(tag => tag.category === 'target_audience');
                  if (targetAudienceTag) {
                    return (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: targetAudienceTag.color || '#9C27B0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          padding: '6px 10px'
                        }}
                      >
                        {targetAudienceTag.name}
                      </span>
                    );
                  }
                  return null;
                })()}

                {/* Row 3+: Status Badges */}
                <div className="d-flex flex-wrap gap-2">
                {!isPast && isNew && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#28a745', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <Sparkles size={14} />
                    New
                  </span>
                )}
                {!isPast && isFewSpotsLeft && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#fd7e14', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <AlertCircle size={14} />
                    Few Spots Left
                  </span>
                )}
                {!isPast && isFull && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#dc3545', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <XCircle size={14} />
                    Full
                  </span>
                )}
                {!isPast && isCancelled && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#6c757d', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <XCircle size={14} />
                    Cancelled
                  </span>
                )}
                </div>
              </div>
            )}
          </div>

        <div className="card-body flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="flex-grow-1">
              <h5 className="card-title" style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}>
                {hike.name}
              </h5>
              <p className="card-text" style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}>
                {hike.description}
              </p>
            </div>
            <div className="d-flex align-items-start gap-2">
              {/* Show difficulty from event_type_data if available, fallback to old field */}
              {(hike.event_type_data?.difficulty || hike.difficulty) && (
                <span className="badge bg-warning text-dark">{hike.event_type_data?.difficulty || hike.difficulty}</span>
              )}
              <button
                onClick={handleFavoriteClick}
                className="btn btn-link p-0"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                title={isFavorite(hike.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  size={24}
                  fill={isFavorite(hike.id) ? '#dc3545' : 'none'}
                  stroke={isFavorite(hike.id) ? '#dc3545' : theme === 'dark' ? 'var(--text-secondary)' : '#6c757d'}
                  style={{ transition: 'all 0.3s ease' }}
                />
              </button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3 small" style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6c757d' }}>
            <span className="text-nowrap">
              <Calendar size={16} className="me-1" />
              {new Date(hike.date).toLocaleDateString()}
            </span>
            {/* Show distance from event_type_data if available, fallback to old field */}
            {(hike.event_type_data?.distance || hike.distance) && (
              <span className="text-nowrap">Distance: {hike.event_type_data?.distance || hike.distance}</span>
            )}
            {/* Only show hike type for hiking events - use event_type_data */}
            {hike.event_type === 'hiking' && hike.event_type_data?.hike_type && (
              <span className="badge bg-info">{hike.event_type_data.hike_type}</span>
            )}
            {hike.cost > 0 && <span className="text-success fw-bold">R{hike.cost}</span>}
            <span className={`badge ${
              displayStatus === 'completed' ? 'bg-success' :
              displayStatus === 'cancelled' ? 'bg-secondary' :
              displayStatus === 'trip_booked' ? 'bg-success' :
              displayStatus === 'final_planning' ? 'bg-primary' :
              displayStatus === 'pre_planning' ? 'bg-warning' : 'bg-secondary'
            }`}>
              {(displayStatus || 'gathering_interest').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {confirmedCount > 0 && (
              <span className="badge bg-dark">
                {confirmedCount}/{maxCapacity} spots
              </span>
            )}
          </div>

          {/* Tags Display - Prominent display of all tag categories */}
          {hike.tags && hike.tags.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-1">
                {/* Show all tags with their category colors */}
                {hike.tags.slice(0, 8).map(tag => (
                  <span
                    key={tag.id}
                    className="badge"
                    style={{
                      backgroundColor: tag.color || '#6366F1',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      padding: '4px 8px'
                    }}
                    title={`${tag.category}: ${tag.name}`}
                  >
                    {tag.name}
                  </span>
                ))}
                {hike.tags.length > 8 && (
                  <span
                    className="badge bg-secondary"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      padding: '4px 8px'
                    }}
                    title={`${hike.tags.slice(8).map(t => t.name).join(', ')}`}
                  >
                    +{hike.tags.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Registration Closing Soon Warning */}
          {isRegistrationClosingSoon && !isPast && (
            <div className="alert alert-warning py-2 px-3 mb-3" style={{ fontSize: '0.85rem' }}>
              <AlertCircle size={14} className="me-1" style={{ verticalAlign: 'text-top' }} />
              <strong>Closes:</strong> {new Date(hike.registration_deadline).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          )}

          {/* Buttons - pushed to bottom with mt-auto */}
          <div className="mt-auto">
            {!isPast ? (
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Link
                  to={`/hikes/${hike.id}`}
                  className="btn btn-outline-primary flex-grow-1"
                  style={{minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}
                >
                  View Details
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleInterest(hike.id);
                  }}
                  className={`btn flex-grow-1 ${isInterested ? 'btn-secondary' : isRegistrationClosed ? 'btn-danger' : 'btn-success'}`}
                  style={{minHeight: '44px'}}
                  disabled={loading || (isRegistrationClosed && !isInterested)}
                  title={isRegistrationClosed ? 'Registration is closed for this event' : ''}
                >
                  {loading ? 'Loading...' :
                   isRegistrationClosed && !isInterested ? 'Registration Closed' :
                   isInterested ? 'Remove Interest' : "I'm Interested!"}
                </button>
              </div>
            ) : (
              <Link
                to={`/hikes/${hike.id}`}
                className="btn btn-outline-secondary w-100"
                style={{minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these change
  return prevProps.hike.id === nextProps.hike.id &&
         prevProps.hike.interested_users?.length === nextProps.hike.interested_users?.length &&
         prevProps.hike.confirmed_users?.length === nextProps.hike.confirmed_users?.length &&
         prevProps.loading === nextProps.loading &&
         prevProps.isPast === nextProps.isPast;
});

HikeCard.displayName = 'HikeCard';

export default HikeCard;
