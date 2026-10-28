import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, ArrowRight, UserCheck, ShieldAlert, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('citizen@civicsignal.org');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, redirectPath: string) => {
    setEmail(quickEmail);
    setLoading(true);
    try {
      await login(quickEmail);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to CivicSignal</h2>
          <p className="text-xs text-slate-500 mt-1">Access citizen tracking or municipal dispatch controls</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Demo mode accepts any password</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Test Role Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Role Login
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@civicsignal.org', '/dashboard')}
              className="w-full py-2 px-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-left text-xs flex items-center justify-between text-slate-700 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-900">Citizen: Sarah Jenkins</span>
                <span className="block text-[11px] text-slate-500">citizen@civicsignal.org</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('staff@civicsignal.org', '/staff')}
              className="w-full py-2 px-3 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 rounded-lg text-left text-xs flex items-center justify-between text-slate-700 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-900">Staff: Marcus Vance</span>
                <span className="block text-[11px] text-slate-500">staff@civicsignal.org (Public Works)</span>
              </div>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-medium">Staff</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@civicsignal.org', '/staff/settings')}
              className="w-full py-2 px-3 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-lg text-left text-xs flex items-center justify-between text-slate-700 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-900">Admin: Elena Rostova</span>
                <span className="block text-[11px] text-slate-500">admin@civicsignal.org (City Admin)</span>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register as a Citizen
          </Link>
        </div>
      </div>
    </div>
  );
};
