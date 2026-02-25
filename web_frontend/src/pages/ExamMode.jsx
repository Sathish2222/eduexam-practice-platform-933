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
 * Exam mode page with persistent 3-hour countdown timer and auto-submission.
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

  // Exam finished screen
  if (examFinished) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-primary mb-3">Exam Complete</h2>
        <p className="text-secondary mb-6">{finishReason}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {paper.hasAnswerKey && (
            <button
              onClick={() => navigate(`/answer/${paperId}`)}
              className="px-5 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
            >
              🔑 View Answer Key
            </button>
          )}
          <button
            onClick={() => navigate(`/paper/${paperId}`)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-primary hover:bg-gray-50 transition"
          >
            📄 Back to Paper
          </button>
          <button
            onClick={() => navigate('/browse')}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50 transition"
          >
            📋 All Papers
          </button>
        </div>
      </div>
    );
  }

  // Pre-exam confirmation screen
  if (!examStarted) {
    const settings = getSettings();
    const duration = paper.duration || settings.examDuration || 180;

    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Ready to Start?</h2>
        <p className="text-lg text-secondary mb-2">{paper.title}</p>
        <div className="bg-blue-50 rounded-lg p-4 mb-6 inline-block">
          <p className="text-blue-700 font-medium">
            ⏱ Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Timer will count down once you start. Auto-submit at 0.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleStartExam}
            className="px-8 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition font-bold text-lg"
          >
            ▶ Start Exam
          </button>
          <button
            onClick={() => navigate(`/paper/${paperId}`)}
            className="px-5 py-3 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Active exam screen
  const settings = getSettings();
  const duration = paper.duration || settings.examDuration || 180;

  return (
    <div>
      {/* Exam Header - Sticky */}
      <div className="sticky top-14 z-40 bg-white border-b shadow-sm -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="min-w-0 mr-4">
            <h2 className="font-semibold text-primary text-sm truncate">{paper.title}</h2>
            <p className="text-xs text-secondary">Exam in progress</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ExamTimer
              paperId={paperId}
              durationMinutes={duration}
              startTime={startTime}
              onTimeUp={handleTimeUp}
            />
            <button
              onClick={handleSubmitEarly}
              className="px-4 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition text-sm font-medium"
            >
              Submit
            </button>
            <button
              onClick={handleQuitExam}
              className="px-3 py-1.5 border border-red-200 text-error rounded-lg hover:bg-red-50 transition text-sm"
            >
              Quit
            </button>
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
