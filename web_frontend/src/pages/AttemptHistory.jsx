import React from 'react';
import { Link } from 'react-router-dom';
import { getAttempts, getPaperById } from '../utils/storage';
import { formatDate } from '../utils/helpers';

/**
 * Attempt history page showing all exam attempts with details.
 * Displays time taken when recorded via Stop/Finish or Submit.
 * Shows student name associated with each attempt when available.
 * Enhanced mobile-responsive layout with clean, polished design.
 */
// PUBLIC_INTERFACE
/**
 * Displays a chronological list of all exam attempts with status, duration, student name, and saved time.
 * @returns {JSX.Element}
 */
function AttemptHistory() {
  const attempts = getAttempts().sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

  return (
    <div className="max-w-3xl mx-auto px-0.5 sm:px-0">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1">📊 Attempt History</h1>
        <p className="text-xs sm:text-sm text-secondary">
          {attempts.length > 0
            ? `${attempts.length} exam attempt${attempts.length !== 1 ? 's' : ''} recorded`
            : 'Track your exam practice attempts here'}
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200">
          <div className="text-4xl sm:text-5xl mb-3">📝</div>
          <p className="text-secondary text-sm sm:text-base font-medium mb-2 sm:mb-3">No exam attempts yet.</p>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 px-6">
            Start practicing with a paper to see your attempt history here.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 text-sm font-medium btn-press"
          >
            <span>📄</span> Browse Papers
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {attempts.map((attempt, idx) => {
            const paper = getPaperById(attempt.paperId);
            const durationMs = (attempt.endTime || Date.now()) - (attempt.startTime || 0);
            const durationMin = Math.round(durationMs / 60000);

            return (
              <div
                key={idx}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Thin color accent at top based on status */}
                <div className={`h-0.5 ${attempt.completed ? 'bg-emerald-400' : 'bg-yellow-400'}`} />

                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex-1 min-w-0 w-full">
                    {/* Paper title */}
                    <h3 className="font-semibold text-primary text-sm leading-snug mb-1.5">
                      {paper ? paper.title : `Paper ${attempt.paperId}`}
                    </h3>

                    {/* Student name — if available */}
                    {attempt.studentName && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[11px] text-gray-400">👤</span>
                        <span className="text-xs text-secondary font-medium">
                          {attempt.studentName}
                        </span>
                      </div>
                    )}

                    {/* Status tags — responsive wrap */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                        attempt.completed
                          ? 'bg-green-100 text-success'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {attempt.completed ? '✓ Completed' : '⚠ Incomplete'}
                      </span>

                      {/* Reason tag */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {attempt.reason === 'time_up' && '⏰ Time expired'}
                        {attempt.reason === 'manual_submit' && '📤 Submitted'}
                        {attempt.reason === 'quit' && '🚪 Quit early'}
                        {attempt.reason === 'time_up_recovery' && '⏰ Recovered'}
                        {attempt.reason === 'stopped' && '⏹ Stopped / Finished'}
                        {!attempt.reason && '—'}
                      </span>

                      {/* Time taken */}
                      {attempt.timeTaken ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-medium">
                          ⏱ {attempt.timeTaken}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
                          ⏱ ~{durationMin} min
                        </span>
                      )}

                      {/* Date */}
                      <span className="text-gray-400 py-0.5">
                        {formatDate(new Date(attempt.startTime).toISOString())}
                      </span>
                    </div>
                  </div>

                  {/* View Paper link */}
                  {paper && (
                    <Link
                      to={`/paper/${attempt.paperId}`}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl text-primary hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 btn-press shrink-0 mobile-touch-target self-end sm:self-auto"
                    >
                      View Paper
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AttemptHistory;
