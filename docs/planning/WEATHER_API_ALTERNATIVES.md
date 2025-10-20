# 🌤️ Weather API Alternatives for South Africa

**Date:** October 16, 2025  
**Context:** OpenWeather API has limited coverage for South African locations  
**Goal:** Find better weather API with comprehensive South African coverage

---

## 📊 Current Situation

### Current Implementation: OpenWeather API
- **Location:** `backend/services/weatherService.js`
- **API:** OpenWeather API (One Call API 2.5)
- **Problem:** Limited location coverage in South Africa
- **Issues:**
  - Many SA hiking locations not recognized
  - Poor geocoding for rural/mountain areas
  - Generic forecasts for regions without specific data

---

## 🌍 Weather API Alternatives - South Africa Focus

### 1. **South African Weather Service (SAWS) API** ⭐ BEST FOR SA
**Provider:** South African Weather Service (Official Government Service)  
**Website:** https://www.weathersa.co.za/

#### ✅ Advantages:
- **Official South African weather authority**
- **Comprehensive SA coverage** - All regions, cities, and rural areas
- **Localized forecasts** - Specific to SA climate patterns
- **Accurate data** - Ground stations across SA
- **Mountain weather** - Better for hiking locations
- **Marine forecasts** - Coastal hikes
- **Severe weather alerts** - Critical for safety

#### ❌ Disadvantages:
- Limited API documentation (may need to contact them)
- Primarily focused on SA only
- May require special application for commercial use
- API access may be restricted or require approval

#### 💰 Pricing:
- **Likely FREE for basic use** (government service)
- May need to contact for commercial API access
- Contact: api@weathersa.co.za (hypothetical, verify)

#### 📍 Coverage:
- **Excellent** for all South African locations
- Covers all 9 provinces
- Rural and mountain areas included

---

### 2. **Visual Crossing Weather API** ⭐ RECOMMENDED ALTERNATIVE
**Provider:** Visual Crossing Corporation  
**Website:** https://www.visualcrossing.com/weather-api

#### ✅ Advantages:
- **Excellent global coverage** including South Africa
- **Historical weather data** - Great for pattern analysis
- **15-day forecast** - Better planning than OpenWeather's 5 days
- **Location autocomplete** - Better geocoding
- **Weather timeline API** - Detailed hourly forecasts
- **CSV/JSON formats** - Flexible integration
- **Good documentation** - Easy to integrate
- **Weather alerts** included
- **Air quality data** included

#### ❌ Disadvantages:
- Paid service (though generous free tier)
- Not SA-specific

#### 💰 Pricing:
- **FREE Tier:** 1,000 calls/day (30,000/month)
- **Starter:** $0.0001 per record (very affordable)
- **Standard:** Custom pricing
- **Perfect for hiking portal** - Free tier likely sufficient

#### 📍 Coverage:
- **Excellent** for South Africa
- Uses multiple data sources including:
  - Global weather models
  - Local weather stations
  - Satellite data
  - Historical records

#### 🔧 Integration Complexity:
**EASY** - Similar to OpenWeather

```javascript
// Example API call
const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?key=${API_KEY}&unitGroup=metric`;
```

---

### 3. **WeatherAPI.com** ⭐ GOOD OPTION
**Provider:** WeatherAPI.com  
**Website:** https://www.weatherapi.com/

#### ✅ Advantages:
- **Very generous free tier** - 1,000,000 calls/month FREE
- **Good SA coverage** - Better than OpenWeather
- **14-day forecast**
- **Real-time weather**
- **Historical data** (last 7 days free)
- **Astronomy data** - Sunrise/sunset (useful for hiking)
- **Simple API** - Very easy to integrate
- **Fast response times**
- **Sports forecasts** - Outdoor activity specific

#### ❌ Disadvantages:
- Less established than major providers
- Some remote locations may have gaps

#### 💰 Pricing:
- **FREE Tier:** 1,000,000 calls/month (incredible value)
- **Pro:** $4/month for 5M calls
- **Business:** Custom pricing
- **Best value for money**

#### 📍 Coverage:
- **Good** for South Africa
- City and rural coverage
- Better than OpenWeather for SA locations

#### 🔧 Integration Complexity:
**VERY EASY**

```javascript
// Example API call
const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=yes`;
```

