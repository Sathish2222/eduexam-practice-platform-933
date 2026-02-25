import React, { useState, useEffect, useCallback } from 'react';

const INSTRUCTIONS_SEEN_KEY = 'eduexam_instructions_seen';

/**
 * Onboarding instruction slides data.
 * Each slide has an emoji icon, title, description, and an SVG illustration.
 */
const slides = [
  {
    emoji: '👋',
    title: 'Welcome!',
    description: 'Your exam practice app 📱\nPractice anytime, anywhere!',
    illustration: (
      <svg viewBox="0 0 200 140" className="w-full h-28 mx-auto" aria-hidden="true">
        {/* Book with graduation cap */}
        <rect x="50" y="50" width="100" height="70" rx="8" fill="#E5E7EB" stroke="#374151" strokeWidth="2" />
        <rect x="55" y="55" width="90" height="60" rx="5" fill="#F9FAFB" />
        <line x1="100" y1="55" x2="100" y2="115" stroke="#D1D5DB" strokeWidth="1" />
        <line x1="65" y1="70" x2="95" y2="70" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="65" y1="80" x2="90" y2="80" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="65" y1="90" x2="93" y2="90" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="107" y1="70" x2="135" y2="70" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="107" y1="80" x2="130" y2="80" stroke="#9CA3AF" strokeWidth="2" />
        {/* Graduation cap */}
        <polygon points="100,15 130,30 100,45 70,30" fill="#374151" />
        <line x1="100" y1="45" x2="100" y2="50" stroke="#374151" strokeWidth="2" />
        <line x1="130" y1="30" x2="130" y2="45" stroke="#374151" strokeWidth="2" />
        <circle cx="130" cy="47" r="2" fill="#059669" />
      </svg>
    ),
  },
  {
    emoji: '📄',
    title: 'Browse Papers',
    description: '🔍 Search & filter\n📚 Pick a subject\n📝 Choose your paper',
    illustration: (
      <svg viewBox="0 0 200 140" className="w-full h-28 mx-auto" aria-hidden="true">
        {/* Search bar */}
        <rect x="30" y="15" width="140" height="28" rx="14" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="52" cy="29" r="7" fill="none" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="57" y1="34" x2="62" y2="39" stroke="#9CA3AF" strokeWidth="2" />
        <text x="72" y="34" fill="#9CA3AF" fontSize="11" fontFamily="sans-serif">Search papers...</text>
        {/* Paper cards */}
        <rect x="30" y="52" width="62" height="38" rx="6" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="36" y="58" width="24" height="3" rx="1.5" fill="#374151" />
        <rect x="36" y="65" width="48" height="2" rx="1" fill="#D1D5DB" />
        <rect x="36" y="71" width="40" height="2" rx="1" fill="#D1D5DB" />
        <circle cx="82" cy="80" r="5" fill="#059669" opacity="0.2" />
        <text x="79" y="83" fill="#059669" fontSize="7" fontFamily="sans-serif">✓</text>
        <rect x="108" y="52" width="62" height="38" rx="6" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="114" y="58" width="30" height="3" rx="1.5" fill="#374151" />
        <rect x="114" y="65" width="48" height="2" rx="1" fill="#D1D5DB" />
        <rect x="114" y="71" width="42" height="2" rx="1" fill="#D1D5DB" />
        {/* Bottom card */}
        <rect x="30" y="98" width="140" height="30" rx="6" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="36" y="104" width="36" height="3" rx="1.5" fill="#374151" />
        <rect x="36" y="111" width="80" height="2" rx="1" fill="#D1D5DB" />
        <rect x="36" y="117" width="60" height="2" rx="1" fill="#D1D5DB" />
      </svg>
    ),
  },
  {
    emoji: '⏱️',
    title: 'Timed Exam',
    description: '▶️ Start exam\n⏳ 3-hour timer\n🔔 Auto-submit when done',
    illustration: (
      <svg viewBox="0 0 200 140" className="w-full h-28 mx-auto" aria-hidden="true">
        {/* Clock */}
        <circle cx="100" cy="70" r="45" fill="#F9FAFB" stroke="#374151" strokeWidth="2.5" />
        <circle cx="100" cy="70" r="40" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
        {/* Clock marks */}
        <line x1="100" y1="34" x2="100" y2="38" stroke="#374151" strokeWidth="2" />
        <line x1="100" y1="102" x2="100" y2="106" stroke="#374151" strokeWidth="2" />
        <line x1="64" y1="70" x2="68" y2="70" stroke="#374151" strokeWidth="2" />
        <line x1="132" y1="70" x2="136" y2="70" stroke="#374151" strokeWidth="2" />
        {/* Clock hands */}
        <line x1="100" y1="70" x2="100" y2="44" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="70" x2="120" y2="58" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="70" r="3" fill="#374151" />
        {/* Top button */}
        <rect x="95" y="18" width="10" height="8" rx="2" fill="#374151" />
        {/* Green play button */}
        <circle cx="160" cy="110" r="14" fill="#059669" opacity="0.15" />
        <polygon points="156,103 170,110 156,117" fill="#059669" />
      </svg>
    ),
  },
  {
    emoji: '✅',
    title: 'Check Answers',
    description: '📖 View answer key\n📊 Track your history\n🎯 Improve each time!',
    illustration: (
      <svg viewBox="0 0 200 140" className="w-full h-28 mx-auto" aria-hidden="true">
        {/* Checklist */}
        <rect x="45" y="15" width="110" height="110" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        {/* Header */}
        <rect x="55" y="25" width="60" height="5" rx="2.5" fill="#374151" />
        {/* Row 1 - checked */}
        <rect x="55" y="42" width="14" height="14" rx="3" fill="#059669" opacity="0.15" stroke="#059669" strokeWidth="1.5" />
        <polyline points="58,49 62,53 68,45" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="78" y="46" width="60" height="3" rx="1.5" fill="#D1D5DB" />
        {/* Row 2 - checked */}
        <rect x="55" y="64" width="14" height="14" rx="3" fill="#059669" opacity="0.15" stroke="#059669" strokeWidth="1.5" />
        <polyline points="58,71 62,75 68,67" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="78" y="68" width="50" height="3" rx="1.5" fill="#D1D5DB" />
        {/* Row 3 - unchecked */}
        <rect x="55" y="86" width="14" height="14" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="78" y="90" width="55" height="3" rx="1.5" fill="#D1D5DB" />
        {/* Star */}
        <polygon points="165,25 168,34 178,34 170,40 173,49 165,44 157,49 160,40 152,34 162,34" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    emoji: '💾',
    title: 'Your Data is Safe',
    description: '📱 Saved on your device\n🔒 No internet needed\n💾 Backup & restore anytime',
    illustration: (
      <svg viewBox="0 0 200 140" className="w-full h-28 mx-auto" aria-hidden="true">
        {/* Phone/Device */}
        <rect x="70" y="15" width="60" height="100" rx="10" fill="#F9FAFB" stroke="#374151" strokeWidth="2" />
        <rect x="76" y="28" width="48" height="70" rx="3" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
        {/* Screen content */}
        <rect x="82" y="36" width="36" height="4" rx="2" fill="#374151" />
        <rect x="82" y="46" width="28" height="2" rx="1" fill="#D1D5DB" />
        <rect x="82" y="52" width="32" height="2" rx="1" fill="#D1D5DB" />
        <rect x="82" y="62" width="36" height="12" rx="4" fill="#059669" opacity="0.15" />
        <rect x="88" y="66" width="24" height="4" rx="2" fill="#059669" />
        {/* Lock icon */}
        <rect x="93" y="80" width="14" height="11" rx="2" fill="#374151" />
        <path d="M96 80 L96 76 A4 4 0 0 1 104 76 L104 80" fill="none" stroke="#374151" strokeWidth="2" />
        {/* Home button */}
        <circle cx="100" cy="108" r="4" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
        {/* Cloud with arrow */}
        <path d="M155 60 A15 15 0 0 1 155 90 L140 90 A12 12 0 0 1 135 66 A16 16 0 0 1 155 60Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="147" y1="70" x2="147" y2="84" stroke="#059669" strokeWidth="2" />
        <polyline points="142,78 147,84 152,78" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

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
 * InstructionsModal component — onboarding modal for first-time students.
 * Shows step-by-step slides explaining the app with emojis, illustrations, and minimal English.
 * Persists dismissal in localStorage so it only auto-shows on first visit.
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 * @returns {JSX.Element|null}
 */
function InstructionsModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset slide index when modal reopens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
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
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="App Instructions"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close instructions"
        >
          ✕
        </button>

        {/* Slide Content */}
        <div className="px-6 pt-8 pb-4 text-center">
          {/* Emoji Icon */}
          <div className="text-5xl mb-3 animate-bounce-gentle">{slide.emoji}</div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-3">{slide.title}</h2>

          {/* Illustration */}
          <div className="mb-4 px-4">{slide.illustration}</div>

          {/* Description */}
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-2">
            {slide.description}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'bg-gray-700 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          {/* Skip / Back */}
          {isFirst ? (
            <button
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-2"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={goPrev}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 flex items-center gap-1"
            >
              ← Back
            </button>
          )}

          {/* Next / Get Started */}
          {isLast ? (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              🚀 Let's Go!
            </button>
          ) : (
            <button
              onClick={goNext}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1"
            >
              Next →
            </button>
          )}
        </div>

        {/* Slide counter */}
        <div className="text-center pb-4 text-xs text-gray-400">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}

export default InstructionsModal;
