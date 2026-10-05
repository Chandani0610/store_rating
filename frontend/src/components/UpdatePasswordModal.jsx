import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function UpdatePasswordModal({ isOpen, onClose, onNotify }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Validation rules according to documentation:
  // Password: 8-16 characters, must include at least one uppercase letter and one special character.
  const hasValidLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const isFormValid = hasValidLength && hasUppercase && hasSpecial && passwordsMatch && currentPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please satisfy all password validation requirements before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.updatePassword(currentPassword, newPassword);
      if (res.success) {
        onNotify('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Update Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Change your login credentials securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (8-16 chars)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Password Requirements:</span>
            <div className={`flex items-center gap-2 ${hasValidLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasValidLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
              <span>8 to 16 characters in length</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
              <span>At least one special character (!@#$%^&*...)</span>
            </div>
            {newPassword.length > 0 && (
              <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500'}`}>
                <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-500' : 'text-rose-400'}`} />
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
