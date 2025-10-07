import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PackingList = ({ hikeId }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPackingList();
  }, [hikeId]);

  const fetchPackingList = async () => {
    setLoading(true);
    try {
      const data = await api.getPackingList(hikeId, token);
      setItems(data.items || []);
    } catch (err) {
      console.error('Fetch packing list error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (index) => {
    const updatedItems = [...items];
    updatedItems[index].checked = !updatedItems[index].checked;
    setItems(updatedItems);

    try {
      await api.updatePackingList(hikeId, updatedItems, token);
    } catch (err) {
      console.error('Update packing list error:', err);
      // Revert on error
      fetchPackingList();
    }
  };

  return (
    <div>
      <h5 className="mb-3">
        <Package size={20} className="me-2" />
        Packing List
      </h5>
      <p className="text-muted small mb-3">
        Check off items as you pack them. Your list is saved automatically.
      </p>

      {loading && items.length === 0 ? (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted">No packing list available for this hike.</p>
      ) : (
        <div className="list-group">
          {items.map((item, index) => (
            <div key={index} className="list-group-item">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={item.checked || false}
                  onChange={() => handleToggleItem(index)}
                  id={`packing-${index}`}
                />
                <label
                  className={`form-check-label ${item.checked ? 'text-decoration-line-through text-muted' : ''}`}
                  htmlFor={`packing-${index}`}
                >
                  {item.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackingList;
