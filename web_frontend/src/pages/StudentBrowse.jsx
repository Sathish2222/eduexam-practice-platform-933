import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttemptsForPaper } from '../utils/storage';

// Subject → colour map for accent bars
const SUBJECT_COLOR = {
  Tamil:         { bar: 'from-red-400 to-orange-400',    badge: 'bg-red-50 text-red-700'     },
  English:       { bar: 'from-blue-400 to-sky-400',      badge: 'bg-blue-50 text-blue-700'   },
  Mathematics:   { bar: 'from-purple-400 to-violet-400', badge: 'bg-purple-50 text-purple-700'},
  Science:       { bar: 'from-green-400 to-emerald-400', badge: 'bg-emerald-50 text-emerald-700'},
  'Social Science':{ bar: 'from-amber-400 to-yellow-400', badge: 'bg-amber-50 text-amber-700' },
};
const DEFAULT_COLOR = { bar: 'from-gray-300 to-gray-400', badge: 'bg-gray-100 text-gray-600' };

function SubjectColor(subject) {
  return SUBJECT_COLOR[subject] || DEFAULT_COLOR;
}

// PUBLIC_INTERFACE
function StudentBrowse() {
  const [allPapers, setAllPapers]     = useState(() => getPapers());
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterClass, setFilterClass] = useState(() => localStorage.getItem('tn_selected_class') || '');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear]   = useState('');
  const [filterType, setFilterType]   = useState('all'); // 'all' | 'qp' | 'ak'
  const [showFilters, setShowFilters] = useState(false);

  // Re-read papers when catalog finishes syncing
  useEffect(() => {
    const handler = () => setAllPapers(getPapers());
    window.addEventListener('catalogSynced', handler);
    return () => window.removeEventListener('catalogSynced', handler);
  }, []);

  const classes = useMemo(() => {
    const set = new Set(allPapers.map(p => p.class).filter(Boolean));
    return Array.from(set).sort();
  }, [allPapers]);

  const classFilteredPapers = useMemo(() => (
    filterClass ? allPapers.filter(p => p.class === filterClass) : allPapers
  ), [allPapers, filterClass]);

  const subjects = useMemo(() => {
    const set = new Set(classFilteredPapers.map(p => p.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [classFilteredPapers]);

  const years = useMemo(() => {
    const set = new Set(classFilteredPapers.map(p => p.year).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [classFilteredPapers]);

  const allAkItems = useMemo(() => {
    const items = [];
    for (const paper of classFilteredPapers) {
      const aks = (paper.allAnswerKeys?.length > 0)
        ? paper.allAnswerKeys
        : paper.answerKeyUrl
          ? [{ url: paper.answerKeyUrl, filename: paper.answerFileName, label: 'Answer Key', fileType: paper.answerFileType }]
          : [];
      aks.forEach((ak, idx) => items.push({
        _key: `${paper.id}-ak-${idx}`, _idx: idx,
        paperId: paper.id, title: paper.title,
        subject: paper.subject, year: paper.year, class: paper.class,
        label: ak.label, filename: ak.filename,
      }));
    }
    return items;
  }, [classFilteredPapers]);

  const counts = useMemo(() => ({
    all: classFilteredPapers.length,
    qp:  classFilteredPapers.length,
    ak:  allAkItems.length,
  }), [classFilteredPapers, allAkItems]);

  const filteredPapers = useMemo(() => classFilteredPapers.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (p.title || '').toLowerCase().includes(term) ||
      (p.subject || '').toLowerCase().includes(term);
    return matchesSearch &&
      (!filterSubject || p.subject === filterSubject) &&
      (!filterYear || p.year === filterYear);
  }), [classFilteredPapers, searchTerm, filterSubject, filterYear]);

  const filteredAkItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allAkItems.filter(item => {
      const matchesSearch = !term ||
        (item.title || '').toLowerCase().includes(term) ||
        (item.subject || '').toLowerCase().includes(term) ||
        (item.label || '').toLowerCase().includes(term);
      return matchesSearch &&
        (!filterSubject || item.subject === filterSubject) &&
        (!filterYear || item.year === filterYear);
    });
  }, [allAkItems, searchTerm, filterSubject, filterYear]);

  const displayList  = filterType === 'ak' ? filteredAkItems : filteredPapers;
  const displayTotal = filterType === 'ak' ? allAkItems.length : classFilteredPapers.length;
  const hasActiveFilters = filterClass || filterSubject || filterYear || searchTerm || filterType !== 'all';
  const activeFilterCount = [filterClass, filterSubject, filterYear, searchTerm, filterType !== 'all' ? filterType : ''].filter(Boolean).length;

  const clearAll = () => {
    setSearchTerm(''); setFilterClass(''); setFilterSubject('');
    setFilterYear(''); setFilterType('all'); setShowFilters(false);
  };

  // ── Tabs config ────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'all', label: 'All',     fullLabel: 'All Papers',     icon: '📋' },
    { key: 'qp',  label: 'Papers',  fullLabel: 'Question Papers', icon: '📄' },
    { key: 'ak',  label: 'Keys',    fullLabel: 'Answer Keys',     icon: '🔑' },
  ];

  return (
    <div>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            Browse Papers
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
            Find and practice with available question papers
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          {displayTotal} {filterType === 'ak' ? 'keys' : 'papers'}
        </span>
      </div>

      {/* ── Class Filter Pills ── */}
      {classes.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {['', ...classes].map(cls => (
            <button
              key={cls || 'all'}
              onClick={() => { setFilterClass(cls); setFilterSubject(''); setFilterYear(''); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-150 active:scale-[0.96] ${
                filterClass === cls
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
              }`}
            >
              {cls ? `Class ${cls}` : 'All Classes'}
            </button>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-3">
        {tabs.map(tab => {
          const active = filterType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 active:scale-[0.97] ${
                active
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.fullLabel}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-0.5 ${
                active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-3 sm:mb-4 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder={filterType === 'ak' ? 'Search answer keys…' : 'Search papers…'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0 py-1.5 text-sm bg-transparent border-none outline-none placeholder:text-gray-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors duration-150 ${
              showFilters || (filterSubject || filterYear)
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Filter
            {(filterSubject || filterYear) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {[filterSubject, filterYear].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Dropdowns */}
        {showFilters && (
          <div className="border-t border-gray-100 px-3 py-3 flex flex-col sm:flex-row gap-2 animate-slideDown">
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none bg-white"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {filterClass && (
            <FilterChip label={`Class ${filterClass}`} onRemove={() => { setFilterClass(''); setFilterSubject(''); setFilterYear(''); }} dark />
          )}
          {filterSubject && <FilterChip label={filterSubject} onRemove={() => setFilterSubject('')} />}
          {filterYear && <FilterChip label={filterYear} onRemove={() => setFilterYear('')} />}
          {searchTerm && <FilterChip label={`"${searchTerm}"`} onRemove={() => setSearchTerm('')} />}
          <span className="text-xs text-gray-400 ml-1">
            {displayList.length} of {displayTotal}
          </span>
        </div>
      )}

      {/* ── Answer Key List ── */}
      {filterType === 'ak' ? (
        displayList.length === 0 ? (
          <EmptyState icon="🔍" title="No answer keys match" sub="Try adjusting filters." />
        ) : (
          <div className="space-y-2">
            {displayList.map(item => {
              const sc = SubjectColor(item.subject);
              return (
                <Link
                  key={item._key}
                  to={`/answer/${item.paperId}?ak=${item._idx}`}
                  className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 active:scale-[0.99] overflow-hidden relative"
                >
                  {/* left accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${sc.bar} rounded-l-2xl`} />
                  <div className="ml-1 w-9 h-9 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-lg">
                    🔑
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 truncate mb-0.5">{item.title}</p>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug truncate group-hover:text-emerald-700 transition-colors">
                      {item.label}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.subject && (
                        <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${sc.badge}`}>
                          {item.subject}
                        </span>
                      )}
                      {item.year && (
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                          {item.year}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        /* ── Paper Grid ── */
        filteredPapers.length === 0 ? (
          <EmptyState
            icon={allPapers.length === 0 ? '📭' : '🔍'}
            title={allPapers.length === 0 ? 'No papers available yet' : 'No papers match'}
            sub={allPapers.length === 0 ? 'Papers will appear here once added.' : 'Try adjusting your search or filters.'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredPapers.map(paper => {
              const sc = SubjectColor(paper.subject);
              const attempts = getAttemptsForPaper(paper.id);
              const completedCount = attempts.filter(a => a.completed).length;
              return (
                <div
                  key={paper.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  {/* Colour accent bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${sc.bar}`} />

                  <div className="p-4">
                    {/* Header row: class badge + year */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {paper.class && (
                          <span className="text-[10px] font-black uppercase tracking-wide bg-gray-900 text-white rounded-md px-1.5 py-0.5">
                            {paper.class}
                          </span>
                        )}
                        {paper.hasAnswerKey && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                            ✓ Key
                          </span>
                        )}
                        {completedCount > 0 && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {paper.year}
                      </span>
                    </div>

                    {/* Title — clickable, full text */}
                    <Link to={`/paper/${paper.id}`} className="block mb-2.5">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors duration-150">
                        {paper.title}
                      </h3>
                    </Link>

                    {/* Subject tag */}
                    {paper.subject && (
                      <span className={`inline-flex text-[11px] font-bold rounded-full px-2.5 py-1 ${sc.badge}`}>
                        {paper.subject}
                      </span>
                    )}

                    {/* Footer: time + action buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {paper.duration || 180}m
                      </span>
                      <Link
                        to={`/study/${paper.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors active:scale-[0.97]"
                      >
                        📖 Study
                      </Link>
                      <Link
                        to={`/paper/${paper.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors active:scale-[0.97]"
                      >
                        🎯 Exam
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ── Tiny helpers ───────────────────────────────────────────────────────────

function FilterChip({ label, onRemove, dark }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
      dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
    }`}>
      {label}
      <button onClick={onRemove} className="opacity-70 hover:opacity-100">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </span>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center px-6">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-bold text-gray-700 text-base mb-1">{title}</p>
      <p className="text-gray-400 text-sm">{sub}</p>
    </div>
  );
}

export default StudentBrowse;
