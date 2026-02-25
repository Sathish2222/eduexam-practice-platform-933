import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPaperById,
  getFile,
  getTimerState,
  saveTimerState,
  clearTimerState,
  saveAttempt,
  getSettings,
} from '../utils/storage';
import FileViewer from '../components/FileViewer';
import ExamTimer from '../components/ExamTimer';

/**
 * Exam mode page with persistent countdown timer and auto-submission.
 * Provides a focused exam environment with timer recovery on reload.
 */
// PUBLIC_INTERFACE
/**
 * Full-screen exam mode with persistent timer, paper viewer, and auto-submit.
 * Recovers timer state on page reload/revisit.
 * @returns {JSX.Element}
 */
function ExamMode() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [examFinished, setExamFinished] = useState(false);
  const [finishReason, setFinishReason] = useState('');

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

      // Check for existing timer state (recovery)
      const timerState = getTimerState();
      if (timerState && timerState.paperId === paperId) {
        const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
        const total = timerState.duration * 60;
        if (elapsed < total) {
          // Resume exam
          setStartTime(timerState.startTime);
          setExamStarted(true);
        } else {
          // Timer already expired — auto-submit
          clearTimerState();
          saveAttempt({
            paperId,
            startTime: timerState.startTime,
            endTime: Date.now(),
            completed: true,
            reason: 'time_up_recovery',
          });
        }
      }

      setLoading(false);
    };
    loadPaper();
  }, [paperId, navigate]);

  const handleStartExam = () => {
    const now = Date.now();
    setStartTime(now);
    setExamStarted(true);
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;
    saveTimerState({
      paperId,
      startTime: now,
      duration,
      remaining: duration * 60,
      lastUpdate: now,
    });
  };

  const handleTimeUp = useCallback(() => {
    setExamFinished(true);
    setFinishReason('⏰ Time is up! Your exam has been auto-submitted.');
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: Date.now(),
      completed: true,
      reason: 'time_up',
    });
  }, [paperId, startTime]);

  const handleSubmitEarly = () => {
    if (!window.confirm('Are you sure you want to submit your exam early?')) return;
    setExamFinished(true);
    setFinishReason('✅ Exam submitted successfully.');
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: Date.now(),
      completed: true,
      reason: 'manual_submit',
    });
  };

  const handleQuitExam = () => {
    if (!window.confirm('Are you sure you want to quit? Your progress will be saved as incomplete.')) return;
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: Date.now(),
      completed: false,
      reason: 'quit',
    });
    navigate(`/paper/${paperId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-secondary text-sm">Preparing exam...</p>
        </div>
      </div>
    );
  }

  // Paper not found
  if (!paper) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-secondary text-lg">Paper not found.</p>
      </div>
    );
  }

  // Exam finished screen
  if (examFinished) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-20 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 sm:p-10">
          {/* Success icon */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse-ring"></div>
            <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Exam Complete!</h2>
          <p className="text-secondary mb-8 text-sm">{finishReason}</p>

          <div className="flex flex-col gap-3">
            {paper.hasAnswerKey && (
              <button
                onClick={() => navigate(`/answer/${paperId}`)}
                className="w-full px-5 py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-medium text-sm shadow-sm btn-press flex items-center justify-center gap-2"
              >
                <span>🔑</span> View Answer Key
              </button>
            )}
            <button
              onClick={() => navigate(`/paper/${paperId}`)}
              className="w-full px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium text-sm btn-press flex items-center justify-center gap-2"
            >
              <span>📄</span> Back to Paper
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="w-full px-5 py-3 border border-gray-200 text-secondary rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm btn-press flex items-center justify-center gap-2"
            >
              <span>📋</span> Browse All Papers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-exam confirmation screen
  if (!examStarted) {
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;

    return (
      <div className="max-w-lg mx-auto py-10 sm:py-16 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"></div>

          <div className="p-8 sm:p-10 text-center">
            {/* Exam icon */}
            <div className="mx-auto mb-6 w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎯</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Ready to Start?</h2>
            <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">{paper.title}</p>

            {/* Duration info card */}
            <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100 inline-block w-full max-w-xs">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-bold text-lg">
                  {hours > 0 && `${hours}h `}{mins > 0 && `${mins}m`}
                  {hours === 0 && mins === 0 && `${duration}m`}
                </span>
              </div>
              <p className="text-blue-600 text-xs">
                Timer starts when you click begin. Auto-submits when time runs out.
              </p>
            </div>

            {/* Important notes */}
            <div className="text-left bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-100">
              <p className="text-xs font-medium text-yellow-800 mb-1.5">📌 Before you begin:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• The timer will count down continuously</li>
                <li>• You can submit early or quit at any time</li>
                <li>• Timer persists if you refresh the page</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartExam}
                className="w-full px-8 py-3.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-bold text-base shadow-md btn-press flex items-center justify-center gap-2"
              >
                <span>▶</span> Begin Exam
              </button>
              <button
                onClick={() => navigate(`/paper/${paperId}`)}
                className="w-full px-5 py-2.5 border border-gray-200 rounded-xl text-secondary hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm btn-press"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active exam screen
  const settings = getSettings();
  const duration = paper.duration || settings.examDuration || 180;

  return (
    <div className="animate-fadeIn">
      {/* Exam Header - Sticky */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 mb-5">
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Paper info */}
              <div className="min-w-0 flex-1 mr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-success text-[10px] font-semibold uppercase tracking-wider rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    Live
                  </span>
                  <h2 className="font-semibold text-primary text-sm truncate">{paper.title}</h2>
                </div>
                <p className="text-[11px] text-gray-400">Exam in progress — stay focused!</p>
              </div>

              {/* Center: Timer */}
              <div className="shrink-0 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                <ExamTimer
                  paperId={paperId}
                  durationMinutes={duration}
                  startTime={startTime}
                  onTimeUp={handleTimeUp}
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSubmitEarly}
                  className="px-4 py-2 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 text-sm font-medium shadow-sm btn-press hidden sm:flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit
                </button>
                {/* Mobile submit */}
                <button
                  onClick={handleSubmitEarly}
                  className="sm:hidden p-2 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 btn-press"
                  title="Submit exam"
                  aria-label="Submit exam"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleQuitExam}
                  className="p-2 border border-red-200 text-error rounded-xl hover:bg-red-50 transition-all duration-200 btn-press"
                  title="Quit exam"
                  aria-label="Quit exam"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paper Viewer */}
      <FileViewer
        fileBlob={fileBlob}
        fileType={paper.paperFileType}
        title={paper.paperFileName || 'Question Paper'}
      />
    </div>
  );
}

export default ExamMode;
