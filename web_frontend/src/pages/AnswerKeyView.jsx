import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaperById, getFile, getSettings, getAttemptsForPaper } from '../utils/storage';
import FileViewer from '../components/FileViewer';

/**
 * Answer key viewer with configurable unlock delay.
 */
// PUBLIC_INTERFACE
/**
 * Displays the answer key for a paper, with optional lock based on settings.
 * @returns {JSX.Element}
 */
function AnswerKeyView() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const p = getPaperById(paperId);
      if (!p || !p.hasAnswerKey) {
        navigate('/browse');
        return;
      }
      setPaper(p);

      // Check lock conditions
      const settings = getSettings();
      const lockDuration = settings.answerKeyLockDuration || 0;

      if (lockDuration > 0) {
        const attempts = getAttemptsForPaper(paperId);
        const completedAttempts = attempts.filter(a => a.completed);

        if (completedAttempts.length === 0) {
          setLocked(true);
          setLockMessage('You must complete at least one exam attempt before viewing the answer key.');
        } else {
          // Check if enough time has passed since last attempt
          const lastAttempt = completedAttempts[completedAttempts.length - 1];
          const timeSince = (Date.now() - lastAttempt.endTime) / (1000 * 60);
          if (timeSince < lockDuration) {
            const remaining = Math.ceil(lockDuration - timeSince);
            setLocked(true);
            setLockMessage(
              `Answer key will unlock in ${remaining} minute${remaining !== 1 ? 's' : ''} after your last exam attempt.`
            );
          }
        }
      }

      const blob = await getFile(paperId, 'answer');
      setFileBlob(blob);
      setLoading(false);
    };
    loadData();
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

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`/paper/${paperId}`)}
        className="text-sm text-secondary hover:text-primary mb-4 inline-flex items-center gap-1"
      >
        ← Back to Paper
      </button>

      <h1 className="text-2xl font-bold text-primary mb-2">🔑 Answer Key</h1>
      <p className="text-secondary mb-6">{paper.title}</p>

      {locked ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-bold text-yellow-800 mb-2">Answer Key Locked</h3>
          <p className="text-yellow-700 text-sm">{lockMessage}</p>
        </div>
      ) : (
        <FileViewer
          fileBlob={fileBlob}
          fileType={paper.answerFileType}
          title={paper.answerFileName || 'Answer Key'}
        />
      )}
    </div>
  );
}

export default AnswerKeyView;
