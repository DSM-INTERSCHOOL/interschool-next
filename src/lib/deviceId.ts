/**
 * Utility to generate and manage a unique device ID for the browser
 * The device ID is stored in localStorage and persists across sessions
 */

const DEVICE_ID_KEY = '__DEVICE_ID__';

/**
 * Generates a unique device ID using crypto API for better randomness
 */
function generateDeviceId(): string {
  // Try to use crypto API if available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets the device ID from localStorage or generates a new one if it doesn't exist
 */
export function getDeviceId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'server-side-render';
  }

  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // If no device ID exists, generate and store a new one
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('Generated new device ID:', deviceId);
    }

    return deviceId;
  } catch (error) {
    // Fallback if localStorage is not available (private browsing, etc.)
    console.warn('localStorage not available, using session device ID');
    return generateDeviceId();
  }
}

/**
 * Resets the device ID (useful for testing or clearing user data)
 */
export function resetDeviceId(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(DEVICE_ID_KEY);
      console.log('Device ID reset');
    } catch (error) {
      console.warn('Failed to reset device ID:', error);
    }
  }
}
