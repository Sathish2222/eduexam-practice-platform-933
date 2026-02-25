import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Main layout component with navigation header, mobile menu, and footer.
 * Provides consistent page structure and responsive navigation.
 */
// PUBLIC_INTERFACE
/**
 * Application layout wrapper with responsive gradient navigation bar and footer.
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
    { to: '/browse', label: 'Papers', icon: '📄' },
    { to: '/admin', label: 'Admin', icon: '🔧' },
    { to: '/history', label: 'History', icon: '📊' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
    { to: '/import-export', label: 'Backup', icon: '💾' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="header-gradient text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg group">
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">📝</span>
              <div className="flex flex-col">
                <span className="hidden sm:inline leading-tight tracking-tight">EduExam Practice</span>
                <span className="sm:hidden leading-tight tracking-tight">EduExam</span>
                <span className="hidden sm:inline text-[10px] font-normal text-gray-300 leading-none">
                  Practice Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                  {/* Active indicator dot */}
                  {isActive(item.to) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden border-t border-white/10 pb-2 animate-slideDown">
            <div className="max-w-7xl mx-auto px-2 pt-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm my-0.5 transition-all duration-150 ${
                    isActive(item.to)
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-gray-400">
            📝 EduExam Practice Platform — All data stored locally on your device
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
