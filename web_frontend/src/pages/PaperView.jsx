import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPaperById, getFile, getAttemptsForPaper } from '../utils/storage';
import { formatDate, isValidPdfBlob } from '../utils/helpers';
import FileViewer from '../components/FileViewer';
import StudentNameDialog from '../components/StudentNameDialog';

/**
 * Paper detail view page showing metadata, file preview, and actions.
 * Provides a comprehensive view of a question paper with exam and answer key access.
 * Paper info is collapsible (hidden by default) to reduce clutter.
 * Attempt history is NOT shown here — it lives in the History tab.
 * Requires student name entry before navigating to exam mode.
 * Optimized for one-hand mobile use with bottom action bar.
 * Start Exam button is prominent at the top on mobile for easy access.
 */
// PUBLIC_INTERFACE
/**
 * Displays paper details, file preview, and provides actions for exam mode and answer key.
 * Paper metadata is hidden by default behind a toggle for cleaner student view.
 * Features mobile-friendly bottom action bar and student name prompt before exam start.
 * Start Exam button appears at the top on mobile for quick access.
 * @returns {JSX.Element}
 */
function PaperView() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [showViewer, setShowViewer] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);

  useEffect(() => {
    const loadPaper = async () => {
      const p = getPaperById(paperId);
      if (!p) {
        navigate('/browse');
        return;
      }
      setPaper(p);

      // URL-first: if a static URL exists, always fetch fresh (avoids stale/broken IndexedDB blobs).
      // Fall back to IndexedDB only for manually-uploaded files that have no URL.
      let blob = null;
      if (p.paperUrl) {
        try {
          const res = await fetch(p.paperUrl, { cache: 'no-cache' });
          if (res.ok) blob = await res.blob();
          else console.warn('Could not fetch paper from URL: HTTP', res.status);
        } catch (e) {
          console.warn('Could not fetch paper from URL:', e);
        }
      }
      if (!blob) {
        const stored = await getFile(paperId, 'paper');
        if (stored && await isValidPdfBlob(stored)) blob = stored;
      }
      setFileBlob(blob);
      setLoading(false);
    };
    loadPaper();
  }, [paperId, navigate]);

  /**
   * Handler when "Start Exam" is clicked — opens name dialog
   */
  const handleStartExamClick = () => {
    setShowNameDialog(true);
  };

  /**
   * Handler when student confirms their name — navigate to exam
   * @param {string} studentName - The confirmed student name
   */
  const handleNameConfirm = (studentName) => {
    setShowNameDialog(false);
    // Navigate to exam mode — the name is saved in localStorage by the dialog
    navigate(`/exam/${paperId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-secondary text-sm sm:text-base">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-secondary text-base sm:text-lg">Paper not found.</p>
        <Link to="/browse" className="mt-4 inline-block text-sm sm:text-base text-primary hover:text-success transition">
          ← Browse all papers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto has-mobile-bottom-bar">
      {/* Student Name Dialog — shown before starting exam */}
      <StudentNameDialog
        open={showNameDialog}
        onConfirm={handleNameConfirm}
        onCancel={() => setShowNameDialog(false)}
        paperTitle={paper.title}
      />

      {/* Breadcrumb navigation — compact on mobile */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-5">
        <Link to="/browse" className="hover:text-primary transition-colors duration-150">
          Papers
        </Link>
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-primary font-medium truncate max-w-[200px] sm:max-w-[250px]">{paper.title}</span>
      </nav>

      {/* Mobile-only: Top Start Exam button — visible & prominent for easy access */}
      <div className="md:hidden mb-3 flex gap-2">
        <button
          onClick={handleStartExamClick}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-bold text-base shadow-md btn-press mobile-touch-target"
        >
          <span>🎯</span>
          Start Exam
        </button>
        <Link
          to={`/study/${paperId}`}
          className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-bold text-base shadow-sm btn-press mobile-touch-target"
        >
          <span>📖</span>
          Study
        </Link>
      </div>

      {/* Compact Paper Header — always visible */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-3 sm:mb-4">
        {/* Header bar with gradient accent */}
        <div className="h-1 sm:h-1.5 bg-gradient-to-r from-gray-600 via-gray-500 to-emerald-500"></div>

        <div className="p-3.5 sm:p-5">
          {/* Title and essential tags */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-primary leading-tight mb-1.5 sm:mb-2">
                {paper.title}
              </h1>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {paper.subject && (
                  <span className="tag-pill bg-gray-100 text-secondary text-xs sm:text-xs">
                    📚 {paper.subject}
                  </span>
                )}
                {paper.year && (
                  <span className="tag-pill bg-gray-100 text-secondary text-xs sm:text-xs">
                    📅 {paper.year}
                  </span>
                )}
                <span className="tag-pill bg-blue-50 text-blue-600 text-xs sm:text-xs">
                  ⏱ {paper.duration || 180} min
                </span>
                {paper.hasAnswerKey && (
                  <span className="tag-pill bg-emerald-50 text-success text-xs sm:text-xs">
                    ✓ Answer Key
                  </span>
                )}
              </div>
            </div>

            {/* Toggle details button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-xs font-medium text-secondary bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-200 btn-press shrink-0 self-start"
              aria-expanded={showDetails}
              aria-label={showDetails ? 'Hide paper details' : 'Show paper details'}
            >
              <svg
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDetails ? 'Hide Details' : 'More Info'}
            </button>
          </div>

          {/* Collapsible details section — notes and meta only, no attempt history */}
          {showDetails && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 animate-fadeIn">
              {/* Notes section */}
              {paper.notes && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-100">
                  <p className="text-xs sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm sm:text-sm text-secondary leading-relaxed">{paper.notes}</p>
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-xs text-gray-400">
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
            </div>
          )}

          {/* Action Buttons — visible on desktop, hidden on mobile (moved to bottom bar + top button) */}
          <div className="hidden md:flex flex-wrap gap-3 mt-4">
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

            <button
              onClick={handleStartExamClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-medium text-sm shadow-sm btn-press"
            >
              <span>🎯</span>
              Start Exam
            </button>

            <Link
              to={`/study/${paperId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium text-sm btn-press"
            >
              <span>📖</span>
              Study Mode
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

      {/* Mobile bottom action bar — one-hand friendly */}
      <div className="mobile-bottom-bar">
        <div className="flex items-center gap-2">
          {/* Toggle viewer */}
          <button
            onClick={() => setShowViewer(!showViewer)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-press mobile-touch-target ${
              showViewer
                ? 'bg-gray-100 text-primary border border-gray-200'
                : 'bg-primary text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showViewer ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              )}
            </svg>
            {showViewer ? 'Hide' : 'View'}
          </button>

          {/* Start Exam — primary CTA, now opens name dialog */}
          <button
            onClick={handleStartExamClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-semibold text-base shadow-sm btn-press mobile-touch-target"
          >
            <span>🎯</span>
            Exam
          </button>

          {/* Study Mode */}
          <Link
            to={`/study/${paperId}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 text-sm font-medium btn-press mobile-touch-target"
          >
            <span>📖</span>
            Study
          </Link>

          {/* Answer Key */}
          {paper.hasAnswerKey && (
            <Link
              to={`/answer/${paperId}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-200 text-primary rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium btn-press mobile-touch-target"
            >
              <span>🔑</span>
              Key
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaperView;
