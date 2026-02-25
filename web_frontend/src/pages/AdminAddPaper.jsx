import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPaper, saveFile } from '../utils/storage';
import { generateId, getFileExtension } from '../utils/helpers';

/**
 * Admin page for adding a new exam paper with metadata and files.
 */
// PUBLIC_INTERFACE
/**
 * Form component for uploading a new question paper and optional answer key.
 * @returns {JSX.Element}
 */
function AdminAddPaper() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('180');
  const [notes, setNotes] = useState('');
  const [paperFile, setPaperFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!paperFile) {
      setError('Question paper file is required.');
      return;
    }

    setSaving(true);
    try {
      const paperId = generateId();
      const paperExt = getFileExtension(paperFile.name);
      const paperType = paperFile.type || (paperExt === 'pdf' ? 'application/pdf' : `image/${paperExt}`);

      // Save paper metadata
      const paperMeta = {
        id: paperId,
        title: title.trim(),
        subject: subject.trim(),
        year: year.trim(),
        duration: parseInt(duration) || 180,
        notes: notes.trim(),
        paperFileName: paperFile.name,
        paperFileType: paperType,
        hasAnswerKey: !!answerFile,
        answerFileName: answerFile ? answerFile.name : null,
        answerFileType: answerFile ? (answerFile.type || 'application/pdf') : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save files to IndexedDB
      await saveFile(paperId, paperFile, 'paper');
      if (answerFile) {
        await saveFile(paperId, answerFile, 'answer');
      }

      // Save metadata to LocalStorage
      addPaper(paperMeta);

      navigate('/admin');
    } catch (err) {
      console.error('Error saving paper:', err);
      setError('Failed to save paper. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const acceptTypes = '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">📄 Add New Paper</h1>

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
            placeholder="e.g. Mathematics Final Exam 2024"
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
              placeholder="e.g. Mathematics"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
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
            placeholder="Any additional notes about this paper..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-y"
          />
        </div>

        {/* Question Paper File */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Question Paper File <span className="text-error">*</span>
          </label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition">
            <input
              type="file"
              accept={acceptTypes}
              onChange={(e) => setPaperFile(e.target.files[0] || null)}
              className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Accepts PDF, JPG, PNG, GIF, BMP, WebP</p>
            {paperFile && (
              <p className="text-xs text-success mt-1">✓ {paperFile.name}</p>
            )}
          </div>
        </div>

        {/* Answer Key File */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Answer Key File (optional)
          </label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition">
            <input
              type="file"
              accept={acceptTypes}
              onChange={(e) => setAnswerFile(e.target.files[0] || null)}
              className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">Accepts PDF, JPG, PNG, GIF, BMP, WebP</p>
            {answerFile && (
              <p className="text-xs text-success mt-1">✓ {answerFile.name}</p>
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
            {saving ? 'Saving...' : '💾 Save Paper'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAddPaper;
