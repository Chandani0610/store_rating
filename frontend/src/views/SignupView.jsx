import React, { useState } from 'react';
import { UserPlus, Lock, Mail, MapPin, User, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function SignupView({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict specification validations
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;

  // Strength score
  let strengthScore = 0;
  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (hasUppercase) strengthScore++;
  if (hasSpecial) strengthScore++;

  const isFormValid = isNameValid && isEmailValid && isAddressValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fulfill all validation rules before proceeding.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
      });

      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        onSignupSuccess(res.user);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error with the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gradient-to-tr from-violet-600/15 via-indigo-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-10 transition-colors">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Normal User Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Register to rate local stores and share authentic experiences
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${isNameValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  {name.length}/60 (Min 20 chars)
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name (20 to 60 characters)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Address <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${isAddressValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  {address.length}/400
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter postal address (Max 400 characters)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                {password.length > 0 && (
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Strength: {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Good' : 'Strong'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 to 16 chars with 1 uppercase & 1 special"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength visual meter */}
              {password.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 1 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                </div>
              )}
            </div>

            {/* Live Requirement Checklist */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password Criteria (Strict):
              </span>
              <div className={`flex items-center gap-2 ${isPasswordLengthValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${isPasswordLengthValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>8 to 16 characters in length</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-5">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
