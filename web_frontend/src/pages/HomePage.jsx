import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPapers, getAttempts } from '../utils/storage';
import InstructionsModal, {
  markInstructionsSeen,
} from '../components/InstructionsModal';

// PUBLIC_INTERFACE
function HomePage() {
  const navigate = useNavigate();
  const papers = getPapers();
  const attempts = getAttempts();

  const [showInstructions, setShowInstructions] = useState(true);

  // Persisted class selection
  const [selectedClass, setSelectedClass] = useState(
    () => localStorage.getItem('tn_selected_class') || ''
  );

  const completedCount = attempts.filter((a) => a.completed).length;
  const subjectCount = new Set(papers.map((p) => p.subject)).size;

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    localStorage.setItem('tn_selected_class', cls);
    navigate('/browse');
  };

  const classes = [
    {
      label: '10th',
      full: '10th Standard',
      icon: '📘',
      desc: 'SSLC Board Exam',
      accent: 'from-blue-500 to-blue-600',
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      badge: 'bg-blue-600',
      ring: 'ring-blue-200',
    },
    {
      label: '11th',
      full: '11th Standard',
      icon: '📗',
      desc: 'First Year HSC',
      accent: 'from-amber-500 to-orange-500',
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      badge: 'bg-amber-500',
      ring: 'ring-amber-200',
    },
    {
      label: '12th',
      full: '12th Standard',
      icon: '📕',
      desc: 'HSC Board Exam',
      accent: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-300',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      badge: 'bg-emerald-600',
      ring: 'ring-emerald-200',
    },
  ];

  return (
    <div>
      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => {
          markInstructionsSeen();
          setShowInstructions(false);
        }}
      />

      {/* ── Hero — full-width breakout ── */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 text-white mb-0">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Tamil Nadu Board Exam Practice
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            📝 TN Study{' '}
            <span className="text-emerald-400">Hub</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            Practice question papers, take timed exams &amp; study with answer keys —{' '}
            <span className="text-white font-semibold">everything saved on your device</span>.
          </p>
        </div>
      </section>

      {/* ── Class Selector — overlaps hero bottom ── */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-8 -mt-6 sm:-mt-8 mb-8 sm:mb-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
            <p className="text-center text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Select Your Class to Get Started
            </p>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {classes.map((cls) => {
                const isSelected = selectedClass === cls.label;
                return (
                  <button
                    key={cls.label}
                    onClick={() => handleClassSelect(cls.label)}
                    className={`relative group flex flex-col items-center py-4 sm:py-5 px-2 rounded-xl border-2 transition-all duration-200 overflow-hidden active:scale-[0.97] ${
                      isSelected
                        ? `${cls.border} ${cls.bg} shadow-md ring-4 ${cls.ring}`
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cls.accent}`} />
                    )}
                    <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform duration-200">
                      {cls.icon}
                    </span>
                    <span className={`font-extrabold text-lg sm:text-xl ${isSelected ? cls.text : 'text-gray-800'}`}>
                      {cls.label}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-medium mt-0.5 ${isSelected ? cls.text : 'text-gray-400'}`}>
                      {cls.desc}
                    </span>
                    {isSelected ? (
                      <span className={`mt-2.5 text-[10px] px-2.5 py-0.5 rounded-full text-white font-bold ${cls.badge}`}>
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="mt-2.5 text-[10px] px-2.5 py-0.5 rounded-full text-gray-400 bg-gray-100 font-medium">
                        Tap to select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedClass && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Browsing papers for{' '}
                <span className="font-bold text-gray-600">{selectedClass} Standard</span>.{' '}
                <button
                  onClick={() => { setSelectedClass(''); localStorage.removeItem('tn_selected_class'); }}
                  className="text-error hover:underline font-medium"
                >
                  Clear
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {[
          { icon: '📄', value: papers.length, label: 'Papers', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
          { icon: '✏️', value: attempts.length, label: 'Attempts', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
          { icon: '✅', value: completedCount, label: 'Completed', bg: 'bg-amber-50', iconBg: 'bg-amber-100' },
          { icon: '📚', value: subjectCount, label: 'Subjects', bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl border border-white p-4 sm:p-5 text-center shadow-sm`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl ${stat.iconBg} flex items-center justify-center text-xl sm:text-2xl`}>
              {stat.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-none">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── Mode Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-10">
        {/* Exam Mode */}
        <Link
          to="/browse"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-300 shadow-sm">
              🎯
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                Exam Mode
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Timed practice with a real countdown timer. Auto-submits when time ends — just like the real board exam.
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-300">
                Start Exam
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Study Mode */}
        <Link
          to="/browse"
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400" />
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition-transform duration-300 shadow-sm">
              📖
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                Study Mode
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                View the question paper &amp; answer key side by side. Study at your own pace with no timer pressure.
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-600 group-hover:translate-x-1.5 transition-transform duration-300">
                Start Studying
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Quick Links ── */}
      <section className="mb-4">
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            to="/browse"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
          >
            📋 Browse Papers
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
          >
            📊 My History
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
          >
            ⚙️ Settings
          </Link>
          <Link
            to="/import-export"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
          >
            💾 Backup
          </Link>
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs sm:text-sm text-emerald-700 font-semibold hover:bg-emerald-100 transition-all duration-200 shadow-sm"
          >
            ❓ How to Use
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
