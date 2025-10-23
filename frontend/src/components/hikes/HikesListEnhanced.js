import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import HikeCard from './HikeCard';
import HikeDetailsModal from './HikeDetailsModal';
import { HikeCardSkeleton } from '../common/Skeleton';
import AdvancedSearchBar from '../search/AdvancedSearchBar';

/**
 * Enhanced HikesList with Advanced Search Capabilities
 *
 * Addresses "Discovery worse than Meetup" gap with:
 * - Multi-select event type filtering
 * - Difficulty level filtering
 * - Tag-based search
 * - Date range filtering
 * - Location-based search
 * - Text search across multiple fields
 */
const HikesListEnhanced = () => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Advanced filter state
  const [filters, setFilters] = useState({
    searchText: '',
    eventTypes: [],
    difficulties: [],
    tags: [],
    dateFrom: '',
    dateTo: '',
    location: '',
    maxDistance: ''
  });

  const fetchHikes = async () => {
    setLoading(true);
    try {
      const data = await api.getHikes(token);
      setHikes(data);
    } catch (err) {
      console.error('Fetch hikes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = useCallback((hike) => {
    setSelectedHike(hike);
    setShowDetailsModal(true);
  }, []);

  const handleToggleInterest = useCallback(async (hikeId) => {
    setLoading(true);
    try {
      await api.toggleInterest(hikeId, token);
      await fetchHikes();
    } catch (err) {
      console.error('Toggle interest error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Advanced filtering logic
  const filteredHikes = useMemo(() => {
    return hikes.filter(hike => {
      // Text search across name, description, and location
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesName = hike.name.toLowerCase().includes(searchLower);
        const matchesDescription = hike.description?.toLowerCase().includes(searchLower);
        const matchesLocation = hike.location?.toLowerCase().includes(searchLower);

        if (!matchesName && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

      // Event type filter (multi-select)
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(hike.event_type)) {
        return false;
      }

      // Difficulty filter (multi-select)
      if (filters.difficulties.length > 0) {
        const hikeDifficulty = hike.event_type_data?.difficulty || hike.difficulty;
        if (!hikeDifficulty || !filters.difficulties.includes(hikeDifficulty)) {
          return false;
        }
      }

      // Tag filter (multi-select)
      if (filters.tags.length > 0) {
        const hikeTagIds = (hike.tags || []).map(tag => tag.id);
        const hasMatchingTag = filters.tags.some(tagId => hikeTagIds.includes(tagId));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const hikeDate = new Date(hike.date);

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (hikeDate < fromDate) {
            return false;
          }
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (hikeDate > toDate) {
            return false;
          }
        }
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const hikeLocation = hike.location?.toLowerCase() || '';
        if (!hikeLocation.includes(locationLower)) {
          return false;
        }
      }

      // Future: Distance filter with geolocation
      // if (filters.maxDistance && userLocation) {
      //   const distance = calculateDistance(userLocation, hike.coordinates);
      //   if (distance > filters.maxDistance) return false;
      // }

      return true;
    });
  }, [hikes, filters]);

  // Group filtered hikes by date
  const { upcomingSoon, future, past } = useMemo(() => {
    const now = new Date();
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    return {
      upcomingSoon: filteredHikes.filter(h => {
        const hikeDate = new Date(h.date);
        return hikeDate >= now && hikeDate <= twoMonthsFromNow;
      }),
      future: filteredHikes.filter(h => {
        const hikeDate = new Date(h.date);
        return hikeDate > twoMonthsFromNow;
      }),
      past: filteredHikes.filter(h => {
        const hikeDate = new Date(h.date);
        return hikeDate < now;
      })
    };
  }, [filteredHikes]);

  if (loading && hikes.length === 0) {
    return (
      <div className="container mt-4">
        <div className="row">
          <HikeCardSkeleton />
          <HikeCardSkeleton />
          <HikeCardSkeleton />
          <HikeCardSkeleton />
          <HikeCardSkeleton />
          <HikeCardSkeleton />
        </div>
      </div>
    );
  }

  // No results state
  if (filteredHikes.length === 0 && hikes.length > 0) {
    return (
      <div className="container">
        <AdvancedSearchBar onFilterChange={handleFilterChange} initialFilters={filters} />
        <div className="card shadow-sm" style={{
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}>
          <div className="card-body text-center py-5">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h4 style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529', marginBottom: '1rem' }}>
              No Events Match Your Search
            </h4>
            <p className="text-muted mb-4">
              Try adjusting your filters or search terms to find more events.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button
                onClick={() => setFilters({
                  searchText: '',
                  eventTypes: [],
                  difficulties: [],
                  tags: [],
                  dateFrom: '',
                  dateTo: '',
                  location: '',
                  maxDistance: ''
                })}
                className="btn btn-primary"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => window.location.href = '/admin/hikes/add'}
                className="btn btn-outline-secondary"
              >
                Suggest an Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No hikes at all
  if (hikes.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏔️</div>
          <h4>No Events Scheduled</h4>
          <p className="mb-0">Check back soon for upcoming adventures!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Advanced Search Bar */}
      <AdvancedSearchBar onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Results Count */}
      {filteredHikes.length < hikes.length && (
        <div className="alert alert-info mb-3" style={{ fontSize: '0.9rem' }}>
          Showing <strong>{filteredHikes.length}</strong> of <strong>{hikes.length}</strong> events
        </div>
      )}

      {/* Upcoming Soon */}
      {upcomingSoon.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-primary">
            <Clock size={20} className="me-2" />
            Next 2 Months
            <span className="badge bg-primary ms-2">{upcomingSoon.length}</span>
          </h4>
          <div className="row g-4">
            {upcomingSoon.map(hike => (
              <HikeCard
                key={hike.id}
                hike={hike}
                isPast={false}
                onViewDetails={handleViewDetails}
                onToggleInterest={handleToggleInterest}
                loading={loading}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Future Adventures */}
      {future.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-info">
            <Calendar size={20} className="me-2" />
            Future Adventures
            <span className="badge bg-info ms-2">{future.length}</span>
          </h4>
          <div className="row g-4">
            {future.map(hike => (
              <HikeCard
                key={hike.id}
                hike={hike}
                isPast={false}
                onViewDetails={handleViewDetails}
                onToggleInterest={handleToggleInterest}
                loading={loading}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Hikes */}
      {past.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-muted">
            <CheckCircle size={20} className="me-2" />
            Past Hikes
            <span className="badge bg-secondary ms-2">{past.length}</span>
          </h4>
          <div className="row g-4">
            {past.map(hike => (
              <HikeCard
                key={hike.id}
                hike={hike}
                isPast={true}
                onViewDetails={handleViewDetails}
                onToggleInterest={handleToggleInterest}
                loading={loading}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedHike && (
        <HikeDetailsModal
          hike={selectedHike}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedHike(null);
            fetchHikes(); // Refresh hikes when modal closes
          }}
        />
      )}
    </div>
  );
};

export default HikesListEnhanced;
