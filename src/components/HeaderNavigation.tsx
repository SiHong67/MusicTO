import React from 'react';
import { Volume2, Users, SlidersHorizontal, QrCode, Plus, Camera, RotateCcw } from 'lucide-react';
import { StationId, STATIONS } from '../types';

export type MainView = 'members' | 'station' | 'qrcards' | 'evaluation';

interface HeaderNavigationProps {
  currentView: MainView;
  onChangeView: (view: MainView) => void;
  onOpenRegister: () => void;
  onOpenScanner: () => void;
  activeStationId: StationId;
  onResetData: () => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  currentView,
  onChangeView,
  onOpenRegister,
  onOpenScanner,
  activeStationId,
  onResetData,
}) => {
  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0E] border-b border-white/10 shadow-2xl px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => onChangeView('members')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-transform group-hover:scale-105">
            <Volume2 className="w-5 h-5" />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-white">
            MusicTO
          </h1>
        </div>

        {/* Center Nav Pills (Immersive UI tech pills) */}
        <nav className="flex items-center gap-1 bg-[#08080C] p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            id="nav-btn-members"
            onClick={() => onChangeView('members')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'members'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">All Members</span>
          </button>

          <button
            id="nav-btn-station"
            onClick={() => onChangeView('station')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'station' || currentView === 'evaluation'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{activeStation.name}</span>
          </button>

          <button
            id="nav-btn-qrcards"
            onClick={() => onChangeView('qrcards')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
              currentView === 'qrcards'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Station QRs</span>
          </button>
        </nav>

        {/* Right Status & Action Items */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Immersive UI Server Live Telemetry */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[11px] font-medium text-gray-300 uppercase tracking-widest font-mono">
              Live Sync
            </span>
          </div>

          {/* Scan Station Camera Button */}
          <button
            id="nav-btn-scan-station"
            onClick={onOpenScanner}
            title="Scan Station QR Code"
            className="p-2 sm:p-2.5 rounded-lg bg-[#12121A] hover:bg-[#1A1A24] border border-white/10 text-indigo-400 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* New Member Registration */}
          <button
            id="nav-btn-register"
            onClick={onOpenRegister}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 text-xs font-bold text-white uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Register</span>
          </button>

          {/* Reset sample data */}
          <button
            onClick={onResetData}
            title="Reset to sample data"
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
