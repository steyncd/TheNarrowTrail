// Haptic Feedback Utility
// Provides vibration feedback for mobile devices

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = () => {
  return 'vibrate' in navigator;
};

/**
 * Haptic feedback patterns
 */
export const HapticPattern = {
  LIGHT: 10,
  MEDIUM: 20,
  HEAVY: 30,
  SUCCESS: [10, 50, 10],
  ERROR: [20, 100, 20, 100, 20],
  WARNING: [30, 50, 30],
  SELECTION: 5,
  NOTIFICATION: [50, 100, 50]
};

/**
 * Trigger haptic feedback
 * @param {number|Array} pattern - Vibration pattern (number for duration, array for pattern)
 */
export const triggerHaptic = (pattern = HapticPattern.LIGHT) => {
  if (!isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Haptic feedback for common actions
 */
export const haptics = {
  light: () => triggerHaptic(HapticPattern.LIGHT),
  medium: () => triggerHaptic(HapticPattern.MEDIUM),
  heavy: () => triggerHaptic(HapticPattern.HEAVY),
  success: () => triggerHaptic(HapticPattern.SUCCESS),
  error: () => triggerHaptic(HapticPattern.ERROR),
  warning: () => triggerHaptic(HapticPattern.WARNING),
  selection: () => triggerHaptic(HapticPattern.SELECTION),
  notification: () => triggerHaptic(HapticPattern.NOTIFICATION)
};

export default haptics;
