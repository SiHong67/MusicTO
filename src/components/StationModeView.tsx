import React, { useState } from 'react';
import {
  Radio,
  QrCode,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Member, StationId, STATIONS, getEvaluationsList } from '../types';
import { StationIcon, TrafficLightBadge } from './StationIcons';

interface StationModeViewProps {
  currentStationId: StationId;
  onSelectStation: (stationId: StationId) => void;
  members: Member[];
  onEvaluateCandidate: (member: Member) => void;
  onOpenStationQR: (stationId: StationId) => void;
  onOpenScanner: () => void;
  onOpenVenueQR?: () => void;
}

export const StationModeView: React.FC<StationModeViewProps> = ({
  currentStationId,
  onSelectStation,
  members,
  onEvaluateCandidate,
  onOpenStationQR,
  onOpenScanner,
  onOpenVenueQR,
}) => {
  const station = STATIONS.find((s) => s.id === currentStationId) || STATIONS[0];
  const [activeTab, setActiveTab] = useState<'queue' | 'all'>('queue');

  // Candidates who checked into this station or have this station as current/primary
  const queueCandidates = members.filter(
    (m) =>
      m.currentStation === currentStationId ||
      m.checkedInStations.includes(currentStationId) ||
      Boolean(m.evaluations[currentStationId])
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Station Selector Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest font-mono">
            SELECT STATION
          </label>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
            {station.name.toUpperCase()} ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATIONS.map((s) => {
            const isSelected = s.id === currentStationId;
            return (
              <button
                key={s.id}
                id={`station-mode-btn-${s.id}`}
                onClick={() => onSelectStation(s.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-white dark:bg-[#0F0F16] text-slate-900 dark:text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                    : 'bg-white dark:bg-[#08080C] text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#12121A] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-end w-full mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-indigo-500 shadow-[0_0_6px_#818cf8]' : 'bg-slate-300 dark:bg-gray-700'
                    }`}
                  />
                </div>
                <div className="my-1 text-indigo-600 dark:text-indigo-400">
                  <StationIcon stationId={s.id} size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-tight">{s.name}</span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Station Banner Card */}
      <div className="bg-white dark:bg-[#08080C] border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-5 shadow-sm dark:shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.25)]">
              <StationIcon stationId={station.id} size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                  {station.name}
                </h2>
                <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                  Active Station
                </span>
              </div>
            </div>
          </div>

          {/* Station Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenVenueQR && (
              <button
                id="btn-show-venue-qr-station-view"
                onClick={onOpenVenueQR}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Venue QR</span>
              </button>
            )}

            <button
              id="btn-show-station-qr-pass"
              onClick={() => onOpenStationQR(station.id)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-slate-700 dark:text-gray-200 text-xs font-mono font-bold uppercase tracking-wider border border-slate-200 dark:border-white/10 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Display Station QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* People List at this Station */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border transition-all ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                : 'bg-white dark:bg-[#08080C] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            At This Station ({queueCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                : 'bg-white dark:bg-[#08080C] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Candidates ({members.length})
          </button>
        </div>

        <button
          onClick={onOpenScanner}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono uppercase tracking-wider font-bold flex items-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan Station QR</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {(activeTab === 'queue' ? queueCandidates : members).map((candidate) => {
          const currentStationEval = candidate.evaluations[currentStationId];
          const candidateEvals = getEvaluationsList(candidate);
          const otherEvals = candidateEvals.filter(
            (ev) => ev.stationId !== currentStationId
          );
          const hasOtherStationRemarks = otherEvals.length > 0;

          return (
            <div
              key={candidate.id}
              onClick={() => onEvaluateCandidate(candidate)}
              className="w-full bg-white hover:bg-slate-50 dark:bg-[#0F0F16] dark:hover:bg-[#13131D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl cursor-pointer transition-all hover:border-slate-300 dark:hover:border-white/20 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {candidate.name}
                    </h3>
                    <span className="bg-slate-100 dark:bg-[#12121A] text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      {candidate.cg}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-mono">Age: {candidate.age}</span>
                    {candidate.currentStation === currentStationId && (
                      <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        HERE AT STATION
                      </span>
                    )}
                  </div>

                  {/* Candidate background info from registration */}
                  {(candidate.experienceLevel || candidate.phone || candidate.notes) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-gray-400 flex-wrap">
                      {candidate.experienceLevel && (
                        <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400">
                          {candidate.experienceLevel} level
                        </span>
                      )}
                      {candidate.phone && <span>• Tel: {candidate.phone}</span>}
                      {candidate.notes && (
                        <span className="italic truncate max-w-xs">• &ldquo;{candidate.notes}&rdquo;</span>
                      )}
                    </div>
                  )}

                  {/* Status at this station */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {currentStationEval ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {currentStationEval.trafficLight ? (
                          <TrafficLightBadge rating={currentStationEval.trafficLight} size="sm" showLabel />
                        ) : (
                          <span className="text-xs text-green-600 dark:text-green-400 font-mono font-semibold">
                            Evaluated
                          </span>
                        )}
                        {currentStationEval.scouted && (
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                            SCOUTED
                          </span>
                        )}
                        {currentStationEval.notes && (
                          <span className="text-xs text-slate-600 dark:text-gray-400 italic truncate max-w-sm font-sans">
                            "{currentStationEval.notes}"
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-gray-500 font-mono italic">
                        Not evaluated at {station.name} yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0 font-mono text-xs uppercase">
                  <span className="hidden sm:inline">Evaluate</span>
                  <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              {/* LIVE REMARKS SNIPPET FROM OTHER STATIONS */}
              {hasOtherStationRemarks && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-gray-400 font-mono uppercase tracking-widest font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_#818cf8]" />
                    <span>Remarks from other stations:</span>
                  </div>

                  <div className="space-y-1.5">
                    {otherEvals.map((other) => {
                      const s = STATIONS.find((x) => x.id === other.stationId);
                      return (
                        <div
                          key={other.stationId}
                          className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#12121A] px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <StationIcon stationId={other.stationId} size={12} />
                            <span className="font-bold text-slate-700 dark:text-gray-200 uppercase font-mono text-[11px]">
                              {s?.name}:
                            </span>
                            <span className="text-slate-600 dark:text-gray-400 truncate italic">
                              "{other.notes || 'Evaluated'}"
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {other.trafficLight && (
                              <TrafficLightBadge rating={other.trafficLight} size="sm" />
                            )}
                            {other.scouted && (
                              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                                SCOUTED
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {activeTab === 'queue' && queueCandidates.length === 0 && (
          <div className="text-center py-10 px-4 bg-white dark:bg-[#0F0F16] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-gray-200 uppercase tracking-wide">
                No candidates currently checked in at {station.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                When students like Mark scan the {station.name} Station QR code on their phones, their details will appear here automatically.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenStationQR(station.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Show {station.name} Station QR</span>
              </button>
              {onOpenVenueQR && (
                <button
                  type="button"
                  onClick={onOpenVenueQR}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Venue Entry QR</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
