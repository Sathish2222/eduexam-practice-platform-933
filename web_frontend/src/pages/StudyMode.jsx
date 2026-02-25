import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getPaperById, getFile } from '../utils/storage';
import { isValidPdfBlob } from '../utils/helpers';
import FileViewer from '../components/FileViewer';

// PUBLIC_INTERFACE
/**
 * Study Mode — shows Question Paper and Answer Key side by side.
 * Desktop: split panel. Mobile: tab toggle between QP and AK.
 */
function StudyMode() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAkIdx = parseInt(searchParams.get('ak') || '0', 10);

  const [paper, setPaper] = useState(null);
  const [qpBlob, setQpBlob] = useState(null);
  const [akBlob, setAkBlob] = useState(null);
  const [allAks, setAllAks] = useState([]);
  const [selectedAkIdx, setSelectedAkIdx] = useState(initialAkIdx);
  const [akLoading, setAkLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState('qp'); // 'qp' | 'ak'

  useEffect(() => {
    const load = async () => {
      const p = getPaperById(paperId);
      if (!p) { navigate('/browse'); return; }
      setPaper(p);

      // URL-first: always fetch fresh from URL to avoid stale/broken IndexedDB blobs.
      // Fall back to IndexedDB only for manually-uploaded files with no URL.
      let qp = null;
      if (p.paperUrl) {
        try { const r = await fetch(p.paperUrl, { cache: 'no-cache' }); if (r.ok) qp = await r.blob(); } catch {}
      }
      if (!qp) {
        const stored = await getFile(paperId, 'paper');
        if (stored && await isValidPdfBlob(stored)) qp = stored;
      }
      setQpBlob(qp);

      // Build AK list
      const aks = (p.allAnswerKeys && p.allAnswerKeys.length > 0)
        ? p.allAnswerKeys
        : p.answerKeyUrl
          ? [{ url: p.answerKeyUrl, filename: p.answerFileName, label: 'Answer Key', fileType: p.answerFileType }]
          : [];
      setAllAks(aks);

      // Load initial AK
      const startIdx = Math.min(initialAkIdx, Math.max(0, aks.length - 1));
      setSelectedAkIdx(startIdx);
      if (aks.length > 0) {
        const blob = await fetchAkBlob(paperId, aks[startIdx]);
        setAkBlob(blob);
      }

      setLoading(false);
    };
    load();
  }, [paperId, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload AK when selection changes
  useEffect(() => {
    if (!paper || allAks.length === 0) return;
    const fetchAk = async () => {
      setAkLoading(true);
      setAkBlob(null);
      const blob = await fetchAkBlob(paperId, allAks[selectedAkIdx]);
      setAkBlob(blob);
      setAkLoading(false);
    };
    fetchAk();
  }, [selectedAkIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-secondary text-sm">Loading study materials...</p>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  const selectedAk = allAks[selectedAkIdx] || null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={`/paper/${paperId}`}
            className="text-sm text-secondary hover:text-primary shrink-0"
          >
            ← Back
          </Link>
          <span className="text-gray-300">/</span>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-primary truncate">📖 {paper.title}</h1>
            <p className="text-xs text-secondary hidden sm:block">Study Mode — Question Paper &amp; Answer Key</p>
          </div>
        </div>
        {/* Start Exam CTA */}
        <Link
          to={`/exam/${paperId}`}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-xl text-sm font-semibold hover:bg-success/90 transition-all shadow-sm"
        >
          🎯 Start Exam
        </Link>
      </div>

      {/* AK Selector — shown when multiple variants */}
      {allAks.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-3 p-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400 font-medium px-1 shrink-0">Answer Key:</span>
          {allAks.map((ak, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAkIdx(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                selectedAkIdx === idx
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-secondary border-gray-200 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {ak.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile tab toggle */}
      <div className="flex sm:hidden mb-3 bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setMobileTab('qp')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mobileTab === 'qp' ? 'bg-white text-primary shadow-sm' : 'text-secondary'
          }`}
        >
          📄 Question Paper
        </button>
        <button
          onClick={() => setMobileTab('ak')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mobileTab === 'ak' ? 'bg-white text-success shadow-sm' : 'text-secondary'
          } ${!paper.hasAnswerKey ? 'opacity-40 cursor-not-allowed' : ''}`}
          disabled={!paper.hasAnswerKey}
        >
          🔑 Answer Key
        </button>
      </div>

      {/* Desktop: side-by-side | Mobile: single tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
        {/* Question Paper panel */}
        <div className={`${mobileTab === 'ak' ? 'hidden sm:block' : 'block'}`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden sm:block px-0.5">
            📄 Question Paper
          </div>
          <FileViewer
            fileBlob={qpBlob}
            fileType={paper.paperFileType}
            title={paper.paperFileName || 'Question Paper'}
          />
        </div>

        {/* Answer Key panel */}
        <div className={`${mobileTab === 'qp' ? 'hidden sm:block' : 'block'}`}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 hidden sm:block px-0.5">
            🔑 {selectedAk?.label || 'Answer Key'}
          </div>
          {!paper.hasAnswerKey ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-secondary text-sm">No answer key available</p>
              </div>
            </div>
          ) : akLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <FileViewer
              fileBlob={akBlob}
              fileType={selectedAk?.fileType || paper.answerFileType}
              title={selectedAk?.label || 'Answer Key'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

async function fetchAkBlob(paperId, ak) {
  // URL-first: always fetch fresh from URL to avoid stale/broken IndexedDB blobs.
  if (ak?.url) {
    try {
      const res = await fetch(ak.url, { cache: 'no-cache' });
      if (res.ok) return await res.blob();
    } catch {}
  }
  // Fall back to IndexedDB for manually-uploaded files with no URL.
  const stored = await getFile(paperId, 'answer');
  if (stored && await isValidPdfBlob(stored)) return stored;
  return null;
}

export default StudyMode;
