import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

function PhotoGallery() {
  const { currentUser, token } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const data = await api.getPhotos(token);
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const handleDeletePhoto = async (photoId, uploadedBy) => {
    // Only allow deletion if user is admin or they uploaded the photo
    if (currentUser.role !== 'admin' && uploadedBy !== currentUser.email) {
      return;
    }

    if (!window.confirm('Delete this photo?')) return;

    setLoading(true);
    try {
      const result = await api.deletePhoto(photoId, token);
      if (result.success) {
        await fetchPhotos();
      } else {
        alert(result.error || 'Failed to delete photo');
      }
    } catch (err) {
      console.error('Delete photo error:', err);
      alert('Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-4">
      {photos.length === 0 ? (
        <div className="col-12">
          <div className="text-center py-5">
            <p className="text-muted">No photos yet. Upload some photos to get started!</p>
          </div>
        </div>
      ) : (
        photos.map(photo => (
          <div key={photo.id} className="col-md-4">
            <div className="card">
              <img
                src={photo.url}
                className="card-img-top"
                alt={photo.hike_name}
                style={{height: '200px', objectFit: 'cover'}}
              />
              <div className="card-body">
                <h6 className="card-title">{photo.hike_name}</h6>
                <p className="card-text small text-muted">
                  {new Date(photo.date).toLocaleDateString()}<br />
                  By {photo.uploaded_by}
                </p>
                {(currentUser.role === 'admin' || photo.uploaded_by === currentUser.email) && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeletePhoto(photo.id, photo.uploaded_by)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PhotoGallery;
