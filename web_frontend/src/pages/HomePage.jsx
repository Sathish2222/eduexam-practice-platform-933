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

  const [selectedClass, setSelectedClass] = useState(
    () => localStorage.getItem('tn_selected_class') || ''
  );

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    localStorage.setItem('tn_selected_class', cls);
    navigate('/browse');
  };

  const classes = [
    {
      label: '10th',
      sublabel: 'SSLC Board',
      icon: '📘',
      color: 'blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      subColor: 'text-blue-400',
      selectedBg: 'bg-blue-600',
      selectedShadow: 'shadow-lg shadow-blue-300/50',
    },
    {
      label: '11th',
      sublabel: 'First Year HSC',
      icon: '📗',
      color: 'amber',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      subColor: 'text-amber-400',
      selectedBg: 'bg-amber-500',
      selectedShadow: 'shadow-lg shadow-amber-300/50',
    },
    {
      label: '12th',
      sublabel: 'HSC Board',
      icon: '📕',
      color: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      subColor: 'text-emerald-400',
      selectedBg: 'bg-emerald-600',
      selectedShadow: 'shadow-lg shadow-emerald-300/50',
    },
  ];

  const quickLinks = [
    { to: '/browse',        icon: '📋', label: 'Browse Papers' },
    { to: '/history',       icon: '📊', label: 'My History'    },
    { to: '/settings',      icon: '⚙️',  label: 'Settings'      },
    { to: '/import-export', icon: '💾', label: 'Backup'         },
  ];

  return (
    <div>
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => { markInstructionsSeen(); setShowInstructions(false); }}
      />

      {/* ── Hero + Class Selector ── */}
      <section className="-mx-4 sm:-mx-6 -mt-6 sm:-mt-8 overflow-hidden relative">
        {/* Clean gradient background */}
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white">

          {/* ── Brand + Subtitle ── */}
          <div className="relative px-5 pt-7 pb-5 sm:pt-12 sm:pb-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-semibold mb-4 tracking-wide">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Tamil Nadu Board Exam Practice
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
              📝 TN Study <span className="text-emerald-400">Hub</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              Practice papers, timed exams &amp; answer keys —{' '}
              <span className="text-gray-300 font-semibold">saved on your device</span>.
            </p>
          </div>
        </div>

        {/* ── Class Selector ── */}
        <div className="relative bg-white px-4 sm:px-8 pt-6 pb-6 sm:pb-8">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
            Select Your Class to Begin
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:max-w-xl sm:mx-auto">
            {classes.map((cls) => {
              const isSelected = selectedClass === cls.label;
              return (
                <button
                  key={cls.label}
                  onClick={() => handleClassSelect(cls.label)}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 transition-all duration-200 active:scale-[0.96] ${
                    isSelected
                      ? `${cls.selectedBg} border-transparent ${cls.selectedShadow}`
                      : `${cls.bg} ${cls.border} ${cls.hoverBorder} hover:shadow-md`
                  }`}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                      <svg className={`w-3.5 h-3.5 ${cls.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Card content */}
                  <div className="flex flex-col items-center pt-4 pb-4 px-2 gap-1.5 w-full">
                    {/* Icon container */}
                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mb-0.5 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'bg-white/20' : cls.iconBg}`}>
                      {cls.icon}
                    </div>

                    {/* Class number */}
                    <span className={`font-extrabold text-lg sm:text-2xl leading-none tracking-tight ${isSelected ? 'text-white' : cls.textColor}`}>
                      {cls.label}
                    </span>

                    {/* Sublabel */}
                    <span className={`text-[9px] sm:text-[11px] font-medium text-center leading-tight ${isSelected ? 'text-white/80' : cls.subColor}`}>
                      {cls.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedClass && (
            <p className="text-center text-[10px] text-gray-400 mt-4">
              Browsing{' '}
              <span className="text-gray-600 font-semibold">{selectedClass} Standard</span>
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
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mt-4 mb-4 sm:mb-8 max-w-4xl mx-auto w-full">

        {/* Exam Mode */}
        <Link
          to="/browse"
          className="group relative rounded-2xl overflow-hidden border border-emerald-100 hover:border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4">
            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl sm:text-3xl shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-extrabold text-gray-900 mb-0.5 group-hover:text-emerald-600 transition-colors">
                Exam Mode
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed">
                Timed countdown — auto-submits when time ends.
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform duration-200">
                Start Exam
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Study Mode */}
        <Link
          to="/browse"
          className="group relative rounded-2xl overflow-hidden border border-blue-100 hover:border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400" />
          <div className="p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4">
            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl sm:text-3xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              📖
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-extrabold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                Study Mode
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed">
                Paper &amp; answer key side by side. No timer.
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform duration-200">
                Start Studying
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Quick Links ── */}
      <section className="mb-6 max-w-4xl mx-auto w-full">
        {/* 2-column grid on mobile, flex-wrap on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-2.5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-200/80 rounded-xl text-xs text-gray-600 font-medium hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/70 transition-all duration-200 shadow-sm sm:rounded-full sm:px-4"
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <button
            onClick={() => setShowInstructions(true)}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold hover:bg-emerald-100 transition-all duration-200 shadow-sm sm:rounded-full sm:px-4"
          >
            ❓ How to Use
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
