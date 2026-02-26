import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttemptsForPaper } from '../utils/storage';
import { truncateText } from '../utils/helpers';

// PUBLIC_INTERFACE
function StudentBrowse() {
  const allPapers = getPapers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'qp' | 'ak'
  const [showFilters, setShowFilters] = useState(false);

  const subjects = useMemo(() => {
    const set = new Set(allPapers.map(p => p.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [allPapers]);

  const years = useMemo(() => {
    const set = new Set(allPapers.map(p => p.year).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [allPapers]);

  // Flat list of every individual answer key file across all papers
  const allAkItems = useMemo(() => {
    const items = [];
    for (const paper of allPapers) {
      const aks = (paper.allAnswerKeys && paper.allAnswerKeys.length > 0)
        ? paper.allAnswerKeys
        : paper.answerKeyUrl
          ? [{ url: paper.answerKeyUrl, filename: paper.answerFileName, label: 'Answer Key', fileType: paper.answerFileType }]
          : [];
      aks.forEach((ak, idx) => {
        items.push({
          _key: `${paper.id}-ak-${idx}`,
          _idx: idx,
          paperId: paper.id,
          title: paper.title,
          subject: paper.subject,
          year: paper.year,
          label: ak.label,
          filename: ak.filename,
        });
      });
    }
    return items;
  }, [allPapers]);

  const counts = useMemo(() => ({
    all: allPapers.length,
    qp:  allPapers.length,
    ak:  allAkItems.length,
  }), [allPapers, allAkItems]);

  // Filtered paper list (used for 'all' and 'qp' tabs)
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

  // Filtered AK items list (used for 'ak' tab)
  const filteredAkItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allAkItems.filter(item => {
      const matchesSearch =
        !term ||
        (item.title || '').toLowerCase().includes(term) ||
        (item.subject || '').toLowerCase().includes(term) ||
        (item.label || '').toLowerCase().includes(term) ||
        (item.year || '').includes(term);
      const matchesSubject = !filterSubject || item.subject === filterSubject;
      const matchesYear = !filterYear || item.year === filterYear;
      return matchesSearch && matchesSubject && matchesYear;
    });
  }, [allAkItems, searchTerm, filterSubject, filterYear]);

  const displayList  = filterType === 'ak' ? filteredAkItems : filteredPapers;
  const displayTotal = filterType === 'ak' ? allAkItems.length : allPapers.length;

  const hasActiveFilters = filterSubject || filterYear || searchTerm || filterType !== 'all';
  const activeFilterCount = [filterSubject, filterYear, searchTerm, filterType !== 'all' ? filterType : ''].filter(Boolean).length;

  return (
    <div className="has-mobile-bottom-bar">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight truncate">
            Browse Papers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
            Find and practice with available question papers
          </p>
        </div>
        <span className="shrink-0 ml-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          {allPapers.length} paper{allPapers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + Filter Panel */}
      <div className="mb-3 sm:mb-5">
        {/* Tab Navigation */}
        <div className="flex gap-1.5 sm:gap-2 mb-3">
          {[
            { key: 'all', label: 'All Papers',     icon: '📋' },
            { key: 'qp',  label: 'Question Paper', icon: '📄' },
            { key: 'ak',  label: 'Answer Key',     icon: '🔑' },
          ].map(tab => {
            const isActive = filterType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm'
                }`}
              >
                <span className="text-sm sm:text-base leading-none">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={filterType === 'ak' ? 'Search answer keys...' : 'Search papers...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 py-1.5 sm:py-2 text-sm bg-transparent border-none outline-none placeholder:text-gray-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-gray-400 hover:text-gray-600 shrink-0" aria-label="Clear search">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
              showFilters || hasActiveFilters ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="Toggle filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-success text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable dropdowns */}
        {showFilters && (
          <div className="border-t border-gray-100 px-2.5 sm:px-4 py-2.5 sm:py-3 animate-slideDown">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white cursor-pointer"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); setFilterType('all'); }}
                  className="text-xs text-error hover:underline font-medium self-end sm:self-center py-1 px-1"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-0.5">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              &ldquo;{truncateText(searchTerm, 16)}&rdquo;
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
          {filterSubject && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              {filterSubject}
              <button onClick={() => setFilterSubject('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
          {filterYear && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-2.5 py-0.5">
              {filterYear}
              <button onClick={() => setFilterYear('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results summary */}
      {hasActiveFilters && (
        <p className="text-xs text-secondary mb-2 sm:mb-3 px-0.5">
          Showing <span className="font-semibold text-primary">{displayList.length}</span> of {displayTotal}{' '}
          {filterType === 'ak' ? 'answer keys' : 'papers'}
        </p>
      )}

      {/* ── Answer Key flat list ── */}
      {filterType === 'ak' ? (
        displayList.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-secondary text-sm font-medium">No answer keys match your search</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayList.map((item) => (
              <Link
                key={item._key}
                to={`/answer/${item.paperId}?ak=${item._idx}`}
                className="group flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 active:scale-[0.99]"
              >
                <div className="w-8 h-8 shrink-0 bg-emerald-50 rounded-lg flex items-center justify-center text-base">
                  🔑
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{item.title}</p>
                  <h3 className="font-semibold text-primary group-hover:text-success transition-colors text-sm leading-snug truncate">
                    {item.label}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {item.subject && (
                      <span className="text-[11px] font-medium text-secondary bg-gray-100 rounded-full px-2 py-0.5">
                        {item.subject}
                      </span>
                    )}
                    {item.year && (
                      <span className="text-[11px] font-medium text-secondary bg-gray-100 rounded-full px-2 py-0.5">
                        {item.year}
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-success shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* ── Paper grid (all / qp tabs) ── */
        filteredPapers.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">
              {allPapers.length === 0 ? '📭' : '🔍'}
            </div>
            <p className="text-secondary text-sm sm:text-base font-medium mb-1">
              {allPapers.length === 0 ? 'No papers available yet' : 'No papers match your search'}
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
                <div
                  key={paper.id}
                  className="group flex items-center gap-3 sm:flex-col sm:items-stretch bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 card-hover transition-all duration-150"
                >
                  {/* Title + tags — clicking navigates to paper detail */}
                  <Link to={`/paper/${paper.id}`} className="flex-1 min-w-0 sm:mb-3 block">
                    <h3 className="font-semibold text-primary group-hover:text-success transition-colors duration-200 text-base sm:text-sm leading-snug truncate sm:whitespace-normal sm:line-clamp-2">
                      {truncateText(paper.title, 60)}
                    </h3>
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
                  </Link>

                  {/* Mobile: action buttons on the right */}
                  <div className="shrink-0 flex sm:hidden flex-col gap-1.5">
                    <Link
                      to={`/study/${paper.id}`}
                      className="group flex items-center gap-1.5 px-2.5 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-all"
                    >
                      <span>📖</span>
                      <span>Study</span>
                      <svg className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </Link>
                    <Link
                      to={`/paper/${paper.id}`}
                      className="group flex items-center gap-1.5 px-2.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-all"
                    >
                      <span>🎯</span>
                      <span>Exam</span>
                      <svg className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  </div>

                  {/* Desktop: footer with time + action buttons */}
                  <div className="hidden sm:flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {paper.duration || 180} min
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/study/${paper.id}`}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all"
                      >
                        📖 Study
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                      </Link>
                      <Link
                        to={`/paper/${paper.id}`}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-all"
                      >
                        🎯 Exam
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Mobile bottom bar */}
      <div className="mobile-bottom-bar">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 mobile-touch-target ${
              showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-primary hover:bg-gray-200'
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
          <span className="text-xs text-secondary">
            {displayList.length}/{displayTotal} {filterType === 'ak' ? 'keys' : 'papers'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); setFilterType('all'); setShowFilters(false); }}
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
