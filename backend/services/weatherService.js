const axios = require('axios');
const { getSetting } = require('./settingsService');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// In-memory cache for weather forecasts
const weatherCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds (configurable)

// API Keys configuration for settings controller
const API_KEYS = {
  visualcrossing: process.env.VISUAL_CROSSING_API_KEY || '',
  weatherapi: process.env.WEATHERAPI_KEY || '',
  openweather: process.env.OPENWEATHER_API_KEY || ''
};

// Provider information for settings controller
const PROVIDERS = {
  visualcrossing: {
    name: 'Visual Crossing',
    freeLimit: 1000, // per day
    forecastDays: 15,
    features: ['alerts', 'hourly', 'historical']
  },
  weatherapi: {
    name: 'WeatherAPI.com',
    freeLimit: 1000000, // per month
    forecastDays: 14,
    features: ['alerts', 'hourly', 'astronomy']
  },
  openweather: {
    name: 'OpenWeather',
    freeLimit: 1000, // per day
    forecastDays: 5,
    features: ['hourly']
  }
};

/**
 * Fetch weather from Visual Crossing API
 */
async function fetchVisualCrossingWeather(location, date) {
  const apiKey = API_KEYS.visualcrossing;
  if (!apiKey) {
    throw new Error('Visual Crossing API key not configured');
  }

  // Calculate date range for 7-day forecast
  const startDate = new Date(date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // 7 days total
  const endDateStr = endDate.toISOString().split('T')[0];

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${date}/${endDateStr}`;
  const response = await axios.get(url, {
    params: {
      key: apiKey,
      unitGroup: 'metric',
      include: 'days'
    }
  });

  const day = response.data.days[0];

  // Build extended forecast array
  const extendedForecast = response.data.days.map(d => ({
    date: d.datetime,
    temp_max: Math.round(d.tempmax),
    temp_min: Math.round(d.tempmin),
    condition: d.conditions,
    icon: d.icon,
    pop: Math.round(d.precipprob || 0),
    rain: d.precip || 0
  }));

  return {
    temperature: Math.round(day.temp),
    feels_like: Math.round(day.feelslike),
    temp_min: Math.round(day.tempmin),
    temp_max: Math.round(day.tempmax),
    humidity: day.humidity,
    pressure: day.pressure,
    weather: day.conditions,
    description: day.description,
    wind_speed: Math.round(day.windspeed),
    wind_direction: day.winddir,
    clouds: day.cloudcover,
    pop: Math.round(day.precipprob || 0),
    rain: day.precip || 0,
    visibility: day.visibility,
    uv_index: day.uvindex || null,
    sunrise: day.sunrise,
    sunset: day.sunset,
    moonrise: day.moonrise || null,
    moonset: day.moonset || null,
    moon_phase: day.moonphase || null, // 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter
    extended_forecast: extendedForecast,
    location: {
      name: location,
      lat: response.data.latitude,
      lon: response.data.longitude
    },
    provider: 'visualcrossing'
  };
}

/**
 * Fetch weather from WeatherAPI.com
 */
async function fetchWeatherAPIWeather(location, date) {
  const apiKey = API_KEYS.weatherapi;
  if (!apiKey) {
    throw new Error('WeatherAPI.com API key not configured');
  }

  const url = 'https://api.weatherapi.com/v1/forecast.json';
  const response = await axios.get(url, {
    params: {
      key: apiKey,
      q: location,
      dt: date,
      days: 7 // Get 7-day forecast for extended forecast feature
    }
  });

  const day = response.data.forecast.forecastday[0].day;
  const astro = response.data.forecast.forecastday[0].astro;

  // Build extended forecast array
  const extendedForecast = response.data.forecast.forecastday.map(fc => ({
    date: fc.date,
    temp_max: Math.round(fc.day.maxtemp_c),
    temp_min: Math.round(fc.day.mintemp_c),
    condition: fc.day.condition.text,
    icon: fc.day.condition.icon,
    pop: fc.day.daily_chance_of_rain,
    rain: fc.day.totalprecip_mm
  }));

  return {
    temperature: Math.round(day.avgtemp_c),
    feels_like: Math.round(day.avgtemp_c), // WeatherAPI doesn't provide feels_like for forecast
    temp_min: Math.round(day.mintemp_c),
    temp_max: Math.round(day.maxtemp_c),
    humidity: day.avghumidity,
    pressure: null, // Not provided in forecast
    weather: day.condition.text,
    description: day.condition.text,
    wind_speed: Math.round(day.maxwind_kph),
    wind_direction: null,
    clouds: null,
    pop: day.daily_chance_of_rain,
    rain: day.totalprecip_mm,
    visibility: day.avgvis_km,
    uv_index: day.uv || null,
    sunrise: astro.sunrise,
    sunset: astro.sunset,
    moonrise: astro.moonrise,
    moonset: astro.moonset,
    moon_phase: astro.moon_phase,
    moon_illumination: astro.moon_illumination,
    extended_forecast: extendedForecast,
    location: {
      name: response.data.location.name,
      lat: response.data.location.lat,
      lon: response.data.location.lon
    },
    provider: 'weatherapi'
  };
}

/**
 * Fetch weather from OpenWeather API
 */
async function fetchOpenWeatherWeather(location, date) {
  const apiKey = API_KEYS.openweather;
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured');
  }

  // First, geocode the location
  const geoUrl = `${OPENWEATHER_BASE_URL}/weather`;
  const geoParams = {
    q: location,
    appid: apiKey,
    units: 'metric'
  };

  const geoResponse = await axios.get(geoUrl, { params: geoParams });
  const { coord } = geoResponse.data;

  // Get 5-day forecast
  const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast`;
  const forecastParams = {
    lat: coord.lat,
    lon: coord.lon,
    appid: apiKey,
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
    throw new Error('Date too far in future or past for OpenWeather API');
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
    },
    provider: 'openweather'
  };
}

