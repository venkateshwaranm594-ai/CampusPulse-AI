import React from 'react';
import { 
  Sparkles, 
  BarChart3, 
  ClipboardCheck, 
  FileImage, 
  History, 
  Settings, 
  Moon, 
  Sun, 
  UserCheck, 
  Building2,
  LogOut
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, setUser, darkMode, setDarkMode, collegeName, cinematicEnabled, setCinematicEnabled }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('principal')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  CampusPulse <span className="gradient-text">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  PRO v2.6
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {collegeName || 'No College Added'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('principal')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'principal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Principal View</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Staff Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('flyer')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'flyer'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30 animate-pulse'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>✨ AI Flyer</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Flyer History</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Manage College</span>
            </button>
          </nav>

          {/* Right Controls: Role Badge, Cinematic Toggle, Dark Mode & User Profile */}
          <div className="flex items-center space-x-2.5">
            
            {/* Cinematic Experience Toggle */}
            <button
              onClick={() => setCinematicEnabled(!cinematicEnabled)}
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all border ${
                cinematicEnabled
                  ? 'bg-indigo-500/10 text-cyan-400 border-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle Cinematic Opening Animation"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cinematic: {cinematicEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* User Profile / Quick Switcher */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                  {user.role.substring(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold capitalize">
                    {user.role} {user.department_code ? `(${user.department_code})` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setUser(null)}
                  className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
                  title="Switch Role / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setUser({ username: 'staff_aids', full_name: 'Dr. M. Karthi', role: 'staff', department_code: 'AI & DS' })}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('principal')}
          className={`flex flex-col items-center p-1 ${activeTab === 'principal' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Principal</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center p-1 ${activeTab === 'attendance' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('flyer')}
          className={`flex flex-col items-center p-1 ${activeTab === 'flyer' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500'}`}
        >
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Flyer</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center p-1 ${activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center p-1 ${activeTab === 'admin' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
        >
          <Settings className="w-5 h-5" />
          <span>Manage</span>
        </button>
      </div>
    </header>
  );
}
