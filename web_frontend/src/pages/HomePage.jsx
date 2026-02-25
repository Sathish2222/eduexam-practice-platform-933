import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttempts } from '../utils/storage';
import InstructionsModal, {
  hasSeenInstructions,
} from '../components/InstructionsModal';

/**
 * Home page with modern app overview and mode selection.
 */
// PUBLIC_INTERFACE
/**
 * Landing page component showing app overview, quick links, and first-visit
 * onboarding instructions modal. The modal auto-opens on first visit (persisted
 * via localStorage) and can be reopened from a help button in the UI.
 *
 * Modernized layout:
 * - Vibrant hero with gradient text and engaging subtitle
 * - 2×2 stat grid with colorful icons and modern card styling
 * - Full-width stacked mode cards with gradient accents and hover effects
 * - Bottom-anchored pill-style quick-links for one-hand reach
 *
 * @returns {JSX.Element}
 */
function HomePage() {
  const papers = getPapers();
  const attempts = getAttempts();

  // Instructions modal state — show on first visit
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!hasSeenInstructions()) {
      setShowInstructions(true);
    }
  }, []);

  // Derived stats
  const completedCount = attempts.filter((a) => a.completed).length;
  const subjectCount = new Set(papers.map((p) => p.subject)).size;

  return (
    <div className="max-w-4xl mx-auto pb-6">
      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* ── Hero Section — modern & engaging ── */}
      <section className="text-center pt-6 pb-5 sm:pt-10 sm:pb-8 px-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Your Exam Practice Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
          📝 EduExam{' '}
          <span className="text-gradient-emerald">Practice</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-lg mx-auto">
          Upload papers, practice with timed exams, and track your progress —{' '}
          <span className="font-semibold text-gray-700">all saved on your device</span>.
        </p>
      </section>

      {/* ── Stats Grid — colorful & modern ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10 px-1">
        {/* Papers */}
        <div className="modern-card p-4 sm:p-5 text-center group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-emerald-50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
            📄
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-none">
            {papers.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Papers
          </div>
        </div>

        {/* Attempts */}
        <div className="modern-card p-4 sm:p-5 text-center group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-blue-50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
            ✏️
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-none">
            {attempts.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Attempts
          </div>
        </div>

        {/* Completed */}
        <div className="modern-card p-4 sm:p-5 text-center group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-amber-50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
            ✅
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-none">
            {completedCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Completed
          </div>
        </div>

        {/* Subjects */}
        <div className="modern-card p-4 sm:p-5 text-center group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-purple-50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
            📚
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-none">
            {subjectCount}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
            Subjects
          </div>
        </div>
      </section>

      {/* ── Mode Cards — modern with gradient accents ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10 px-1">
        {/* Student Mode */}
        <Link
          to="/browse"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 active:scale-[0.98]"
        >
          {/* Top accent gradient */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />

          <div className="p-5 sm:p-7 flex items-start gap-4">
            {/* Icon — modern rounded container */}
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-300 shadow-sm">
              📄
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                Student Mode
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Browse papers, start timed exams, view answer keys & review your attempt history.
              </p>
            </div>
          </div>

          {/* CTA hint */}
          <div className="px-5 pb-4 sm:px-7 sm:pb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-300">
              Start Practicing
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>

        {/* Admin Mode */}
        <Link
          to="/admin"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-300 transition-all duration-300 active:scale-[0.98]"
        >
          {/* Top accent gradient */}
          <div className="h-1.5 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400" />

          <div className="p-5 sm:p-7 flex items-start gap-4">
            {/* Icon — modern rounded container */}
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-300 shadow-sm">
              🔧
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-1 group-hover:text-gray-600 transition-colors duration-200">
                Admin Mode
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Upload & manage question papers, add answer keys & configure exam settings.
              </p>
            </div>
          </div>

          {/* CTA hint */}
          <div className="px-5 pb-4 sm:px-7 sm:pb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 group-hover:translate-x-1.5 transition-transform duration-300">
              Manage Papers
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </section>

      {/* ── Quick Links — modern pill buttons ── */}
      <section className="px-1">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.97] transition-all duration-200 shadow-sm"
          >
            📊 History
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.97] transition-all duration-200 shadow-sm"
          >
            ⚙️ Settings
          </Link>
          <Link
            to="/import-export"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.97] transition-all duration-200 shadow-sm"
          >
            💾 Backup
          </Link>
          {/* Help / Instructions button — reopens the onboarding modal */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs sm:text-sm text-emerald-700 font-semibold hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.97] transition-all duration-200 shadow-sm"
            aria-label="Show app instructions"
          >
            ❓ How to Use
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
