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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Hero Section */}
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-primary mb-3">📝 EduExam Practice</h1>
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          Your personal exam practice platform. Upload question papers, practice with timed exams,
          and track your progress — all stored locally on your device.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl p-5 text-center shadow-sm border">
          <div className="text-3xl font-bold text-primary">{papers.length}</div>
          <div className="text-sm text-secondary mt-1">Papers</div>
        </div>
        <div className="bg-white rounded-xl p-5 text-center shadow-sm border">
          <div className="text-3xl font-bold text-success">{attempts.length}</div>
          <div className="text-sm text-secondary mt-1">Attempts</div>
        </div>
        <div className="bg-white rounded-xl p-5 text-center shadow-sm border">
          <div className="text-3xl font-bold text-primary">
            {attempts.filter(a => a.completed).length}
          </div>
          <div className="text-sm text-secondary mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-5 text-center shadow-sm border">
          <div className="text-3xl font-bold text-primary">
            {new Set(papers.map(p => p.subject)).size}
          </div>
          <div className="text-sm text-secondary mt-1">Subjects</div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link
          to="/browse"
          className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition group"
        >
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-success transition">
            Student Mode
          </h2>
          <p className="text-secondary text-sm">
            Browse papers, start timed exams, view answer keys, and review your attempt history.
          </p>
        </Link>

        <Link
          to="/admin"
          className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition group"
        >
          <div className="text-4xl mb-3">🔧</div>
          <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-success transition">
            Admin Mode
          </h2>
          <p className="text-secondary text-sm">
            Upload and manage question papers, add answer keys, and configure exam settings.
          </p>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/history"
          className="px-5 py-2 bg-white border rounded-full text-sm text-secondary hover:text-primary hover:border-primary transition"
        >
          📊 Attempt History
        </Link>
        <Link
          to="/settings"
          className="px-5 py-2 bg-white border rounded-full text-sm text-secondary hover:text-primary hover:border-primary transition"
        >
          ⚙️ Settings
        </Link>
        <Link
          to="/import-export"
          className="px-5 py-2 bg-white border rounded-full text-sm text-secondary hover:text-primary hover:border-primary transition"
        >
          💾 Backup / Restore
        </Link>
        {/* Help / Instructions button — reopens the onboarding modal */}
        <button
          onClick={() => setShowInstructions(true)}
          className="px-5 py-2 bg-white border rounded-full text-sm text-secondary hover:text-primary hover:border-primary transition flex items-center gap-1"
          aria-label="Show app instructions"
        >
          ❓ How to Use
        </button>
      </div>
    </div>
  );
}

export default HomePage;
