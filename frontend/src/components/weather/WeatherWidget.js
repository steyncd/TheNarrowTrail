import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const WeatherWidget = ({ hikeId, location, date }) => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, [hikeId, location, date]);

  const fetchWeather = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      let data;
      if (hikeId) {
        data = await api.getWeatherForHike(hikeId, token);
      } else if (location && date) {
        data = await api.getWeatherForecast(location, date, token);
      } else {
        setLoading(false);
        return;
      }

      if (data.available) {
        setWeather(data);
      } else {
        setError(data.message || 'Weather data not available');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to load weather forecast');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherType, iconCode) => {
    const iconMap = {
      'Clear': <Sun size={48} className="text-warning" />,
      'Clouds': <Cloud size={48} className="text-secondary" />,
      'Rain': <CloudRain size={48} className="text-info" />,
      'Drizzle': <CloudRain size={48} className="text-info" />,
      'Thunderstorm': <CloudRain size={48} className="text-danger" />,
      'Snow': <Cloud size={48} className="text-light" />,
    };

    return iconMap[weatherType] || <Cloud size={48} className="text-secondary" />;
  };

  const getSuitabilityColor = (rating) => {
    const colors = {
      'excellent': 'success',
      'good': 'info',
      'fair': 'warning',
      'poor': 'danger',
      'dangerous': 'dark'
    };
    return colors[rating] || 'secondary';
  };

  const getSuitabilityIcon = (rating) => {
    if (rating === 'excellent' || rating === 'good') {
      return <ThumbsUp size={20} />;
    } else if (rating === 'poor' || rating === 'dangerous') {
      return <ThumbsDown size={20} />;
    }
    return <AlertTriangle size={20} />;
  };

  if (loading) {
    return (
      <div className={`card ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading weather...</span>
          </div>
          <p className="mt-2">Loading weather forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
        <div className="card-body text-center text-muted">
          <Cloud size={32} className="mb-2" />
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather || !weather.weather) {
    return null;
  }

  const { weather: w, suitability } = weather;

  return (
    <div className={`card ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center">
          <Cloud size={20} className="me-2" />
          Weather Forecast
        </h5>

        <div className="row align-items-center mb-3">
          <div className="col-auto">
            {getWeatherIcon(w.weather, w.icon)}
          </div>
          <div className="col">
            <h2 className="mb-0">{w.temperature}°C</h2>
            <p className="text-muted mb-0">{w.description}</p>
            <small className="text-muted">Feels like {w.feels_like}°C</small>
          </div>
        </div>

        {/* Suitability Rating */}
        <div className={`alert alert-${getSuitabilityColor(suitability.rating)} d-flex align-items-center mb-3`}>
          <div className="me-2">
            {getSuitabilityIcon(suitability.rating)}
          </div>
          <div>
            <strong className="text-capitalize">{suitability.rating}</strong> for hiking ({suitability.score}/100)
            {suitability.advice && (
              <div className="small mt-1">{suitability.advice}</div>
            )}
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="row g-3">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <Wind size={18} className="me-2 text-primary" />
              <div>
                <small className="text-muted d-block">Wind</small>
                <strong>{w.wind_speed} km/h</strong>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="d-flex align-items-center">
              <Droplets size={18} className="me-2 text-primary" />
              <div>
                <small className="text-muted d-block">Humidity</small>
                <strong>{w.humidity}%</strong>
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="d-flex align-items-center">
              <CloudRain size={18} className="me-2 text-primary" />
              <div>
                <small className="text-muted d-block">Rain Chance</small>
                <strong>{w.pop}%</strong>
              </div>
            </div>
          </div>

          {w.visibility && (
            <div className="col-6">
              <div className="d-flex align-items-center">
                <Eye size={18} className="me-2 text-primary" />
                <div>
                  <small className="text-muted d-block">Visibility</small>
                  <strong>{w.visibility} km</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warnings and Tips */}
        {suitability.warnings && suitability.warnings.length > 0 && (
          <div className="mt-3">
            <h6 className="text-danger d-flex align-items-center">
              <AlertTriangle size={16} className="me-2" />
              Warnings
            </h6>
            <ul className="small mb-0">
              {suitability.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {suitability.tips && suitability.tips.length > 0 && (
          <div className="mt-3">
            <h6 className="text-primary">💡 Tips</h6>
            <ul className="small mb-0">
              {suitability.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            Forecast for {new Date(w.timestamp * 1000).toLocaleDateString()} at {new Date(w.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </small>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
