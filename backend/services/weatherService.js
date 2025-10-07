const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get weather forecast for a location and date
 * @param {string} location - Location name or coordinates
 * @param {string} date - ISO date string
 * @returns {Promise<Object>} Weather forecast data
 */
async function getWeatherForecast(location, date) {
  try {
    if (!OPENWEATHER_API_KEY) {
      console.log('OpenWeather API key not configured');
      return null;
    }

    // First, geocode the location
    const geoUrl = `${OPENWEATHER_BASE_URL}/weather`;
    const geoParams = {
      q: location,
      appid: OPENWEATHER_API_KEY,
      units: 'metric'
    };

    const geoResponse = await axios.get(geoUrl, { params: geoParams });
    const { coord } = geoResponse.data;

    // Get 5-day forecast
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast`;
    const forecastParams = {
      lat: coord.lat,
      lon: coord.lon,
      appid: OPENWEATHER_API_KEY,
      units: 'metric'
    };

    const forecastResponse = await axios.get(forecastUrl, { params: forecastParams });

    // Find forecast closest to hike date
    const hikeDate = new Date(date);
    const hikeDateStr = hikeDate.toISOString().split('T')[0];

    const relevantForecasts = forecastResponse.data.list.filter(item => {
      const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0];
      return forecastDate === hikeDateStr;
    });

    if (relevantForecasts.length === 0) {
      // If no exact match, return null (date too far in future or past)
      return null;
    }

    // Use midday forecast (around 12:00)
    const middayForecast = relevantForecasts.reduce((prev, curr) => {
      const prevHour = new Date(prev.dt * 1000).getHours();
      const currHour = new Date(curr.dt * 1000).getHours();
      return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev;
    });

    return {
      temperature: Math.round(middayForecast.main.temp),
      feels_like: Math.round(middayForecast.main.feels_like),
      temp_min: Math.round(middayForecast.main.temp_min),
      temp_max: Math.round(middayForecast.main.temp_max),
      humidity: middayForecast.main.humidity,
      pressure: middayForecast.main.pressure,
      weather: middayForecast.weather[0].main,
      description: middayForecast.weather[0].description,
      icon: middayForecast.weather[0].icon,
      wind_speed: Math.round(middayForecast.wind.speed * 3.6), // Convert m/s to km/h
      wind_direction: middayForecast.wind.deg,
      clouds: middayForecast.clouds.all,
      pop: Math.round((middayForecast.pop || 0) * 100), // Probability of precipitation
      rain: middayForecast.rain ? middayForecast.rain['3h'] : 0,
      visibility: middayForecast.visibility ? middayForecast.visibility / 1000 : null, // Convert to km
      timestamp: middayForecast.dt,
      location: {
        name: location,
        lat: coord.lat,
        lon: coord.lon
      }
    };
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    return null;
  }
}

/**
 * Get weather suitability rating for hiking
 * @param {Object} weather - Weather data
 * @returns {Object} Suitability rating and advice
 */
function getHikingSuitability(weather) {
  if (!weather) {
    return {
      rating: 'unknown',
      score: 0,
      advice: 'Weather data unavailable'
    };
  }

  let score = 100;
  const warnings = [];
  const tips = [];

  // Temperature checks
  if (weather.temperature > 35) {
    score -= 30;
    warnings.push('Extreme heat - high risk of heat exhaustion');
    tips.push('Bring extra water and take frequent breaks');
  } else if (weather.temperature > 30) {
    score -= 15;
    warnings.push('Very hot conditions');
    tips.push('Start early morning to avoid peak heat');
  } else if (weather.temperature < 5) {
    score -= 25;
    warnings.push('Very cold conditions');
    tips.push('Dress in warm layers and bring hot drinks');
  } else if (weather.temperature < 10) {
    score -= 10;
    warnings.push('Cold conditions');
    tips.push('Bring warm clothing');
  }

  // Precipitation checks
  if (weather.pop > 80) {
    score -= 40;
    warnings.push('Very high chance of rain');
    tips.push('Bring waterproof gear and consider postponing');
  } else if (weather.pop > 60) {
    score -= 25;
    warnings.push('High chance of rain');
    tips.push('Pack rain gear and waterproof your bag');
  } else if (weather.pop > 30) {
    score -= 10;
    tips.push('Light rain possible - bring a rain jacket');
  }

  // Wind checks
  if (weather.wind_speed > 60) {
    score -= 50;
    warnings.push('Dangerous winds - consider canceling');
  } else if (weather.wind_speed > 40) {
    score -= 30;
    warnings.push('Very windy conditions');
    tips.push('Secure loose items and be cautious on exposed ridges');
  } else if (weather.wind_speed > 25) {
    score -= 15;
    warnings.push('Windy conditions');
    tips.push('Wear windproof layers');
  }

  // Weather condition checks
  const badConditions = ['Thunderstorm', 'Snow', 'Fog', 'Tornado'];
  if (badConditions.includes(weather.weather)) {
    score -= 50;
    warnings.push(`${weather.weather} expected - not suitable for hiking`);
  }

  // Humidity checks
  if (weather.humidity > 85 && weather.temperature > 25) {
    score -= 10;
    tips.push('High humidity - drink more water than usual');
  }

  // Visibility checks
  if (weather.visibility && weather.visibility < 1) {
    score -= 30;
    warnings.push('Poor visibility');
    tips.push('Stay on marked trails');
  }

  // Determine rating
  let rating;
  if (score >= 80) {
    rating = 'excellent';
  } else if (score >= 60) {
    rating = 'good';
  } else if (score >= 40) {
    rating = 'fair';
  } else if (score >= 20) {
    rating = 'poor';
  } else {
    rating = 'dangerous';
  }

  return {
    rating,
    score,
    warnings,
    tips,
    advice: warnings.length > 0 ? warnings[0] : 'Good conditions for hiking'
  };
}

module.exports = {
  getWeatherForecast,
  getHikingSuitability
};
