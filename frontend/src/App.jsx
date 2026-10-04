import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import AdminDashboardView from './views/AdminDashboardView';
import NormalUserView from './views/NormalUserView';
import StoreOwnerView from './views/StoreOwnerView';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [initializing, setInitializing] = useState(true);
  const [toast, setToast] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Restore authenticated session on page refresh
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (err) {
          console.error('Session check error:', err);
        }
      }
      setInitializing(false);
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    showToast(`Welcome to RateSphere, ${userData.name}! Your account has been created.`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('login');
    showToast('You have been logged out successfully.', 'success');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <span className="text-sm text-slate-500 font-sans ml-2">Loading RateSphere...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
      />

      <main className="flex-1">
        {!user ? (
          authView === 'login' ? (
            <LoginView
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setAuthView('signup')}
            />
          ) : (
            <SignupView
              onSignupSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )
        ) : (
          <>
            {user.role === 'ADMIN' && (
              <AdminDashboardView onNotify={showToast} />
            )}
            {user.role === 'USER' && (
              <NormalUserView onNotify={showToast} />
            )}
            {user.role === 'STORE_OWNER' && (
              <StoreOwnerView user={user} onNotify={showToast} />
            )}
          </>
        )}
      </main>

      {/* Global Password Update Modal */}
      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onNotify={showToast}
      />

      {/* Global Toast Alerts */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
