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
      {/* Navigation Header — modern gradient with glass effect */}
      <header className="header-gradient text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand — modern styling */}
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">📝</span>
              <div className="flex flex-col">
                <span className="hidden sm:inline leading-tight tracking-tight font-extrabold">
                  TN Study Hub
                </span>
                <span className="sm:hidden leading-tight tracking-tight font-extrabold">TN Study Hub</span>
                <span className="hidden sm:inline text-[10px] font-normal text-emerald-300/70 leading-none tracking-wide">
                  Exam Practice Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — pill-style active states */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-250 ${
                    isActive(item.to)
                      ? 'bg-white/15 text-white shadow-sm backdrop-blur-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                  {/* Active indicator — emerald dot */}
                  {isActive(item.to) && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-sm" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button — smooth animation */}
            <button
              className="md:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: menuOpen ? 'rotate(90deg)' : 'none' }}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation — slide-down with modern styling */}
        {menuOpen && (
          <nav className="md:hidden border-t border-white/10 pb-3 animate-slideDown">
            <div className="max-w-7xl mx-auto px-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm my-0.5 transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-white/15 text-white font-semibold backdrop-blur-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive(item.to) && (
                    <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main content — smooth fade-in */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
        {children}
      </main>

      {/* Footer — clean modern style */}
      <footer className="border-t border-gray-100 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col items-center gap-2">
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
