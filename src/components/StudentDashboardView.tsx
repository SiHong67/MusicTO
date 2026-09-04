import React, { useState } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Music,
  MapPin,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, StationId, STATIONS } from '../types';
import { StationIcon } from './StationIcons';

interface StudentDashboardViewProps {
  member: Member;
  onCheckinStation: (stationId: StationId) => void;
  onOpenScanner: () => void;
  onLogout: () => void;
  onEditRegistration: () => void;
  onSwitchToInstructor: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  member,
  onCheckinStation,
  onOpenScanner,
  onLogout,
  onEditRegistration,
  onSwitchToInstructor,
}) => {
  const [justCheckedIn, setJustCheckedIn] = useState<StationId | null>(null);

  const currentStationConfig = member.currentStation
    ? STATIONS.find((s) => s.id === member.currentStation)
    : null;

  const handleSimulatedScan = (stationId: StationId) => {
    onCheckinStation(stationId);
    setJustCheckedIn(stationId);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
      });
    } catch {}

    setTimeout(() => setJustCheckedIn(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070B] text-slate-900 dark:text-gray-100 py-5 px-3 sm:px-6">
      <div className="max-w-xl w-full mx-auto space-y-5">
        {/* Top Student Pass Card */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-mono uppercase tracking-wider mb-2 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Tryout Candidate Pass</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{member.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-indigo-100 font-mono">
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded">CG: {member.cg}</span>
                <span>• Age: {member.age}</span>
                {member.phone && <span>• {member.phone}</span>}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-indigo-200 block">Status</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Quick primary instrument badge */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-100">
            <div className="flex items-center gap-1.5">
              <span>Primary interest:</span>
              <span className="font-bold capitalize text-white">
                {member.primaryStation || 'All Instruments'}
              </span>
            </div>
            <button
              onClick={onEditRegistration}
              className="text-[11px] text-indigo-200 hover:text-white underline underline-offset-2 transition-colors"
            >
              Edit Details
            </button>
          </div>
        </div>

        {/* Checked-in Confirmation Banner */}
        {justCheckedIn && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-fadeIn shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-bold">
                Checked in to {STATIONS.find((s) => s.id === justCheckedIn)?.name} Station!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                Your details are now appearing live on the station instructor&apos;s phone.
              </p>
            </div>
          </div>
        )}

        {/* Current Station Location Card */}
        {currentStationConfig ? (
          <div className="bg-white dark:bg-[#0D0D14] border-2 border-indigo-500/50 dark:border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: currentStationConfig.color }}
                >
                  <StationIcon name={currentStationConfig.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Currently Checked-In At
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {currentStationConfig.name} Station
                  </h2>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
                Ready for Evaluation
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-400 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
              {currentStationConfig.description}
            </p>

            {member.evaluations[currentStationConfig.id] && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-gray-400">Station Evaluation:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Remarks Recorded by Evaluator</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Not checked in to any station yet</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                Walk up to any instrument station and scan its QR code to check in!
              </p>
            </div>
          </div>
        )}

        {/* Primary Action: SCAN STATION QR CODE */}
        <div className="bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Scan Station QR Code
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Point your camera at the station QR card (Keyboard, Drums, Guitar, etc.) to check in
            </p>
          </div>

          <button
            id="btn-student-scan-qr"
            type="button"
            onClick={onOpenScanner}
            className="w-full py-4 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span>Open Phone Camera Scanner</span>
          </button>

          {/* Quick Simulation / Testing Tap */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Testing / Quick Station Tap
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Check-In</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STATIONS.map((st) => {
                const isCurrent = member.currentStation === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSimulatedScan(st.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#12121A] text-slate-700 dark:text-gray-300 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: st.color }}
                    >
                      <StationIcon name={st.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight truncate w-full">
                      {st.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tryout Passport / Stations Progress */}
        <div className="bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              My Tryout Passport
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {member.checkedInStations.length} / {STATIONS.length} Visited
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {STATIONS.map((st) => {
              const hasCheckedIn = member.checkedInStations.includes(st.id);
              const isCurrent = member.currentStation === st.id;
              const evalRecord = member.evaluations[st.id];

              return (
                <div key={st.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 text-xs"
                      style={{ backgroundColor: st.color }}
                    >
                      <StationIcon name={st.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {st.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 uppercase font-mono">
                            Here Now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">
                        {st.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {evalRecord ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Evaluated</span>
                      </span>
                    ) : hasCheckedIn ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Checked in
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSimulatedScan(st.id)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Check in
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions: Logout & Switch to Instructor */}
        <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-gray-400">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Candidate / Sign Out</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToInstructor}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Instructor Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
