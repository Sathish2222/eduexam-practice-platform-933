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
                  EduExam Practice
                </span>
                <span className="sm:hidden leading-tight tracking-tight font-extrabold">EduExam</span>
                <span className="hidden sm:inline text-[10px] font-normal text-emerald-300/70 leading-none tracking-wide">
                  Practice Platform
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-gray-400 font-medium">
            📝 EduExam Practice Platform — All data stored locally on your device
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
