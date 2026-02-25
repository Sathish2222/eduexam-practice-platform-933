import React, { useState } from 'react';
import { getSettings } from '../utils/storage';

/**
 * PIN dialog for admin authentication.
 */
// PUBLIC_INTERFACE
/**
 * Modal dialog for entering admin PIN.
 * @param {{ onSuccess: Function, onCancel: Function }} props
 * @returns {JSX.Element}
 */
function PinDialog({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const settings = getSettings();
    if (pin === settings.adminPin) {
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-bold text-primary mb-4">🔒 Admin Access</h2>
        <p className="text-sm text-secondary mb-4">Enter the admin PIN to continue.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            placeholder="Enter PIN"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-center text-xl tracking-widest"
            autoFocus
            maxLength={10}
          />
          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pin}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PinDialog;
