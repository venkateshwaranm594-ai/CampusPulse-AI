import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  RefreshCw, 
  Building2, 
  Calendar, 
  UserCheck, 
  UserX, 
  Award,
  Layers,
  FileText,
  ShieldCheck,
  GraduationCap,
  Clock,
  Briefcase,
  Users
} from 'lucide-react';

export default function AIFlyerGenerator({ flyerParams, onBackToAttendance }) {
  const [flyerData, setFlyerData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const flyerRef = useRef(null);

  const { sectionId, date } = flyerParams || {};

  useEffect(() => {
    if (sectionId && date) {
      generateFlyer();
    }
  }, [sectionId, date, selectedTheme]);

  const generateFlyer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flyers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: sectionId,
          attendance_date: date,
          theme: selectedTheme
        })
      });

      if (!res.ok) throw new Error('Failed to generate flyer data');
      const data = await res.json();
      setFlyerData(data);

      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      saveFlyerToHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveFlyerToHistory = async (data) => {
    try {
      await fetch('/api/flyers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flyer_date: data.date,
          department_id: data.department.id,
          year_label: data.class_info.year,
          section_id: sectionId,
          adviser_name: data.class_info.adviser_name,
          present_count: data.statistics.present,
          absent_count: data.statistics.absent,
          total_count: data.statistics.total,
          attendance_percentage: data.statistics.percentage,
          theme: selectedTheme,
          quote_used: data.quote,
          generated_by: 'Staff'
        })
      });
    } catch (e) {
      console.error('History save error:', e);
    }
  };

  const downloadImage = async (format = 'png') => {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0F172A',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `Attendance-Flyer-${flyerData.department.code}-${flyerData.class_info.year}-${flyerData.class_info.section}-${flyerData.date}.${format}`;
      link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.98);
      link.click();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadPDF = async () => {
    if (!flyerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true, backgroundColor: '#0F172A' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Attendance-Flyer-${flyerData.department.code}-${flyerData.date}.pdf`);
    } catch (err) {
      alert('PDF generation failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (!flyerRef.current) return;
    try {
      const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } else {
          alert('Clipboard copy is not supported in this browser version.');
        }
      });
    } catch (err) {
      alert('Copy failed: ' + err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-5 p-8 rounded-3xl glass-panel border border-indigo-500/30 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Generating Daily Attendance Flyer
            </h3>
            <p className="text-xs text-amber-400 font-extrabold uppercase tracking-wider mt-1 animate-pulse">
              CampusPulse AI Design Studio
            </p>
          </div>
          <div className="w-full space-y-2 text-left pt-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Fetching Actual Database Attendance Records</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-400 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Formatting Absent & On-Duty Student Tables</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Rendering Institutional Navy/Gold Layout</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!flyerData) {
    return (
      <div className="text-center py-12 glass-panel rounded-2xl">
        <p className="text-rose-500 font-bold">Please select a department & section from Attendance tab first.</p>
        <button onClick={onBackToAttendance} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">
          Go to Attendance Sheet
        </button>
      </div>
    );
  }

  const absentList = flyerData.absent_students || [];
  const onDutyList = flyerData.on_duty_students || [];
  const stats = flyerData.statistics || {};
  const boys = stats.boys || { total: 0, present: 0, absent: 0, on_duty: 0 };
  const girls = stats.girls || { total: 0, present: 0, absent: 0, on_duty: 0 };

  // Theme Styles Dictionary
  const themeStyles = {
    classic: {
      outerBg: 'bg-slate-950 text-slate-900',
      canvasBg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-900 border-4 border-amber-500/80',
      headerBg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b-2 border-amber-400 text-white',
      bannerBg: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-black',
      tableHeaderBg: 'bg-slate-900 text-amber-400 border-b border-amber-500/40',
      cardBg: 'bg-slate-900/90 text-white border border-slate-700',
      badgeGold: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      badgeRed: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      badgeBlue: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      accentColor: 'text-amber-400'
    },
    modern: {
      outerBg: 'bg-slate-950 text-white',
      canvasBg: 'bg-slate-900 text-white border-2 border-indigo-500/50',
      headerBg: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white border-b border-indigo-500/30',
      bannerBg: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold',
      tableHeaderBg: 'bg-indigo-950 text-indigo-300 border-b border-indigo-500/40',
      cardBg: 'bg-slate-950/80 text-white border border-indigo-500/20',
      badgeGold: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30',
      badgeRed: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
      badgeBlue: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
      accentColor: 'text-indigo-400'
    },
    emerald: {
      outerBg: 'bg-emerald-950 text-white',
      canvasBg: 'bg-slate-950 text-white border-2 border-emerald-500/50',
      headerBg: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white border-b border-emerald-500/40',
      bannerBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold',
      tableHeaderBg: 'bg-emerald-950 text-emerald-300 border-b border-emerald-500/40',
      cardBg: 'bg-slate-900/90 text-white border border-emerald-500/20',
      badgeGold: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
      badgeRed: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
      badgeBlue: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
      accentColor: 'text-emerald-400'
    }
  };

  const activeTheme = themeStyles[selectedTheme] || themeStyles.classic;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Controls Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              College Daily Attendance Flyer Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional publication-grade daily report for {flyerData.department.name} ({flyerData.class_info.year} - {flyerData.class_info.section})
          </p>
        </div>

        {/* Theme & Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Palette className="w-4 h-4 text-amber-500" />
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="classic">Institutional Navy & Gold (Reference Design)</option>
              <option value="modern">Modern Indigo & Cyan</option>
              <option value="emerald">Emerald Academic</option>
            </select>
          </div>

          <button
            onClick={generateFlyer}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Refresh Flyer Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => downloadImage('png')}
          disabled={exporting}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/30 transition-all transform hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Download High-Res PNG</span>
        </button>

        <button
          onClick={() => downloadImage('jpg')}
          disabled={exporting}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Download JPG</span>
        </button>

        <button
          onClick={downloadPDF}
          disabled={exporting}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105"
        >
          <FileText className="w-4 h-4" />
          <span>Download PDF Document</span>
        </button>

        <button
          onClick={copyImageToClipboard}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-lg transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
        </button>
      </div>

      {/* FLYER CANVAS (Renders reference-inspired institutional layout) */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div
          ref={flyerRef}
          className={`w-[850px] min-h-[1100px] p-6 rounded-2xl ${activeTheme.canvasBg} shadow-2xl relative flex flex-col justify-between overflow-hidden`}
          style={{ fontFamily: 'Inter, Georgia, sans-serif' }}
        >
          
          {/* HEADER SECTION: COLLEGE LOGO, COLLEGE NAME, DEPARTMENT, CLASS */}
          <div className="relative z-10">
            <div className={`p-5 rounded-xl ${activeTheme.headerBg} flex items-center justify-between shadow-xl relative overflow-hidden`}>
              
              {/* College Logo & Name */}
              <div className="flex items-center space-x-4">
                {flyerData.college.logo_url ? (
                  <img
                    src={flyerData.college.logo_url}
                    alt="College Crest"
                    className="w-20 h-20 rounded-xl object-contain bg-white p-1 border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-amber-400" />
                    </div>
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white uppercase font-serif">
                    {flyerData.college.name}
                  </h1>
                  <p className="text-xs font-bold tracking-widest text-amber-400 uppercase mt-0.5">
                    {flyerData.department.name}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-300 mt-0.5 flex items-center space-x-2">
                    <span>Academic Year: {flyerData.class_info.academic_year || '2026-2027'}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-extrabold">{flyerData.class_info.year} - SECTION {flyerData.class_info.section}</span>
                  </p>
                </div>
              </div>

              {/* Date & Title Badge */}
              <div className="text-right border-l border-amber-500/30 pl-4">
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase mb-1 shadow">
                  DAILY ATTENDANCE
                </div>
                <p className="text-xs font-bold text-slate-200 flex items-center justify-end">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {flyerData.date}
                </p>
              </div>
            </div>

            {/* GOLDEN STRIP BANNER */}
            <div className={`mt-2 py-1.5 px-4 rounded-lg ${activeTheme.bannerBg} text-center text-xs tracking-wider uppercase shadow flex items-center justify-between`}>
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-4 h-4 inline" />
                <span>OFFICIAL CLASS ATTENDANCE BULLETIN</span>
              </span>
              <span>DEPT CODE: {flyerData.department.code}</span>
            </div>
          </div>

          {/* STATISTICS GRID CARD */}
          <div className="relative z-10 my-4">
            <div className="bg-slate-900/90 rounded-xl border-2 border-amber-500/40 p-4 text-white shadow-xl">
              
              {/* Overall Totals Header */}
              <div className="grid grid-cols-4 gap-3 text-center pb-3 border-b border-slate-700/80">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Strength</p>
                  <p className="text-xl font-black text-amber-400 mt-0.5">{stats.total}</p>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <p className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">Total Present</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{stats.present}</p>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <p className="text-[10px] uppercase font-extrabold text-rose-400 tracking-wider">Total Absent</p>
                  <p className="text-xl font-black text-rose-400 mt-0.5">{stats.absent}</p>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <p className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-wider">Attendance %</p>
                  <p className="text-xl font-black text-cyan-300 mt-0.5">{stats.percentage}%</p>
                </div>
              </div>

              {/* Boys & Girls Detailed Table Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                
                {/* Boys Stats */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-indigo-500/30">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-extrabold text-indigo-300">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1" /> BOYS (Total: {boys.total})
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">
                      P: {boys.present} | A: {boys.absent} | OD: {boys.on_duty}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-center mt-2 text-[11px] font-bold">
                    <div className="text-emerald-400">Present: {boys.present}</div>
                    <div className="text-rose-400">Absent: {boys.absent}</div>
                    <div className="text-cyan-400">OD: {boys.on_duty}</div>
                  </div>
                </div>

                {/* Girls Stats */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-extrabold text-purple-300">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1" /> GIRLS (Total: {girls.total})
                    </span>
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">
                      P: {girls.present} | A: {girls.absent} | OD: {girls.on_duty}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-center mt-2 text-[11px] font-bold">
                    <div className="text-emerald-400">Present: {girls.present}</div>
                    <div className="text-rose-400">Absent: {girls.absent}</div>
                    <div className="text-cyan-400">OD: {girls.on_duty}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ABSENT STUDENTS TABLE SECTION */}
          <div className="relative z-10 my-2">
            <div className="flex items-center justify-between bg-rose-950/90 border border-rose-500/40 px-4 py-2 rounded-t-xl text-rose-300 font-extrabold text-xs">
              <span className="flex items-center">
                <UserX className="w-4 h-4 mr-1.5 text-rose-400" />
                ABSENT STUDENTS ROSTER ({absentList.length})
              </span>
              <span className="text-[11px] text-rose-300/80">List of students absent today</span>
            </div>

            {absentList.length === 0 ? (
              <div className="bg-slate-900/90 border border-emerald-500/40 p-6 text-center rounded-b-xl text-emerald-300">
                <Award className="w-10 h-10 mx-auto mb-2 text-emerald-400 animate-bounce" />
                <p className="text-base font-black">100% PERFECT ATTENDANCE TODAY!</p>
                <p className="text-xs text-slate-400 mt-0.5">No students are recorded absent for this session.</p>
              </div>
            ) : (
              <div className="bg-slate-900/90 border-x border-b border-rose-500/30 rounded-b-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950/90 text-amber-400 font-extrabold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-center w-12">S.No</th>
                      <th className="py-2 px-3 w-28">Roll No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Absence Reason</th>
                      <th className="py-2 px-3 text-center w-28">Informed</th>
                      <th className="py-2 px-3 text-center w-28">Residence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-[11px]">
                    {absentList.map((st, idx) => (
                      <tr key={st.id || idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">{st.s_no || idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-300">{st.roll_number}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-2.5">
                            {st.photo_url ? (
                              <img
                                src={st.photo_url}
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover border border-rose-500/50 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-500/50 flex items-center justify-center text-[10px] font-black text-rose-300 shrink-0">
                                {getInitials(st.name)}
                              </div>
                            )}
                            <span className="font-extrabold text-white">{st.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-rose-300 font-semibold">{st.reason}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${st.informed === 'Informed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                            {st.informed}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                            {st.scholar_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ON-DUTY (OD) STUDENTS TABLE SECTION */}
          {onDutyList.length > 0 && (
            <div className="relative z-10 my-2">
              <div className="flex items-center justify-between bg-cyan-950/90 border border-cyan-500/40 px-4 py-2 rounded-t-xl text-cyan-300 font-extrabold text-xs">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1.5 text-cyan-400" />
                  ON-DUTY (OD) STUDENTS ROSTER ({onDutyList.length})
                </span>
                <span className="text-[11px] text-cyan-300/80">Approved College/Academic Duty</span>
              </div>

              <div className="bg-slate-900/90 border-x border-b border-cyan-500/30 rounded-b-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950/90 text-cyan-300 font-extrabold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-center w-12">S.No</th>
                      <th className="py-2 px-3 w-28">Roll No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">OD Event / Activity Details</th>
                      <th className="py-2 px-3 text-center w-28">Residence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-[11px]">
                    {onDutyList.map((st, idx) => (
                      <tr key={st.id || idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">{st.s_no || idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-cyan-300">{st.roll_number}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-2.5">
                            {st.photo_url ? (
                              <img
                                src={st.photo_url}
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover border border-cyan-500/50 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[10px] font-black text-cyan-300 shrink-0">
                                {getInitials(st.name)}
                              </div>
                            )}
                            <span className="font-extrabold text-white">{st.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-cyan-300 font-semibold">{st.reason}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                            {st.scholar_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FOOTER SECTION: ADVISER SIGNATURE & MOTIVATIONAL QUOTE */}
          <div className="relative z-10 mt-4 border-t-2 border-amber-500/40 pt-4">
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-xl flex items-center justify-between">
              
              {/* Class Adviser Info & Photo */}
              <div className="flex items-center space-x-3.5">
                {flyerData.class_info.adviser_photo ? (
                  <img
                    src={flyerData.class_info.adviser_photo}
                    alt={flyerData.class_info.adviser_name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-base">
                    {getInitials(flyerData.class_info.adviser_name)}
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Class Adviser</p>
                  <h4 className="text-sm font-black text-white">{flyerData.class_info.adviser_name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{flyerData.class_info.adviser_designation || 'Faculty In-Charge'}</p>
                </div>
              </div>

              {/* Motivational Quote & Branding */}
              <div className="text-right max-w-xs pl-4 border-l border-slate-800">
                <p className="text-xs italic font-medium text-slate-200">
                  "{flyerData.quote}"
                </p>
                <div className="mt-1 flex items-center justify-end space-x-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Verified by CampusPulse AI</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

