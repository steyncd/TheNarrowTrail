import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, Search, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import HikeCard from './HikeCard';
import HikeDetailsModal from './HikeDetailsModal';
import { HikeCardSkeleton } from '../common/Skeleton';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from './PullToRefreshIndicator';

// PERFORMANCE OPTIMIZATION: Memoized filtering logic
const HikesList = () => {
  const { token, currentUser } = useAuth();
  const { theme } = useTheme();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHike, setSelectedHike] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all'); // Changed from typeFilter to eventTypeFilter
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

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

  // Pull-to-refresh for mobile
  const { containerRef, isPulling, pullDistance, isRefreshing, isReady } = usePullToRefresh(
    fetchHikes,
    { enabled: true }
  );

  useEffect(() => {
    fetchHikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (hike) => {
    setSelectedHike(hike);
    setShowDetailsModal(true);
  };

  const handleToggleInterest = async (hikeId) => {
    setLoading(true);
    try {
      await api.toggleInterest(hikeId, token);
      await fetchHikes();
    } catch (err) {
      console.error('Toggle interest error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEventTypeFilter('all');
    setStatusFilter('all');
    setDateRangeFilter('all');
  };

  // PERFORMANCE OPTIMIZATION: Memoize filter logic to prevent recalculation on every render
  // Only recalculates when hikes or filter dependencies change
  const filteredHikes = useMemo(() => {
    return hikes.filter(hike => {
      // Search filter
      if (searchTerm && !hike.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !hike.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Event Type filter (hiking, camping, 4x4, cycling, outdoor)
      if (eventTypeFilter !== 'all' && hike.event_type !== eventTypeFilter) {
        return false;
      }

      // Date Range filter
      if (dateRangeFilter !== 'all') {
        const hikeDate = new Date(hike.date);
        const now = new Date();
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

        if (dateRangeFilter === 'thisMonth' && (hikeDate < now || hikeDate > oneMonthFromNow)) {
          return false;
        } else if (dateRangeFilter === 'next3Months' && (hikeDate < now || hikeDate > threeMonthsFromNow)) {
          return false;
        } else if (dateRangeFilter === 'next6Months' && (hikeDate < now || hikeDate > sixMonthsFromNow)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'open') {
          const confirmedCount = hike.confirmed_users ? hike.confirmed_users.length : 0;
          const maxCapacity = hike.max_capacity || 20;
          if (confirmedCount >= maxCapacity) return false;
        } else if (hike.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [hikes, searchTerm, eventTypeFilter, dateRangeFilter, statusFilter]);

  // PERFORMANCE OPTIMIZATION: Memoize date calculations
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

  // Define renderFilters before it's used
  const renderFilters = () => (
    <div
      className="card shadow-sm mb-3"
      style={{
        background: theme === 'dark' ? 'var(--card-bg)' : 'white',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
      }}
    >
      <div className="card-body py-2 px-3">
        <div className="row g-2 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text" style={{ padding: '0.25rem 0.5rem' }}>
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                  color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                  border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                  fontSize: '0.85rem'
                }}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSearchTerm('')}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns - Inline */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Event Types</option>
              <option value="hiking">Hiking</option>
              <option value="camping">Camping</option>
              <option value="4x4">4x4</option>
              <option value="cycling">Cycling</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Dates</option>
              <option value="thisMonth">This Month</option>
              <option value="next3Months">Next 3 Months</option>
              <option value="next6Months">Next 6 Months</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="gathering_interest">Gathering</option>
              <option value="pre_planning">Planning</option>
              <option value="trip_booked">Booked</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="col-6 col-md-1 text-end">
            <button
              className="btn btn-sm btn-outline-secondary w-100"
              onClick={clearFilters}
              title="Clear all filters"
              style={{ fontSize: '0.75rem', padding: '0.25rem' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  if (filteredHikes.length === 0 && hikes.length > 0) {
    return (
      <>
        {renderFilters()}
        <div className="card shadow-sm" style={{
          background: theme === 'dark' ? 'var(--card-bg)' : 'white',
          border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #dee2e6'
        }}>
          <div className="card-body text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h5 style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#212529' }}>
              No Events Found
            </h5>
            <p className="text-muted mb-4">
              {eventTypeFilter !== 'all'
                ? `No ${eventTypeFilter} events match your current filters.`
                : 'No events match your current filters.'}
            </p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        </div>
      </>
    );
  }

  if (hikes.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted py-5">
          No hikes scheduled
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ minHeight: '100vh' }}>
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isReady={isReady}
        isRefreshing={isRefreshing || (isPulling && loading)}
      />

      {renderFilters()}

      {upcomingSoon.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-primary">
            <Clock size={20} className="me-2" />
            Next 2 Months
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

      {future.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-info">
            <Calendar size={20} className="me-2" />
            Future Adventures
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

      {past.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-muted">
            <CheckCircle size={20} className="me-2" />
            Past Hikes
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

export default HikesList;
