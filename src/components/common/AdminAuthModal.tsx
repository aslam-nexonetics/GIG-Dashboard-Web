'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { tokenManager } from '@/services/gigApi';
import { useAuth } from '@/context/AuthContext';
import { Key, Lock, User, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const { login, loginWithToken, logout } = useAuth();

  const [activeMode, setActiveMode] = useState<'credentials' | 'token'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rawToken, setRawToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentToken = tokenManager.getToken();
  const storedUser = tokenManager.getStoredUser();

  const handleLoginWithCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login({ emailOrUsername: username.trim(), password });
      setSuccessMsg('Successfully authenticated with backend!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawToken.trim()) {
      setError('Please paste a valid JWT access token.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await loginWithToken(rawToken.trim());
      setSuccessMsg('Token applied successfully!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired token.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setSuccessMsg('Signed out successfully.');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Authentication & Live Backend Link"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Status card */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connection Status</span>
            {currentToken ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected (Live API)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Not Authenticated
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Target Host:{' '}
            <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px]">
              api3.made2tech.com/api/v1/jobs/GIG
            </code>
          </p>

          {currentToken && storedUser && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Logged in as: <strong className="text-slate-800">{storedUser.username || 'Admin'}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Success or Error alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setActiveMode('credentials');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'credentials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Sign In with Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('token');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'token'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Paste Direct Token
          </button>
        </div>

        {/* Mode 1: Credentials Form */}
        {activeMode === 'credentials' && (
          <form onSubmit={handleLoginWithCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, jibin"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Backend'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Paste JWT Token */}
        {activeMode === 'token' && (
          <form onSubmit={handleSaveToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bearer JWT Access Token
              </label>
              <textarea
                rows={4}
                value={rawToken}
                onChange={(e) => setRawToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste any valid JWT access token generated by the authentication API.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Save & Connect
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
