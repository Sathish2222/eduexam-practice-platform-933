import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime } from '../utils/helpers';
import { saveTimerState, clearTimerState } from '../utils/storage';

/**
 * Exam countdown timer with persistence, auto-submit, and stop support.
 * When `stopped` is true, the timer freezes at the current remaining time.
 */
// PUBLIC_INTERFACE
/**
 * Persistent countdown timer for exam mode.
 * Supports stopping/freezing the timer and reporting remaining time to parent.
 * @param {{
 *   paperId: string,
 *   durationMinutes: number,
 *   startTime: number,
 *   onTimeUp: Function,
 *   stopped: boolean,
 *   onRemainingChange: Function
 * }} props
 * @returns {JSX.Element}
 */
function ExamTimer({ paperId, durationMinutes, startTime, onTimeUp, stopped = false, onRemainingChange }) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  });
  const onTimeUpRef = useRef(onTimeUp);
  const onRemainingChangeRef = useRef(onRemainingChange);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    onRemainingChangeRef.current = onRemainingChange;
  }, [onRemainingChange]);

  // Notify parent whenever remaining changes
  useEffect(() => {
    if (onRemainingChangeRef.current) {
      onRemainingChangeRef.current(remaining);
    }
  }, [remaining]);

  // Persist timer state periodically
  const persistState = useCallback((rem) => {
    saveTimerState({
      paperId,
      startTime,
      duration: durationMinutes,
      remaining: rem,
      lastUpdate: Date.now(),
    });
  }, [paperId, startTime, durationMinutes]);

  useEffect(() => {
    // If timer is stopped, do not run the countdown interval
    if (stopped) {
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newRemaining = Math.max(0, totalSeconds - elapsed);

        // Persist every 10 seconds
        if (newRemaining % 10 === 0) {
          persistState(newRemaining);
        }

        if (newRemaining <= 0) {
          clearInterval(interval);
          clearTimerState();
          onTimeUpRef.current();
          return 0;
        }

        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, totalSeconds, persistState, stopped]);

  // Determine color based on remaining time and stopped state
  const getTimerColor = () => {
    if (stopped) return 'text-blue-600';
    const pct = remaining / totalSeconds;
    if (pct <= 0.1) return 'text-error animate-pulse';
    if (pct <= 0.25) return 'text-orange-500';
    return 'text-success';
  };

  return (
    <div className={`font-mono text-2xl font-bold ${getTimerColor()}`}>
      {stopped ? '⏹' : '⏱'} {formatTime(remaining)}
    </div>
  );
}

export default ExamTimer;
