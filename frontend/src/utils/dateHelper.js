// Helper function to format Firebase Timestamp objects
export const formatFirebaseDate = (firebaseDate) => {
  if (firebaseDate === null || firebaseDate === undefined || firebaseDate === '') return 'N/A';

  try {
    // Firebase Timestamp object with toDate method
    if (firebaseDate && typeof firebaseDate.toDate === 'function') {
      const d = firebaseDate.toDate();
      if (d && !isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    }

    // Firestore Timestamp object - check for both _seconds (with underscore) and seconds (without underscore)
    // Firestore Admin SDK serializes Timestamps as objects with _seconds and _nanoseconds
    if (firebaseDate && typeof firebaseDate === 'object' && !Array.isArray(firebaseDate)) {
      // Check for _seconds first (Firestore Admin SDK format)
      if (firebaseDate._seconds !== undefined && firebaseDate._seconds !== null) {
        const ms = Number(firebaseDate._seconds) * 1000;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString();
        }
      }
      // Check for seconds (alternative format)
      if (firebaseDate.seconds !== undefined && firebaseDate.seconds !== null) {
        const ms = Number(firebaseDate.seconds) * 1000;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString();
        }
      }
    }

    // Native Date instance
    if (firebaseDate instanceof Date) {
      if (!isNaN(firebaseDate.getTime())) {
        return firebaseDate.toLocaleDateString();
      }
    }

    // Numeric timestamp (milliseconds or seconds)
    if (typeof firebaseDate === 'number') {
      const ms = firebaseDate < 1e12 ? firebaseDate * 1000 : firebaseDate;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    }

    // String that might be a number or ISO date
    if (typeof firebaseDate === 'string') {
      // Check if it's a numeric string (timestamp)
      if (/^\d+$/.test(firebaseDate.trim())) {
        const num = Number(firebaseDate);
        const ms = num < 1e12 ? num * 1000 : num;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString();
        }
      }
      // Try as ISO date string
      const d = new Date(firebaseDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString();
      }
    }

    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error, firebaseDate);
    return 'N/A';
  }
};

// Safe date creation for Firestore
export const createSafeDate = (date) => {
  if (!date && date !== 0) return null;
  if (date && typeof date.toDate === 'function') return date.toDate();
  if (date && typeof date === 'object' && 'seconds' in date) return new Date(Number(date.seconds) * 1000);
  if (typeof date === 'number') return new Date(date < 1e12 ? date * 1000 : date);
  if (typeof date === 'string' && /^\d+$/.test(date)) return new Date(Number(date) < 1e12 ? Number(date) * 1000 : Number(date));
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};