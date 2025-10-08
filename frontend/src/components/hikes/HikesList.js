import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, Search, Filter, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import HikeCard from './HikeCard';
import HikeDetailsModal from './HikeDetailsModal';
import { HikeCardSkeleton } from '../common/Skeleton';

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
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHikes();
  }, []);

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
    setDifficultyFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const applyQuickFilter = (filterType) => {
    clearFilters();
    if (filterType === 'thisMonth') {
      // This is already handled by date filtering, just clear others
    } else if (filterType === 'easy') {
      setDifficultyFilter('easy');
    } else if (filterType === 'openSpots') {
      setStatusFilter('open');
    }
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

      // Difficulty filter
      if (difficultyFilter !== 'all' && hike.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && hike.type !== typeFilter) {
        return false;
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
  }, [hikes, searchTerm, difficultyFilter, typeFilter, statusFilter]);

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
        <div className="card">
          <div className="card-body text-center text-muted py-5">
            <p>No hikes match your filters</p>
            <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
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
                placeholder="Search hikes..."
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
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'var(--bg-secondary)' : 'white',
                color: theme === 'dark' ? 'var(--text-primary)' : '#212529',
                border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid #ced4da',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Types</option>
              <option value="day">Day</option>
              <option value="multi">Multi-Day</option>
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

  return (
    <>
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
    </>
  );
};

export default HikesList;
