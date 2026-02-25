import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPaperById, getFile, getSettings, getAttemptsForPaper } from '../utils/storage';
import { isValidPdfBlob } from '../utils/helpers';
import FileViewer from '../components/FileViewer';

/**
 * Answer key viewer with configurable unlock delay and multi-AK selector.
 */
// PUBLIC_INTERFACE
/**
 * Displays the answer key for a paper, with optional lock based on settings.
 * Supports multiple answer key variants via allAnswerKeys array.
 * @returns {JSX.Element}
 */
function AnswerKeyView() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAkIdx = parseInt(searchParams.get('ak') || '0', 10);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  // All available answer keys for this paper
  const [allAks, setAllAks] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(initialAkIdx);
  const [fileBlob, setFileBlob] = useState(null);
  const [akLoading, setAkLoading] = useState(false);

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

      // Build list of available answer keys
      const aks = (p.allAnswerKeys && p.allAnswerKeys.length > 0)
        ? p.allAnswerKeys
        : p.answerKeyUrl
          ? [{ url: p.answerKeyUrl, filename: p.answerFileName, label: 'Answer Key', fileType: p.answerFileType }]
          : [];

      setAllAks(aks);
      const startIdx = Math.min(initialAkIdx, Math.max(0, aks.length - 1));
      setSelectedIdx(startIdx);

      // Load the selected AK blob
      if (aks.length > 0) {
        const blob = await loadAkBlob(paperId, aks[startIdx]);
        setFileBlob(blob);
      }

      setLoading(false);
    };
    loadData();
  }, [paperId, navigate]);

  // When selected index changes, fetch the new blob
  useEffect(() => {
    if (!paper || allAks.length === 0 || locked) return;
    const fetchSelected = async () => {
      setAkLoading(true);
      setFileBlob(null);
      const blob = await loadAkBlob(paperId, allAks[selectedIdx]);
      setFileBlob(blob);
      setAkLoading(false);
    };
    fetchSelected();
  }, [selectedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const selectedAk = allAks[selectedIdx] || null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`/paper/${paperId}`)}
        className="text-sm text-secondary hover:text-primary mb-4 inline-flex items-center gap-1"
      >
        ← Back to Paper
      </button>

      <h1 className="text-2xl font-bold text-primary mb-1">🔑 Answer Key</h1>
      <p className="text-secondary mb-4">{paper.title}</p>

      {locked ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-bold text-yellow-800 mb-2">Answer Key Locked</h3>
          <p className="text-yellow-700 text-sm">{lockMessage}</p>
        </div>
      ) : (
        <>
          {/* AK Selector — shown only when multiple variants exist */}
          {allAks.length > 1 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Answer Key Variants
                </span>
                <span className="text-xs text-secondary bg-gray-100 rounded-full px-2 py-0.5">
                  {allAks.length} available
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {allAks.map((ak, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                      selectedIdx === idx
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-secondary border-gray-200 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {ak.label}
                  </button>
                ))}
              </div>
              {selectedAk && (
                <div className="px-3 pb-2 text-xs text-gray-400">
                  Viewing: <span className="text-primary font-medium">{selectedAk.label}</span>
                  {' · '}{selectedAk.filename}
                </div>
              )}
            </div>
          )}

          {akLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FileViewer
              fileBlob={fileBlob}
              fileType={selectedAk?.fileType || paper.answerFileType}
              title={selectedAk?.label || selectedAk?.filename || 'Answer Key'}
            />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Fetch an answer key blob from IndexedDB or URL.
 */
async function loadAkBlob(paperId, ak) {
  // URL-first: always fetch fresh from URL to avoid stale/broken IndexedDB blobs.
  if (ak?.url) {
    try {
      const res = await fetch(ak.url, { cache: 'no-cache' });
      if (res.ok) return await res.blob();
      console.warn('Could not fetch answer key: HTTP', res.status);
    } catch (e) {
      console.warn('Could not fetch answer key:', e);
    }
  }
  // Fall back to IndexedDB for manually-uploaded files with no URL.
  const stored = await getFile(paperId, 'answer');
  if (stored && await isValidPdfBlob(stored)) return stored;
  return null;
}

export default AnswerKeyView;