---

### 4. **Tomorrow.io (formerly ClimaCell)** 🌟 PREMIUM OPTION
**Provider:** Tomorrow.io  
**Website:** https://www.tomorrow.io/

#### ✅ Advantages:
- **HyperCast technology** - Very accurate short-term forecasts
- **Minute-by-minute** precipitation forecasts
- **15-day forecast**
- **Global coverage** including South Africa
- **Weather routes** - Perfect for hiking trails
- **Air quality** and **pollen** data
- **Fire weather index** - Critical for SA hiking
- **Professional grade** - Used by major companies

#### ❌ Disadvantages:
- More expensive than alternatives
- May be overkill for basic needs
- Complex pricing structure

#### 💰 Pricing:
- **FREE Tier:** 500 calls/day (15,000/month)
- **Developer:** $99/month for 100K calls
- **Premium:** Custom pricing

#### 📍 Coverage:
- **Excellent** global coverage
- Good SA data from multiple sources
- Fire weather data crucial for SA

---

### 5. **Open-Meteo** 🆓 FREE & OPEN SOURCE
**Provider:** Open-Meteo.com  
**Website:** https://open-meteo.com/

#### ✅ Advantages:
- **100% FREE** - No API key needed!
- **Open source** - Transparent
- **No rate limits** for non-commercial use
- **No registration** required
- **Good global coverage**
- **16-day forecast**
- **Hourly data**
- **Historical data**
- **Multiple weather models** (ECMWF, GFS, DWD)

#### ❌ Disadvantages:
- May have gaps in remote SA locations
- Not as polished as commercial APIs
- Limited support

#### 💰 Pricing:
- **FREE** for non-commercial use
- **Commercial:** Subscribe for higher rate limits and support

#### 📍 Coverage:
- **Good** for South Africa
- Uses European weather models (ECMWF) which cover SA
- May struggle with very specific mountain locations

#### 🔧 Integration Complexity:
**VERY EASY** - No auth required!

```javascript
// Example API call - NO KEY NEEDED!
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Johannesburg`;
```

---

### 6. **Weatherstack** 💼 BUSINESS OPTION
**Provider:** Weatherstack (by APILayer)  
**Website:** https://weatherstack.com/

#### ✅ Advantages:
- **Good SA coverage**
- **Real-time weather**
- **Historical data**
- **Simple REST API**
- **Reliable infrastructure**
- **Weather forecasts**

#### ❌ Disadvantages:
- Free tier is very limited (1,000 calls/month)
- More expensive for volume
- Forecast feature only on paid plans

#### 💰 Pricing:
- **FREE Tier:** 1,000 calls/month (current weather only)
- **Standard:** $9.99/month for 50K calls + forecasts
- **Professional:** $49.99/month

---

## 🏆 RECOMMENDATIONS

### Best Overall for Hiking Portal: **Visual Crossing Weather API** ⭐⭐⭐⭐⭐

**Why?**
1. ✅ **Excellent SA coverage** - Better than OpenWeather
2. ✅ **Generous free tier** - 1,000 calls/day (sufficient for portal)
3. ✅ **15-day forecasts** - Better planning for hikers
4. ✅ **Easy integration** - Similar to current OpenWeather code
5. ✅ **Historical data** - Can analyze patterns for popular hikes
6. ✅ **Good documentation** - Developer-friendly
7. ✅ **Weather alerts** - Safety critical
8. ✅ **Proven reliability** - Used by major companies

**Use Case Calculation:**
- Average portal users: ~100 hikers
- Weather checks per user per day: ~2-3
- Total daily calls: ~200-300
- Free tier: 1,000/day = **More than sufficient**

---

### Best Budget Option: **WeatherAPI.com** 💰⭐⭐⭐⭐⭐

**Why?**
1. ✅ **Incredibly generous free tier** - 1M calls/month!
2. ✅ **Good SA coverage**
3. ✅ **14-day forecast**
4. ✅ **Super easy integration**
5. ✅ **Astronomy data** (sunrise/sunset)
6. ✅ **Zero cost concerns**

**Best if:** Budget is primary concern or expecting high traffic

---

### Best for SA-Specific Accuracy: **SAWS API** 🇿🇦⭐⭐⭐⭐

**Why?**
1. ✅ **Official SA weather service**
2. ✅ **Best local accuracy**
3. ✅ **Comprehensive SA coverage**
4. ✅ **Severe weather alerts**
5. ✅ **Mountain weather expertise**

**Considerations:**
- Need to investigate API availability
- May require application/approval
- Contact SAWS for API access: info@weathersa.co.za

---

### Best Free/Open Source: **Open-Meteo** 🆓⭐⭐⭐⭐

**Why?**
1. ✅ **Completely free**
2. ✅ **No API key needed**
3. ✅ **No rate limits**
4. ✅ **Good SA coverage**
5. ✅ **Open source transparency**

**Best if:** Want zero dependencies on commercial services

---

## 🔧 IMPLEMENTATION GUIDE

### Option A: Switch to Visual Crossing (RECOMMENDED)

#### Step 1: Get API Key
1. Sign up at https://www.visualcrossing.com/weather-api
2. Get free API key (1,000 calls/day)
3. Add to Google Secret Manager as `visualcrossing-api-key`

#### Step 2: Update weatherService.js

```javascript
// services/weatherService.js
const axios = require('axios');

