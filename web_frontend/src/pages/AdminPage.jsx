import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPapers, deletePaperMeta, removeFile } from '../utils/storage';
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

  const filteredPapers = papers.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(term) ||
      (p.subject || '').toLowerCase().includes(term) ||
      (p.year || '').toString().includes(term)
    );
  });

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
        <Link
          to="/admin/add"
          className="px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
        >
          + Add Paper
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search papers by title, subject, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />
      </div>

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
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
                      ✓ Answer Key
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Added {formatDate(paper.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/admin/edit/${paper.id}`}
                  className="px-3 py-1.5 text-sm border rounded-md text-primary hover:bg-gray-50 transition"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(paper.id)}
                  className="px-3 py-1.5 text-sm border border-red-200 rounded-md text-error hover:bg-red-50 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
