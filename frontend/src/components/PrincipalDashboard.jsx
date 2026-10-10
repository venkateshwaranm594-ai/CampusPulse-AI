import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Building2, 
  Award, 
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function PrincipalDashboard({ onSelectSectionForFlyer }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState('');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resAnal, resIns, resTrend] = await Promise.all([
        fetch(`/api/analytics/principal?date=${selectedDate}`).then(r => r.json()),
        fetch(`/api/analytics/insights?date=${selectedDate}`).then(r => r.json()),
        fetch('/api/analytics/trends').then(r => r.json())
      ]);

      setAnalytics(resAnal);
      setInsights(resIns.insight || '');
      setTrends(resTrend || []);
    } catch (err) {
      console.error('Failed to fetch principal analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold animate-pulse">
            Analyzing College-wide Intelligence...
          </p>
        </div>
      </div>
    );
  }

  const overall = analytics?.overall || { total: 0, present: 0, absent: 0, attendance_percentage: 0 };
  const highlights = analytics?.highlights || {};
  const departments = analytics?.departments || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner & Date Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Principal Executive Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time digital attendance analytics & gender intelligence across all departments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none"
            />
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
            title="Refresh Intelligence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Smart Insight Alert Banner */}
      {insights && (
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-indigo-900/90 via-slate-900 to-purple-900 border border-indigo-500/30 text-white shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-40 h-40 text-cyan-400" />
          </div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-cyan-400 shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
                  CampusPulse AI Insight Engine
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
                  Live Analysis
                </span>
              </div>
              <p className="text-base font-semibold mt-1 text-slate-100 leading-relaxed">
                {insights}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall College Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Total Enrolled</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {overall.total.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1" />
            All academic years & sections
          </p>
        </div>

        {/* Present Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Present Today</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {overall.present.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {overall.attendance_percentage}% Attendance Rate
            </span>
          </div>
        </div>

        {/* Absent Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-rose-500">Absent Today</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {overall.absent.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Automated flyers ready for generation
          </p>
        </div>

        {/* Overall Percentage Progress */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-indigo-500">College Attendance</p>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {overall.attendance_percentage}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overall.attendance_percentage, 100)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* College Highlights Banner */}
      {highlights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Highest Attendance</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {highlights.highest_attendance?.code || 'N/A'} ({highlights.highest_attendance?.pct || 0}%)
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Lowest Attendance</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {highlights.lowest_attendance?.code || 'N/A'} ({highlights.lowest_attendance?.pct || 0}%)
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-500">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Highest Absences</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {highlights.highest_absence?.code || 'N/A'} ({highlights.highest_absence?.absent || 0} Absents)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gender-wise Attendance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Boys Analytics Card */}
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 shadow-lg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center">
                ♂
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Boys Attendance Intelligence
                </h3>
                <p className="text-xs text-slate-500">Male cohort metrics across all departments</p>
              </div>
            </div>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {overall.boys?.percentage || 0}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Boys</p>
              <p className="text-lg font-black text-slate-800 dark:text-white mt-1">
                {overall.boys?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-500 uppercase">Present</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {overall.boys?.present || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-500 uppercase">Absent</p>
              <p className="text-lg font-black text-rose-500 mt-1">
                {overall.boys?.absent || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Girls Analytics Card */}
        <div className="glass-panel p-6 rounded-2xl border border-pink-500/20 shadow-lg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-500 font-bold flex items-center justify-center">
                ♀
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Girls Attendance Intelligence
                </h3>
                <p className="text-xs text-slate-500">Female cohort metrics across all departments</p>
              </div>
            </div>
            <span className="text-xl font-black text-pink-600 dark:text-pink-400">
              {overall.girls?.percentage || 0}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Girls</p>
              <p className="text-lg font-black text-slate-800 dark:text-white mt-1">
                {overall.girls?.total || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-500 uppercase">Present</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {overall.girls?.present || 0}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-500 uppercase">Absent</p>
              <p className="text-lg font-black text-rose-500 mt-1">
                {overall.girls?.absent || 0}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Department Breakdown Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
            Department Breakdown & Gender Statistics
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {departments.length} Active Departments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={`glass-panel p-5 rounded-2xl border transition-all hover:scale-[1.02] shadow-md ${
                dept.is_below_threshold
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                  {dept.code}
                </span>
                {dept.is_below_threshold && (
                  <span className="flex items-center text-[10px] font-bold bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Alert
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate" title={dept.name}>
                {dept.name}
              </h4>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {dept.attendance_percentage}%
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {dept.present} / {dept.total} Present
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${dept.attendance_percentage < 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${dept.attendance_percentage}%` }}
                ></div>
              </div>

              {/* Boys / Girls Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center">♂ Boys:</span>
                  <span className="font-bold">{dept.boys.present} P / {dept.boys.absent} A ({dept.boys.percentage}%)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center">♀ Girls:</span>
                  <span className="font-bold">{dept.girls.present} P / {dept.girls.absent} A ({dept.girls.percentage}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Attendance Trend Line Visualizer */}
      {trends.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              7-Day College Attendance Velocity Trend
            </h3>
            <span className="text-xs text-slate-500">Historical Tracking</span>
          </div>

          <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-slate-200 dark:border-slate-700 pb-2">
            {trends.map((t, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center space-y-2 group">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.percentage}%
                </span>
                <div className="w-full bg-indigo-500/10 rounded-t-xl overflow-hidden h-28 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-xl transition-all duration-700 group-hover:brightness-125"
                    style={{ height: `${t.percentage}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[50px]">
                  {t.date.substring(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
