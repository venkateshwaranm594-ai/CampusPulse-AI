import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Quote, 
  CheckCircle, 
  Layers, 
  Upload, 
  Save,
  Search,
  UserCheck,
  GraduationCap,
  X,
  FileText,
  History,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ClipboardCheck,
  Calendar,
  Eye
} from 'lucide-react';

const POPULAR_COLLEGES = [
  'Erode Sengunthar Engineering College',
  'Erode Institute of Technology',
  'Velalar College of Engineering and Technology',
  'Kongu Engineering College',
  'Bannari Amman Institute of Technology',
  'PSG College of Technology',
  'Coimbatore Institute of Technology',
  'Kumaraguru College of Technology',
  'SRM Institute of Science and Technology',
  'Vellore Institute of Technology (VIT)',
  'Anna University, Chennai',
  'Madras Institute of Technology',
  'Indian Institute of Technology Madras (IIT Madras)',
  'Government College of Technology, Coimbatore',
  'SSN College of Engineering',
  'SASTRA Deemed University',
  'Thiagarajar College of Engineering',
  'Mepco Schlenk Engineering College',
  'National Institute of Technology, Tiruchirappalli (NITT)',
  'Amrita Vishwa Vidyapeetham',
  'Rajalakshmi Engineering College',
  'St. Joseph\'s College of Engineering',
  'KPR Institute of Engineering and Technology',
  'Sri Sivasubramaniya Nadar College of Engineering',
  'Hindustan Institute of Technology and Science'
];

