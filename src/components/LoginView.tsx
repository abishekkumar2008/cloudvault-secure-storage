import React, { useState } from 'react';
import { Cloud, Lock, Mail, Shield, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('sarah.j@enterprise.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer' | 'user'>('user');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(name, email, password, role, department || 'Operations');
        onLoginSuccess(res.user, res.token);
      } else {
        const res = await api.login(email, password);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setError(null);
    setLoading(true);
    try {
      const res = await api.switchUser(undefined, demoEmail);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 rounded-2xl shadow-2xl border border-white/10 p-8 backdrop-blur-xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4 border border-indigo-400/30">
            <Cloud className="w-8 h-8 fill-white/20 stroke-white stroke-[2.3]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">CloudVault</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister
              ? 'Create your enterprise vault account.'
              : 'Sign in to access your secure storage.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {forgotSent && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>Password reset instructions sent to your email.</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reg-role">
                    Role (RBAC)
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user" className="bg-slate-900 text-slate-100">Standard User</option>
                    <option value="editor" className="bg-slate-900 text-slate-100">Editor</option>
                    <option value="viewer" className="bg-slate-900 text-slate-100">Viewer</option>
                    <option value="admin" className="bg-slate-900 text-slate-100">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reg-dept">
                    Department
                  </label>
                  <input
                    id="reg-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                    className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                Password
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <span>Create CloudVault Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-5 text-xs text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-indigo-400 font-semibold hover:underline ml-1"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New to CloudVault?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-indigo-400 font-semibold hover:underline ml-1"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        {/* Quick Demo Profiles Selector */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick One-Click Demo Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('kcabishiekkumar@gmail.com')}
              className="p-2.5 text-left bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 border border-white/10 rounded-xl transition-all group backdrop-blur-xs"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                Abishek Kumar
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Master Admin</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('bothanapriyabothana@gmail.com')}
              className="p-2.5 text-left bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 border border-white/10 rounded-xl transition-all group backdrop-blur-xs"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                BOTHANA
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Administrator</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya.sharma@enterprise.com')}
              className="p-2.5 text-left bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 border border-white/10 rounded-xl transition-all group backdrop-blur-xs"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                Priya Sharma
              </div>
              <div className="text-[10px] text-amber-400 font-medium">Administrator</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul.kumar@enterprise.com')}
              className="p-2.5 text-left bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 border border-white/10 rounded-xl transition-all group backdrop-blur-xs"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                Rahul Kumar
              </div>
              <div className="text-[10px] text-indigo-400 font-medium">Editor Role</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  );
};
