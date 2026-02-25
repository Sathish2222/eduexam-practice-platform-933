import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPaperById, getFile, getAttemptsForPaper } from '../utils/storage';
import { formatDate } from '../utils/helpers';
import FileViewer from '../components/FileViewer';

/**
 * Paper detail view page showing metadata, file preview, and actions.
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
  const [showViewer, setShowViewer] = useState(false);
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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-16">
        <p className="text-secondary">Paper not found.</p>
      </div>
    );
  }

  const attempts = getAttemptsForPaper(paperId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/browse')}
        className="text-sm text-secondary hover:text-primary mb-4 inline-flex items-center gap-1"
      >
        ← Back to Papers
      </button>

      {/* Paper Info Card */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-3">{paper.title}</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {paper.subject && (
            <span className="text-sm bg-gray-100 text-secondary px-3 py-1 rounded-full">
              📚 {paper.subject}
            </span>
          )}
          {paper.year && (
            <span className="text-sm bg-gray-100 text-secondary px-3 py-1 rounded-full">
              📅 {paper.year}
            </span>
          )}
          <span className="text-sm bg-gray-100 text-secondary px-3 py-1 rounded-full">
            ⏱ {paper.duration || 180} minutes
          </span>
          {paper.hasAnswerKey && (
            <span className="text-sm bg-green-100 text-success px-3 py-1 rounded-full">
              ✓ Answer Key Available
            </span>
          )}
        </div>

        {paper.notes && (
          <p className="text-sm text-secondary mb-4 bg-gray-50 p-3 rounded-lg">{paper.notes}</p>
        )}

        <div className="text-xs text-gray-400 mb-4">
          Added {formatDate(paper.createdAt)}
          {paper.updatedAt !== paper.createdAt && ` • Updated ${formatDate(paper.updatedAt)}`}
        </div>

        {/* Attempt Summary */}
        {attempts.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              📊 You have {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} •{' '}
              {attempts.filter(a => a.completed).length} completed
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowViewer(!showViewer)}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
          >
            {showViewer ? '👁️ Hide Paper' : '👁️ View Paper'}
          </button>

          <Link
            to={`/exam/${paperId}`}
            className="px-5 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
          >
            🎯 Start Exam
          </Link>

          {paper.hasAnswerKey && (
            <Link
              to={`/answer/${paperId}`}
              className="px-5 py-2.5 border border-gray-300 text-primary rounded-lg hover:bg-gray-50 transition font-medium"
            >
              🔑 View Answer Key
            </Link>
          )}
        </div>
      </div>

      {/* File Viewer */}
      {showViewer && (
        <FileViewer
          fileBlob={fileBlob}
          fileType={paper.paperFileType}
          title={paper.paperFileName || 'Question Paper'}
        />
      )}
    </div>
  );
}

export default PaperView;
