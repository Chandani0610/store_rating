import React from 'react';
import { Store, ShieldCheck, UserCheck, KeyRound, LogOut, Sun, Moon, Sparkles } from 'lucide-react';

export default function Navbar({ user, theme, onToggleTheme, onLogout, onOpenPasswordModal }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
            System Administrator
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
            <Store className="w-3.5 h-3.5 text-emerald-500" />
            Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-xs">
            <UserCheck className="w-3.5 h-3.5 text-sky-500" />
            Normal User
          </span>
        );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
                RateSphere
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Store Rating & Discovery Portal
            </p>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:scale-105 active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {user && (
            <>
              {/* User Info (Desktop) */}
              <div className="hidden md:flex items-center gap-3 pl-2 pr-1 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={user.name}>
                      {user.name}
                    </span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pl-2">
                <button
                  type="button"
                  onClick={onOpenPasswordModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 active:scale-95"
                  title="Change your account password"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="hidden sm:inline">Password</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-all border border-rose-200 dark:border-rose-900/50 active:scale-95"
                  title="Log out of the system"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
