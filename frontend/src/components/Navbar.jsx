import React from 'react';
import { Store, ShieldCheck, UserCheck, KeyRound, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenPasswordModal }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Administrator
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Store className="w-3.5 h-3.5" />
            Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            Normal User
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                RateSphere
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Platform
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Store Rating & Discovery Portal
            </p>
          </div>
        </div>

        {/* User Profile & Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]" title={user.name}>
                  {user.name}
                </span>
                {getRoleBadge(user.role)}
              </div>
              <span className="text-xs text-slate-500 truncate max-w-[220px]">
                {user.email}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                title="Change your account password"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                title="Log out of the system"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
