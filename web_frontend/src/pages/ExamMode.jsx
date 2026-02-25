import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { formatTime } from '../utils/helpers';
import FileViewer from '../components/FileViewer';
import ExamTimer from '../components/ExamTimer';

/**
 * Exam mode page with persistent countdown timer and auto-submission.
 * Provides a focused exam environment with timer recovery on reload.
 * Supports stopping/finishing the exam with saved elapsed and remaining time.
 * Optimized for one-hand mobile use with bottom-pinned action controls.
 */
// PUBLIC_INTERFACE
/**
 * Full-screen exam mode with persistent timer, paper viewer, stop/finish, and auto-submit.
 * Recovers timer state on page reload/revisit.
 * Features mobile-friendly bottom action bar for submit/stop/quit controls.
 * Timer starts when the student clicks "Begin Exam".
 * Stop/Finish button freezes the timer and records the stopped time for the attempt.
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
  const [examStopped, setExamStopped] = useState(false);
  // Track elapsed time display string for the finished screen
  const [stoppedTimeDisplay, setStoppedTimeDisplay] = useState('');
  // Ref to always have latest remaining seconds from ExamTimer
  const currentRemainingRef = useRef(null);

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

  /**
   * Callback from ExamTimer reporting the current remaining seconds.
   * Stored in a ref so it's always up-to-date without causing re-renders.
   */
  const handleRemainingChange = useCallback((remaining) => {
    currentRemainingRef.current = remaining;
  }, []);

  /**
   * Start the exam: sets the start time and persists timer state.
   * The countdown begins from this moment.
   */
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
    setStoppedTimeDisplay('');
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: Date.now(),
      completed: true,
      reason: 'time_up',
    });
  }, [paperId, startTime]);

  /**
   * Stop/Finish the exam: freezes the timer and records the stopped time.
   * Saves both the remaining seconds and elapsed seconds to the attempt.
   */
  const handleStopExam = () => {
    if (!window.confirm('Are you sure you want to stop and finish your exam? The timer will be saved.')) return;
    const now = Date.now();
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;
    const totalSeconds = duration * 60;
    // Use the live remaining value from the timer, fallback to calculation
    const remainingSeconds = currentRemainingRef.current != null
      ? currentRemainingRef.current
      : Math.max(0, totalSeconds - Math.floor((now - startTime) / 1000));
    const elapsedSeconds = totalSeconds - remainingSeconds;

    // First stop the timer visually
    setExamStopped(true);
    // Then mark as finished
    setExamFinished(true);
    setFinishReason('✅ Exam stopped and time saved successfully.');
    setStoppedTimeDisplay(formatTime(elapsedSeconds));
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: now,
      completed: true,
      reason: 'stopped',
      remainingSeconds,
      elapsedSeconds,
      timeTaken: formatTime(elapsedSeconds),
    });
  };

  const handleSubmitEarly = () => {
    if (!window.confirm('Are you sure you want to submit your exam early?')) return;
    const now = Date.now();
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;
    const totalSeconds = duration * 60;
    const remainingSeconds = currentRemainingRef.current != null
      ? currentRemainingRef.current
      : Math.max(0, totalSeconds - Math.floor((now - startTime) / 1000));
    const elapsedSeconds = totalSeconds - remainingSeconds;

    setExamFinished(true);
    setFinishReason('✅ Exam submitted successfully.');
    setStoppedTimeDisplay(formatTime(elapsedSeconds));
    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: now,
      completed: true,
      reason: 'manual_submit',
      remainingSeconds,
      elapsedSeconds,
      timeTaken: formatTime(elapsedSeconds),
    });
  };

  const handleQuitExam = () => {
    if (!window.confirm('Are you sure you want to quit? Your progress will be saved as incomplete.')) return;
    const now = Date.now();
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;
    const totalSeconds = duration * 60;
    const remainingSeconds = currentRemainingRef.current != null
      ? currentRemainingRef.current
      : Math.max(0, totalSeconds - Math.floor((now - startTime) / 1000));
    const elapsedSeconds = totalSeconds - remainingSeconds;

    clearTimerState();
    saveAttempt({
      paperId,
      startTime,
      endTime: now,
      completed: false,
      reason: 'quit',
      remainingSeconds,
      elapsedSeconds,
      timeTaken: formatTime(elapsedSeconds),
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
      <div className="max-w-lg mx-auto text-center py-8 sm:py-20 px-2 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-10">
          {/* Success icon */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse-ring"></div>
            <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Exam Complete!</h2>
          <p className="text-secondary mb-4 text-sm">{finishReason}</p>

          {/* Display the time taken when available */}
          {stoppedTimeDisplay && (
            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100 inline-block w-full max-w-xs">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-bold text-lg font-mono">{stoppedTimeDisplay}</span>
              </div>
              <p className="text-blue-600 text-xs">Time taken for this attempt</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {paper.hasAnswerKey && (
              <button
                onClick={() => navigate(`/answer/${paperId}`)}
                className="w-full px-5 py-3.5 sm:py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-medium text-sm shadow-sm btn-press flex items-center justify-center gap-2 mobile-touch-target"
              >
                <span>🔑</span> View Answer Key
              </button>
            )}
            <button
              onClick={() => navigate(`/paper/${paperId}`)}
              className="w-full px-5 py-3.5 sm:py-3 bg-primary text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-medium text-sm btn-press flex items-center justify-center gap-2 mobile-touch-target"
            >
              <span>📄</span> Back to Paper
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="w-full px-5 py-3.5 sm:py-3 border border-gray-200 text-secondary rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm btn-press flex items-center justify-center gap-2 mobile-touch-target"
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
      <div className="max-w-lg mx-auto py-6 sm:py-16 px-1 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"></div>

          <div className="p-6 sm:p-10 text-center">
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
                Timer starts when you click begin. You can stop when done.
              </p>
            </div>

            {/* Important notes */}
            <div className="text-left bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-100">
              <p className="text-xs font-medium text-yellow-800 mb-1.5">📌 Before you begin:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• The timer will start counting down when you begin</li>
                <li>• Use the <strong>Stop / Finish</strong> button when you complete the exam</li>
                <li>• Your time will be recorded for this attempt</li>
                <li>• Timer persists if you refresh the page</li>
              </ul>
            </div>

            {/* Action buttons — larger targets for mobile */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartExam}
                className="w-full px-8 py-4 sm:py-3.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-bold text-base shadow-md btn-press flex items-center justify-center gap-2 mobile-touch-target"
              >
                <span>▶</span> Begin Exam
              </button>
              <button
                onClick={() => navigate(`/paper/${paperId}`)}
                className="w-full px-5 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-secondary hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm btn-press mobile-touch-target"
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
    <div className="animate-fadeIn has-mobile-bottom-bar">
      {/* Exam Header - Sticky */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 mb-5">
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Left: Paper info */}
              <div className="min-w-0 flex-1 mr-2 sm:mr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-success text-[10px] font-semibold uppercase tracking-wider rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                    Live
                  </span>
                  <h2 className="font-semibold text-primary text-xs sm:text-sm truncate">{paper.title}</h2>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">Exam in progress — stay focused!</p>
              </div>

              {/* Center: Timer */}
              <div className="shrink-0 bg-gray-50 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200">
                <ExamTimer
                  paperId={paperId}
                  durationMinutes={duration}
                  startTime={startTime}
                  onTimeUp={handleTimeUp}
                  stopped={examStopped}
                  onRemainingChange={handleRemainingChange}
                />
              </div>

              {/* Right: Desktop Actions — hidden on mobile (moved to bottom bar) */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                {/* Stop/Finish button — primary action */}
                <button
                  onClick={handleStopExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm btn-press flex items-center gap-1.5"
                  title="Stop timer and finish exam"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop / Finish
                </button>
                <button
                  onClick={handleSubmitEarly}
                  className="px-4 py-2 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 text-sm font-medium shadow-sm btn-press flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit
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

      {/* Mobile bottom action bar — one-hand friendly stop/submit/quit */}
      <div className="mobile-bottom-bar">
        <div className="flex items-center gap-2">
          {/* Quit button */}
          <button
            onClick={handleQuitExam}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-red-200 text-error rounded-xl hover:bg-red-50 transition-all duration-200 btn-press mobile-touch-target text-xs font-medium"
            aria-label="Quit exam"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Quit
          </button>

          {/* Stop/Finish button — prominent action for completing exam */}
          <button
            onClick={handleStopExam}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-sm shadow-sm btn-press mobile-touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop / Finish
          </button>

          {/* Submit button */}
          <button
            onClick={handleSubmitEarly}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 btn-press mobile-touch-target text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamMode;
