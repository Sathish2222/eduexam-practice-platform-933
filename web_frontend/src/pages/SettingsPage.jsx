import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

/**
 * Settings page for configuring application preferences.
 */
// PUBLIC_INTERFACE
/**
 * Application settings page for admin PIN, exam duration, and answer key lock.
 * @returns {JSX.Element}
 */
function SettingsPage() {
  const [settings, setSettingsState] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const handleChange = (key, value) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">⚙️ Settings</h1>

      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* Admin PIN */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Admin PIN</label>
          <p className="text-xs text-secondary mb-2">
            Required to access the admin dashboard. Default is 1234.
          </p>
          <div className="flex gap-2">
            <input
              type={showPin ? 'text' : 'password'}
              value={settings.adminPin || ''}
              onChange={(e) => handleChange('adminPin', e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none tracking-widest"
              maxLength={10}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="px-3 py-2 border rounded-lg text-secondary hover:bg-gray-50 transition text-sm"
            >
              {showPin ? '🙈 Hide' : '👁️ Show'}
            </button>
          </div>
        </div>

        {/* Default Exam Duration */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Default Exam Duration (minutes)
          </label>
          <p className="text-xs text-secondary mb-2">
            Default timer duration for exams. Can be overridden per paper.
          </p>
          <input
            type="number"
            value={settings.examDuration || 180}
            onChange={(e) => handleChange('examDuration', parseInt(e.target.value) || 180)}
            min="1"
            max="600"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>

        {/* Answer Key Lock Duration */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Answer Key Lock Duration (minutes)
          </label>
          <p className="text-xs text-secondary mb-2">
            How many minutes after completing an exam before the answer key unlocks.
            Set to 0 for immediate access.
          </p>
          <input
            type="number"
            value={settings.answerKeyLockDuration || 0}
            onChange={(e) => handleChange('answerKeyLockDuration', parseInt(e.target.value) || 0)}
            min="0"
            max="1440"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition font-medium"
          >
            💾 Save Settings
          </button>
          {saved && (
            <span className="text-success text-sm animate-pulse">✓ Settings saved!</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">ℹ️ About Data Storage</p>
        <p>
          All your data is stored locally on this device using your browser&apos;s IndexedDB and LocalStorage.
          No data is sent to any server. Use the Backup page to export your data for safekeeping
          or to transfer to another device.
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
