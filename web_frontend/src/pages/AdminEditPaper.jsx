import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaperById, updatePaper, saveFile, getFile } from '../utils/storage';
import { getFileExtension } from '../utils/helpers';

/**
 * Admin page for editing an existing paper's metadata and files.
 */
// PUBLIC_INTERFACE
/**
 * Edit form for an existing paper's metadata and file attachments.
 * @returns {JSX.Element}
 */
function AdminEditPaper() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('180');
  const [notes, setNotes] = useState('');
  const [newPaperFile, setNewPaperFile] = useState(null);
  const [newAnswerFile, setNewAnswerFile] = useState(null);
  const [hasPaperFile, setHasPaperFile] = useState(false);
  const [hasAnswerFile, setHasAnswerFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = getPaperById(paperId);
    if (!p) {
      navigate('/admin');
      return;
    }
    setPaper(p);
    setTitle(p.title || '');
    setSubject(p.subject || '');
    setYear(p.year || '');
    setDuration((p.duration || 180).toString());
    setNotes(p.notes || '');
    setHasAnswerFile(p.hasAnswerKey || false);

    // Check if paper file exists
    getFile(paperId, 'paper').then(f => setHasPaperFile(!!f));
  }, [paperId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        title: title.trim(),
        subject: subject.trim(),
        year: year.trim(),
        duration: parseInt(duration) || 180,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };

      // Update paper file if new one provided
      if (newPaperFile) {
        const ext = getFileExtension(newPaperFile.name);
        updates.paperFileName = newPaperFile.name;
        updates.paperFileType = newPaperFile.type || (ext === 'pdf' ? 'application/pdf' : `image/${ext}`);
        await saveFile(paperId, newPaperFile, 'paper');
      }

      // Update answer file if new one provided
      if (newAnswerFile) {
        updates.hasAnswerKey = true;
        updates.answerFileName = newAnswerFile.name;
        updates.answerFileType = newAnswerFile.type || 'application/pdf';
        await saveFile(paperId, newAnswerFile, 'answer');
      }

      updatePaper(paperId, updates);
      navigate('/admin');
    } catch (err) {
      console.error('Error updating paper:', err);
      setError('Failed to update paper. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!paper) {
    return (
      <div className="text-center py-16">
        <p className="text-secondary">Loading paper...</p>
      </div>
    );
  }

  const acceptTypes = '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">✏️ Edit Paper</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {error && (
          <div className="bg-red-50 text-error px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            required
          />
        </div>

        {/* Subject & Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Exam Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="600"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y"
          />
        </div>

        {/* Question Paper File */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Question Paper File
          </label>
          {hasPaperFile && !newPaperFile && (
            <p className="text-xs text-success mb-2">✓ Current file: {paper.paperFileName}</p>
          )}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition">
            <input
              type="file"
              accept={acceptTypes}
              onChange={(e) => setNewPaperFile(e.target.files[0] || null)}
              className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Upload a new file to replace the current one</p>
            {newPaperFile && (
              <p className="text-xs text-success mt-1">✓ New: {newPaperFile.name}</p>
            )}
          </div>
        </div>

        {/* Answer Key File */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Answer Key File
          </label>
          {hasAnswerFile && !newAnswerFile && (
            <p className="text-xs text-success mb-2">✓ Current file: {paper.answerFileName}</p>
          )}
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition">
            <input
              type="file"
              accept={acceptTypes}
              onChange={(e) => setNewAnswerFile(e.target.files[0] || null)}
              className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Upload to add or replace answer key</p>
            {newAnswerFile && (
              <p className="text-xs text-success mt-1">✓ New: {newAnswerFile.name}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Update Paper'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminEditPaper;
