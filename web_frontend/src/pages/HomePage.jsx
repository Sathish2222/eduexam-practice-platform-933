import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttempts } from '../utils/storage';
import InstructionsModal, {
  hasSeenInstructions,
} from '../components/InstructionsModal';

/**
 * Home page with app overview and mode selection.
 */
// PUBLIC_INTERFACE
/**
 * Landing page component showing app overview, quick links, and first-visit
 * onboarding instructions modal. The modal auto-opens on first visit (persisted
 * via localStorage) and can be reopened from a help button in the UI.
 *
 * Mobile-optimised layout:
 * - Compact hero with scaled typography
 * - 2×2 stat grid with generous touch padding
 * - Full-width stacked mode cards on small screens
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

      {/* ── Hero Section ── */}
      <section className="text-center pt-6 pb-5 sm:pt-10 sm:pb-8 px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">
          📝 EduExam Practice
        </h1>
        <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-md sm:max-w-2xl mx-auto">
          Your personal exam practice platform. Upload papers, practice with
          timed exams, and track progress — all stored on your device.
        </p>
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10 px-1">
        {/* Papers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-gray-100 btn-press">
          <div className="text-2xl sm:text-3xl font-bold text-primary leading-none">
            {papers.length}
          </div>
          <div className="text-xs sm:text-sm text-secondary mt-1.5 font-medium">
            📄 Papers
          </div>
        </div>

        {/* Attempts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-gray-100 btn-press">
          <div className="text-2xl sm:text-3xl font-bold text-success leading-none">
            {attempts.length}
          </div>
          <div className="text-xs sm:text-sm text-secondary mt-1.5 font-medium">
            ✏️ Attempts
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-gray-100 btn-press">
          <div className="text-2xl sm:text-3xl font-bold text-primary leading-none">
            {completedCount}
          </div>
          <div className="text-xs sm:text-sm text-secondary mt-1.5 font-medium">
            ✅ Completed
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-gray-100 btn-press">
          <div className="text-2xl sm:text-3xl font-bold text-primary leading-none">
            {subjectCount}
          </div>
          <div className="text-xs sm:text-sm text-secondary mt-1.5 font-medium">
            📚 Subjects
          </div>
        </div>
      </section>

      {/* ── Mode Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10 px-1">
        {/* Student Mode */}
        <Link
          to="/browse"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />

          <div className="p-5 sm:p-7 flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl sm:text-3xl">
              📄
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-1 group-hover:text-success transition-colors">
                Student Mode
              </h2>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                Browse papers, start timed exams, view answer keys & review
                attempt history.
              </p>
            </div>
          </div>

          {/* CTA hint */}
          <div className="px-5 pb-4 sm:px-7 sm:pb-5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success group-hover:translate-x-1 transition-transform duration-200">
              Start Practicing →
            </span>
          </div>
        </Link>

        {/* Admin Mode */}
        <Link
          to="/admin"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-gray-600 to-gray-400" />

          <div className="p-5 sm:p-7 flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl sm:text-3xl">
              🔧
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-1 group-hover:text-success transition-colors">
                Admin Mode
              </h2>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                Upload & manage question papers, add answer keys & configure
                exam settings.
              </p>
            </div>
          </div>

          {/* CTA hint */}
          <div className="px-5 pb-4 sm:px-7 sm:pb-5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 group-hover:translate-x-1 transition-transform duration-200">
              Manage Papers →
            </span>
          </div>
        </Link>
      </section>

      {/* ── Quick Links ── */}
      <section className="px-1">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-secondary font-medium hover:text-primary hover:border-primary active:scale-[0.97] transition-all duration-150 shadow-sm"
          >
            📊 History
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-secondary font-medium hover:text-primary hover:border-primary active:scale-[0.97] transition-all duration-150 shadow-sm"
          >
            ⚙️ Settings
          </Link>
          <Link
            to="/import-export"
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-secondary font-medium hover:text-primary hover:border-primary active:scale-[0.97] transition-all duration-150 shadow-sm"
          >
            💾 Backup
          </Link>
          {/* Help / Instructions button — reopens the onboarding modal */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-secondary font-medium hover:text-primary hover:border-primary active:scale-[0.97] transition-all duration-150 shadow-sm"
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
