import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPapers, deletePaperMeta, removeFile, addPaper, updatePaper } from '../utils/storage';
import { formatDate, truncateText } from '../utils/helpers';
import PinDialog from '../components/PinDialog';

/**
 * Admin page for managing exam papers.
 * Requires PIN authentication.
 */
// PUBLIC_INTERFACE
/**
 * Admin dashboard showing all papers with CRUD operations.
 * @returns {JSX.Element}
 */
function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');    // 'all' | 'qp' | 'ak'
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, status: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      setPapers(getPapers());
    }
  }, [authenticated]);

  const handleDelete = async (paperId) => {
    if (!window.confirm('Delete this paper and all associated files?')) return;

    // Remove files from IndexedDB
    await removeFile(paperId, 'paper');
    await removeFile(paperId, 'answer');

    // Remove metadata
    deletePaperMeta(paperId);
    setPapers(getPapers());
  };

  const handleBulkImport = async () => {
    if (!window.confirm('This will load/refresh all 64 Tamil Nadu 12th standard exam papers. Continue?')) return;
    setImporting(true);
    try {
      const res = await fetch('/catalog.json');
      const catalog = await res.json();
      const existing = getPapers();
      const existingIds = new Set(existing.map(p => p.id));
      setImportProgress({ done: 0, total: catalog.length, status: 'Importing...' });
      let added = 0, updated = 0;
      for (let i = 0; i < catalog.length; i++) {
        const p = catalog[i];
        if (existingIds.has(p.id)) {
          updatePaper(p.id, p);
          updated++;
        } else {
          addPaper(p);
          added++;
        }
        setImportProgress({ done: i + 1, total: catalog.length, status: `Processing: ${p.title}` });
      }
      setPapers(getPapers());
      setImportProgress({ done: catalog.length, total: catalog.length, status: `✓ Done! Added ${added}, updated ${updated} papers.` });
    } catch (e) {
      setImportProgress({ done: 0, total: 0, status: '✗ Import failed. Make sure the app is running via vite dev.' });
    } finally {
      setImporting(false);
    }
  };

  const subjects = useMemo(() => [...new Set(papers.map(p => p.subject).filter(Boolean))].sort(), [papers]);
  const years    = useMemo(() => [...new Set(papers.map(p => p.year).filter(Boolean))].sort().reverse(), [papers]);

  // Flat list of every individual answer key file
  const allAkItems = useMemo(() => {
    const items = [];
    for (const paper of papers) {
      const aks = (paper.allAnswerKeys && paper.allAnswerKeys.length > 0)
        ? paper.allAnswerKeys
        : paper.answerKeyUrl
          ? [{ url: paper.answerKeyUrl, filename: paper.answerFileName, label: 'Answer Key' }]
          : [];
      aks.forEach((ak, idx) => {
        items.push({
          _key: `${paper.id}-ak-${idx}`,
          _idx: idx,
          paperId: paper.id,
          paperTitle: paper.title,
          subject: paper.subject,
          year: paper.year,
          label: ak.label,
          filename: ak.filename,
        });
      });
    }
    return items;
  }, [papers]);

  const filteredPapers = useMemo(() => papers.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch  = !term || (p.title||'').toLowerCase().includes(term) || (p.subject||'').toLowerCase().includes(term) || (p.year||'').toString().includes(term);
    const matchSubject = !filterSubject || p.subject === filterSubject;
    const matchYear    = !filterYear    || p.year    === filterYear;
    return matchSearch && matchSubject && matchYear;
  }), [papers, searchTerm, filterSubject, filterYear]);

  const filteredAkItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allAkItems.filter(item => {
      const matchSearch  = !term || (item.paperTitle||'').toLowerCase().includes(term) || (item.subject||'').toLowerCase().includes(term) || (item.label||'').toLowerCase().includes(term) || (item.year||'').includes(term);
      const matchSubject = !filterSubject || item.subject === filterSubject;
      const matchYear    = !filterYear    || item.year    === filterYear;
      return matchSearch && matchSubject && matchYear;
    });
  }, [allAkItems, searchTerm, filterSubject, filterYear]);

  const counts = useMemo(() => ({
    all: papers.length,
    qp:  papers.length,
    ak:  allAkItems.length,
  }), [papers, allAkItems]);

  const displayList  = filterType === 'ak' ? filteredAkItems : filteredPapers;
  const displayTotal = filterType === 'ak' ? allAkItems.length : papers.length;

  if (!authenticated) {
    return (
      <PinDialog
        onSuccess={() => setAuthenticated(true)}
        onCancel={() => navigate('/')}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">🔧 Admin Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleBulkImport}
            disabled={importing}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            📚 Load All Papers
          </button>
          <Link
            to="/admin/add"
            className="px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
          >
            + Add Paper
          </Link>
        </div>
      </div>

      {/* Bulk import progress */}
      {importProgress.total > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">{importProgress.status}</span>
            {importProgress.total > 0 && (
              <span className="text-xs text-blue-600 font-mono">{importProgress.done}/{importProgress.total}</span>
            )}
          </div>
          {importing && (
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-5 overflow-hidden">

        {/* Row 1: Type tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'all', label: 'All Papers',     icon: '📋' },
            { key: 'qp',  label: 'Question Paper', icon: '📄' },
            { key: 'ak',  label: 'Answer Key',     icon: '🔑' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                filterType === tab.key
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filterType === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Row 2: Search + Subject + Year */}
        <div className="flex flex-col sm:flex-row gap-2 p-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search title, subject, year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          {/* Subject */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Year */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* Clear all */}
          {(filterSubject || filterYear || searchTerm) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterSubject(''); setFilterYear(''); }}
              className="px-3 py-2 text-xs font-medium text-error border border-red-200 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* Row 3: Results summary */}
        <div className="px-3 pb-2.5 text-xs text-secondary">
          Showing <span className="font-semibold text-primary">{displayList.length}</span> of {displayTotal}{' '}
          {filterType === 'ak' ? 'answer keys' : 'papers'}
        </div>
      </div>

      {/* ── Answer Key flat list ── */}
      {filterType === 'ak' ? (
        displayList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-secondary">No matching answer keys found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayList.map((item) => (
              <div key={item._key} className="bg-white rounded-lg border p-3 sm:p-4 flex items-center gap-3 hover:shadow-sm transition">
                <div className="w-8 h-8 shrink-0 bg-emerald-50 rounded-lg flex items-center justify-center text-base">🔑</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{item.paperTitle}</p>
                  <h3 className="font-semibold text-primary text-sm truncate">{item.label}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {item.subject && <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">{item.subject}</span>}
                    {item.year && <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">{item.year}</span>}
                  </div>
                </div>
                <Link
                  to={`/answer/${item.paperId}?ak=${item._idx}`}
                  className="shrink-0 px-3 py-1.5 text-sm border border-emerald-200 rounded-md text-success hover:bg-emerald-50 transition"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Papers list (all / qp tabs) ── */
        filteredPapers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-secondary">
              {papers.length === 0 ? 'No papers yet. Add your first paper!' : 'No matching papers found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-sm transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary">{truncateText(paper.title, 60)}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {paper.subject && <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">{paper.subject}</span>}
                    {paper.year && <span className="text-xs bg-gray-100 text-secondary px-2 py-0.5 rounded-full">{paper.year}</span>}
                    {paper.hasAnswerKey ? (
                      <span className="text-xs bg-green-100 text-success px-2 py-0.5 rounded-full font-medium">
                        🔑 {(paper.allAnswerKeys||[]).length > 1 ? `${paper.allAnswerKeys.length} Answer Keys` : 'Answer Key'}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">📄 QP only</span>
                    )}
                    <span className="text-xs text-gray-400">Added {formatDate(paper.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/admin/edit/${paper.id}`} className="px-3 py-1.5 text-sm border rounded-md text-primary hover:bg-gray-50 transition">
                    ✏️ Edit
                  </Link>
                  <button onClick={() => handleDelete(paper.id)} className="px-3 py-1.5 text-sm border border-red-200 rounded-md text-error hover:bg-red-50 transition">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default AdminPage;
