import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Main layout component with navigation header and mobile menu.
 */
// PUBLIC_INTERFACE
/**
 * Application layout wrapper with responsive navigation bar.
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <span>📝</span>
              <span className="hidden sm:inline">EduExam Practice</span>
              <span className="sm:hidden">EduExam</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.to)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <nav className="md:hidden border-t border-white/20 pb-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 text-sm ${
                  isActive(item.to)
                    ? 'bg-white/20 text-white'
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
