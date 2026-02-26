import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Main layout component with modern navigation header, mobile menu, and footer.
 * Provides consistent page structure and responsive navigation with a fresh, modern feel.
 */
// PUBLIC_INTERFACE
/**
 * Application layout wrapper with modern gradient navigation bar, responsive mobile menu, and footer.
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/browse', label: 'Exam', icon: '🎯' },
    { to: '/history', label: 'History', icon: '📊' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="header-gradient text-white shadow-lg sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <span className="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110">📝</span>
              <div className="flex flex-col leading-none">
                <span className="text-sm sm:text-base font-extrabold tracking-tight">TN Study Hub</span>
                <span className="text-[10px] text-emerald-300/80 font-normal tracking-wide hidden sm:block">Exam Practice Platform</span>
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

            {/* Mobile: bottom tab bar (rendered below) — just show brand on mobile header */}
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 active:scale-95"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 animate-slideDown">
            <nav className="w-full px-3 py-2 grid grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-white/20 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive(item.to) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content — smooth fade-in */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
        {children}
      </main>

      {/* Footer — clean modern style */}
      <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="w-full px-4 sm:px-6 py-5 sm:py-6 flex flex-col items-center gap-2">
          <p className="text-center text-sm sm:text-base text-gray-500 font-medium">
            📝 TN Study Hub — All data stored locally on your device
          </p>
          <p className="text-center text-sm sm:text-base text-gray-500">
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
    </div>
  );
}

export default Layout;
