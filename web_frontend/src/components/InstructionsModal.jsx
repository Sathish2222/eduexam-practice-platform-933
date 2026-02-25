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
    title: 'Welcome to EduExam!',
    subtitle: 'Your personal exam practice helper',
    bullets: [
      { icon: '📱', text: 'Practice exams on your phone or computer' },
      { icon: '🎯', text: 'Get better at exams with timed practice' },
      { icon: '🔒', text: 'Everything is saved on YOUR device — safe & private' },
    ],
    tip: '💡 Swipe through these slides to learn how to use the app!',
    tipColor: 'emerald',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        {/* Open book with sparkles */}
        <rect x="40" y="40" width="140" height="65" rx="8" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <rect x="46" y="46" width="128" height="53" rx="5" fill="#ffffff" />
        <line x1="110" y1="46" x2="110" y2="99" stroke="#d1fae5" strokeWidth="1.5" />
        {/* Left page lines */}
        <line x1="56" y1="58" x2="100" y2="58" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="68" x2="95" y2="68" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="78" x2="98" y2="78" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="88" x2="90" y2="88" stroke="#d1fae5" strokeWidth="2" strokeLinecap="round" />
        {/* Right page lines */}
        <line x1="120" y1="58" x2="164" y2="58" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="68" x2="158" y2="68" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="78" x2="160" y2="78" stroke="#d1fae5" strokeWidth="2" strokeLinecap="round" />
        {/* Graduation cap */}
        <polygon points="110,8 145,22 110,36 75,22" fill="#059669" opacity="0.9" />
        <line x1="110" y1="36" x2="110" y2="42" stroke="#059669" strokeWidth="2" />
        <line x1="145" y1="22" x2="145" y2="34" stroke="#059669" strokeWidth="1.5" />
        <circle cx="145" cy="36" r="2.5" fill="#34d399" />
        {/* Sparkles */}
        <circle cx="30" cy="25" r="3" fill="#fbbf24" opacity="0.8" />
        <circle cx="190" cy="30" r="2.5" fill="#fbbf24" opacity="0.7" />
        <circle cx="25" cy="65" r="2" fill="#34d399" opacity="0.6" />
        <circle cx="195" cy="70" r="2" fill="#34d399" opacity="0.7" />
        {/* Star */}
        <polygon points="185,15 187,21 193,21 188,25 190,31 185,27 180,31 182,25 177,21 183,21" fill="#fbbf24" opacity="0.8" />
      </svg>
    ),
  },
  {
    step: 1,
    emoji: '📄',
    title: 'Step 1: Find Your Paper',
    subtitle: 'Browse & search question papers easily',
    bullets: [
      { icon: '👆', text: 'Tap "Papers" in the menu at the top' },
      { icon: '🔍', text: 'Type in the search box to find your subject' },
      { icon: '🏷️', text: 'Use filters to pick subject and year' },
      { icon: '📋', text: 'Tap any paper card to open it' },
    ],
    tip: '🎓 Your teacher or admin uploads papers for you!',
    tipColor: 'blue',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        {/* Search bar */}
        <rect x="25" y="10" width="170" height="30" rx="15" fill="#f0fdf4" stroke="#059669" strokeWidth="1.5" />
        <circle cx="48" cy="25" r="7" fill="none" stroke="#6ee7b7" strokeWidth="2" />
        <line x1="53" y1="30" x2="58" y2="35" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
        <text x="68" y="29" fill="#6b7280" fontSize="11" fontFamily="sans-serif">Search papers...</text>
        {/* Paper cards with green accents */}
        <rect x="25" y="48" width="80" height="30" rx="8" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="31" y="54" width="30" height="3" rx="1.5" fill="#059669" />
        <rect x="31" y="61" width="50" height="2" rx="1" fill="#d1d5db" />
        <rect x="31" y="67" width="40" height="2" rx="1" fill="#e5e7eb" />
        <rect x="115" y="48" width="80" height="30" rx="8" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        <rect x="121" y="54" width="35" height="3" rx="1.5" fill="#059669" />
        <rect x="121" y="61" width="48" height="2" rx="1" fill="#d1d5db" />
        <rect x="121" y="67" width="42" height="2" rx="1" fill="#e5e7eb" />
        {/* Bottom card with checkmark */}
        <rect x="25" y="86" width="170" height="26" rx="8" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
        <rect x="31" y="92" width="40" height="3" rx="1.5" fill="#059669" />
        <rect x="31" y="99" width="80" height="2" rx="1" fill="#6ee7b7" />
        {/* Checkmark badge */}
        <circle cx="180" cy="99" r="7" fill="#059669" />
        <polyline points="176,99 179,102 184,96" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Tap finger indicator */}
        <circle cx="65" cy="63" r="4" fill="#059669" opacity="0.15" />
        <circle cx="65" cy="63" r="8" fill="#059669" opacity="0.08" />
      </svg>
    ),
  },
  {
    step: 2,
    emoji: '⏱️',
    title: 'Step 2: Start Your Exam',
    subtitle: 'Practice with a real countdown timer',
    bullets: [
      { icon: '✏️', text: 'Enter your name when asked' },
      { icon: '▶️', text: 'Tap the green "Start Exam" button' },
      { icon: '⏳', text: 'A 3-hour timer starts counting down' },
      { icon: '🔔', text: 'When time is up, it auto-submits for you!' },
    ],
    tip: '⚡ Don\'t worry — if you close the app, the timer remembers where you left off!',
    tipColor: 'amber',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        {/* Clock face */}
        <circle cx="110" cy="58" r="42" fill="#f0fdf4" stroke="#059669" strokeWidth="2" />
        <circle cx="110" cy="58" r="36" fill="#ffffff" stroke="#d1fae5" strokeWidth="1" />
        {/* Clock marks */}
        <line x1="110" y1="26" x2="110" y2="30" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <line x1="110" y1="86" x2="110" y2="90" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <line x1="78" y1="58" x2="82" y2="58" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <line x1="138" y1="58" x2="142" y2="58" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        {/* Hour hand */}
        <line x1="110" y1="58" x2="110" y2="36" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
        {/* Minute hand */}
        <line x1="110" y1="58" x2="128" y2="46" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <circle cx="110" cy="58" r="3" fill="#059669" />
        {/* Timer display */}
        <rect x="70" y="102" width="80" height="16" rx="8" fill="#059669" />
        <text x="110" y="113" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">03:00:00</text>
        {/* Play button */}
        <circle cx="175" cy="95" r="14" fill="#059669" opacity="0.12" />
        <polygon points="171,88 185,95 171,102" fill="#059669" />
        {/* Sparkle */}
        <polygon points="45,30 47,36 53,36 48,40 50,46 45,42 40,46 42,40 37,36 43,36" fill="#fbbf24" opacity="0.7" />
      </svg>
    ),
  },
  {
    step: 3,
    emoji: '✅',
    title: 'Step 3: Check Your Answers',
    subtitle: 'See how well you did!',
    bullets: [
      { icon: '🔑', text: 'Tap "Answer Key" to see correct answers' },
      { icon: '📊', text: 'Go to "History" to see all your past attempts' },
      { icon: '🎯', text: 'Practice again and try to improve each time!' },
    ],
    tip: '🏆 The more you practice, the better you get!',
    tipColor: 'purple',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        {/* Checklist card */}
        <rect x="50" y="10" width="120" height="95" rx="10" fill="#ffffff" stroke="#d1fae5" strokeWidth="1.5" />
        {/* Header */}
        <rect x="60" y="20" width="60" height="5" rx="2.5" fill="#059669" />
        {/* Row 1 - checked */}
        <rect x="60" y="35" width="16" height="16" rx="4" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <polyline points="64,43 67,47 74,39" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="82" y="40" width="70" height="3" rx="1.5" fill="#d1d5db" />
        {/* Row 2 - checked */}
        <rect x="60" y="57" width="16" height="16" rx="4" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <polyline points="64,65 67,69 74,61" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="82" y="62" width="55" height="3" rx="1.5" fill="#d1d5db" />
        {/* Row 3 - unchecked */}
        <rect x="60" y="79" width="16" height="16" rx="4" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" />
        <rect x="82" y="84" width="60" height="3" rx="1.5" fill="#e5e7eb" />
        {/* Trophy */}
        <circle cx="190" cy="30" r="15" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <text x="190" y="35" textAnchor="middle" fontSize="16">🏆</text>
        {/* Progress bar */}
        <rect x="25" y="112" width="170" height="5" rx="2.5" fill="#e5e7eb" />
        <rect x="25" y="112" width="113" height="5" rx="2.5" fill="#059669" />
        <text x="200" y="117" fill="#059669" fontSize="8" fontWeight="bold">67%</text>
      </svg>
    ),
  },
  {
    step: 4,
    emoji: '💾',
    title: 'Step 4: Your Data is Safe',
    subtitle: 'No internet? No problem!',
    bullets: [
      { icon: '📱', text: 'Everything is saved on YOUR device' },
      { icon: '🌐', text: 'Works without internet — practice anywhere!' },
      { icon: '💾', text: 'Use "Backup" to save & move your data' },
      { icon: '🔄', text: 'Restore your data on a new device anytime' },
    ],
    tip: '📌 Bookmark this app in your browser for easy access!',
    tipColor: 'emerald',
    illustration: (
      <svg viewBox="0 0 220 120" className="w-full h-24 mx-auto" aria-hidden="true">
        {/* Phone device */}
        <rect x="75" y="8" width="70" height="104" rx="12" fill="#f8fafc" stroke="#374151" strokeWidth="2" />
        <rect x="82" y="22" width="56" height="72" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        {/* Screen content */}
        <rect x="88" y="30" width="44" height="4" rx="2" fill="#059669" />
        <rect x="88" y="40" width="34" height="2" rx="1" fill="#d1d5db" />
        <rect x="88" y="46" width="38" height="2" rx="1" fill="#e5e7eb" />
        {/* Save button on screen */}
        <rect x="88" y="56" width="44" height="14" rx="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1" />
        <text x="110" y="66" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">SAVED ✓</text>
        {/* Lock icon */}
        <rect x="101" y="76" width="18" height="13" rx="3" fill="#374151" />
        <path d="M105 76 L105 72 A5 5 0 0 1 115 72 L115 76" fill="none" stroke="#374151" strokeWidth="2" />
        <circle cx="110" cy="82" r="2" fill="#ffffff" />
        {/* Home indicator */}
        <rect x="101" y="100" width="18" height="3" rx="1.5" fill="#d1d5db" />
        {/* Cloud sync icon */}
        <path d="M180 50 A16 16 0 0 1 180 82 L165 82 A13 13 0 0 1 160 56 A17 17 0 0 1 180 50Z" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <line x1="172" y1="62" x2="172" y2="76" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <polyline points="167,70 172,76 177,70" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Shield icon */}
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="App Instructions — How to use EduExam"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container — modern rounded design */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border border-gray-100">
        {/* Progress bar at the very top */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #059669, #34d399)',
            }}
          />
        </div>

        {/* Close button — subtle but accessible */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-200 backdrop-blur-sm"
          aria-label="Close instructions"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Slide Content — animated transitions */}
        <div key={slideKey} className="px-5 sm:px-7 pt-6 pb-3 slide-enter">
          {/* Step badge + Emoji */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {slide.step > 0 && (
              <span className="step-number">{slide.step}</span>
            )}
            <span className="text-4xl sm:text-5xl animate-bounce-gentle">{slide.emoji}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 text-center mb-1 leading-tight">
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 text-center mb-4 font-medium">
            {slide.subtitle}
          </p>

          {/* Illustration */}
          <div className="mb-4 px-2">{slide.illustration}</div>

          {/* Bullet points — clear & easy to read */}
          <div className="space-y-2 mb-4">
            {slide.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
              >
                <span className="text-lg leading-none shrink-0 mt-0.5">{bullet.icon}</span>
                <span className="text-sm text-gray-700 leading-snug font-medium">
                  {bullet.text}
                </span>
              </div>
            ))}
          </div>

          {/* Tip box — colored */}
          {slide.tip && (
            <div className={`rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium border ${tipColors[slide.tipColor] || tipColors.emerald}`}>
              {slide.tip}
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 py-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                setSlideKey((prev) => prev + 1);
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 h-2.5 bg-emerald-500'
                  : idx < currentSlide
                  ? 'w-2.5 h-2.5 bg-emerald-300'
                  : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons — prominent and student-friendly */}
        <div className="flex items-center justify-between px-5 sm:px-7 pb-5 pt-1">
          {/* Skip / Back */}
          {isFirst ? (
            <button
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-all px-3 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          {/* Next / Get Started */}
          {isLast ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              }}
            >
              🚀 Let's Start!
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Slide counter — minimal */}
        <div className="text-center pb-4 text-xs text-gray-300 font-medium">
          {currentSlide + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
}

export default InstructionsModal;
