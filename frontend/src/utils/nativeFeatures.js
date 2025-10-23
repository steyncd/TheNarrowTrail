/**
 * Native app features for PWA
 * Calendar export, sharing, device integration
 */

/**
 * Generate iCalendar (.ics) file for event
 */
export const generateICSFile = (event) => {
  const formatDate = (date) => {
    return new Date(date)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  };

  const escapeText = (text) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const startDate = formatDate(event.date);
  const endDate = event.end_date ? formatDate(event.end_date) : startDate;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Narrow Trail Hiking Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@narrowtrail.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeText(event.name || event.title)}`,
    `DESCRIPTION:${escapeText(event.description || '')}`,
    `LOCATION:${escapeText(event.location || '')}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

/**
 * Download .ics file to device
 */
export const downloadICSFile = (event) => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.name?.replace(/\s+/g, '-') || 'event'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Add to device calendar using Web Share API (mobile) or download (desktop)
 */
export const addToCalendar = async (event) => {
  // Check if Web Share API is available (mainly mobile)
  if (navigator.share && navigator.canShare) {
    try {
      const icsContent = generateICSFile(event);
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const file = new File([blob], `${event.name?.replace(/\s+/g, '-') || 'event'}.ics`, {
        type: 'text/calendar'
      });

      const shareData = {
        files: [file],
        title: event.name || event.title,
        text: `Add "${event.name || event.title}" to your calendar`
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, method: 'share' };
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fall through to download
    }
  }

  // Fallback to download
  downloadICSFile(event);
  return { success: true, method: 'download' };
};

/**
 * Share event using native share sheet
 */
export const shareEvent = async (event, url) => {
  const shareData = {
    title: event.name || event.title,
    text: `Check out this event: ${event.name || event.title}`,
    url: url || window.location.href
  };

  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true };
    } catch (error) {
      // User cancelled or share failed
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return { success: false, error: error.message };
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(url || window.location.href);
    return { success: true, fallback: 'clipboard' };
  } catch (error) {
    return { success: false, error: 'Share not supported' };
  }
};

/**
 * Share via WhatsApp
 */
export const shareViaWhatsApp = (event, url) => {
  const text = encodeURIComponent(
    `Check out this event: ${event.name || event.title}\n${url || window.location.href}`
  );
  const whatsappUrl = `https://wa.me/?text=${text}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Share via SMS
 */
export const shareViaSMS = (event, url, phoneNumber = '') => {
  const text = encodeURIComponent(
    `Check out: ${event.name || event.title} ${url || window.location.href}`
  );

  // iOS and Android have different SMS URL schemes
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  const smsUrl = `sms:${phoneNumber}${separator}body=${text}`;

  window.location.href = smsUrl;
};

/**
 * Share via Email
 */
export const shareViaEmail = (event, url) => {
  const subject = encodeURIComponent(`Event: ${event.name || event.title}`);
  const body = encodeURIComponent(
    `Hi,\n\nI wanted to share this event with you:\n\n${event.name || event.title}\n${
      event.description || ''
    }\n\nView details: ${url || window.location.href}\n\nSee you there!`
  );
  const emailUrl = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = emailUrl;
};

/**
 * Check if device supports native sharing
 */
export const canShare = () => {
  return typeof navigator.share !== 'undefined';
};

/**
 * Check if device supports file sharing
 */
export const canShareFiles = () => {
  return typeof navigator.share !== 'undefined' && typeof navigator.canShare !== 'undefined';
};

/**
 * Get device location (for "events near me" feature)
 */
export const getDeviceLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { success: false, error: 'Notifications not supported' };
  }

  if (Notification.permission === 'granted') {
    return { success: true, permission: 'granted' };
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return { success: permission === 'granted', permission };
  }

  return { success: false, permission: 'denied' };
};

/**
 * Vibrate device (haptic feedback)
 */
export const vibrate = (pattern = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Check if app is installed as PWA
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if device is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Monitor online/offline status
 */
export const monitorNetworkStatus = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
