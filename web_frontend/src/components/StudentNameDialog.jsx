import React, { useState, useEffect, useRef } from 'react';
import { getStudentName, saveStudentName } from '../utils/storage';

/**
 * Modal dialog to capture the student's name before starting an exam.
 * Persists the name in LocalStorage so it is remembered for future exams.
 * Requires a non-empty name before allowing the student to proceed.
 */
// PUBLIC_INTERFACE
/**
 * A modal dialog prompting the student to enter their name before beginning an exam.
 * Pre-fills with previously saved name. The name is saved to localStorage on confirm.
 * @param {{ open: boolean, onConfirm: (name: string) => void, onCancel: () => void, paperTitle?: string }} props
 * @returns {JSX.Element|null}
 */
function StudentNameDialog({ open, onConfirm, onCancel, paperTitle = '' }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Pre-fill with saved name when dialog opens
  useEffect(() => {
    if (open) {
      const saved = getStudentName();
      setName(saved);
      setError('');
      // Focus the input after a short delay for animation
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 150);
    }
  }, [open]);

  /**
   * Handle form submission — validate and confirm name
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (name || '').trim();
    if (!trimmed) {
      setError('Please enter your name to continue');
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    saveStudentName(trimmed);
    onConfirm(trimmed);
  };

  /**
   * Handle key press — allow Enter to submit
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enter student name"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          {/* Icon and title */}
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-1">
              Enter Your Name
            </h2>
            <p className="text-sm text-secondary">
              {paperTitle
                ? `Your name will be recorded for this exam attempt`
                : 'Required before starting the exam'}
            </p>
          </div>

          {/* Paper title display */}
          {paperTitle && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Exam Paper</p>
              <p className="text-sm font-medium text-primary truncate">{paperTitle}</p>
            </div>
          )}

          {/* Name input */}
          <div className="mb-4">
            <label
              htmlFor="student-name-input"
              className="block text-sm font-medium text-primary mb-1.5"
            >
              Student Name <span className="text-error">*</span>
            </label>
            <input
              ref={inputRef}
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all duration-200 ${
                error
                  ? 'border-error bg-red-50 focus:ring-2 focus:ring-error/20'
                  : 'border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
              autoComplete="name"
              maxLength={60}
            />
            {error && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full px-5 py-3.5 bg-success text-white rounded-xl hover:bg-success/90 transition-all duration-200 font-semibold text-sm shadow-sm btn-press flex items-center justify-center gap-2"
            >
              <span>▶</span> Continue to Exam
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-5 py-2.5 border border-gray-200 text-secondary rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm btn-press"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentNameDialog;
