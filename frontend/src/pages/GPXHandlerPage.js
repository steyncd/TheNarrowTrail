// GPXHandlerPage.js - Handle .gpx file opening from system
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Map, MapPin, Route, TrendingUp, Clock, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GPXHandlerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [gpxData, setGpxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login?redirect=/open-gpx');
      return;
    }

    // Load GPX file data
    loadGPXFile();
  }, [currentUser, navigate]);

  const loadGPXFile = async () => {
    try {
      // In a real implementation, the service worker would cache the file
      // and we'd retrieve it from IndexedDB or FileSystem Access API
      const db = await openGPXDB();
      const tx = db.transaction(['gpxFiles'], 'readonly');
      const store = tx.objectStore('gpxFiles');
      const files = await store.getAll();

      if (files.length > 0) {
        const latestFile = files[files.length - 1];
        await parseGPX(latestFile.content);

        // Clean up after reading
        const deleteTx = db.transaction(['gpxFiles'], 'readwrite');
        const deleteStore = deleteTx.objectStore('gpxFiles');
        await deleteStore.clear();
      } else {
        setError('No GPX file found. Please try opening a GPX file again.');
      }
    } catch (err) {
      console.error('Error loading GPX file:', err);
      setError('Failed to load GPX file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openGPXDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GPXFilesDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('gpxFiles')) {
          db.createObjectStore('gpxFiles', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  const parseGPX = async (gpxContent) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');

      // Extract metadata
      const metadata = xmlDoc.querySelector('metadata');
      const name = metadata?.querySelector('name')?.textContent || 'Unnamed Trail';
      const description = metadata?.querySelector('desc')?.textContent || '';

      // Extract track points
      const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt')).map(point => ({
        lat: parseFloat(point.getAttribute('lat')),
        lon: parseFloat(point.getAttribute('lon')),
        ele: parseFloat(point.querySelector('ele')?.textContent || 0),
        time: point.querySelector('time')?.textContent
      }));

      if (trackPoints.length === 0) {
        throw new Error('No track points found in GPX file');
      }

      // Calculate statistics
      const stats = calculateTrackStats(trackPoints);

      setGpxData({
        name,
        description,
        trackPoints,
        stats
      });
    } catch (err) {
      console.error('Error parsing GPX:', err);
      throw new Error('Invalid GPX file format');
    }
  };

  const calculateTrackStats = (points) => {
    let totalDistance = 0;
    let totalElevationGain = 0;
    let totalElevationLoss = 0;
    let minElevation = points[0]?.ele || 0;
    let maxElevation = points[0]?.ele || 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = toRad(curr.lat - prev.lat);
      const dLon = toRad(curr.lon - prev.lon);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(prev.lat)) * Math.cos(toRad(curr.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;

      // Calculate elevation changes
      const elevDiff = curr.ele - prev.ele;
      if (elevDiff > 0) {
        totalElevationGain += elevDiff;
      } else {
        totalElevationLoss += Math.abs(elevDiff);
      }

      // Track min/max elevation
      minElevation = Math.min(minElevation, curr.ele);
      maxElevation = Math.max(maxElevation, curr.ele);
    }

    // Calculate estimated time (using Naismith's rule: 5 km/h + 10 min per 100m ascent)
    const baseTime = (totalDistance / 5) * 60; // minutes
    const ascentTime = (totalElevationGain / 100) * 10; // minutes
    const estimatedTime = baseTime + ascentTime;

    return {
      distance: totalDistance.toFixed(2),
      elevationGain: Math.round(totalElevationGain),
      elevationLoss: Math.round(totalElevationLoss),
      minElevation: Math.round(minElevation),
      maxElevation: Math.round(maxElevation),
      estimatedTime: Math.round(estimatedTime),
      pointCount: points.length
    };
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const handleCreateHike = () => {
    // Navigate to create hike page with GPX data
    navigate('/manage-hikes/new', { state: { gpxData } });
  };

  const handleViewOnMap = () => {
    // Navigate to map view with GPX data
    navigate('/map', { state: { gpxData } });
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

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading GPX file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div className="card shadow-lg">
                <div className="card-body text-center p-5">
                  <Map size={64} className="text-danger mb-3" />
                  <h3 className="mb-3">Error Loading GPX File</h3>
                  <p className="text-muted mb-4">{error}</p>
                  <button className="btn btn-primary" onClick={() => navigate('/hikes')}>
                    Return to Hikes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%)'}}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-lg">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center me-3" style={{width: '56px', height: '56px'}}>
                    <Map size={32} color="white" />
                  </div>
                  <div>
                    <h3 className="mb-0">{gpxData?.name}</h3>
                    <p className="text-muted mb-0">GPX Trail Data</p>
                  </div>
                </div>

                {/* Description */}
                {gpxData?.description && (
                  <div className="alert alert-info mb-4">
                    <strong>Description:</strong> {gpxData.description}
                  </div>
                )}

                {/* Statistics Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <Route size={20} className="text-primary me-2" />
                          <h6 className="mb-0">Distance</h6>
                        </div>
                        <h4 className="mb-0">{gpxData?.stats.distance} km</h4>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <TrendingUp size={20} className="text-success me-2" />
                          <h6 className="mb-0">Elevation Gain</h6>
                        </div>
                        <h4 className="mb-0">{gpxData?.stats.elevationGain} m</h4>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-light h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <Clock size={20} className="text-warning me-2" />
                          <h6 className="mb-0">Est. Time</h6>
                        </div>
                        <h4 className="mb-0">
                          {Math.floor(gpxData?.stats.estimatedTime / 60)}h {gpxData?.stats.estimatedTime % 60}m
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <MapPin size={20} className="text-muted mb-2" />
                      <div className="small text-muted">Track Points</div>
                      <strong>{gpxData?.stats.pointCount}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <TrendingUp size={20} className="text-danger mb-2" />
                      <div className="small text-muted">Elevation Loss</div>
                      <strong>{gpxData?.stats.elevationLoss} m</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <Navigation size={20} className="text-info mb-2" />
                      <div className="small text-muted">Min Elevation</div>
                      <strong>{gpxData?.stats.minElevation} m</strong>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <Navigation size={20} className="text-success mb-2" />
                      <div className="small text-muted">Max Elevation</div>
                      <strong>{gpxData?.stats.maxElevation} m</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button className="btn btn-outline-secondary flex-fill" onClick={() => navigate('/hikes')}>
                    Cancel
                  </button>
                  <button className="btn btn-outline-primary flex-fill" onClick={handleViewOnMap}>
                    <Map size={18} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                    View on Map
                  </button>
                  <button className="btn btn-primary flex-fill" onClick={handleCreateHike}>
                    <Route size={18} className="me-2" style={{verticalAlign: 'text-bottom'}} />
                    Create Hike from Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPXHandlerPage;
