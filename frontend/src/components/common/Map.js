import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ locationLink, height = '400px' }) => {
  const [position, setPosition] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [locationName, setLocationName] = React.useState('');

  useEffect(() => {
    if (!locationLink) {
      setError('No location provided');
      return;
    }

    // Extract coordinates from Google Maps URL
    const extractCoordinates = () => {
      try {
        // Try to parse Google Maps URL formats:
        // https://maps.google.com/?q=-33.123,18.456
        // https://www.google.com/maps/place/name/@-33.123,18.456,15z
        // https://www.google.com/maps/@-33.123,18.456,15z

        let lat, lon;

        // Format 1: ?q=lat,lon
        const qMatch = locationLink.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (qMatch) {
          lat = parseFloat(qMatch[1]);
          lon = parseFloat(qMatch[2]);
        }

        // Format 2: @lat,lon or place/@lat,lon
        const atMatch = locationLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (!lat && atMatch) {
          lat = parseFloat(atMatch[1]);
          lon = parseFloat(atMatch[2]);
        }

        // Format 3: /maps/place/name (try to extract name and geocode)
        const placeMatch = locationLink.match(/\/maps\/place\/([^/@]+)/);
        if (!lat && placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          setLocationName(placeName);
          geocodeLocation(placeName);
          return;
        }

        if (lat && lon) {
          setPosition([lat, lon]);
          setLocationName('Selected Location');
          setError(null);
        } else {
          // If we can't extract coordinates, try geocoding the URL as a search query
          geocodeLocation(locationLink);
        }
      } catch (err) {
        console.error('Error parsing location link:', err);
        setError('Failed to parse location link');
      }
    };

    // Geocode the location using Nominatim (OpenStreetMap's geocoding service)
    const geocodeLocation = async (query) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setLocationName(data[0].display_name);
          setError(null);
        } else {
          setError('Location not found');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Failed to load map location');
      }
    };

    extractCoordinates();
  }, [locationLink]);

  if (error) {
    return (
      <div
        className="d-flex align-items-center justify-content-center text-muted"
        style={{ height, border: '1px solid #dee2e6', borderRadius: '8px' }}
      >
        {error}
      </div>
    );
  }

  if (!position) {
    return (
      <div
        className="d-flex align-items-center justify-content-center text-muted"
        style={{ height, border: '1px solid #dee2e6', borderRadius: '8px' }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
