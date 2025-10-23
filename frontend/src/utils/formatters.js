// Input Formatters for better mobile data entry

/**
 * Format currency input (South African Rand)
 * @param {string} value - Input value
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value) => {
  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '');

  // Split into integer and decimal parts
  const parts = numericValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with thousand separators
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Add decimal part if exists (max 2 digits)
  if (decimalPart !== undefined) {
    return `R ${formatted}.${decimalPart.slice(0, 2)}`;
  }

  return `R ${formatted}`;
};

/**
 * Parse formatted currency to number
 * @param {string} formattedValue - Formatted currency string
 * @returns {number} Numeric value
 */
export const parseCurrency = (formattedValue) => {
  const numeric = formattedValue.replace(/[^\d.]/g, '');
  return parseFloat(numeric) || 0;
};

/**
 * Format phone number (South African format)
 * @param {string} value - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-numeric characters
  const numeric = value.replace(/\D/g, '');

  // Handle different lengths
  if (numeric.length === 0) return '';
  if (numeric.length <= 3) return numeric;
  if (numeric.length <= 6) return `${numeric.slice(0, 3)} ${numeric.slice(3)}`;
  if (numeric.length <= 10) {
    return `${numeric.slice(0, 3)} ${numeric.slice(3, 6)} ${numeric.slice(6)}`;
  }

  // International format
  return `+${numeric.slice(0, 2)} ${numeric.slice(2, 4)} ${numeric.slice(4, 7)} ${numeric.slice(7, 11)}`;
};

/**
 * Parse formatted phone number to raw digits
 * @param {string} formattedValue - Formatted phone number
 * @returns {string} Raw phone number
 */
export const parsePhoneNumber = (formattedValue) => {
  return formattedValue.replace(/\D/g, '');
};

/**
 * Format distance with unit
 * @param {string|number} value - Distance value
 * @returns {string} Formatted distance
 */
export const formatDistance = (value) => {
  const numeric = parseFloat(value);
  if (isNaN(numeric)) return value;

  return `${numeric} km`;
};

/**
 * Format date for display (South African format: DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateDisplay = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateInput = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Format time for display (24h format)
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return time;

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

/**
 * Format GPS coordinates for display
 * @param {string} coordinates - GPS coordinates
 * @returns {string} Formatted coordinates
 */
export const formatGPSCoordinates = (coordinates) => {
  if (!coordinates) return '';

  // Parse lat, lng
  const parts = coordinates.split(',').map(p => p.trim());
  if (parts.length !== 2) return coordinates;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return coordinates;

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Validate and format email
 * @param {string} email - Email address
 * @returns {string} Formatted email (lowercase, trimmed)
 */
export const formatEmail = (email) => {
  return email.trim().toLowerCase();
};

/**
 * Format percentage
 * @param {number} value - Numeric value (0-100)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value) => {
  const numeric = parseFloat(value);
  if (isNaN(numeric)) return '0%';

  return `${Math.round(numeric)}%`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Auto-detect and format input based on type
 * @param {string} value - Input value
 * @param {string} type - Input type hint
 * @returns {string} Formatted value
 */
export const autoFormat = (value, type) => {
  if (!value) return '';

  switch (type) {
    case 'currency':
    case 'cost':
    case 'price':
      return formatCurrency(value);
    case 'phone':
    case 'mobile':
      return formatPhoneNumber(value);
    case 'date':
      return formatDateDisplay(value);
    case 'distance':
      return formatDistance(value);
    case 'gps':
    case 'coordinates':
      return formatGPSCoordinates(value);
    case 'email':
      return formatEmail(value);
    default:
      return value;
  }
};

export default {
  formatCurrency,
  parseCurrency,
  formatPhoneNumber,
  parsePhoneNumber,
  formatDistance,
  formatDateDisplay,
  formatDateInput,
  formatTime,
  formatGPSCoordinates,
  formatEmail,
  formatPercentage,
  formatFileSize,
  autoFormat
};
