import React from 'react';
import {
  Volume2,
  Users,
  SlidersHorizontal,
  QrCode,
  Plus,
  Camera,
  RotateCcw,
  Sun,
  Moon,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { StationId, STATIONS, ThemePreference } from '../types';

export type MainView = 'members' | 'station' | 'qrcards' | 'evaluation';

interface HeaderNavigationProps {
  currentView: MainView;
  onChangeView: (view: MainView) => void;
  onOpenRegister: () => void;
  onOpenScanner: () => void;
  activeStationId: StationId;
  onResetData: () => void;
  theme: ThemePreference;
  onToggleTheme: () => void;
  instructorDept?: StationId | 'general';
  onLockApp: () => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  currentView,
  onChangeView,
  onOpenRegister,
  onOpenScanner,
  activeStationId,
  onResetData,
  theme,
  onToggleTheme,
  instructorDept,
  onLockApp,
}) => {
  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];
  const deptName =
    instructorDept && instructorDept !== 'general'
      ? STATIONS.find((s) => s.id === instructorDept)?.name
      : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A0A0E]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl px-3 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => onChangeView('members')}
          className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-transform group-hover:scale-105">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm sm:text-base font-bold tracking-tight uppercase text-slate-900 dark:text-white">
              MusicTO
            </h1>
            <p className="text-[9px] font-mono font-medium text-slate-500 dark:text-gray-400 leading-none">
              Scouting Portal
            </p>
          </div>
        </div>

        {/* Center Nav Pills */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-[#08080C] p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
          <button
            id="nav-btn-members"
            onClick={() => onChangeView('members')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'members'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Members</span>
          </button>

          <button
            id="nav-btn-station"
            onClick={() => onChangeView('station')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'station' || currentView === 'evaluation'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{activeStation.name}</span>
          </button>

          <button
            id="nav-btn-qrcards"
            onClick={() => onChangeView('qrcards')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'qrcards'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Station QRs</span>
          </button>
        </nav>

        {/* Right Controls & Preferences */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            id="nav-btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Scan Station Camera Button */}
          <button
            id="nav-btn-scan-station"
            onClick={onOpenScanner}
            title="Scan Station QR Code"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* New Member Registration */}
          <button
            id="nav-btn-register"
            onClick={onOpenRegister}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 text-xs font-bold text-white uppercase tracking-widest shadow-[0_0_12px_rgba(79,70,229,0.35)] flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden md:inline">Add</span>
          </button>

          {/* Instructor Badge & Lock Screen Button */}
          <div className="flex items-center pl-1 border-l border-slate-200 dark:border-white/10 gap-1 sm:gap-1.5">
            {deptName && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                <span>{deptName}</span>
              </span>
            )}
            <button
              id="nav-btn-lock-app"
              onClick={onLockApp}
              title="Lock App (Requires instructor password)"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all text-xs font-mono"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Lock</span>
            </button>

            {/* Reset sample data */}
            <button
              id="nav-btn-reset-data"
              onClick={onResetData}
              title="Reset to sample data"
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

