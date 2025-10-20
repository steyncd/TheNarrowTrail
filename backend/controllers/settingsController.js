// controllers/settingsController.js - System settings management
const pool = require('../config/database');
const { clearSettingsCache, PROVIDERS, API_KEYS } = require('../services/weatherService');

/**
 * Get all system settings (admin only)
 */
exports.getAllSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_settings ORDER BY category, setting_key'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

/**
 * Get settings by category
 */
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      'SELECT * FROM system_settings WHERE category = $1 ORDER BY setting_key',
      [category]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

/**
 * Get single setting by key
 */
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query(
      'SELECT * FROM system_settings WHERE setting_key = $1',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

/**
 * Update system setting (admin only)
 */
exports.updateSetting = async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    
    if (!setting_key || setting_value === undefined) {
      return res.status(400).json({ error: 'setting_key and setting_value are required' });
    }
    
    const result = await pool.query(
      `UPDATE system_settings 
       SET setting_value = $1, updated_at = NOW(), updated_by = $2 
       WHERE setting_key = $3
       RETURNING *`,
      [setting_value, req.user.id, setting_key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    // Clear weather settings cache if weather setting was updated
    if (setting_key.startsWith('weather_')) {
      clearSettingsCache();
    }
    
    res.json({
      success: true,
      setting: result.rows[0],
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

/**
 * Update multiple settings at once (admin only)
 */
exports.updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ error: 'settings array is required' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const updatedSettings = [];
      for (const setting of settings) {
        const result = await client.query(
          `UPDATE system_settings 
           SET setting_value = $1, updated_at = NOW(), updated_by = $2 
           WHERE setting_key = $3
           RETURNING *`,
          [setting.setting_value, req.user.id, setting.setting_key]
        );
        
        if (result.rows.length > 0) {
          updatedSettings.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      
      // Clear weather settings cache
      clearSettingsCache();
      
      res.json({
        success: true,
        updated: updatedSettings,
        message: `${updatedSettings.length} settings updated successfully`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update multiple settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

/**
 * Get weather API provider information
 */
exports.getWeatherProviders = async (req, res) => {
  try {
    const providers = Object.keys(PROVIDERS).map(key => ({
      id: key,
      ...PROVIDERS[key],
      isConfigured: !!API_KEYS[key],
      apiKeySet: API_KEYS[key] ? API_KEYS[key].substring(0, 8) + '...' : null
    }));
    
    res.json(providers);
  } catch (error) {
    console.error('Get weather providers error:', error);
    res.status(500).json({ error: 'Failed to fetch weather providers' });
  }
};

/**
 * Test weather API provider
 */
exports.testWeatherProvider = async (req, res) => {
  try {
    const { provider, location, date } = req.body;
    
    if (!provider || !location || !date) {
      return res.status(400).json({ error: 'provider, location, and date are required' });
    }
    
    // Temporarily fetch from specified provider
    const { getWeatherForecast } = require('../services/weatherService');
    
    // Save current settings
    const currentSettings = await pool.query(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key = 'weather_api_primary'"
    );
    const originalPrimary = currentSettings.rows[0]?.setting_value;
    
    // Temporarily set provider
    await pool.query(
      "UPDATE system_settings SET setting_value = $1 WHERE setting_key = 'weather_api_primary'",
      [provider]
    );
    clearSettingsCache();
    
    // Test fetch
    const startTime = Date.now();
    const weather = await getWeatherForecast(location, date);
    const responseTime = Date.now() - startTime;
    
    // Restore original setting
    if (originalPrimary) {
      await pool.query(
        "UPDATE system_settings SET setting_value = $1 WHERE setting_key = 'weather_api_primary'",
        [originalPrimary]
      );
      clearSettingsCache();
    }
    
    if (weather) {
      res.json({
        success: true,
        provider: provider,
        responseTime: responseTime,
        weather: weather
      });
    } else {
      res.json({
        success: false,
        provider: provider,
        responseTime: responseTime,
        error: 'No weather data returned'
      });
    }
  } catch (error) {
    console.error('Test weather provider error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get public branding settings (NO AUTH REQUIRED)
 * Returns only public branding settings like logo and favicon
 */
exports.getPublicBrandingSettings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value
       FROM system_settings
       WHERE is_public = true
       AND category = 'branding'
       AND setting_key IN (
         'branding_logo_url',
         'branding_favicon_url',
         'branding_portal_name',
         'branding_tagline',
         'branding_show_upcoming_hikes',
         'branding_show_statistics'
       )
       ORDER BY setting_key`
    );

    // Convert to key-value object for easier consumption
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Get public branding settings error:', error);
    res.status(500).json({ error: 'Failed to fetch branding settings' });
  }
};

module.exports = exports;
