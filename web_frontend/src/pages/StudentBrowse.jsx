import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttemptsForPaper } from '../utils/storage';
import { truncateText } from '../utils/helpers';

/**
 * Student browse page for searching, filtering, and selecting papers.
 * Displays papers in a responsive grid with filter controls.
 */
// PUBLIC_INTERFACE
/**
 * Searchable paper list for students with filtering by subject and year.
 * @returns {JSX.Element}
 */
function StudentBrowse() {
  const allPapers = getPapers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');

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

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">📄 Browse Papers</h1>
        <p className="text-sm text-secondary">
          Find and practice with available question papers
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
        {/* Search input */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, subject, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all duration-200"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); }}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-error hover:bg-red-50 rounded-xl transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-secondary">
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
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">
            {allPapers.length === 0 ? '📭' : '🔍'}
          </div>
          <p className="text-secondary text-lg font-medium mb-2">
            {allPapers.length === 0
              ? 'No papers available yet'
              : 'No papers match your search'}
          </p>
          <p className="text-gray-400 text-sm">
            {allPapers.length === 0
              ? 'Ask your admin to upload some question papers to get started.'
              : 'Try adjusting your search terms or clearing filters.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const attempts = getAttemptsForPaper(paper.id);
            const completedCount = attempts.filter(a => a.completed).length;
            return (
              <Link
                key={paper.id}
                to={`/paper/${paper.id}`}
                className="group bg-white rounded-2xl border border-gray-200 p-5 card-hover block"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-primary group-hover:text-success transition-colors duration-200 text-sm leading-snug flex-1 mr-2">
                    {truncateText(paper.title, 55)}
                  </h3>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-success shrink-0 mt-0.5 transition-all duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
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
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
    </div>
  );
}

export default StudentBrowse;
