/**
 * Helper utilities for the exam practice platform.
 */

// PUBLIC_INTERFACE
/**
 * Generate a unique ID string.
 * @returns {string} Unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// PUBLIC_INTERFACE
/**
 * Format seconds into HH:MM:SS display.
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time string
 */
export function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// PUBLIC_INTERFACE
/**
 * Format a date string for display.
 * @param {string} isoString - ISO date string
 * @returns {string} Human-readable date
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// PUBLIC_INTERFACE
/**
 * Get file extension from a filename.
 * @param {string} filename
 * @returns {string} Extension in lowercase
 */
export function getFileExtension(filename) {
  return (filename || '').split('.').pop().toLowerCase();
}

// PUBLIC_INTERFACE
/**
 * Check if a file is a PDF based on extension or MIME type.
 * @param {string} filenameOrType - Filename or MIME type
 * @returns {boolean}
 */
export function isPdf(filenameOrType) {
  if (!filenameOrType) return false;
  return filenameOrType.includes('pdf');
}

// PUBLIC_INTERFACE
/**
 * Check if a file is an image based on extension or MIME type.
 * @param {string} filenameOrType - Filename or MIME type
 * @returns {boolean}
 */
export function isImage(filenameOrType) {
  if (!filenameOrType) return false;
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'image/'];
  return imageTypes.some(t => filenameOrType.toLowerCase().includes(t));
}

// PUBLIC_INTERFACE
/**
 * Validate that a Blob contains real PDF data by checking the %PDF magic bytes.
 * Used to detect stale/corrupt blobs stored in IndexedDB before the response.ok fix.
 * @param {Blob|null} blob
 * @returns {Promise<boolean>}
 */
export async function isValidPdfBlob(blob) {
  if (!blob) return false;
  try {
    const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
    return header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
/**
 * Truncate text to a maximum length.
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}
