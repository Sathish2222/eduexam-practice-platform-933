/**
 * Storage utility module.
 * Uses IndexedDB (via localforage) for binary file storage (PDFs, images).
 * Uses LocalStorage for metadata, settings, and lightweight data.
 */
import localforage from 'localforage';

// Configure IndexedDB store for file blobs
const fileStore = localforage.createInstance({
  name: 'eduexam-files',
  storeName: 'paper_files',
  description: 'Stores PDF and image files for exam papers',
});

// Configure IndexedDB store for answer key blobs
const answerStore = localforage.createInstance({
  name: 'eduexam-files',
  storeName: 'answer_files',
  description: 'Stores PDF and image files for answer keys',
});

/* ===================== FILE STORAGE (IndexedDB) ===================== */

// PUBLIC_INTERFACE
/**
 * Save a file blob to IndexedDB.
 * @param {string} paperId - The paper identifier
 * @param {Blob|File} fileBlob - The file data
 * @param {'paper'|'answer'} type - Whether this is a paper or answer key
 * @returns {Promise<void>}
 */
export async function saveFile(paperId, fileBlob, type = 'paper') {
  const store = type === 'answer' ? answerStore : fileStore;
  await store.setItem(paperId, fileBlob);
}

// PUBLIC_INTERFACE
/**
 * Retrieve a file blob from IndexedDB.
 * @param {string} paperId - The paper identifier
 * @param {'paper'|'answer'} type - Whether this is a paper or answer key
 * @returns {Promise<Blob|null>}
 */
export async function getFile(paperId, type = 'paper') {
  const store = type === 'answer' ? answerStore : fileStore;
  return await store.getItem(paperId);
}

// PUBLIC_INTERFACE
/**
 * Remove a file from IndexedDB.
 * @param {string} paperId - The paper identifier
 * @param {'paper'|'answer'} type - Whether this is a paper or answer key
 * @returns {Promise<void>}
 */
export async function removeFile(paperId, type = 'paper') {
  const store = type === 'answer' ? answerStore : fileStore;
  await store.removeItem(paperId);
}

// PUBLIC_INTERFACE
/**
 * Get all keys from file store.
 * @param {'paper'|'answer'} type - Store type
 * @returns {Promise<string[]>}
 */
export async function getAllFileKeys(type = 'paper') {
  const store = type === 'answer' ? answerStore : fileStore;
  return await store.keys();
}

/* ===================== METADATA STORAGE (LocalStorage) ===================== */

const PAPERS_KEY = 'eduexam_papers';
const SETTINGS_KEY = 'eduexam_settings';
const ATTEMPTS_KEY = 'eduexam_attempts';
const TIMER_KEY = 'eduexam_timer';
const STUDENT_NAME_KEY = 'eduexam_student_name';

// PUBLIC_INTERFACE
/**
 * Get all paper metadata from LocalStorage.
 * @returns {Array} Array of paper metadata objects
 */
