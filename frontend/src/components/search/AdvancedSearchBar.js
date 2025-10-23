import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import './AdvancedSearchBar.css';

/**
 * AdvancedSearchBar Component
 *
 * Enhanced search with multi-select filters, tag-based search, and location filtering
 * Addresses "Discovery worse than Meetup" gap from usability analysis
 *
 * Features:
 * - Text search across name, description, location
 * - Multi-select event types with visual chips
 * - Difficulty level filters
 * - Tag-based filtering (kid-friendly, pet-friendly, etc.)
 * - Date range picker
 * - Distance/location filtering (future: with geolocation)
 * - Save search functionality (future)
 * - Mobile-responsive design
 */
const AdvancedSearchBar = ({ onFilterChange, initialFilters = {} }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [tags, setTags] = useState([]);

  // Filter states
  const [searchText, setSearchText] = useState(initialFilters.searchText || '');
  const [selectedEventTypes, setSelectedEventTypes] = useState(initialFilters.eventTypes || []);
  const [selectedDifficulties, setSelectedDifficulties] = useState(initialFilters.difficulties || []);
  const [selectedTags, setSelectedTags] = useState(initialFilters.tags || []);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');
  const [locationSearch, setLocationSearch] = useState(initialFilters.location || '');
  const [maxDistance, setMaxDistance] = useState(initialFilters.maxDistance || '');

  // Available options
  const eventTypes = [
    { value: 'hiking', label: 'Hiking', icon: '🥾', color: '#4CAF50' },
    { value: 'camping', label: 'Camping', icon: '⛺', color: '#FF9800' },
    { value: '4x4', label: '4x4', icon: '🚙', color: '#795548' },
    { value: 'cycling', label: 'Cycling', icon: '🚴', color: '#2196F3' },
    { value: 'outdoor', label: 'Outdoor', icon: '🏕️', color: '#9C27B0' }
  ];

  const difficulties = [
    { value: 'Easy', label: 'Easy', color: '#4CAF50' },
    { value: 'Moderate', label: 'Moderate', color: '#FF9800' },
    { value: 'Hard', label: 'Hard', color: '#f44336' },
    { value: 'Very Hard', label: 'Very Hard', color: '#9C27B0' }
  ];

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.getTags();
        if (response.success) {
          setTags(response.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    const filters = {
      searchText,
      eventTypes: selectedEventTypes,
      difficulties: selectedDifficulties,
      tags: selectedTags,
      dateFrom,
      dateTo,
      location: locationSearch,
      maxDistance
    };
    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedEventTypes, selectedDifficulties, selectedTags, dateFrom, dateTo, locationSearch, maxDistance]);

  // Toggle functions
  const toggleEventType = (type) => {
    setSelectedEventTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleDifficulty = (diff) => {
    setSelectedDifficulties(prev =>
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const clearAllFilters = () => {
    setSearchText('');
    setSelectedEventTypes([]);
    setSelectedDifficulties([]);
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
    setLocationSearch('');
    setMaxDistance('');
  };

  const hasActiveFilters = () => {
    return searchText || selectedEventTypes.length > 0 || selectedDifficulties.length > 0 ||
           selectedTags.length > 0 || dateFrom || dateTo || locationSearch || maxDistance;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchText) count++;
    if (selectedEventTypes.length > 0) count++;
    if (selectedDifficulties.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (dateFrom || dateTo) count++;
    if (locationSearch) count++;
    if (maxDistance) count++;
    return count;
  };

  // Get popular tags (most used)
  const popularTags = tags
    .filter(tag => tag.category === 'feature' || tag.category === 'target_audience')
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 12);

  return (
    <div className={`advanced-search-bar ${theme}`}>
      {/* Main Search Bar */}
      <div className="search-bar-main">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search events by name, description, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchText('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          className="filter-toggle-btn"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Hide filters' : 'Show filters'}
        >
          <Filter size={18} />
          <span className="filter-label">Filters</span>
          {hasActiveFilters() && (
            <span className="filter-count">{getActiveFilterCount()}</span>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {hasActiveFilters() && (
          <button
            className="clear-all-btn"
            onClick={clearAllFilters}
            aria-label="Clear all filters"
          >
            <X size={16} />
            <span className="d-none d-md-inline">Clear All</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div className="filters-expanded">
          {/* Event Type Multi-Select */}
          <div className="filter-section">
            <label className="filter-label-header">Event Type</label>
            <div className="filter-chips">
              {eventTypes.map(type => (
                <button
                  key={type.value}
                  className={`filter-chip ${selectedEventTypes.includes(type.value) ? 'active' : ''}`}
                  onClick={() => toggleEventType(type.value)}
                  style={{
                    '--chip-color': type.color,
                    '--chip-bg': selectedEventTypes.includes(type.value) ? type.color : 'transparent',
                    '--chip-border': type.color
                  }}
                >
                  <span className="chip-icon">{type.icon}</span>
                  <span className="chip-label">{type.label}</span>
                  {selectedEventTypes.includes(type.value) && (
                    <X size={14} className="chip-remove" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Multi-Select */}
          <div className="filter-section">
            <label className="filter-label-header">Difficulty Level</label>
            <div className="filter-chips">
              {difficulties.map(diff => (
                <button
                  key={diff.value}
                  className={`filter-chip ${selectedDifficulties.includes(diff.value) ? 'active' : ''}`}
                  onClick={() => toggleDifficulty(diff.value)}
                  style={{
                    '--chip-color': diff.color,
                    '--chip-bg': selectedDifficulties.includes(diff.value) ? diff.color : 'transparent',
                    '--chip-border': diff.color
                  }}
                >
                  <span className="chip-label">{diff.label}</span>
                  {selectedDifficulties.includes(diff.value) && (
                    <X size={14} className="chip-remove" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-section">
            <label className="filter-label-header">
              <CalendarIcon size={16} className="me-1" />
              Date Range
            </label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                className="date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                min={dateFrom}
              />
            </div>
          </div>

          {/* Location Search */}
          <div className="filter-section">
            <label className="filter-label-header">
              <MapPin size={16} className="me-1" />
              Location
            </label>
            <div className="location-inputs">
              <input
                type="text"
                className="location-input"
                placeholder="City, province, or region..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
              {/* Future enhancement: Add "Use My Location" button with geolocation */}
            </div>
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className="filter-section">
              <label className="filter-label-header">Popular Tags</label>
              <div className="filter-chips">
                {popularTags.map(tag => (
                  <button
                    key={tag.id}
                    className={`filter-chip tag-chip ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      '--chip-color': tag.color || '#607D8B',
                      '--chip-bg': selectedTags.includes(tag.id) ? (tag.color || '#607D8B') : 'transparent',
                      '--chip-border': tag.color || '#607D8B'
                    }}
                  >
                    <span className="chip-label">{tag.name}</span>
                    {selectedTags.includes(tag.id) && (
                      <X size={14} className="chip-remove" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary (Mobile) */}
          {hasActiveFilters() && (
            <div className="active-filters-mobile d-md-none">
              <div className="active-filters-summary">
                <span>{getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}</span>
                <button onClick={clearAllFilters} className="btn btn-sm btn-outline-danger">
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Filters Chips (Compact View) */}
      {!expanded && hasActiveFilters() && (
        <div className="selected-filters-compact">
          {searchText && (
            <span className="selected-filter-chip">
              Search: "{searchText.substring(0, 20)}{searchText.length > 20 ? '...' : ''}"
            </span>
          )}
          {selectedEventTypes.length > 0 && (
            <span className="selected-filter-chip">
              {selectedEventTypes.length} Event Type{selectedEventTypes.length !== 1 ? 's' : ''}
            </span>
          )}
          {selectedDifficulties.length > 0 && (
            <span className="selected-filter-chip">
              {selectedDifficulties.length} Difficulty Level{selectedDifficulties.length !== 1 ? 's' : ''}
            </span>
          )}
          {selectedTags.length > 0 && (
            <span className="selected-filter-chip">
              {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="selected-filter-chip">
              Date Range
            </span>
          )}
          {locationSearch && (
            <span className="selected-filter-chip">
              Location: {locationSearch.substring(0, 15)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
