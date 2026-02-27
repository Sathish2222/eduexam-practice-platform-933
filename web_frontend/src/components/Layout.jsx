import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { to: '/',        label: 'Home',     icon: '🏠' },
    { to: '/browse',  label: 'Exam',     icon: '🎯' },
    { to: '/history', label: 'History',  icon: '📊' },
    { to: '/settings',label: 'Settings', icon: '⚙️'  },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top Header ── */}
      <header className="header-gradient text-white shadow-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-13 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0 py-2">
              <span className="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110 leading-none">📝</span>
              <div className="flex flex-col leading-none">
                <span className="text-sm sm:text-base font-extrabold tracking-tight">TN Study Hub</span>
                <span className="text-[10px] text-emerald-300/80 font-normal tracking-wide hidden sm:block mt-0.5">Exam Practice Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile: current page indicator */}
            <div className="md:hidden">
              <span className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                {navItems.find(n => isActive(n.to))?.label || 'TN Hub'}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full px-3 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-10 animate-fadeIn">
        {children}
      </main>

      {/* Footer — desktop only */}
      <footer className="hidden md:block border-t border-gray-100 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="w-full px-4 sm:px-6 py-5 flex flex-col items-center gap-1.5">
          <p className="text-center text-sm text-gray-500 font-medium">
            📝 TN Study Hub — All data stored locally on your device
          </p>
          <p className="text-center text-sm text-gray-400">
            Designed &amp; Developed by{' '}
            <a
              href="https://www.linkedin.com/in/sathish-kumar-balakrishnan-3436611b5/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-success transition-colors duration-150 inline-flex items-center gap-1"
            >
              Sathish
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            {' '}© 2026. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Mobile Bottom Tab Navigation ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
        style={{
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors duration-150 active:scale-95 ${
                  active ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <span className={`text-[22px] leading-none transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="w-4 h-0.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

export default Layout;
