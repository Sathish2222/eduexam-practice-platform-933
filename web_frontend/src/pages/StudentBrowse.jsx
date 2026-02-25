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
      {/* Page Header — compact & clean on mobile */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary leading-tight truncate">
            Browse Papers
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-0.5 hidden sm:block">
            Find and practice with available question papers
          </p>
        </div>
        {/* Paper count badge — always visible, compact */}
        <span className="shrink-0 ml-2 text-xs sm:text-xs font-medium text-secondary bg-gray-100 rounded-full px-2.5 py-1">
          {allPapers.length} paper{allPapers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + Inline Filter Toggle — compact single-row on mobile */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm mb-3 sm:mb-5 overflow-hidden">
        {/* Search row with integrated filter button */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-3">
          {/* Search icon */}
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {/* Search input — flexible width */}
          <input
            type="text"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 py-1.5 sm:py-2 text-sm bg-transparent border-none outline-none placeholder:text-gray-400"
          />
          {/* Clear search — inline */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* Filter toggle — always visible, compact */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative shrink-0 p-2 rounded-lg transition-colors duration-150 ${
              showFilters || hasActiveFilters
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Toggle filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {/* Active filter count badge */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-success text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter dropdowns — expandable section */}
        {showFilters && (
          <div className="border-t border-gray-100 px-2.5 sm:px-4 py-2.5 sm:py-3 animate-slideDown">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer"
              >
                <option value="">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {/* Clear filters link */}
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); }}
                  className="text-xs text-error hover:underline font-medium self-end sm:self-center py-1 px-1"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips — visible when filters applied & panel closed */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-0.5">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              &ldquo;{truncateText(searchTerm, 16)}&rdquo;
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600" aria-label="Remove search filter">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
          {filterSubject && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              {filterSubject}
              <button onClick={() => setFilterSubject('')} className="text-gray-400 hover:text-gray-600" aria-label="Remove subject filter">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
          {filterYear && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              {filterYear}
              <button onClick={() => setFilterYear('')} className="text-gray-400 hover:text-gray-600" aria-label="Remove year filter">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results summary — only shown when filtering */}
      {hasActiveFilters && (
        <p className="text-xs sm:text-xs text-secondary mb-2 sm:mb-3 px-0.5">
          Showing <span className="font-semibold text-primary">{filteredPapers.length}</span> of {allPapers.length} papers
        </p>
      )}

      {/* Papers List / Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-10 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200">
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">
            {allPapers.length === 0 ? '📭' : '🔍'}
          </div>
          <p className="text-secondary text-sm sm:text-base font-medium mb-1">
            {allPapers.length === 0
              ? 'No papers available yet'
              : 'No papers match your search'}
          </p>
          <p className="text-gray-400 text-[11px] sm:text-xs px-8 max-w-xs mx-auto">
            {allPapers.length === 0
              ? 'Ask your admin to upload question papers to get started.'
              : 'Try adjusting your search or clearing filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 lg:gap-4">
          {filteredPapers.map((paper) => {
            const attempts = getAttemptsForPaper(paper.id);
            const completedCount = attempts.filter(a => a.completed).length;
            return (
              <Link
                key={paper.id}
                to={`/paper/${paper.id}`}
                className="group flex items-center gap-3 sm:block bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 card-hover active:scale-[0.98] transition-all duration-150"
              >
                {/* Mobile: single-row layout | Desktop: stacked card */}
                {/* Left section: title + meta */}
                <div className="flex-1 min-w-0 sm:mb-3">
                  <h3 className="font-semibold text-primary group-hover:text-success transition-colors duration-200 text-base sm:text-sm leading-snug truncate sm:whitespace-normal sm:line-clamp-2">
                    {truncateText(paper.title, 60)}
                  </h3>
                  {/* Tags row — bigger on mobile for readability */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 sm:mt-2">
                    {paper.subject && (
                      <span className="text-xs sm:text-[11px] font-medium text-secondary bg-gray-100 rounded-full px-2.5 py-0.5">
                        {paper.subject}
                      </span>
                    )}
                    {paper.year && (
                      <span className="text-xs sm:text-[11px] font-medium text-secondary bg-gray-100 rounded-full px-2.5 py-0.5">
                        {paper.year}
                      </span>
                    )}
                    {paper.hasAnswerKey && (
                      <span className="text-xs sm:text-[11px] font-medium text-success bg-emerald-50 rounded-full px-2.5 py-0.5">
                        ✓ Key
                      </span>
                    )}
                  </div>
                </div>

                {/* Right section: meta + arrow (mobile) | Footer (desktop) */}
                <div className="shrink-0 flex sm:hidden flex-col items-end gap-1">
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-success transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs text-gray-400">
                    {paper.duration || 180}m
                  </span>
                </div>

                {/* Desktop footer with duration + attempts */}
                <div className="hidden sm:flex items-center justify-between pt-3 border-t border-gray-100">
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

      {/* Mobile bottom bar — slim filter toggle and results */}
      <div className="mobile-bottom-bar">
        <div className="flex items-center justify-between gap-2">
          {/* Filter toggle — compact pill */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 mobile-touch-target ${
              showFilters
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-primary hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-success text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Results count */}
          <span className="text-xs text-secondary">
            {filteredPapers.length}/{allPapers.length} papers
          </span>

          {/* Clear all — only when filters active */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); setShowFilters(false); }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-error bg-red-50 hover:bg-red-100 transition-all duration-150 mobile-touch-target"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
