import React from 'react';
import { Link } from 'react-router-dom';
import { getAttempts, getPaperById } from '../utils/storage';
import { formatDate } from '../utils/helpers';

/**
 * Attempt history page showing all exam attempts with details.
 * Displays time taken when recorded via Stop/Finish or Submit.
 */
// PUBLIC_INTERFACE
/**
 * Displays a chronological list of all exam attempts with status, duration, and saved time.
 * @returns {JSX.Element}
 */
function AttemptHistory() {
  const attempts = getAttempts().sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">📊 Attempt History</h1>

      {attempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-secondary mb-3">No exam attempts yet.</p>
          <Link
            to="/browse"
            className="inline-block px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition"
          >
            Browse Papers
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt, idx) => {
            const paper = getPaperById(attempt.paperId);
            const durationMs = (attempt.endTime || Date.now()) - (attempt.startTime || 0);
            const durationMin = Math.round(durationMs / 60000);

            return (
              <div
                key={idx}
                className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary text-sm">
                    {paper ? paper.title : `Paper ${attempt.paperId}`}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                      attempt.completed
                        ? 'bg-green-100 text-success'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {attempt.completed ? '✓ Completed' : '⚠ Incomplete'}
                    </span>
                    <span className="text-gray-400">
                      {attempt.reason === 'time_up' && '⏰ Time expired'}
                      {attempt.reason === 'manual_submit' && '📤 Submitted'}
                      {attempt.reason === 'quit' && '🚪 Quit early'}
                      {attempt.reason === 'time_up_recovery' && '⏰ Recovered (time up)'}
                      {attempt.reason === 'stopped' && '⏹ Stopped / Finished'}
                    </span>
                    {/* Show recorded time taken if available */}
                    {attempt.timeTaken ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-medium">
                        ⏱ {attempt.timeTaken}
                      </span>
                    ) : (
                      <span className="text-gray-400">⏱ {durationMin} min</span>
                    )}
                    <span className="text-gray-400">{formatDate(new Date(attempt.startTime).toISOString())}</span>
                  </div>
                </div>
                {paper && (
                  <Link
                    to={`/paper/${attempt.paperId}`}
                    className="text-xs px-3 py-1.5 border rounded-md text-primary hover:bg-gray-50 transition shrink-0"
                  >
                    View Paper →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AttemptHistory;