export function getPapers() {
  try {
    const data = localStorage.getItem(PAPERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
/**
 * Save all paper metadata to LocalStorage.
 * @param {Array} papers - Array of paper metadata objects
 */
export function savePapers(papers) {
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

// PUBLIC_INTERFACE
/**
 * Add a single paper metadata entry.
 * @param {Object} paper - Paper metadata object
 */
export function addPaper(paper) {
  const papers = getPapers();
  papers.push(paper);
  savePapers(papers);
}

// PUBLIC_INTERFACE
/**
 * Update a paper's metadata by ID.
 * @param {string} paperId - Paper identifier
 * @param {Object} updates - Fields to update
 */
export function updatePaper(paperId, updates) {
  const papers = getPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx !== -1) {
    papers[idx] = { ...papers[idx], ...updates };
    savePapers(papers);
  }
}

// PUBLIC_INTERFACE
/**
 * Delete a paper metadata entry by ID.
 * @param {string} paperId - Paper identifier
 */
export function deletePaperMeta(paperId) {
  const papers = getPapers().filter(p => p.id !== paperId);
  savePapers(papers);
}

// PUBLIC_INTERFACE
/**
 * Get a single paper by ID.
 * @param {string} paperId - Paper identifier
 * @returns {Object|null}
 */
export function getPaperById(paperId) {
  return getPapers().find(p => p.id === paperId) || null;
}

/* ===================== SETTINGS ===================== */

const DEFAULT_SETTINGS = {
  adminPin: '1234',
  examDuration: 180, // minutes
  answerKeyLockDuration: 0, // minutes after exam start to unlock (0 = immediate)
  theme: 'light',
};

// PUBLIC_INTERFACE
/**
 * Get application settings.
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// PUBLIC_INTERFACE
/**
 * Save application settings.
 * @param {Object} settings - Settings object
 */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ===================== STUDENT NAME ===================== */

// PUBLIC_INTERFACE
/**
 * Get the saved student name from LocalStorage.
 * @returns {string} The student name or empty string if not set
 */
export function getStudentName() {
  try {
    return localStorage.getItem(STUDENT_NAME_KEY) || '';
  } catch {
    return '';
  }
}

// PUBLIC_INTERFACE
/**
 * Save the student name to LocalStorage.
 * @param {string} name - The student's name
 */
export function saveStudentName(name) {
  localStorage.setItem(STUDENT_NAME_KEY, (name || '').trim());
}

/* ===================== ATTEMPT HISTORY ===================== */

// PUBLIC_INTERFACE
/**
 * Get all attempt history records.
 * @returns {Array} Array of attempt objects
 */
export function getAttempts() {
  try {
    const data = localStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
/**
 * Save an attempt record. Automatically includes student name if available.
 * @param {Object} attempt - Attempt object { paperId, startTime, endTime, completed, studentName?, ... }
 */
export function saveAttempt(attempt) {
  const attempts = getAttempts();
  // Automatically attach student name if not already provided
  if (!attempt.studentName) {
    const name = getStudentName();
    if (name) {
      attempt.studentName = name;
    }
  }
  attempts.push(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

// PUBLIC_INTERFACE
/**
 * Get attempts for a specific paper.
 * @param {string} paperId - Paper identifier
 * @returns {Array}
 */
export function getAttemptsForPaper(paperId) {
  return getAttempts().filter(a => a.paperId === paperId);
}

/* ===================== TIMER STATE ===================== */

// PUBLIC_INTERFACE
/**
 * Save timer state for recovery.
 * @param {Object} timerState - { paperId, startTime, duration, remaining }
 */
export function saveTimerState(timerState) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
}

// PUBLIC_INTERFACE
/**
 * Get saved timer state.
 * @returns {Object|null}
 */
export function getTimerState() {
  try {
    const data = localStorage.getItem(TIMER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
/**
 * Clear timer state after exam completion.
 */
export function clearTimerState() {
  localStorage.removeItem(TIMER_KEY);
}

/* ===================== EXPORT / IMPORT ===================== */

// PUBLIC_INTERFACE
/**
 * Export all data (metadata + files) as a JSON-compatible object.
 * Files are converted to base64 strings for portability.
 * @returns {Promise<Object>} Exportable data object
 */
export async function exportAllData() {
  const papers = getPapers();
  const settings = getSettings();
  const attempts = getAttempts();

  // Export file blobs as base64
  const paperFiles = {};
  const answerFiles = {};

  for (const paper of papers) {
    const pBlob = await getFile(paper.id, 'paper');
    if (pBlob) {
      paperFiles[paper.id] = await blobToBase64(pBlob);
    }
    const aBlob = await getFile(paper.id, 'answer');
    if (aBlob) {
      answerFiles[paper.id] = await blobToBase64(aBlob);
    }
  }

  return {
    version: 1,
    exportDate: new Date().toISOString(),
    papers,
    settings,
    attempts,
    paperFiles,
    answerFiles,
  };
}

// PUBLIC_INTERFACE
/**
 * Import data from a previously exported JSON object.
 * Merges with existing data (papers with same ID are overwritten).
 * @param {Object} data - Exported data object
 * @returns {Promise<{papersImported: number}>}
 */
export async function importAllData(data) {
  if (!data || data.version !== 1) {
    throw new Error('Invalid backup file format');
  }

  // Import settings (merge)
  if (data.settings) {
    const current = getSettings();
    saveSettings({ ...current, ...data.settings });
  }

  // Import papers (merge by id)
  const existingPapers = getPapers();
  const existingMap = new Map(existingPapers.map(p => [p.id, p]));

  if (data.papers) {
    for (const paper of data.papers) {
      existingMap.set(paper.id, paper);
    }
    savePapers(Array.from(existingMap.values()));
  }

  // Import attempts (append)
  if (data.attempts) {
    const existingAttempts = getAttempts();
    const existingKeys = new Set(existingAttempts.map(a => `${a.paperId}_${a.startTime}`));
    const newAttempts = data.attempts.filter(a => !existingKeys.has(`${a.paperId}_${a.startTime}`));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([...existingAttempts, ...newAttempts]));
  }

  // Import files
  let papersImported = 0;
  if (data.paperFiles) {
    for (const [id, b64] of Object.entries(data.paperFiles)) {
      const blob = base64ToBlob(b64);
      await saveFile(id, blob, 'paper');
      papersImported++;
    }
  }
  if (data.answerFiles) {
    for (const [id, b64] of Object.entries(data.answerFiles)) {
      const blob = base64ToBlob(b64);
      await saveFile(id, blob, 'answer');
    }
  }

  return { papersImported };
}

/* ===================== HELPERS ===================== */

/**
 * Convert a Blob to a base64-encoded string with metadata.
 * @param {Blob} blob
 * @returns {Promise<{data: string, type: string}>}
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ data: reader.result, type: blob.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a base64 object back to a Blob.
 * @param {{data: string, type: string}} b64Obj
 * @returns {Blob}
 */
function base64ToBlob(b64Obj) {
  const { data, type } = b64Obj;
  const byteString = atob(data.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type });
}
