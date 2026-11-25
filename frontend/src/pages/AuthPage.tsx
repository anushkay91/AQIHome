import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { api, ApiError } from '../api';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, startGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ email, password, full_name: fullName });
        await login(res.access_token, res.user);
        navigate('/household/setup');
      } else {
        const res = await api.login({ email, password });
        await login(res.access_token, res.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Authentication failed. Please verify your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await startGuestMode();
      navigate('/dashboard');
    } catch {
      setError('Could not start demo session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-clean-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Create Your Household Account' : 'Sign in to GharKaGod'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="font-medium text-clean-700 hover:text-clean-800 underline focus-ring rounded"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="full-name">
                  Household Display Name / Pseudonym
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sharma Family"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus-ring text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email-address">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus-ring text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password {isRegister && <span className="text-xs text-slate-500 font-normal">(min 8 characters)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus-ring text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-clean-600 hover:bg-clean-700 focus-ring disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : (isRegister ? 'Register Household' : 'Sign In')}
            </button>
          </form>

          {/* Guest Demo Bypass */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleGuestDemo}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-amber-300 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition focus-ring"
            >
              <span>Instant Guest Demo (No signup)</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Explore all 3 modules with preloaded demo data and live AQI.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
