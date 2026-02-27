import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPapers } from '../utils/storage';
import InstructionsModal, { markInstructionsSeen } from '../components/InstructionsModal';

// PUBLIC_INTERFACE
function HomePage() {
  const navigate = useNavigate();
  const papers = useMemo(() => getPapers(), []);

  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedClass, setSelectedClass] = useState(
    () => localStorage.getItem('tn_selected_class') || ''
  );

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    localStorage.setItem('tn_selected_class', cls);
    navigate('/browse');
  };

  const classMeta = [
    {
      label: '10th',
      sublabel: 'SSLC Board',
      icon: '📘',
      accent: 'from-blue-500 to-blue-600',
      border: 'border-blue-100',
      activeBorder: 'border-blue-500',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
    },
    {
      label: '11th',
      sublabel: 'First Year HSC',
      icon: '📗',
      accent: 'from-amber-400 to-amber-500',
      border: 'border-amber-100',
      activeBorder: 'border-amber-400',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-50',
    },
    {
      label: '12th',
      sublabel: 'HSC Board',
      icon: '📕',
      accent: 'from-emerald-500 to-emerald-600',
      border: 'border-emerald-100',
      activeBorder: 'border-emerald-500',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
    },
  ];

  // Count papers per class
  const paperCounts = useMemo(() => {
    const counts = {};
    papers.forEach(p => {
      if (p.class) counts[p.class] = (counts[p.class] || 0) + 1;
    });
    return counts;
  }, [papers]);

  return (
    <div>
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => { markInstructionsSeen(); setShowInstructions(false); }}
      />

      {/* ── Hero ── */}
      <section className="-mx-3 sm:-mx-6 -mt-4 sm:-mt-8 overflow-hidden">
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white px-4 pt-8 pb-8 sm:pt-14 sm:pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold mb-5 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Tamil Nadu Board Exam Practice
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
            📝 TN Study <span className="text-emerald-400">Hub</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Past papers, timed exams &amp; answer keys —{' '}
            <span className="text-gray-200 font-semibold">free &amp; offline</span>
          </p>
        </div>

        {/* ── Class Selector ── */}
        <div className="bg-white px-4 sm:px-8 pt-6 pb-6 sm:pb-8">
          <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Select Your Class to Begin
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto sm:max-w-lg">
            {classMeta.map((cls) => {
              const isSelected = selectedClass === cls.label;
              const count = paperCounts[cls.label] || 0;
              return (
                <button
                  key={cls.label}
                  onClick={() => handleClassSelect(cls.label)}
                  className={`relative flex flex-col items-center rounded-2xl border-2 transition-all duration-200 active:scale-[0.95] overflow-hidden ${
                    isSelected
                      ? `${cls.activeBorder} shadow-lg`
                      : `${cls.border} hover:shadow-md hover:border-gray-300`
                  }`}
                >
                  {/* Gradient top bar */}
                  <div className={`w-full h-1 bg-gradient-to-r ${cls.accent}`} />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className={`absolute top-2 right-2 w-5 h-5 bg-gradient-to-br ${cls.accent} rounded-full flex items-center justify-center shadow-sm`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col items-center pt-3 pb-3.5 px-2 gap-1 w-full">
                    <span className="text-2xl sm:text-3xl leading-none mb-0.5">{cls.icon}</span>
                    <span className={`font-extrabold text-xl sm:text-2xl leading-none ${cls.textColor}`}>
                      {cls.label}
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-gray-400 font-medium text-center leading-tight">
                      {cls.sublabel}
                    </span>
                    {count > 0 && (
                      <span className={`text-[10px] font-bold ${cls.textColor} ${cls.badgeBg} rounded-full px-2 py-0.5 mt-0.5`}>
                        {count} papers
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedClass && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Showing{' '}
              <span className="text-gray-700 font-semibold">{selectedClass} Standard</span>
              {' · '}
              <button
                onClick={() => { setSelectedClass(''); localStorage.removeItem('tn_selected_class'); }}
                className="text-red-400 hover:text-red-500 font-medium"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      {/* ── Mode Cards ── */}
      <section className="grid grid-cols-2 gap-3 mt-4 mb-4 max-w-4xl mx-auto w-full">

        {/* Exam Mode */}
        <button
          onClick={() => navigate('/browse')}
          className="group relative rounded-2xl overflow-hidden border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 active:scale-[0.97] text-left"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-4 sm:p-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg sm:text-2xl shadow-md shadow-emerald-500/30 mb-3 group-hover:scale-105 transition-transform duration-200">
              🎯
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 mb-0.5 group-hover:text-emerald-700 transition-colors">
              Exam Mode
            </h2>
            <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
              Timed — auto-submits when time ends
            </p>
            <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold text-emerald-600">
              Start
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>

        {/* Study Mode */}
        <button
          onClick={() => navigate('/browse')}
          className="group relative rounded-2xl overflow-hidden border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 active:scale-[0.97] text-left"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400" />
          <div className="p-4 sm:p-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-lg sm:text-2xl shadow-md shadow-blue-500/30 mb-3 group-hover:scale-105 transition-transform duration-200">
              📖
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 mb-0.5 group-hover:text-blue-700 transition-colors">
              Study Mode
            </h2>
            <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
              Paper + answer key, no timer
            </p>
            <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold text-blue-600">
              Start
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      </section>

      {/* ── Quick Links ── */}
      <section className="mb-4 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { to: '/browse',        icon: '📋', label: 'Browse Papers', color: 'hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700' },
            { to: '/history',       icon: '📊', label: 'My History',    color: 'hover:border-purple-200 hover:bg-purple-50/60 hover:text-purple-700' },
            { to: '/settings',      icon: '⚙️',  label: 'Settings',     color: 'hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700' },
            { to: '/import-export', icon: '💾', label: 'Backup Data',   color: 'hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700' },
          ].map((link) => (
            <a
              key={link.to}
              href={link.to}
              onClick={(e) => { e.preventDefault(); navigate(link.to); }}
              className={`flex items-center gap-2 px-3 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-500 font-medium transition-all duration-150 shadow-sm active:scale-[0.97] ${link.color}`}
            >
              <span className="text-base">{link.icon}</span>
              <span className="text-xs sm:text-sm">{link.label}</span>
            </a>
          ))}
        </div>

        <button
          onClick={() => setShowInstructions(true)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold hover:bg-emerald-100 transition-all duration-150 active:scale-[0.98]"
        >
          ❓ How to Use This App
        </button>
      </section>
    </div>
  );
}

export default HomePage;
