import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PrincipalDashboard from './components/PrincipalDashboard';
import StaffAttendance from './components/StaffAttendance';
import AIFlyerGenerator from './components/AIFlyerGenerator';
import FlyerHistory from './components/FlyerHistory';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import CinematicIntro from './components/CinematicIntro';

export default function App() {
  const [activeTab, setActiveTab] = useState('principal');
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState({
    username: 'staff_aids',
    full_name: 'Dr. M. Karthi',
    role: 'staff',
    department_id: 1,
    department_code: 'AI & DS'
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [collegeSettings, setCollegeSettings] = useState(null);

  // Cinematic Intro Setting (ON by default, toggleable in Navbar/Settings)
  const [cinematicEnabled, setCinematicEnabled] = useState(() => {
    const saved = localStorage.getItem('cinematic_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showIntro, setShowIntro] = useState(cinematicEnabled);

  // Parameters passed to AI Flyer Generator
  const [flyerParams, setFlyerParams] = useState({
    sectionId: 1,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('cinematic_enabled', JSON.stringify(cinematicEnabled));
  }, [cinematicEnabled]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setCollegeSettings)
      .catch(console.error);
  }, []);

  const handleGenerateFlyerClick = ({ sectionId, date }) => {
    setFlyerParams({ sectionId, date });
    setActiveTab('flyer');
  };

  const handleOpenHistoricalFlyer = ({ sectionId, date }) => {
    setFlyerParams({ sectionId, date });
    setActiveTab('flyer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Cinematic Intro Animation */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        setUser={(u) => {
          if (!u) setShowLoginModal(true);
          setUser(u);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        collegeName={collegeSettings?.college_name}
        cinematicEnabled={cinematicEnabled}
        setCinematicEnabled={setCinematicEnabled}
      />

      {/* Main Content Area with Cinematic Micro-Transitions */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-300 transform">
        {activeTab === 'principal' && (
          <div className="animate-fadeIn">
            <PrincipalDashboard onSelectSectionForFlyer={handleGenerateFlyerClick} />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="animate-fadeIn">
            <StaffAttendance
              currentUser={user}
              onGenerateFlyer={handleGenerateFlyerClick}
            />
          </div>
        )}

        {activeTab === 'flyer' && (
          <div className="animate-fadeIn">
            <AIFlyerGenerator
              flyerParams={flyerParams}
              onBackToAttendance={() => setActiveTab('attendance')}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <FlyerHistory onOpenFlyer={handleOpenHistoricalFlyer} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Login Modal Popup */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            setShowLoginModal(false);
          }}
        />
      )}

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold">
          CampusPulse AI © 2026 • Turn Attendance Into Insight.
        </p>
        <p className="text-[10px] mt-1 text-slate-400">
          Designed for production college deployments. All departments, sections, and intelligence rules enabled.
        </p>
      </footer>

    </div>
  );
}
