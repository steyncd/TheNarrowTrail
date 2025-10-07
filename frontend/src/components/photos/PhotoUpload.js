import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

function PhotoUpload({ onPhotoUploaded }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoUpload, setPhotoUpload] = useState({
    hikeName: '',
    date: '',
    url: ''
  });

  const handleAddPhoto = async () => {
    setError('');

    if (!photoUpload.hikeName || !photoUpload.date || !photoUpload.url) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const result = await api.addPhoto({
        hike_name: photoUpload.hikeName,
        date: photoUpload.date,
        url: photoUpload.url
      }, token);

      if (result.success) {
        setPhotoUpload({ hikeName: '', date: '', url: '' });
        if (onPhotoUploaded) onPhotoUploaded();
      } else {
        setError(result.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Add photo error:', err);
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Upload Photo</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Hike name"
              value={photoUpload.hikeName}
              onChange={(e) => setPhotoUpload({...photoUpload, hikeName: e.target.value})}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={photoUpload.date}
              onChange={(e) => setPhotoUpload({...photoUpload, date: e.target.value})}
            />
          </div>
          <div className="col-md-5">
            <input
              type="url"
              className="form-control"
              placeholder="Image URL"
              value={photoUpload.url}
              onChange={(e) => setPhotoUpload({...photoUpload, url: e.target.value})}
            />
          </div>
        </div>
        <button
          className="btn btn-success mt-3"
          onClick={handleAddPhoto}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>
    </div>
  );
}

export default PhotoUpload;
