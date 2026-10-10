import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Save, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Calendar,
  Building2,
  Users,
  ChevronDown
} from 'lucide-react';

export default function StaffAttendance({ onGenerateFlyer, currentUser }) {
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);

  // Form selections
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedYear, setSelectedYear] = useState('2nd Year');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Sheet state
  const [students, setStudents] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Save status toast message
  const [toastMessage, setToastMessage] = useState(null);

  const absenceReasons = [
    'Fever',
    'Medical',
    'Personal Issues',
    'On Duty',
    'Family Reason',
    'Emergency',
    'Other'
  ];

  // Fetch initial departments and sections
  useEffect(() => {
    fetch('/api/departments')
      .then(r => r.json())
      .then(data => {
        setDepartments(data || []);
        if (data && data.length > 0) {
          // If staff has assigned department, preselect it
          const defaultDept = currentUser?.department_id 
            ? data.find(d => d.id === currentUser.department_id) || data[0]
            : data[0];
          setSelectedDeptId(defaultDept.id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch sections when department or year changes
  useEffect(() => {
    if (!selectedDeptId) return;
    fetch(`/api/sections?department_id=${selectedDeptId}&year_label=${encodeURIComponent(selectedYear)}`)
      .then(r => r.json())
      .then(secData => {
        setSections(secData || []);
        if (secData && secData.length > 0) {
          setSelectedSectionId(secData[0].id);
        } else {
          setSelectedSectionId('');
          setStudents([]);
          setSummary(null);
        }
      })
      .catch(console.error);
  }, [selectedDeptId, selectedYear]);

  // Fetch attendance sheet when section or date changes
  useEffect(() => {
    if (!selectedSectionId || !selectedDate) return;
    loadAttendanceSheet();
  }, [selectedSectionId, selectedDate]);

  const loadAttendanceSheet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?section_id=${selectedSectionId}&attendance_date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setSectionInfo(data.section);
      setSummary(data.summary);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          attendance_status: newStatus,
          absence_reason: newStatus === 'Absent' ? (s.absence_reason || 'Personal Issues') : null
        };
      }
      return s;
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, absence_reason: reason };
      }
      return s;
    }));
  };

  const handleCustomReasonChange = (studentId, customReason) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, custom_reason: customReason };
      }
      return s;
    }));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({
      ...s,
      attendance_status: status,
      absence_reason: status === 'Absent' ? (s.absence_reason || 'Personal Issues') : null
    })));
  };

  const saveAttendance = async () => {
    if (!selectedSectionId || !selectedDate) return;

    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: s.attendance_status,
        reason: s.absence_reason,
        custom_reason: s.custom_reason
      }));

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: selectedSectionId,
          attendance_date: selectedDate,
          records,
          marked_by: currentUser?.full_name || 'Staff'
        })
      });

      if (!res.ok) throw new Error('Failed to save attendance');
      
      const presentCount = students.filter(s => s.attendance_status === 'Present').length;
      const absentCount = students.filter(s => s.attendance_status !== 'Present').length;
      const secObj = sections.find(s => String(s.id) === String(selectedSectionId));

      setToastMessage({
        date: selectedDate,
        deptCode: secObj?.department_code || 'Dept',
        year: selectedYear,
        sectionName: secObj?.section_name || 'Section',
        present: presentCount,
        absent: absentCount
      });
      setTimeout(() => setToastMessage(null), 4500);

      // Reload updated sheet & summary
      loadAttendanceSheet();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtered students list
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.register_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
    const matchesStatus = statusFilter === 'ALL' || s.attendance_status === statusFilter;

    return matchesSearch && matchesGender && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400/40 text-xs space-y-1 animate-bounce">
          <div className="flex items-center space-x-1.5 font-black text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>✓ Attendance Saved Successfully</span>
          </div>
          <p className="font-extrabold text-emerald-100">
            {toastMessage.date} • {toastMessage.deptCode} {toastMessage.year} ({toastMessage.sectionName})
          </p>
          <div className="flex space-x-3 pt-1 text-[11px] font-bold">
            <span className="bg-emerald-800 px-2 py-0.5 rounded-md text-emerald-200">Present: {toastMessage.present}</span>
            <span className="bg-rose-900/80 px-2 py-0.5 rounded-md text-rose-200">Absent: {toastMessage.absent}</span>
          </div>
        </div>
      )}

      {/* Header Selector Control Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Daily Attendance Portal
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select department, section, date, and mark official student presence.
            </p>
          </div>

          {/* ✨ ONE-CLICK AI FLYER GENERATOR BUTTON */}
          <button
            onClick={() => onGenerateFlyer({ sectionId: selectedSectionId, date: selectedDate })}
            disabled={!selectedSectionId || students.length === 0}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" />
            <span>✨ Generate Today's AI Flyer</span>
          </button>
        </div>

        {/* 4-Step Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Dept Dropdown */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Department
            </label>
            <div className="relative">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Academic Year Dropdown */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Academic Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none appearance-none cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Section Dropdown */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Section
            </label>
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={sections.length === 0}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none appearance-none cursor-pointer disabled:opacity-50"
              >
                {sections.length > 0 ? (
                  sections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.section_name} {s.adviser_name ? `(${s.adviser_name})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No sections available</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Summary Bar & Gender Breakdown */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Class Total</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.total_students}</p>
            </div>
            <Users className="w-7 h-7 text-indigo-500 opacity-80" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Present</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.present} ({summary.attendance_percentage}%)</p>
            </div>
            <UserCheck className="w-7 h-7 text-emerald-500" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-500 uppercase">Absent</p>
              <p className="text-2xl font-black text-rose-500">{summary.absent}</p>
            </div>
            <UserX className="w-7 h-7 text-rose-500" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs font-bold">
            <div>
              <span className="text-blue-500 block">♂ Boys</span>
              <span className="text-slate-800 dark:text-white text-sm">{summary.boys.present} P / {summary.boys.absent} A</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <span className="text-pink-500 block">♀ Girls</span>
              <span className="text-slate-800 dark:text-white text-sm">{summary.girls.present} P / {summary.girls.absent} A</span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Boys Only</option>
            <option value="Female">Girls Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
          </select>

          {/* Quick Mark All Buttons */}
          <button
            onClick={() => markAll('Present')}
            className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
          >
            All Present
          </button>
          <button
            onClick={() => markAll('Absent')}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            All Absent
          </button>
        </div>

      </div>

      {/* Student Rows Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse font-semibold">
            Loading student roster...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-semibold">
            No students found matching current criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map((st) => {
              const isPresent = st.attendance_status === 'Present';
              return (
                <div
                  key={st.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !isPresent ? 'bg-rose-500/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Left: Photo + Name + Roll */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={st.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`}
                      alt={st.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {st.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          st.gender === 'Male' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'
                        }`}>
                          {st.gender}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 font-mono">
                        Roll: {st.roll_number} | Reg: {st.register_number}
                      </p>
                    </div>
                  </div>

                  {/* Right: Toggle Present/Absent & Reason Selector */}
                  <div className="flex items-center space-x-3">
                    
                    {/* Status Toggle Buttons */}
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => handleStatusChange(st.id, 'Present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        PRESENT
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'Absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
                          !isPresent
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        ABSENT
                      </button>
                    </div>

                    {/* Absence Reason Select if Absent */}
                    {!isPresent && (
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <select
                          value={st.absence_reason || 'Personal Issues'}
                          onChange={(e) => handleReasonChange(st.id, e.target.value)}
                          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none"
                        >
                          {absenceReasons.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>

                        {st.absence_reason === 'Other' && (
                          <input
                            type="text"
                            placeholder="Specify custom reason..."
                            value={st.custom_reason || ''}
                            onChange={(e) => handleCustomReasonChange(st.id, e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-white px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700"
                          />
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Save Button */}
      <div className="sticky bottom-6 flex justify-end z-30">
        <button
          onClick={saveAttendance}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-2xl shadow-emerald-600/40 transition-all transform hover:scale-105"
        >
          <Save className="w-5 h-5" />
          <span>Save Official Attendance</span>
        </button>
      </div>

    </div>
  );
}
