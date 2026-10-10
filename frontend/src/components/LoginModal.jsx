import React, { useState } from 'react';
import { Sparkles, Shield, UserCheck, BarChart3, Key, LogIn } from 'lucide-react';

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('staff_aids');
  const [password, setPassword] = useState('staff123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickRoles = [
    { role: 'staff', name: 'Staff / Faculty', uname: 'staff_aids', pass: 'staff123', desc: 'Mark attendance & generate flyers for AI & DS' },
    { role: 'principal', name: 'Principal / Executive', uname: 'principal', pass: 'principal123', desc: 'College-wide analytics & dept comparisons' },
    { role: 'admin', name: 'System Admin', uname: 'admin', pass: 'admin123', desc: 'Manage departments, sections, advisers & settings' }
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setQuickRole = (r) => {
    setUsername(r.uname);
    setPassword(r.pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6 text-left">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            CampusPulse <span className="gradient-text">AI</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Turn Digital Attendance Into Intelligent Daily Flyers
          </p>
        </div>

        {/* Quick Role Selector Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Quick Persona Login (1-Click Demo Access)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quickRoles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setQuickRole(r)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  username === r.uname
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                }`}
              >
                <p className="text-xs font-black capitalize">{r.role}</p>
                <p className="text-[9px] opacity-80 truncate">{r.uname}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to CampusPulse'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