export default function AdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState('settings');

  // College Settings state
  const [settings, setSettings] = useState({
    college_name: '',
    logo_url: '',
    address: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    academic_year: '2026-2027',
    principal_name: '',
    alert_threshold: 85.0
  });

  // College Auto-Suggest state
  const [collegeQuery, setCollegeQuery] = useState('');
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [collegeLogoPreview, setCollegeLogoPreview] = useState('');

  // Data lists
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [advisers, setAdvisers] = useState([]);
  const [students, setStudents] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [flyerHistory, setFlyerHistory] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Toast & Modals
  const [toast, setToast] = useState(null);

  // Add/Edit Department State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', hod_name: '', logo_url: '' });

  // Add/Edit Section State
  const [secModalOpen, setSecModalOpen] = useState(false);
  const [editingSec, setEditingSec] = useState(null);
  const [secForm, setSecForm] = useState({ department_id: '', year_label: '1st Year', section_name: 'A', academic_year: '2026-2027', adviser_id: '' });

  // Add/Edit Adviser State
  const [advModalOpen, setAdvModalOpen] = useState(false);
  const [editingAdv, setEditingAdv] = useState(null);
  const [advForm, setAdvForm] = useState({
    name: '', email: '', phone: '', designation: 'Assistant Professor',
    department_id: '', year_label: '1st Year', section_id: '', photo_url: ''
  });
  const [advPhotoPreview, setAdvPhotoPreview] = useState('');

  // Add/Edit Student State
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '', roll_number: '', register_number: '', gender: 'Male',
    department_id: '', year_label: '1st Year', section_id: '', adviser_id: '', photo_url: ''
  });
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // View Attendance Detail Modal
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  // Add Quote State
  const [newQuote, setNewQuote] = useState({ quote: '', author: 'CampusPulse' });

  // Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [activeSubTab]);

  const loadAllData = () => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      setCollegeQuery(data.college_name || '');
      setCollegeLogoPreview(data.logo_url || '');
    }).catch(console.error);

    fetch('/api/departments').then(r => r.json()).then(setDepartments).catch(console.error);
    fetch('/api/sections').then(r => r.json()).then(setSections).catch(console.error);
    fetch('/api/advisers').then(r => r.json()).then(setAdvisers).catch(console.error);
    fetch('/api/students').then(r => r.json()).then(setStudents).catch(console.error);
    fetch('/api/quotes').then(r => r.json()).then(setQuotes).catch(console.error);
    fetch('/api/flyers/history').then(r => r.json()).then(setFlyerHistory).catch(console.error);
    fetch('/api/attendance/records').then(r => r.json()).then(setAttendanceRecords).catch(console.error);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Upload File Helper
  const handleFileUpload = async (file, type) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      return data.url;
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
      return null;
    }
  };

  // Auto-Suggest College Name Handler
  const handleCollegeQueryChange = (val) => {
    setCollegeQuery(val);
    setSettings(prev => ({ ...prev, college_name: val }));
    if (val.trim().length > 0) {
      const matches = POPULAR_COLLEGES.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setCollegeSuggestions(matches);
      setShowCollegeDropdown(true);
    } else {
      setCollegeSuggestions([]);
      setShowCollegeDropdown(false);
    }
  };

  const selectCollegeSuggestion = (name) => {
    setCollegeQuery(name);
    setSettings(prev => ({ ...prev, college_name: name }));
    setShowCollegeDropdown(false);
  };

  // Save College Settings
  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('✓ College information saved successfully');
        loadAllData();
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleCollegeLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCollegeLogoPreview(URL.createObjectURL(file));
      const uploadedUrl = await handleFileUpload(file, 'college');
      if (uploadedUrl) {
        setSettings(prev => ({ ...prev, logo_url: uploadedUrl }));
        setCollegeLogoPreview(uploadedUrl);
        showToast('✓ College logo uploaded!');
      }
    }
  };

  // Department Handlers
  const openDeptModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '', hod_name: dept.hod_name || '', logo_url: dept.logo_url || '' });
    } else {
      setEditingDept(null);
      setDeptForm({ name: '', code: '', description: '', hod_name: '', logo_url: '' });
    }
    setDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      alert('Department name and code are required');
      return;
    }
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      });

      if (res.ok) {
        showToast(editingDept ? '✓ Department updated successfully' : '✓ Department added successfully');
        setDeptModalOpen(false);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  const handleDeleteDept = async (id) => {
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Department deleted successfully');
        setDeleteConfirm(null);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  // Section Handlers (+ Add Section)
  const openSecModal = (sec = null) => {
    if (sec) {
      setEditingSec(sec);
      setSecForm({
        department_id: sec.department_id, year_label: sec.year_label, section_name: sec.section_name,
        academic_year: sec.academic_year || '2026-2027', adviser_id: sec.adviser_id || ''
      });
    } else {
      setEditingSec(null);
      setSecForm({
        department_id: departments[0]?.id || '', year_label: '1st Year', section_name: 'A',
        academic_year: '2026-2027', adviser_id: ''
      });
    }
    setSecModalOpen(true);
  };

  const handleSaveSec = async (e) => {
    e.preventDefault();
    if (!secForm.department_id || !secForm.year_label || !secForm.section_name) {
      alert('Department, year, and section name are required');
      return;
    }
    try {
      const url = editingSec ? `/api/sections/${editingSec.id}` : '/api/sections';
      const method = editingSec ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secForm)
      });

      if (res.ok) {
        showToast(editingSec ? '✓ Section updated successfully' : '✓ Section created successfully');
        setSecModalOpen(false);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  const handleDeleteSec = async (id) => {
    try {
      const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Section deleted successfully');
        setDeleteConfirm(null);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  // Adviser Handlers
  const openAdvModal = (adv = null) => {
    if (adv) {
      setEditingAdv(adv);
      setAdvForm({
        name: adv.name, email: adv.email || '', phone: adv.phone || '', designation: adv.designation || 'Assistant Professor',
        department_id: adv.department_id || '', year_label: adv.assigned_year_label || '1st Year', section_id: '', photo_url: adv.photo_url || ''
      });
      setAdvPhotoPreview(adv.photo_url || '');
    } else {
      setEditingAdv(null);
      setAdvForm({
        name: '', email: '', phone: '', designation: 'Assistant Professor',
        department_id: departments[0]?.id || '', year_label: '1st Year', section_id: '', photo_url: ''
      });
      setAdvPhotoPreview('');
    }
    setAdvModalOpen(true);
  };

  const handleAdvPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdvPhotoPreview(URL.createObjectURL(file));
      const url = await handleFileUpload(file, 'advisers');
      if (url) {
        setAdvForm(prev => ({ ...prev, photo_url: url }));
        setAdvPhotoPreview(url);
        showToast('✓ Adviser photo uploaded');
      }
    }
  };

  const handleSaveAdv = async (e) => {
    e.preventDefault();
    if (!advForm.name || !advForm.department_id) {
      alert('Adviser name and department are required');
      return;
    }
    try {
      const url = editingAdv ? `/api/advisers/${editingAdv.id}` : '/api/advisers';
      const method = editingAdv ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advForm)
      });

      if (res.ok) {
        showToast(editingAdv ? '✓ Adviser updated successfully' : '✓ Adviser saved successfully');
        setAdvModalOpen(false);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  const handleDeleteAdv = async (id) => {
    try {
      const res = await fetch(`/api/advisers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Adviser removed successfully');
        setDeleteConfirm(null);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  // Student Handlers
  const openStudentModal = (st = null) => {
    if (st) {
      setEditingStudent(st);
      setStudentForm({
        name: st.name, roll_number: st.roll_number, register_number: st.register_number, gender: st.gender,
        department_id: st.department_id, year_label: st.year_label, section_id: st.section_id, adviser_id: st.adviser_id || '', photo_url: st.photo_url || ''
      });
      setStudentPhotoPreview(st.photo_url || '');
    } else {
      setEditingStudent(null);
      const defaultDept = departments[0]?.id || '';
      const availableSecs = sections.filter(sec => sec.department_id === defaultDept);
      setStudentForm({
        name: '', roll_number: '', register_number: '', gender: 'Male',
        department_id: defaultDept, year_label: '1st Year', section_id: availableSecs[0]?.id || '', adviser_id: '', photo_url: ''
      });
      setStudentPhotoPreview('');
    }
    setStudentModalOpen(true);
  };

  const handleStudentPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setStudentPhotoPreview(URL.createObjectURL(file));
      const url = await handleFileUpload(file, 'students');
      if (url) {
        setStudentForm(prev => ({ ...prev, photo_url: url }));
        setStudentPhotoPreview(url);
        showToast('✓ Student photo uploaded');
      }
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.roll_number || !studentForm.register_number || !studentForm.department_id || !studentForm.section_id) {
      alert('Please fill all required student fields');
      return;
    }
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });

      if (res.ok) {
        showToast(editingStudent ? '✓ Student updated successfully' : '✓ Student saved successfully');
        setStudentModalOpen(false);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('✓ Student record removed');
        setDeleteConfirm(null);
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  // Fetch Attendance Details for Record Inspection Modal
  const viewAttendanceRecordDetails = async (rec) => {
    try {
      const res = await fetch(`/api/attendance?section_id=${rec.section_id}&attendance_date=${rec.attendance_date}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRecordDetail(data);
      }
    } catch (e) { alert('Failed to load record details'); }
  };

  // Add Quote
  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!newQuote.quote) return;
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote)
      });
      if (res.ok) {
        showToast('✓ Motivational Quote added!');
        setNewQuote({ quote: '', author: 'CampusPulse' });
        loadAllData();
      }
    } catch (err) { alert(err.message); }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.register_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Data Center Navigation Top Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-indigo-500" />
            ADMIN DATA CENTER & STORAGE PORTAL
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Database-backed management for College, Departments, Sections, Advisers, Students, and Attendance Logs.
          </p>
        </div>

        {/* Sub-Nav Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>College Setup</span>
          </button>

          <button
            onClick={() => setActiveSubTab('departments')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'departments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Departments</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sections')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'sections' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sections</span>
          </button>

          <button
            onClick={() => setActiveSubTab('advisers')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'advisers' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Advisers</span>
          </button>

          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'students' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students</span>
          </button>

          <button
            onClick={() => setActiveSubTab('attendance_records')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'attendance_records' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Attendance History</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Flyer Logs</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB TAB 1: COLLEGE SETUP */}
      {/* ============================================================== */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={saveSettings} className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-indigo-500" />
                College Profile & Branding Setup
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                SQLite Permanent Storage
              </span>
            </div>

            {/* Smart Browser College Search / Auto-suggest */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                College Name (Search & Auto-Suggest or Type Manually)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={collegeQuery}
                  onChange={(e) => handleCollegeQueryChange(e.target.value)}
                  onFocus={() => {
                    if (collegeQuery.trim().length > 0) setShowCollegeDropdown(true);
                  }}
                  placeholder="Type college name (e.g., Erode Sengunthar, PSG, VIT...)"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>

              {showCollegeDropdown && collegeSuggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {collegeSuggestions.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCollegeSuggestion(col)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors"
                    >
                      🎓 {col}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logo Upload Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {collegeLogoPreview ? (
                  <img src={collegeLogoPreview} alt="Logo" className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-300 p-1 shadow" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Upload Official College Logo</p>
                  <p className="text-[10px] text-slate-400 font-semibold">JPG, PNG, WEBP or SVG up to 5MB</p>
                </div>
              </div>

              <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleCollegeLogoChange} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={settings.principal_name || ''}
                  onChange={(e) => setSettings({ ...settings, principal_name: e.target.value })}
                  placeholder="e.g. Dr. R. Arumugam, Ph.D."
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={settings.academic_year || '2026-2027'}
                  onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Website</label>
                <input
                  type="text"
                  value={settings.website || ''}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save College Setup</span>
              </button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-indigo-500">Branding Preview</h4>
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
              <div className="flex items-center space-x-3">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-0.5" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs">
                    CP
                  </div>
                )}
                <div>
                  <h5 className="font-extrabold text-sm leading-tight text-white">
                    {settings.college_name || 'No College Added'}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {settings.principal_name ? `Principal: ${settings.principal_name}` : 'Setup Required'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 2: DEPARTMENTS */}
      {/* ============================================================== */}
      {activeSubTab === 'departments' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Departments Directory ({departments.length})
            </h3>
            <button
              onClick={() => openDeptModal(null)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(d => (
              <div key={d.id} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                      {d.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {d.student_count || 0} Students
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">{d.name}</h4>
                  {d.hod_name && <p className="text-xs font-semibold text-slate-500 mt-0.5">HOD: {d.hod_name}</p>}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => openDeptModal(d)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'department', id: d.id, title: d.name })} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 3: SECTIONS MANAGEMENT */}
      {/* ============================================================== */}
      {activeSubTab === 'sections' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Class Sections Directory ({sections.length})
            </h3>
            <button
              onClick={() => openSecModal(null)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Section</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map(sec => (
              <div key={sec.id} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                      {sec.department_code} • {sec.year_label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-400">
                      {sec.academic_year || '2026-2027'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">
                    Section {sec.section_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Adviser: <strong className="text-slate-800 dark:text-slate-200">{sec.adviser_name || 'Unassigned'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Students: {sec.student_count || 0}</p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => openSecModal(sec)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'section', id: sec.id, title: `Section ${sec.section_name}` })} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 4: ADVISERS */}
      {/* ============================================================== */}
      {activeSubTab === 'advisers' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Class Advisers ({advisers.length})
            </h3>
            <button onClick={() => openAdvModal(null)} className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md">
              <Plus className="w-4 h-4" />
              <span>+ Add Adviser</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisers.map(adv => (
              <div key={adv.id} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow space-y-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={adv.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adv.name)}`} alt={adv.name} className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/30 bg-slate-200" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{adv.name}</h4>
                    <p className="text-[11px] font-bold text-indigo-500">{adv.designation || 'Faculty'}</p>
                    <p className="text-[10px] text-slate-400">{adv.department_code || 'General'} {adv.assigned_section_name ? `• ${adv.assigned_year_label} ${adv.assigned_section_name}` : ''}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <button onClick={() => openAdvModal(adv)} className="p-1.5 text-slate-400 hover:text-indigo-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm({ type: 'adviser', id: adv.id, title: adv.name })} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 5: STUDENTS DIRECTORY */}
      {/* ============================================================== */}
      {activeSubTab === 'students' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Students Directory ({filteredStudents.length})
              </h3>
              <button onClick={() => openStudentModal(null)} className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Student</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl w-full sm:w-72 border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search student..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-full" />
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map(st => (
                <div key={st.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={st.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`} alt={st.name} className="w-10 h-10 rounded-xl object-cover bg-slate-200 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{st.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">Roll: {st.roll_number} | Reg: {st.register_number}</p>
                      <p className="text-[10px] text-indigo-500 font-bold">{st.department_code} • {st.year_label} ({st.section_name})</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => openStudentModal(st)} className="p-1.5 text-slate-400 hover:text-indigo-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm({ type: 'student', id: st.id, title: st.name })} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 6: ATTENDANCE HISTORY RECORDS PORTAL */}
      {/* ============================================================== */}
      {activeSubTab === 'attendance_records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Attendance Records ({attendanceRecords.length} Snapshots)
            </h3>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendanceRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold">
                  No attendance records logged yet. Mark attendance in Staff Attendance tab.
                </div>
              ) : (
                attendanceRecords.map((rec, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">{rec.attendance_date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                          {rec.department_code} {rec.year_label} ({rec.section_name})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Department: {rec.department_name}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 font-bold text-xs">
                        <span className="text-emerald-500">Present: {rec.present_count}</span>
                        <span className="text-rose-500">Absent: {rec.absent_count}</span>
                      </div>

                      <button
                        onClick={() => viewAttendanceRecordDetails(rec)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] shadow flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB TAB 7: FLYER LOGS */}
      {/* ============================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Generated Flyers Log ({flyerHistory.length})
          </h3>

          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {flyerHistory.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {item.department_code} • {item.year_label} ({item.section_name})
                    </p>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">Date: {item.flyer_date} | Adviser: {item.adviser_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-cyan-400 text-sm">{item.attendance_percentage}%</span>
                    <p className="text-[10px] text-slate-400">Present: {item.present_count} / {item.total_count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE / EDIT SECTION */}
      {/* ============================================================== */}
      {secModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveSec} className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {editingSec ? 'Edit Section Details' : '+ Add New Section'}
              </h4>
              <button type="button" onClick={() => setSecModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Department</label>
              <select
                value={secForm.department_id}
                onChange={(e) => setSecForm({ ...secForm, department_id: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Year</label>
                <select
                  value={secForm.year_label}
                  onChange={(e) => setSecForm({ ...secForm, year_label: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C, A1, B1"
                  value={secForm.section_name}
                  onChange={(e) => setSecForm({ ...secForm, section_name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={secForm.academic_year}
                  onChange={(e) => setSecForm({ ...secForm, academic_year: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assigned Adviser</label>
                <select
                  value={secForm.adviser_id}
                  onChange={(e) => setSecForm({ ...secForm, adviser_id: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="">Select Adviser (Optional)</option>
                  {advisers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button type="button" onClick={() => setSecModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow">
                Save Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VIEW DETAILED ATTENDANCE ROSTER RECORD */}
      {/* ============================================================== */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Attendance Roster Details: {selectedRecordDetail.attendance_date}
                </h4>
                <p className="text-xs text-indigo-500 font-bold">
                  {selectedRecordDetail.section?.department_name} • {selectedRecordDetail.section?.year_label} ({selectedRecordDetail.section?.section_name})
                </p>
              </div>
              <button type="button" onClick={() => setSelectedRecordDetail(null)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-xs font-bold">
              <div>Total: <span className="text-slate-800 dark:text-white font-extrabold">{selectedRecordDetail.summary?.total_students}</span></div>
              <div>Present: <span className="text-emerald-500 font-extrabold">{selectedRecordDetail.summary?.present}</span></div>
              <div>Absent: <span className="text-rose-500 font-extrabold">{selectedRecordDetail.summary?.absent}</span></div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {selectedRecordDetail.students?.map(st => (
                <div key={st.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={st.photo_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-200" />
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{st.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Roll: {st.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {st.attendance_status === 'Absent' && (
                      <span className="text-[10px] text-rose-400 font-semibold italic">Reason: {st.absence_reason || 'Personal'}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      st.attendance_status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {st.attendance_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedRecordDetail(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ============================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 bg-white dark:bg-slate-900 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Confirm Deletion</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deleteConfirm.title}</strong>? Historical data will be preserved.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'department') handleDeleteDept(deleteConfirm.id);
                  if (deleteConfirm.type === 'section') handleDeleteSec(deleteConfirm.id);
                  if (deleteConfirm.type === 'adviser') handleDeleteAdv(deleteConfirm.id);
                  if (deleteConfirm.type === 'student') handleDeleteStudent(deleteConfirm.id);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
