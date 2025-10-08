import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function PackingListEditorModal({ show, onClose, hikeId, hikeName }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (show && hikeId) {
      fetchPackingList();
    }
  }, [show, hikeId]);

  const fetchPackingList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPackingList(hikeId, token);
      console.log('Packing list API response:', data);

      // Handle different response formats
      let itemsArray = [];
      if (Array.isArray(data)) {
        itemsArray = data;
      } else if (data && Array.isArray(data.items)) {
        itemsArray = data.items;
      } else if (data && typeof data.items === 'string') {
        // Items might be a JSON string
        try {
          itemsArray = JSON.parse(data.items);
        } catch (parseErr) {
          console.error('Failed to parse items JSON:', parseErr);
          itemsArray = [];
        }
      }

      setItems(Array.isArray(itemsArray) ? itemsArray : []);
    } catch (err) {
      console.error('Fetch packing list error:', err);
      setError('Failed to load packing list');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    const currentItems = Array.isArray(items) ? items : [];
    setItems([...currentItems, { name: newItemName.trim(), checked: false }]);
    setNewItemName('');
    setError('');
  };

  const handleRemoveItem = (index) => {
    if (!Array.isArray(items)) return;
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleUpdateItemName = (index, newName) => {
    if (!Array.isArray(items)) return;
    const updatedItems = [...items];
    updatedItems[index].name = newName;
    setItems(updatedItems);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updatePackingList(hikeId, items, token);
      alert('Packing list updated successfully!');
      onClose();
    } catch (err) {
      console.error('Save packing list error:', err);
      setError('Failed to save packing list');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = (templateType) => {
    const templates = {
      day: [
        { name: 'Hiking boots', checked: false },
        { name: 'Water bottle (2L minimum)', checked: false },
        { name: 'Snacks and lunch', checked: false },
        { name: 'Sun hat and sunglasses', checked: false },
        { name: 'Sunscreen', checked: false },
        { name: 'First aid kit', checked: false },
        { name: 'Rain jacket', checked: false },
        { name: 'Extra layers', checked: false },
        { name: 'Headlamp/flashlight', checked: false },
        { name: 'Charged cellphone', checked: false },
        { name: 'Personal medication', checked: false },
        { name: 'Toilet paper and trowel', checked: false }
      ],
      overnight: [
        { name: 'Tent', checked: false },
        { name: 'Sleeping bag', checked: false },
        { name: 'Sleeping mat', checked: false },
        { name: 'Backpack (60L+)', checked: false },
        { name: 'Hiking boots', checked: false },
        { name: 'Water bottles (3L capacity)', checked: false },
        { name: 'Water purification tablets', checked: false },
        { name: 'Food for all meals', checked: false },
        { name: 'Cooking equipment', checked: false },
        { name: 'Stove and fuel', checked: false },
        { name: 'Warm clothes', checked: false },
        { name: 'Rain gear', checked: false },
        { name: 'First aid kit', checked: false },
        { name: 'Headlamp with extra batteries', checked: false },
        { name: 'Toiletries', checked: false },
        { name: 'Toilet paper and trowel', checked: false },
        { name: 'Map and compass', checked: false },
        { name: 'Emergency whistle', checked: false },
        { name: 'Personal medication', checked: false }
      ]
    };

    setItems(templates[templateType] || []);
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1055}}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Package size={20} className="me-2" />
              Edit Packing List - {hikeName}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div>
                {/* Template Buttons */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Load Template:</label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => handleLoadTemplate('day')}
                    >
                      Day Hike Template
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => handleLoadTemplate('overnight')}
                    >
                      Overnight Hike Template
                    </button>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Loading a template will replace the current list
                  </small>
                </div>

                <hr />

                {/* Add New Item */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Add Item:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter item name..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem();
                        }
                      }}
                    />
                    <button
                      className="btn btn-success"
                      onClick={handleAddItem}
                    >
                      <Plus size={16} className="me-1" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Packing List Items ({Array.isArray(items) ? items.length : 0}):</label>
                  {!Array.isArray(items) || items.length === 0 ? (
                    <div className="alert alert-info">
                      No items yet. Add items manually or load a template.
                    </div>
                  ) : (
                    <div className="list-group" style={{maxHeight: '400px', overflowY: 'auto'}}>
                      {items.map((item, index) => (
                        <div key={index} className="list-group-item d-flex align-items-center gap-2">
                          <span className="text-muted" style={{minWidth: '30px'}}>
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.name}
                            onChange={(e) => handleUpdateItemName(index, e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || saving || items.length === 0}
            >
              <Save size={16} className="me-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackingListEditorModal;
