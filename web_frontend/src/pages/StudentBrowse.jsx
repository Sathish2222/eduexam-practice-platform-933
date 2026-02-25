import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPapers, getAttemptsForPaper } from '../utils/storage';
import { truncateText } from '../utils/helpers';

/**
 * Student browse page for searching, filtering, and selecting papers.
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">📄 Browse Papers</h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search papers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {(filterSubject || filterYear || searchTerm) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); }}
              className="px-3 py-2 text-sm text-error hover:bg-red-50 rounded-lg transition"
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-secondary mb-4">
        Showing {filteredPapers.length} of {allPapers.length} papers
      </p>

      {/* Papers Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-secondary">
            {allPapers.length === 0
              ? 'No papers available. Ask your admin to add some!'
              : 'No papers match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const attempts = getAttemptsForPaper(paper.id);
            return (
              <Link
                key={paper.id}
                to={`/paper/${paper.id}`}
                className="bg-white rounded-xl border p-5 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary group-hover:text-success transition text-sm leading-tight">
                    {truncateText(paper.title, 50)}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {paper.subject && (
                    <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">
                      {paper.subject}
                    </span>
                  )}
                  {paper.year && (
                    <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">
                      {paper.year}
                    </span>
                  )}
                  {paper.hasAnswerKey && (
                    <span className="text-xs bg-green-100 text-success px-2 py-0.5 rounded-full">
                      ✓ Key
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>⏱ {paper.duration || 180} min</span>
                  <span>{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}</span>
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
