import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function CinematicIntro({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 200);
    const timer2 = setTimeout(() => setStep(2), 700);
    const timer3 = setTimeout(() => {
      setStep(3);
      setTimeout(onComplete, 400);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 bg-[#090d16] flex items-center justify-center transition-opacity duration-500 ${step === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center justify-center p-8 text-center">
        {/* Glowing Background Orb */}
        <div className="absolute w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Animated Brand Logo */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-1 shadow-2xl shadow-indigo-500/50 mb-5 transition-all duration-500 transform ${step >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'}`}>
          <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl font-black text-white tracking-tight transition-all duration-500 transform ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          CampusPulse <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-xs font-extrabold tracking-widest uppercase text-cyan-400 mt-2 transition-all duration-500 delay-150 transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          Turn Attendance Into Insight
        </p>
      </div>
    </div>
  );
}