const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY || '';
const VISUAL_CROSSING_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

/**
 * Get weather forecast for a location and date using Visual Crossing
 * @param {string} location - Location name or "lat,lon"
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @returns {Promise<Object>} Weather forecast data
 */
async function getWeatherForecast(location, date) {
  try {
    if (!VISUAL_CROSSING_API_KEY) {
      console.log('Visual Crossing API key not configured');
      return null;
    }

    // Format date for Visual Crossing (YYYY-MM-DD)
    const hikeDate = new Date(date);
    const dateStr = hikeDate.toISOString().split('T')[0];

    // Build API URL
    const url = `${VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}/${dateStr}`;
    const params = {
      key: VISUAL_CROSSING_API_KEY,
      unitGroup: 'metric',
      include: 'days,hours,alerts',
      elements: 'datetime,temp,tempmax,tempmin,feelslike,humidity,precip,precipprob,preciptype,snow,windspeed,winddir,pressure,cloudcover,visibility,conditions,description,icon'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    // Extract day's weather
    const dayWeather = data.days[0];
    
    // Find midday hour (around 12:00)
    const middayHour = dayWeather.hours?.find(h => {
      const hour = parseInt(h.datetime.split(':')[0]);
      return hour === 12;
    }) || dayWeather.hours?.[Math.floor(dayWeather.hours.length / 2)] || dayWeather;

    return {
      temperature: Math.round(middayHour.temp || dayWeather.temp),
      feels_like: Math.round(middayHour.feelslike || dayWeather.feelslike),
      temp_min: Math.round(dayWeather.tempmin),
      temp_max: Math.round(dayWeather.tempmax),
      humidity: Math.round(middayHour.humidity || dayWeather.humidity),
      pressure: Math.round(middayHour.pressure || dayWeather.pressure),
      weather: dayWeather.conditions,
      description: dayWeather.description,
      icon: dayWeather.icon,
      wind_speed: Math.round(middayHour.windspeed || dayWeather.windspeed),
      wind_direction: Math.round(middayHour.winddir || dayWeather.winddir),
      clouds: Math.round(middayHour.cloudcover || dayWeather.cloudcover),
      pop: Math.round(middayHour.precipprob || dayWeather.precipprob),
      rain: Math.round((middayHour.precip || dayWeather.precip) * 10) / 10,
      visibility: Math.round((middayHour.visibility || dayWeather.visibility) * 10) / 10,
      timestamp: new Date(dateStr).getTime() / 1000,
      location: {
        name: data.resolvedAddress,
        lat: data.latitude,
        lon: data.longitude
      },
      alerts: data.alerts || [] // Severe weather alerts
    };
  } catch (error) {
    console.error('Error fetching weather from Visual Crossing:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return null;
  }
}

// Keep existing getHikingSuitability function (no changes needed)
// ... rest of file unchanged
```

#### Step 3: Update Secret Manager

```bash
# Add Visual Crossing API key to Secret Manager
gcloud secrets create visualcrossing-api-key \
  --data-file=- \
  --project=helloliam \
  --replication-policy=automatic

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding visualcrossing-api-key \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@helloliam.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=helloliam
```

#### Step 4: Update Backend Environment Variables

```yaml
# backend/cloudbuild.yaml or deployment config
env:
  - name: VISUAL_CROSSING_API_KEY
    valueFrom:
      secretKeyRef:
        name: visualcrossing-api-key
        key: latest
```

#### Step 5: Test

```bash
# Test endpoint
curl "https://backend-4kzqyywlqq-ew.a.run.app/api/weather/forecast?location=Table Mountain, Cape Town&date=2025-10-20"
```

---

### Option B: Switch to WeatherAPI.com (SIMPLEST)

#### Step 1: Get API Key
1. Sign up at https://www.weatherapi.com/signup.aspx
2. Get free API key (1M calls/month)

#### Step 2: Update weatherService.js

```javascript
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || '';
const WEATHERAPI_BASE_URL = 'http://api.weatherapi.com/v1';

async function getWeatherForecast(location, date) {
  try {
    if (!WEATHERAPI_KEY) {
      console.log('WeatherAPI key not configured');
      return null;
    }

    // Calculate days in future
    const hikeDate = new Date(date);
    const today = new Date();
    const daysInFuture = Math.ceil((hikeDate - today) / (1000 * 60 * 60 * 24));

    const url = `${WEATHERAPI_BASE_URL}/forecast.json`;
    const params = {
      key: WEATHERAPI_KEY,
      q: location,
      days: Math.max(1, Math.min(daysInFuture + 1, 14)), // Max 14 days
      aqi: 'yes',
      alerts: 'yes'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    // Find the specific day
    const dateStr = hikeDate.toISOString().split('T')[0];
    const dayForecast = data.forecast.forecastday.find(day => day.date === dateStr);

    if (!dayForecast) {
      return null; // Date too far in future
    }

    const day = dayForecast.day;
    const location_data = data.location;

    return {
      temperature: Math.round(day.avgtemp_c),
      feels_like: Math.round(day.avgtemp_c), // WeatherAPI doesn't have feels_like for day
      temp_min: Math.round(day.mintemp_c),
      temp_max: Math.round(day.maxtemp_c),
      humidity: Math.round(day.avghumidity),
      pressure: 1013, // WeatherAPI doesn't provide pressure in forecast
      weather: day.condition.text,
      description: day.condition.text,
      icon: day.condition.icon,
      wind_speed: Math.round(day.maxwind_kph),
      wind_direction: 0, // Not available in day forecast
      clouds: 0, // Not available
      pop: Math.round(day.daily_chance_of_rain),
      rain: Math.round(day.totalprecip_mm * 10) / 10,
      visibility: Math.round(day.avgvis_km * 10) / 10,
      timestamp: new Date(dateStr).getTime() / 1000,
      location: {
        name: `${location_data.name}, ${location_data.region}`,
        lat: location_data.lat,
        lon: location_data.lon
      },
      uv_index: day.uv,
      alerts: data.alerts?.alert || []
    };
  } catch (error) {
    console.error('Error fetching weather from WeatherAPI:', error.message);
    return null;
  }
}
```

---

### Option C: Use Open-Meteo (FREE, NO KEY)

#### No API Key Needed!

```javascript
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

async function getWeatherForecast(location, date) {
  try {
    // First geocode the location using a simple geocoder
    // (Could use nominatim.org or keep OpenWeather geocoding)
    
    // For now, assume we have lat/lon
    // TODO: Add geocoding step
    
    const url = `${OPEN_METEO_BASE_URL}/forecast`;
    const params = {
      latitude: lat,
      longitude: lon,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max',
      hourly: 'temperature_2m,relativehumidity_2m,precipitation_probability,cloudcover,visibility,windspeed_10m',
      timezone: 'Africa/Johannesburg',
      start_date: dateStr,
      end_date: dateStr
    };

    const response = await axios.get(url, { params });
    // ... parse response
  } catch (error) {
    console.error('Error fetching weather from Open-Meteo:', error.message);
    return null;
  }
}
```

---

## 📊 Comparison Table

| API | Free Tier | SA Coverage | Forecast Days | Alerts | Ease | Best For |
|-----|-----------|-------------|---------------|--------|------|----------|
| **Visual Crossing** | 1K/day | ⭐⭐⭐⭐⭐ | 15 | ✅ | ⭐⭐⭐⭐ | **Best Overall** |
| **WeatherAPI.com** | 1M/month | ⭐⭐⭐⭐ | 14 | ✅ | ⭐⭐⭐⭐⭐ | **Best Value** |
| **SAWS** | Free? | ⭐⭐⭐⭐⭐ | Unknown | ✅ | ⭐⭐⭐ | **SA Accuracy** |
| **Tomorrow.io** | 500/day | ⭐⭐⭐⭐⭐ | 15 | ✅ | ⭐⭐⭐ | Premium Users |
| **Open-Meteo** | Unlimited | ⭐⭐⭐⭐ | 16 | ❌ | ⭐⭐⭐⭐⭐ | **Zero Cost** |
| **Weatherstack** | 1K/month | ⭐⭐⭐⭐ | Paid only | ❌ | ⭐⭐⭐⭐ | Business |
| **OpenWeather** | 1K/day | ⭐⭐⭐ | 5 | ✅ | ⭐⭐⭐⭐ | Current Choice |

---

## 🎯 FINAL RECOMMENDATION

### Switch to: **Visual Crossing Weather API**

**Reasons:**
1. ✅ **Significantly better SA coverage** than OpenWeather
2. ✅ **Free tier sufficient** for hiking portal (1,000/day)
3. ✅ **15-day forecasts** vs OpenWeather's 5 days
4. ✅ **Historical weather data** - Can add "typical weather" feature
5. ✅ **Weather alerts** - Critical for hiker safety
6. ✅ **Easy migration** - Similar API structure to OpenWeather
7. ✅ **Better location recognition** - Handles SA locations better
8. ✅ **Reliable service** - Used by enterprise customers

**Migration Effort:** ~2-3 hours
**Downtime:** None (can be tested in staging first)
**Cost:** FREE (within free tier limits)

---

## 🚀 MIGRATION CHECKLIST

- [ ] Sign up for Visual Crossing API
- [ ] Get API key
- [ ] Add secret to Google Secret Manager
- [ ] Update `weatherService.js`
- [ ] Update environment variables in Cloud Run
- [ ] Test with SA locations (Table Mountain, Drakensberg, etc.)
- [ ] Deploy to staging
- [ ] Verify frontend weather widget still works
- [ ] Deploy to production
- [ ] Monitor API usage
- [ ] Update documentation
- [ ] Remove old OpenWeather API key (after successful migration)

---

## 📞 SUPPORT CONTACTS

**Visual Crossing:**
- Support: https://www.visualcrossing.com/weather/weather-data-services
- Docs: https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/
- Email: support@visualcrossing.com

**SAWS (SA Weather Service):**
- Website: https://www.weathersa.co.za/
- Email: info@weathersa.co.za
- API Inquiries: Worth contacting for official SA data access

---

**Document Created:** October 16, 2025  
**Status:** Ready for Implementation  
**Priority:** HIGH - Improves core functionality for SA users
