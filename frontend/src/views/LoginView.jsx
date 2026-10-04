import React, { useState } from 'react';
import { Store, LogIn, Lock, Mail, AlertCircle, Sparkles, User, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function LoginView({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Unable to reach server. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@storerating.com');
      setPassword('Admin@12345');
    } else if (role === 'owner') {
      setEmail('alex.organic@stores.com');
      setPassword('Owner@12345');
    } else if (role === 'user') {
      setEmail('benjamin.harrison@gmail.com');
      setPassword('User@123456');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
          {/* Logo & Headline */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to Platform
            </h1>
            <p className="text-sm text-slate-500">
              Single login for System Administrators, Normal Users, & Store Owners
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-5">
            New user?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Sign up for a normal user account
            </button>
          </div>
        </div>

        {/* Quick Demo Credentials Autofill Helper */}
        <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-all flex flex-col items-center"
            >
              <span className="font-semibold">Admin</span>
              <span className="text-[10px] text-slate-400">admin@</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('owner')}
              className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-all flex flex-col items-center"
            >
              <span className="font-semibold">Store Owner</span>
              <span className="text-[10px] text-slate-400">alex.organic@</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('user')}
              className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-all flex flex-col items-center"
            >
              <span className="font-semibold">Normal User</span>
              <span className="text-[10px] text-slate-400">benjamin@</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
