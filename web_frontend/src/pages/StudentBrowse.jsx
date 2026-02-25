import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttemptsForPaper } from '../utils/storage';
import { truncateText } from '../utils/helpers';

/**
 * Student browse page for searching, filtering, and selecting papers.
 * Displays papers in a responsive grid with filter controls.
 * Optimized for one-hand mobile use with bottom-reachable controls.
 * Enhanced mobile-responsive layout with clean, polished UI.
 */
// PUBLIC_INTERFACE
/**
 * Searchable paper list for students with filtering by subject and year.
 * Features mobile-optimized layout with bottom-reachable actions and larger touch targets.
 * @returns {JSX.Element}
 */
function StudentBrowse() {
  const allPapers = getPapers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Unique subjects and years for filter dropdowns
  const subjects = useMemo(() => {
    const set = new Set(allPapers.map(p => p.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [allPapers]);

  const years = useMemo(() => {
    const set = new Set(allPapers.map(p => p.year).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [allPapers]);

  const filteredPapers = useMemo(() => {
    return allPapers.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (p.title || '').toLowerCase().includes(term) ||
        (p.subject || '').toLowerCase().includes(term) ||
        (p.notes || '').toLowerCase().includes(term);
      const matchesSubject = !filterSubject || p.subject === filterSubject;
      const matchesYear = !filterYear || p.year === filterYear;
      return matchesSearch && matchesSubject && matchesYear;
    });
  }, [allPapers, searchTerm, filterSubject, filterYear]);

  const hasActiveFilters = filterSubject || filterYear || searchTerm;
  const activeFilterCount = [filterSubject, filterYear, searchTerm].filter(Boolean).length;

  return (
    <div className="has-mobile-bottom-bar">
      {/* Page Header — compact on mobile */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">
          📄 Browse Papers
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Find and practice with available question papers
        </p>
      </div>

      {/* Search & Filters — responsive card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-6">
        {/* Search input — always visible */}
        <div className="relative mb-2 sm:mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, subject, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter row — visible on desktop always, on mobile when toggled */}
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5`}>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer w-full sm:w-auto sm:flex-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer w-full sm:w-auto sm:flex-none"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); }}
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 sm:py-2 text-sm text-error hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-150 mobile-touch-target"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-0.5">
        <p className="text-xs sm:text-sm text-secondary">
          {hasActiveFilters ? (
            <>
              <span className="font-semibold text-primary">{filteredPapers.length}</span> of {allPapers.length} papers
            </>
          ) : (
            <>
              <span className="font-semibold text-primary">{allPapers.length}</span> paper{allPapers.length !== 1 ? 's' : ''} available
            </>
          )}
        </p>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl border border-gray-200">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
            {allPapers.length === 0 ? '📭' : '🔍'}
          </div>
          <p className="text-secondary text-base sm:text-lg font-medium mb-1.5 sm:mb-2">
            {allPapers.length === 0
              ? 'No papers available yet'
              : 'No papers match your search'}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm px-6">
            {allPapers.length === 0
              ? 'Ask your admin to upload some question papers to get started.'
              : 'Try adjusting your search terms or clearing filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredPapers.map((paper) => {
            const attempts = getAttemptsForPaper(paper.id);
            const completedCount = attempts.filter(a => a.completed).length;
            return (
              <Link
                key={paper.id}
                to={`/paper/${paper.id}`}
                className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3.5 sm:p-5 card-hover block mobile-touch-target active:scale-[0.98] transition-all duration-150"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                  <h3 className="font-semibold text-primary group-hover:text-success transition-colors duration-200 text-sm leading-snug flex-1 mr-2">
                    {truncateText(paper.title, 55)}
                  </h3>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-success shrink-0 mt-0.5 transition-all duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Tags — responsive wrapping */}
                <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                  {paper.subject && (
                    <span className="tag-pill bg-gray-100 text-secondary text-[11px]">
                      {paper.subject}
                    </span>
                  )}
                  {paper.year && (
                    <span className="tag-pill bg-gray-100 text-secondary text-[11px]">
                      {paper.year}
                    </span>
                  )}
                  {paper.hasAnswerKey && (
                    <span className="tag-pill bg-emerald-50 text-success text-[11px]">
                      ✓ Key
                    </span>
                  )}
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {paper.duration || 180} min
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${
                    completedCount > 0 ? 'text-success' : 'text-gray-400'
                  }`}>
                    {completedCount > 0 ? '✓' : '○'} {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile bottom bar — filter toggle and quick actions */}
      <div className="mobile-bottom-bar">
        <div className="flex items-center justify-between gap-3">
          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-press mobile-touch-target relative ${
              showFilters
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-primary'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-success text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Results count — compact */}
          <span className="text-xs text-secondary font-medium">
            {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}
          </span>

          {/* Clear filters — only when active */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); setShowFilters(false); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-error bg-red-50 hover:bg-red-100 transition-all duration-200 btn-press mobile-touch-target"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentBrowse;
