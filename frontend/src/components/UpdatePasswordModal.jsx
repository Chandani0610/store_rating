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
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Update Password</h3>
              <p className="text-xs text-slate-500">Change your login credentials securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (8-16 chars)"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Validation Checklist according to requirements */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <span className="font-semibold text-slate-700 block mb-1">Validation Requirements:</span>
            <div className={`flex items-center gap-2 ${hasValidLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasValidLength ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>8 to 16 characters in length</span>
            </div>
            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>At least one special character (!@#$%^&*...)</span>
            </div>
            {newPassword.length > 0 && (
              <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600'}`}>
                <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-400'}`} />
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
