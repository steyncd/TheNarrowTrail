// ShareTargetPage.js - Handle shared content from native share menu
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Image as ImageIcon, X, Check, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ShareTargetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [sharedData, setSharedData] = useState({
    title: '',
    text: '',
    url: '',
    files: []
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      // Redirect to login with return path
      navigate('/login?redirect=/share&shared=true');
      return;
    }

    // Extract shared data from URL params
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    setSharedData(prev => ({
      ...prev,
      title,
      text,
      url
    }));

    // Handle form data (for files shared from native apps)
    handleFormData();
  }, [currentUser, navigate, searchParams]);

  const handleFormData = async () => {
    // Check if this is a POST request with form data
    // In a real implementation, the service worker would cache the POST data
    // and we'd retrieve it from IndexedDB
    try {
      const db = await openShareDB();
      const tx = db.transaction(['shares'], 'readonly');
      const store = tx.objectStore('shares');
      const shares = await store.getAll();

      if (shares.length > 0) {
        const latestShare = shares[shares.length - 1];
        if (latestShare.files && latestShare.files.length > 0) {
          setSharedData(prev => ({
            ...prev,
            files: latestShare.files
          }));
        }

        // Clean up the share data after reading
        const deleteTx = db.transaction(['shares'], 'readwrite');
        const deleteStore = deleteTx.objectStore('shares');
        await deleteStore.clear();
      }
    } catch (err) {
      console.warn('Could not retrieve shared files:', err);
    }
  };

  const openShareDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShareTargetDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('shares')) {
          db.createObjectStore('shares', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setSharedData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index) => {
    setSharedData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!sharedData.title && !sharedData.text && sharedData.files.length === 0) {
      setError('Please add some content to share');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Here you would upload to your backend
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);

      // After success, redirect to appropriate page
      setTimeout(() => {
        navigate('/hikes');
      }, 2000);
    } catch (err) {
      setError('Failed to share content. Please try again.');
      console.error('Share error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/hikes');
  };

  if (!currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg">
              <div className="card-body p-4">
                {success ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                        <Check size={48} color="white" />
                      </div>
                    </div>
                    <h3 className="mb-3">Shared Successfully!</h3>
                    <p className="text-muted">Your content has been shared. Redirecting...</p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center mb-4">
                      <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                        <Upload size={24} color="white" />
                      </div>
                      <div>
                        <h4 className="mb-0">Share to The Narrow Trail</h4>
                        <p className="text-muted mb-0 small">Share photos, links, or text with the community</p>
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    {/* Title */}
                    {sharedData.title && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sharedData.title}
                          onChange={(e) => setSharedData(prev => ({...prev, title: e.target.value}))}
                        />
                      </div>
                    )}

                    {/* Text/Description */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={sharedData.text}
                        onChange={(e) => setSharedData(prev => ({...prev, text: e.target.value}))}
                        placeholder="Add a description or note..."
                      />
                    </div>

                    {/* URL */}
                    {sharedData.url && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Link</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FileText size={16} />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            value={sharedData.url}
                            readOnly
                          />
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {sharedData.files.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Images ({sharedData.files.length})</label>
                        <div className="row g-2">
                          {sharedData.files.map((file, index) => (
                            <div key={index} className="col-4">
                              <div className="position-relative">
                                {file.type?.startsWith('image/') ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Shared ${index + 1}`}
                                    className="img-fluid rounded"
                                    style={{width: '100%', height: '120px', objectFit: 'cover'}}
                                  />
                                ) : (
                                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{height: '120px'}}>
                                    <ImageIcon size={32} className="text-muted" />
                                  </div>
                                )}
                                <button
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                                  style={{width: '28px', height: '28px', padding: 0}}
                                  onClick={() => removeFile(index)}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Add Photos</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                      />
                      <small className="text-muted">You can select multiple images</small>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-secondary flex-fill"
                        onClick={handleCancel}
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary flex-fill"
                        onClick={handleSubmit}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sharing...
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                            Share
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTargetPage;
