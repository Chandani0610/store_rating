import React, { useState } from 'react';
import { Store, UserPlus, Lock, Mail, MapPin, User, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function SignupView({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Validations based directly on specification:
  // - Name: Min 20 characters, Max 60 characters.
  // - Address: Max 400 characters.
  // - Password: 8-16 characters, must include at least one uppercase letter and one special character.
  // - Email: Must follow standard email validation rules.
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;

  const isFormValid = isNameValid && isEmailValid && isAddressValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please satisfy all form validation criteria before submitting.');
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Normal User Account
            </h1>
            <p className="text-sm text-slate-500">
              Register to explore stores and submit your ratings
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${isNameValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {name.length}/60 (Min 20)
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Benjamin Edward Harrison"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    name.length > 0 && !isNameValid
                      ? 'border-amber-400 focus:ring-amber-500/20 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Must be between 20 and 60 characters</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="benjamin.harrison@gmail.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    email.length > 0 && !isEmailValid
                      ? 'border-amber-400 focus:ring-amber-500/20 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Standard email format (e.g. name@domain.com)</p>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Address <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${address.length > 400 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {address.length}/400
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full residential address (Max 400 characters)"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-16 chars with 1 uppercase & 1 special"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Requirement Indicator Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 block mb-1">Documentation Form Rules:</span>
              <div className={`flex items-center gap-2 ${isNameValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${isNameValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Name: 20 to 60 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${isAddressValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${isAddressValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Address: Up to 400 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${isPasswordLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${isPasswordLengthValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Password: 8 to 16 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Password: At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Password: At least one special character (!@#$%^&*)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-5">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Log in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
