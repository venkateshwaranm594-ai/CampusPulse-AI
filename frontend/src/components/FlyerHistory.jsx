import React, { useState, useEffect } from 'react';
import { History, Calendar, Building2, Download, Eye, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function FlyerHistory({ onOpenFlyer }) {
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(data => setDepartments(data || []))
      .catch(console.error);

    loadHistory();
  }, [selectedDeptId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = selectedDeptId ? `/api/flyers/history?department_id=${selectedDeptId}` : '/api/flyers/history';
      const res = await fetch(url);
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Filter */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Generated Flyer Archive
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, reopen, and export historical daily attendance flyers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>

          <button
            onClick={loadHistory}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Stored Flyers */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-semibold animate-pulse">
          Retrieving flyer repository...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl text-slate-500 font-semibold">
          No generated flyers found in history archive.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                  {item.department_code} • {item.year_label} ({item.section_name})
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {item.flyer_date}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">TOTAL</span>
                  <span className="font-extrabold text-slate-800 dark:text-white text-base">{item.total_count}</span>
                </div>
                <div>
                  <span className="text-emerald-500 block font-bold text-[10px]">PRESENT</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{item.present_count}</span>
                </div>
                <div>
                  <span className="text-rose-500 block font-bold text-[10px]">ABSENT</span>
                  <span className="font-extrabold text-rose-500 text-base">{item.absent_count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-cyan-500">
                  {item.attendance_percentage}% Attendance
                </span>

                <button
                  onClick={() => onOpenFlyer({ sectionId: item.section_id, date: item.flyer_date })}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Re-open</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