/**
 * Get weather forecast for a location and date
 * Checks database for preferred provider and attempts to fetch weather
 * Uses in-memory caching to reduce API calls
 * @param {string} location - Location name or coordinates
 * @param {string} date - ISO date string
 * @returns {Promise<Object>} Weather forecast data
 */
async function getWeatherForecast(location, date) {
  const pool = require('../config/database');
  
  // Generate cache key
  const cacheKey = `${location}|${date}`.toLowerCase();
  
  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Weather cache HIT for ${location} on ${date} - reapplying settings`);
    // Apply current settings even to cached data to respect settings changes
    return await applyWeatherSettings(cached.rawData);
  }
  
  console.log(`Weather cache MISS for ${location} on ${date}`);
  
  try {
    // Get the primary provider from settings
    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'weather_api_primary'"
    );
    const primaryProvider = result.rows[0]?.setting_value || 'openweather';

    // Try the specified provider
    let weather = null;
    try {
      switch (primaryProvider) {
        case 'visualcrossing':
          weather = await fetchVisualCrossingWeather(location, date);
          break;
        case 'weatherapi':
          weather = await fetchWeatherAPIWeather(location, date);
          break;
        case 'openweather':
        default:
          weather = await fetchOpenWeatherWeather(location, date);
          break;
      }
    } catch (providerError) {
      console.error(`Error fetching weather from ${primaryProvider}:`, providerError.message);
      
      // Try fallback provider
      const fallbackResult = await pool.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'weather_api_fallback'"
      );
      const fallbackProvider = fallbackResult.rows[0]?.setting_value;
      
      if (fallbackProvider && fallbackProvider !== primaryProvider) {
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        try {
          switch (fallbackProvider) {
            case 'visualcrossing':
              weather = await fetchVisualCrossingWeather(location, date);
              break;
            case 'weatherapi':
              weather = await fetchWeatherAPIWeather(location, date);
              break;
            case 'openweather':
              weather = await fetchOpenWeatherWeather(location, date);
              break;
          }
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
        }
      }
    }

    // Cache the raw weather data (without settings applied)
    // This allows us to reapply settings when they change
    if (weather) {
      weatherCache.set(cacheKey, {
        rawData: weather, // Store unconverted data
        timestamp: Date.now()
      });
      console.log(`Cached raw weather data for ${location} on ${date}`);

      // Apply current settings before returning
      return await applyWeatherSettings(weather);
    }

    return null;
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

/**
 * Unit conversion functions
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function kmhToMs(kmh) {
  return kmh / 3.6;
}

/**
 * Apply weather settings (unit conversions and data filtering)
 */
async function applyWeatherSettings(weather) {
  if (!weather) return null;

  try {
    // Get weather display settings
    const tempUnit = await getSetting('weather_temperature_unit', 'celsius');
    const windUnit = await getSetting('weather_wind_speed_unit', 'km/h');

    // Make a copy to avoid mutating original
    const processedWeather = { ...weather };

    // Convert temperature if needed
    if (tempUnit === 'fahrenheit') {
      processedWeather.temperature = Math.round(celsiusToFahrenheit(weather.temperature));
      processedWeather.feels_like = Math.round(celsiusToFahrenheit(weather.feels_like));
      processedWeather.temp_min = Math.round(celsiusToFahrenheit(weather.temp_min));
      processedWeather.temp_max = Math.round(celsiusToFahrenheit(weather.temp_max));
      processedWeather.tempUnit = '°F';
    } else {
      processedWeather.tempUnit = '°C';
    }

    // Convert wind speed if needed
    if (windUnit === 'mph') {
      processedWeather.wind_speed = Math.round(kmhToMph(weather.wind_speed));
      processedWeather.windUnit = 'mph';
    } else if (windUnit === 'm/s') {
      processedWeather.wind_speed = Math.round(kmhToMs(weather.wind_speed) * 10) / 10; // One decimal
      processedWeather.windUnit = 'm/s';
    } else {
      processedWeather.windUnit = 'km/h';
    }

    // Note: Extended forecast, UV index, sunrise/sunset, moon phase
    // require additional API calls or different endpoints
    // For now, we mark which features are enabled for frontend to know
    processedWeather.settings = {
      showExtendedForecast: await getSetting('weather_show_extended_forecast', true),
      showUvIndex: await getSetting('weather_show_uv_index', true),
      showSunTimes: await getSetting('weather_show_sun_times', true),
      showMoonPhase: await getSetting('weather_show_moon_phase', true)
    };

    return processedWeather;
  } catch (error) {
    console.error('Error applying weather settings:', error);
    // Return original weather if settings fail
    return {
      ...weather,
      tempUnit: '°C',
      windUnit: 'km/h'
    };
  }
}

// Stub function for clearing settings cache (required by settingsController)
function clearSettingsCache() {
  // No-op for now - can be implemented later if caching is added
  return true;
}

/**
 * Clear weather forecast cache
 * Useful for testing or when cache needs to be invalidated
 */
function clearWeatherCache() {
  const size = weatherCache.size;
  weatherCache.clear();
  console.log(`Cleared ${size} weather cache entries`);
  return { cleared: size };
}

/**
 * Get weather cache statistics
 */
function getWeatherCacheStats() {
  return {
    size: weatherCache.size,
    cacheDuration: CACHE_DURATION,
    cacheDurationMinutes: CACHE_DURATION / 60000
  };
}

// Clean up old cache entries periodically (every 15 minutes)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of weatherCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      weatherCache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired weather cache entries`);
  }
}, 900000); // 15 minutes

module.exports = {
  getWeatherForecast,
  getHikingSuitability,
  clearSettingsCache,
  clearWeatherCache,
  getWeatherCacheStats,
  PROVIDERS,
  API_KEYS
};
