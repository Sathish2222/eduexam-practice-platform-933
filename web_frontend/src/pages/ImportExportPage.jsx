import React, { useState, useRef } from 'react';
import { exportAllData, importAllData } from '../utils/storage';

/**
 * Import/Export page for backing up and restoring data.
 */
// PUBLIC_INTERFACE
/**
 * Provides backup export (download JSON) and import (upload JSON) functionality.
 * @returns {JSX.Element}
 */
function ImportExportPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduexam-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: '✅ Backup exported successfully!' });
    } catch (err) {
      console.error('Export error:', err);
      setMessage({ type: 'error', text: '❌ Failed to export backup. ' + err.message });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importAllData(data);
      setMessage({
        type: 'success',
        text: `✅ Import successful! ${result.papersImported} paper file(s) imported.`,
      });
    } catch (err) {
      console.error('Import error:', err);
      setMessage({ type: 'error', text: '❌ Failed to import backup. ' + err.message });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">💾 Backup & Restore</h1>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-success border border-green-200'
              : 'bg-red-50 text-error border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">📤 Export Backup</h2>
        <p className="text-sm text-secondary mb-4">
          Download all your papers, answer keys, settings, and attempt history as a single JSON file.
          This file can be imported on another device or browser.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
        >
          {exporting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
              Exporting...
            </span>
          ) : (
            '📥 Download Backup'
          )}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">📥 Import Backup</h2>
        <p className="text-sm text-secondary mb-4">
          Upload a previously exported JSON backup file. Existing papers with the same ID will be
          updated. New papers will be added. Settings will be merged.
        </p>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-2">Select a .json backup file</p>
          {importing && (
            <p className="text-sm text-primary mt-3 animate-pulse">Importing data...</p>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
        <p className="font-medium mb-1">⚠️ Important Notes</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Backups include all paper files (PDFs/images), which may result in large file sizes.</li>
          <li>Importing will merge data — it will not delete existing papers not in the backup.</li>
          <li>Always keep a backup before importing to avoid data loss.</li>
          <li>Backup files are not encrypted — keep them secure if they contain sensitive exam content.</li>
        </ul>
      </div>
    </div>
  );
}

export default ImportExportPage;
