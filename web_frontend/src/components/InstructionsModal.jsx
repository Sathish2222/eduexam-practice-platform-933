import React, { useState, useEffect, useCallback } from 'react';

const INSTRUCTIONS_SEEN_KEY = 'eduexam_instructions_seen';

/**
 * Onboarding instruction slides data — redesigned for school students.
 * Each slide has a step number, emoji icon, title, bullet points (simple language),
 * a colorful tip, and an SVG illustration.
 */
const slides = [
  {
    step: 0,
    emoji: '👋',
    title: 'Welcome to TN Study Hub!',
    subtitle: 'Your free Tamil Nadu board exam practice app',
    bullets: [
      { icon: '🏫', text: 'For 10th, 11th & 12th Standard TN Board students' },
      { icon: '📱', text: 'Use on your phone or computer — works everywhere' },
      { icon: '🎯', text: 'Practice with real past question papers & answer keys' },
      { icon: '🔒', text: 'All your data is saved privately on your own device' },
    ],
    tip: '💡 Swipe the slides or tap Next to learn how to use the app!',
    tipColor: 'emerald',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="40" y="40" width="140" height="65" rx="8" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <rect x="46" y="46" width="128" height="53" rx="5" fill="#ffffff" />
        <line x1="110" y1="46" x2="110" y2="99" stroke="#d1fae5" strokeWidth="1.5" />
        <line x1="56" y1="58" x2="100" y2="58" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="68" x2="95" y2="68" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="78" x2="98" y2="78" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="58" x2="164" y2="58" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="68" x2="158" y2="68" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <polygon points="110,8 145,22 110,36 75,22" fill="#059669" opacity="0.9" />
        <line x1="110" y1="36" x2="110" y2="42" stroke="#059669" strokeWidth="2" />
        <circle cx="145" cy="36" r="2.5" fill="#34d399" />
        <circle cx="30" cy="25" r="3" fill="#fbbf24" opacity="0.8" />
        <circle cx="190" cy="30" r="2.5" fill="#fbbf24" opacity="0.7" />
        <polygon points="185,15 187,21 193,21 188,25 190,31 185,27 180,31 182,25 177,21 183,21" fill="#fbbf24" opacity="0.8" />
      </svg>
    ),
  },
  {
    step: 1,
    emoji: '🎓',
    title: 'Step 1: Choose Your Class',
    subtitle: 'Pick 10th, 11th or 12th on the home screen',
    bullets: [
      { icon: '📘', text: '10th Standard — SSLC Board Exam papers' },
      { icon: '📗', text: '11th Standard — First Year HSC papers' },
      { icon: '📕', text: '12th Standard — HSC Board Exam papers' },
      { icon: '👆', text: 'Tap your class card on the home page to begin' },
    ],
    tip: '💾 Your class choice is remembered — no need to select again next time!',
    tipColor: 'blue',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="10" y="30" width="58" height="70" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="39" y="58" textAnchor="middle" fontSize="18">📘</text>
        <text x="39" y="74" textAnchor="middle" fill="#1d4ed8" fontSize="11" fontWeight="bold">10th</text>
        <text x="39" y="87" textAnchor="middle" fill="#3b82f6" fontSize="7">SSLC</text>
        <rect x="81" y="30" width="58" height="70" rx="8" fill="#d1fae5" stroke="#059669" strokeWidth="2.5" />
        <rect x="81" y="30" width="58" height="4" rx="4" fill="#059669" />
        <text x="110" y="58" textAnchor="middle" fontSize="18">📗</text>
        <text x="110" y="74" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="bold">11th</text>
        <text x="110" y="87" textAnchor="middle" fill="#059669" fontSize="7">First Year</text>
        <rect x="152" y="30" width="58" height="70" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
        <text x="181" y="58" textAnchor="middle" fontSize="18">📕</text>
        <text x="181" y="74" textAnchor="middle" fill="#991b1b" fontSize="11" fontWeight="bold">12th</text>
        <text x="181" y="87" textAnchor="middle" fill="#ef4444" fontSize="7">HSC Board</text>
        <circle cx="110" cy="17" r="8" fill="#059669" />
        <polyline points="107,17 110,20 114,13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="110" y="112" textAnchor="middle" fill="#6b7280" fontSize="8">Tap to select your class</text>
      </svg>
    ),
  },
  {
    step: 2,
    emoji: '🔍',
    title: 'Step 2: Find Your Paper',
    subtitle: 'Search by subject, year or paper type',
    bullets: [
      { icon: '👆', text: 'Tap "Browse Papers" from the home screen or menu' },
      { icon: '🔍', text: 'Type your subject name in the search box' },
      { icon: '🏷️', text: 'Use tab filters: All Papers / Question Paper / Answer Key' },
      { icon: '📋', text: 'Tap any paper card to open it and start practising' },
    ],
    tip: '🎓 Papers are uploaded by your admin — new papers are added regularly!',
    tipColor: 'blue',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="25" y="10" width="170" height="28" rx="14" fill="#f0fdf4" stroke="#059669" strokeWidth="1.5" />
        <circle cx="48" cy="24" r="7" fill="none" stroke="#6ee7b7" strokeWidth="2" />
        <line x1="53" y1="29" x2="58" y2="34" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
        <text x="68" y="28" fill="#6b7280" fontSize="10" fontFamily="sans-serif">Tamil, Maths, Physics...</text>
        <rect x="25" y="46" width="80" height="30" rx="8" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="31" y="52" width="30" height="3" rx="1.5" fill="#059669" />
        <rect x="31" y="59" width="50" height="2" rx="1" fill="#d1d5db" />
        <rect x="31" y="65" width="40" height="2" rx="1" fill="#e5e7eb" />
        <rect x="115" y="46" width="80" height="30" rx="8" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="121" y="52" width="35" height="3" rx="1.5" fill="#059669" />
        <rect x="121" y="59" width="48" height="2" rx="1" fill="#d1d5db" />
        <rect x="121" y="65" width="42" height="2" rx="1" fill="#e5e7eb" />
        <rect x="25" y="84" width="170" height="26" rx="8" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
        <rect x="31" y="90" width="40" height="3" rx="1.5" fill="#059669" />
        <rect x="31" y="97" width="80" height="2" rx="1" fill="#6ee7b7" />
        <circle cx="180" cy="97" r="7" fill="#059669" />
        <polyline points="176,97 179,100 184,94" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: 3,
    emoji: '🎯',
    title: 'Step 3: Exam Mode',
    subtitle: 'Simulate the real Tamil Nadu board exam',
    bullets: [
      { icon: '✏️', text: 'Enter your name — it will be saved for future attempts' },
      { icon: '⏱️', text: 'A 3-hour countdown timer starts automatically' },
      { icon: '📄', text: 'Question paper appears full screen — stay focused!' },
      { icon: '✅', text: 'Click Stop / Submit when done, or let the timer auto-submit' },
      { icon: '🔁', text: 'Timer is saved — close & reopen the app without losing time' },
    ],
    tip: '💡 Treat it like the real exam — no peeking at answers until you submit!',
    tipColor: 'amber',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="35" y="10" width="90" height="100" rx="8" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="35" y="10" width="90" height="20" rx="8" fill="#059669" />
        <rect x="35" y="22" width="90" height="8" rx="0" fill="#059669" />
        <text x="80" y="24" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">EXAM MODE</text>
        <rect x="45" y="38" width="60" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="45" y="46" width="70" height="2" rx="1" fill="#e5e7eb" />
        <rect x="45" y="52" width="65" height="2" rx="1" fill="#e5e7eb" />
        <rect x="45" y="62" width="60" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="45" y="70" width="70" height="2" rx="1" fill="#e5e7eb" />
        <circle cx="170" cy="42" r="28" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="170" cy="42" r="22" fill="#ffffff" stroke="#fde68a" strokeWidth="1" />
        <line x1="170" y1="42" x2="170" y2="28" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="170" y1="42" x2="180" y2="36" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="170" cy="42" r="2.5" fill="#f59e0b" />
        <rect x="145" y="80" width="50" height="14" rx="7" fill="#059669" />
        <text x="170" y="90" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">SUBMIT ✓</text>
      </svg>
    ),
  },
  {
    step: 4,
    emoji: '📖',
    title: 'Step 4: Study Mode',
    subtitle: 'Learn with paper & answer key side by side',
    bullets: [
      { icon: '🖥️', text: 'Desktop: Question Paper and Answer Key shown together' },
      { icon: '📱', text: 'Mobile: Switch between paper and key with one tap' },
      { icon: '🔑', text: 'Multiple answer keys: Official, Sura, Together, etc.' },
      { icon: '⏰', text: 'No timer — study at your own comfortable pace' },
      { icon: '💡', text: 'Best used AFTER completing an exam attempt' },
    ],
    tip: '✨ Use Study Mode to understand where you went wrong in your exam!',
    tipColor: 'blue',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="10" y="15" width="95" height="90" rx="6" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1.5" />
        <rect x="10" y="15" width="95" height="16" rx="6" fill="#3b82f6" />
        <rect x="10" y="24" width="95" height="7" rx="0" fill="#3b82f6" />
        <text x="57" y="27" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">📄 Question Paper</text>
        <rect x="18" y="40" width="70" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="18" y="48" width="79" height="2" rx="1" fill="#e5e7eb" />
        <rect x="18" y="54" width="72" height="2" rx="1" fill="#e5e7eb" />
        <rect x="18" y="64" width="70" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="18" y="72" width="79" height="2" rx="1" fill="#e5e7eb" />
        <rect x="115" y="15" width="95" height="90" rx="6" fill="#ffffff" stroke="#a7f3d0" strokeWidth="1.5" />
        <rect x="115" y="15" width="95" height="16" rx="6" fill="#059669" />
        <rect x="115" y="24" width="95" height="7" rx="0" fill="#059669" />
        <text x="162" y="27" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">🔑 Answer Key</text>
        <rect x="123" y="40" width="50" height="3" rx="1.5" fill="#d1d5db" />
        <circle cx="186" cy="42" r="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1" />
        <polyline points="183,42 185,44 189,39" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="123" y="52" width="50" height="3" rx="1.5" fill="#d1d5db" />
        <circle cx="186" cy="54" r="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1" />
        <polyline points="183,54 185,56 189,51" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="123" y="64" width="50" height="3" rx="1.5" fill="#d1d5db" />
        <circle cx="186" cy="66" r="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <text x="186" y="69" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">?</text>
        <line x1="110" y1="15" x2="110" y2="105" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />
      </svg>
    ),
  },
  {
    step: 5,
    emoji: '📊',
    title: 'Step 5: Track Your Progress',
    subtitle: 'See your scores and improve each attempt',
    bullets: [
      { icon: '🔑', text: 'After exam — tap "Answer Key" to check your answers' },
      { icon: '📊', text: 'Go to "My History" to see all past exam attempts' },
      { icon: '⏱️', text: 'See how much time you took for each attempt' },
      { icon: '🔁', text: 'Retake the same paper to beat your previous time' },
      { icon: '🏆', text: 'Consistent practice = better board exam score!' },
    ],
    tip: '🏆 The more papers you practice, the more confident you become!',
    tipColor: 'purple',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="50" y="10" width="120" height="95" rx="10" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="60" y="20" width="60" height="5" rx="2.5" fill="#059669" />
        <rect x="60" y="35" width="16" height="16" rx="4" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <polyline points="64,43 67,47 74,39" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="82" y="40" width="70" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="60" y="57" width="16" height="16" rx="4" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <polyline points="64,65 67,69 74,61" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="82" y="62" width="55" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="60" y="79" width="16" height="16" rx="4" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" />
        <rect x="82" y="84" width="60" height="3" rx="1.5" fill="#e5e7eb" />
        <circle cx="190" cy="28" r="15" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <text x="190" y="33" textAnchor="middle" fontSize="16">🏆</text>
        <rect x="25" y="110" width="170" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="25" y="110" width="113" height="5" rx="2.5" fill="#059669" />
        <text x="200" y="115" fill="#059669" fontSize="8" fontWeight="bold">67%</text>
      </svg>
    ),
  },
  {
    step: 6,
    emoji: '💾',
    title: 'Your Data is Always Safe',
    subtitle: 'Private, secure & works offline too!',
    bullets: [
      { icon: '📱', text: 'All your attempts are stored only on your own device' },
      { icon: '🌐', text: 'Works offline — practice even without internet!' },
      { icon: '💾', text: 'Use "Backup" page to export and save your data safely' },
      { icon: '🔄', text: 'Restore your data on any device from the backup file' },
      { icon: '🔖', text: 'Bookmark this page in your browser for quick access' },
    ],
    tip: '📌 Add this app to your phone home screen for one-tap access!',
    tipColor: 'emerald',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        <rect x="75" y="8" width="70" height="104" rx="12" fill="#f8fafc" stroke="#374151" strokeWidth="2" />
        <rect x="82" y="22" width="56" height="72" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <rect x="88" y="30" width="44" height="4" rx="2" fill="#059669" />
        <rect x="88" y="40" width="34" height="2" rx="1" fill="#d1d5db" />
        <rect x="88" y="46" width="38" height="2" rx="1" fill="#e5e7eb" />
        <rect x="88" y="56" width="44" height="14" rx="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1" />
        <text x="110" y="66" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">SAVED ✓</text>
        <rect x="101" y="76" width="18" height="13" rx="3" fill="#374151" />
        <path d="M105 76 L105 72 A5 5 0 0 1 115 72 L115 76" fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx="110" cy="82" r="2" fill="#ffffff" />
        <rect x="101" y="100" width="18" height="3" rx="1.5" fill="#d1d5db" />
        <path d="M180 50 A16 16 0 0 1 180 82 L165 82 A13 13 0 0 1 160 56 A17 17 0 0 1 180 50Z" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <line x1="172" y1="62" x2="172" y2="76" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <polyline points="167,70 172,76 177,70" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 40 L38 60 Q38 75 50 82 Q62 75 62 60 L62 40 L50 35 Z" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <polyline points="44,57 49,62 56,52" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/**
 * Color mapping for tip backgrounds
 */
const tipColors = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

// PUBLIC_INTERFACE
/**
 * Check whether the user has already seen the instructions modal.
 * @returns {boolean} True if instructions have been dismissed previously
 */
export function hasSeenInstructions() {
  try {
    return localStorage.getItem(INSTRUCTIONS_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
/**
 * Mark the instructions modal as dismissed/seen.
 */
export function markInstructionsSeen() {
  try {
    localStorage.setItem(INSTRUCTIONS_SEEN_KEY, 'true');
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// PUBLIC_INTERFACE
/**
 * InstructionsModal component — modern onboarding modal for school students.
 * Shows step-by-step numbered slides with simple language, bullet points,
 * colorful tips, and engaging illustrations. Designed for clarity.
 * Persists dismissal in localStorage so it only auto-shows on first visit.
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 * @returns {JSX.Element|null}
 */
function InstructionsModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0);

  // Reset slide index when modal reopens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setSlideKey(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, currentSlide]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setSlideKey((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setSlideKey((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    markInstructionsSeen();
    onClose();
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;
  const isFirst = currentSlide === 0;
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="App Instructions — How to use TN Study Hub"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal — narrow on mobile, wide horizontal card on desktop */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-4xl overflow-hidden animate-scaleIn sm:h-[500px]">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 shrink-0">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-md border border-gray-200 text-gray-500 hover:text-gray-800 hover:shadow-lg active:scale-95 transition-all duration-200"
          aria-label="Close instructions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Body: stacked on mobile, side-by-side on desktop, fills full card height */}
        <div key={slideKey} className="sm:flex sm:h-[calc(100%-4px)] slide-enter">

          {/* ── LEFT PANEL (desktop only) — dark bg, illustration + dots ── */}
          <div className="hidden sm:flex flex-col items-center justify-between w-64 shrink-0 bg-gradient-to-b from-gray-900 to-emerald-950 px-6 py-7">
            {/* Step + Emoji */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {slide.step > 0 && <span className="step-number">{slide.step}</span>}
                <span className="text-4xl animate-bounce-gentle">{slide.emoji}</span>
              </div>
              <p className="text-emerald-300 text-xs font-semibold text-center leading-tight mt-1">
                {slide.subtitle}
              </p>
            </div>
            {/* Illustration */}
            <div className="w-full px-1 my-4 opacity-95">{slide.illustration}</div>
            {/* Dots + counter */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentSlide(idx); setSlideKey((p) => p + 1); }}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-5 h-2 bg-emerald-400'
                        : idx < currentSlide
                        ? 'w-2 h-2 bg-emerald-600'
                        : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <p className="text-white/30 text-xs">{currentSlide + 1} / {slides.length}</p>
            </div>
          </div>

          {/* ── RIGHT PANEL (full on mobile, right column on desktop) ── */}
          <div className="flex-1 flex flex-col max-h-[82dvh] sm:max-h-none sm:h-full">

            {/* Title header — proper breathing room, pr-10 avoids close button */}
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-3 pr-10 sm:pr-12 bg-gradient-to-b from-gray-50 to-white shrink-0">
              {/* Mobile: step badge + emoji */}
              <div className="flex items-center gap-2 mb-1.5 sm:hidden">
                {slide.step > 0 && <span className="step-number">{slide.step}</span>}
                <span className="text-2xl animate-bounce-gentle">{slide.emoji}</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 leading-tight">
                {slide.title}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 sm:hidden font-medium">{slide.subtitle}</p>
              {/* Accent underline */}
              <div className="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>

            {/* Bullets — scrollable flex-1 area */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-3">
              <div className="space-y-1.5">
                {slide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                  >
                    <span className="text-base leading-none shrink-0 mt-0.5">{bullet.icon}</span>
                    <span className="text-xs sm:text-sm text-gray-700 leading-snug font-medium">
                      {bullet.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip — pinned above nav */}
            {slide.tip && (
              <div className={`mx-5 sm:mx-7 mb-2 rounded-xl px-3 py-2 text-xs font-medium border shrink-0 ${tipColors[slide.tipColor] || tipColors.emerald}`}>
                {slide.tip}
              </div>
            )}

            {/* Mobile dots */}
            <div className="flex justify-center gap-1.5 py-1.5 sm:hidden shrink-0">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentSlide(idx); setSlideKey((p) => p + 1); }}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-5 h-2 bg-emerald-500'
                      : idx < currentSlide
                      ? 'w-2 h-2 bg-emerald-300'
                      : 'w-2 h-2 bg-gray-200'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation — always at bottom */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3 shrink-0">
              {isFirst ? (
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Skip
                </button>
              ) : (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-all px-3 py-1.5 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              {isLast ? (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-white text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                >
                  🚀 Let's Start!
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
                >
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default InstructionsModal;
