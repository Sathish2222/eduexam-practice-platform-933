import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPaperById, getFile, getAttemptsForPaper } from '../utils/storage';
import { formatDate } from '../utils/helpers';
import FileViewer from '../components/FileViewer';

/**
 * Paper detail view page showing metadata, file preview, and actions.
 * Provides a comprehensive view of a question paper with exam and answer key access.
 */
// PUBLIC_INTERFACE
/**
 * Displays paper details, file preview, and provides actions for exam mode and answer key.
 * @returns {JSX.Element}
 */
function PaperView() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [showViewer, setShowViewer] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaper = async () => {
      const p = getPaperById(paperId);
      if (!p) {
        navigate('/browse');
        return;
      }
      setPaper(p);

      const blob = await getFile(paperId, 'paper');
      setFileBlob(blob);
      setLoading(false);
    };
    loadPaper();
  }, [paperId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-secondary text-sm">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-secondary text-lg">Paper not found.</p>
        <Link to="/browse" className="mt-4 inline-block text-sm text-primary hover:text-success transition">
          ← Browse all papers
        </Link>
      </div>
    );
  }

  const attempts = getAttemptsForPaper(paperId);
  const completedAttempts = attempts.filter(a => a.completed);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link to="/browse" className="hover:text-primary transition-colors duration-150">
          Papers
        </Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-primary font-medium truncate max-w-[250px]">{paper.title}</span>
      </nav>

      {/* Paper Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header bar with gradient accent */}
        <div className="h-1.5 bg-gradient-to-r from-gray-600 via-gray-500 to-emerald-500"></div>

        <div className="p-5 sm:p-7">
          {/* Title and basic info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight mb-3">
                {paper.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {paper.subject && (
                  <span className="tag-pill bg-gray-100 text-secondary">
                    📚 {paper.subject}
                  </span>
                )}
                {paper.year && (
                  <span className="tag-pill bg-gray-100 text-secondary">
                    📅 {paper.year}
                  </span>
                )}
                <span className="tag-pill bg-blue-50 text-blue-600">
                  ⏱ {paper.duration || 180} minutes
                </span>
                {paper.hasAnswerKey && (
                  <span className="tag-pill bg-emerald-50 text-success">
                    ✓ Answer Key
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes section */}
          {paper.notes && (
            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-secondary leading-relaxed">{paper.notes}</p>
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-5">
            <span>
              📁 {paper.paperFileName || 'Question Paper'}
            </span>
            <span>
              Added {formatDate(paper.createdAt)}
            </span>
            {paper.updatedAt !== paper.createdAt && (
              <span>Updated {formatDate(paper.updatedAt)}</span>
            )}
          </div>

          {/* Attempt summary */}
          {attempts.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg shrink-0">
                📊
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} •{' '}
                  {completedAttempts.length} completed
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {completedAttempts.length > 0
                    ? `Last completed ${formatDate(new Date(completedAttempts[completedAttempts.length - 1].endTime).toISOString())}`
                    : 'No completed attempts yet'}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowViewer(!showViewer)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 btn-press ${
                showViewer
                  ? 'bg-gray-100 text-primary border border-gray-200 hover:bg-gray-200'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showViewer ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
              {showViewer ? 'Hide Paper' : 'View Paper'}
            </button>

            <Link
              to={`/exam/${paperId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-medium text-sm shadow-sm btn-press"
            >
              <span>🎯</span>
              Start Exam
            </Link>

            {paper.hasAnswerKey && (
              <Link
                to={`/answer/${paperId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-primary rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm btn-press"
              >
                <span>🔑</span>
                Answer Key
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* File Viewer */}
      {showViewer && (
        <div className="animate-fadeIn">
          <FileViewer
            fileBlob={fileBlob}
            fileType={paper.paperFileType}
            title={paper.paperFileName || 'Question Paper'}
          />
        </div>
      )}
    </div>
  );
}

export default PaperView;
