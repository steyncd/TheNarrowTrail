import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Heart, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import useFavorites from '../../hooks/useFavorites';
import { useTheme } from '../../contexts/ThemeContext';

const HikeCard = ({ hike, isPast, onViewDetails, onToggleInterest, loading, currentUserId }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const isInterested = hike.interested_users && hike.interested_users.includes(currentUserId);
  const isConfirmed = hike.confirmed_users && hike.confirmed_users.includes(currentUserId);
  const displayStatus = isPast
    ? (hike.status === 'trip_booked' ? 'completed' : 'cancelled')
    : hike.status;

  // Calculate status badges
  const interestedCount = hike.interested_users ? hike.interested_users.length : 0;
  const confirmedCount = hike.confirmed_users ? hike.confirmed_users.length : 0;
  const maxCapacity = hike.max_capacity || 20; // Assume default capacity
  const occupancyRate = confirmedCount / maxCapacity;
  const isFewSpotsLeft = occupancyRate > 0.7 && occupancyRate < 1.0;
  const isFull = occupancyRate >= 1.0;
  const isCancelled = hike.status === 'cancelled';
  const isNew = !isPast && new Date() - new Date(hike.created_at || hike.date) < 7 * 24 * 60 * 60 * 1000;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(hike.id);
  };

  return (
    <div className="col-md-6 col-lg-4">
      <div
        className="card shadow-sm h-100"
        style={{
          overflow: 'hidden',
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => onViewDetails(hike)}
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
        {isConfirmed && (
          <div style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            padding: '8px 16px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            <CheckCircle size={16} className="me-2" style={{verticalAlign: 'text-bottom'}} />
            BOOKED!
          </div>
        )}

        {/* Thumbnail Image */}
        {hike.image_url && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            overflow: 'hidden',
            background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa'
          }}>
            <img
              src={hike.image_url}
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
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'none';
              }}
            />
            {/* Status Badges Overlay on Image */}
            {!isPast && (isNew || isFewSpotsLeft || isFull || isCancelled) && (
              <div className="position-absolute top-0 start-0 d-flex flex-wrap gap-2 p-2">
                {isNew && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#28a745', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <Sparkles size={14} />
                    New
                  </span>
                )}
                {isFewSpotsLeft && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#fd7e14', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <AlertCircle size={14} />
                    Few Spots Left
                  </span>
                )}
                {isFull && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#dc3545', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <XCircle size={14} />
                    Full
                  </span>
                )}
                {isCancelled && (
                  <span className="badge d-flex align-items-center gap-1" style={{ background: '#6c757d', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <XCircle size={14} />
                    Cancelled
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Badges Row (when no image) */}
        {!hike.image_url && !isPast && (isNew || isFewSpotsLeft || isFull || isCancelled) && (
          <div className="d-flex flex-wrap gap-2 p-3 pb-0">
            {isNew && (
              <span className="badge d-flex align-items-center gap-1" style={{ background: '#28a745' }}>
                <Sparkles size={14} />
                New
              </span>
            )}
            {isFewSpotsLeft && (
              <span className="badge d-flex align-items-center gap-1" style={{ background: '#fd7e14' }}>
                <AlertCircle size={14} />
                Few Spots Left
              </span>
            )}
            {isFull && (
              <span className="badge d-flex align-items-center gap-1" style={{ background: '#dc3545' }}>
                <XCircle size={14} />
                Full
              </span>
            )}
            {isCancelled && (
              <span className="badge d-flex align-items-center gap-1" style={{ background: '#6c757d' }}>
                <XCircle size={14} />
                Cancelled
              </span>
            )}
          </div>
        )}

        <div className="card-body d-flex flex-column">
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
              <span className="badge bg-warning text-dark">{hike.difficulty}</span>
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
            <span className="text-nowrap">Distance: {hike.distance}</span>
            <span className="badge bg-info">{hike.type === 'day' ? 'Day Hike' : 'Multi-Day'}</span>
            <span className="badge bg-secondary">{hike.group_type === 'family' ? 'Family' : "Men's"}</span>
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
                className={`btn flex-grow-1 ${isInterested ? 'btn-secondary' : 'btn-success'}`}
                style={{minHeight: '44px'}}
                disabled={loading}
              >
                {loading ? 'Loading...' : (isInterested ? 'Remove Interest' : "I'm Interested!")}
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
  );
};

export default HikeCard;
