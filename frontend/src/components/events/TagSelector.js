import React, { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './TagSelector.css';

const TagSelector = ({
  selectedTags = [],
  onChange,
  allowCustom = true,
  maxTags = null,
  categories = null
}) => {
  const { token } = useAuth();
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsByCategory, setTagsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [customTagName, setCustomTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTags();
  }, [categories]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await api.getTags(null, null);

      if (response.success && response.tags) {
        const tags = response.tags;

        // Filter by categories if specified
        const filteredTags = categories
          ? tags.filter(t => categories.includes(t.category))
          : tags;

        setAvailableTags(filteredTags);

        // Group by category
        const grouped = filteredTags.reduce((acc, tag) => {
          if (!acc[tag.category]) acc[tag.category] = [];
          acc[tag.category].push(tag);
          return acc;
        }, {});
        setTagsByCategory(grouped);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag) => {
    if (maxTags && selectedTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`);
      return;
    }
    if (!selectedTags.find(t => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId) => {
    onChange(selectedTags.filter(t => t.id !== tagId));
  };

  const createCustomTag = async () => {
    if (!customTagName.trim()) return;

    if (!token) {
      alert('Please log in to create custom tags');
      return;
    }

    setCreatingTag(true);
    try {
      const response = await api.createTag({
        name: customTagName.trim(),
        category: 'custom'
      }, token);

      if (response.success && response.tag) {
        addTag(response.tag);
        setCustomTagName('');
        await loadTags(); // Refresh tag list
      } else {
        alert(response.error || 'Failed to create tag');
      }
    } catch (error) {
      alert(error.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createCustomTag();
    }
  };

  // Filter tags by search query
  const filteredTagsByCategory = {};
  Object.keys(tagsByCategory).forEach(category => {
    const filtered = tagsByCategory[category].filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredTagsByCategory[category] = filtered;
    }
  });

  const categoriesToShow = activeCategory === 'all'
    ? Object.keys(filteredTagsByCategory)
    : filteredTagsByCategory[activeCategory] ? [activeCategory] : [];

  return (
    <div className="tag-selector">
      {/* Selected Tags */}
      <div className="selected-tags-section">
        <h5>
          Selected Tags ({selectedTags.length}
          {maxTags ? `/${maxTags}` : ''})
        </h5>
        {selectedTags.length > 0 ? (
          <div className="tag-badges">
            {selectedTags.map(tag => (
              <span
                key={tag.id}
                className="tag-badge"
                style={{ backgroundColor: tag.color || '#6366F1' }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="tag-remove"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted">No tags selected</p>
        )}
      </div>

      {/* Search Bar */}
      <div className="tag-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          type="button"
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {Object.keys(tagsByCategory).map(category => (
          <button
            key={category}
            type="button"
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Available Tags */}
      <div className="available-tags">
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Loading tags...</span>
          </div>
        ) : categoriesToShow.length === 0 ? (
          <div className="text-center py-3 text-muted">
            {searchQuery ? 'No tags found matching your search.' : 'No tags available.'}
          </div>
        ) : (
          categoriesToShow.map(category => (
            <div key={category} className="tag-category">
              <h6 className="category-title">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h6>
              <div className="tag-options">
                {filteredTagsByCategory[category]?.map(tag => {
                  const isSelected = selectedTags.some(t => t.id === tag.id);
                  const isDisabled = !isSelected && maxTags && selectedTags.length >= maxTags;

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => isSelected ? removeTag(tag.id) : addTag(tag)}
                      disabled={isDisabled}
                      style={{
                        backgroundColor: isSelected ? tag.color : 'white',
                        borderColor: tag.color,
                        color: isSelected ? 'white' : tag.color
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Tag Creation */}
      {allowCustom && (
        <div className="custom-tag-creator">
          <h6>Create Custom Tag</h6>
          <div className="custom-tag-input">
            <input
              type="text"
              value={customTagName}
              onChange={(e) => setCustomTagName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tag name..."
              disabled={creatingTag}
              className="form-control"
            />
            <button
              type="button"
              onClick={createCustomTag}
              disabled={!customTagName.trim() || creatingTag}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              {creatingTag ? 'Creating...' : 'Create'}
            </button>
          </div>
          <small className="text-muted">
            Custom tags are saved and can be reused on other events.
          </small>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
