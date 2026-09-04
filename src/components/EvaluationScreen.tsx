import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Save,
  Check,
  Radio,
  Clock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Member,
  StationId,
  StationEvaluation,
  TrafficLightRating,
  STATIONS,
  getEvaluationsList,
} from '../types';
import { StationIcon, TrafficLightBadge } from './StationIcons';

interface EvaluationScreenProps {
  member: Member;
  activeStationId: StationId;
  onBack: () => void;
  onSaveEvaluation: (
    memberId: string,
    stationId: StationId,
    evaluation: StationEvaluation
  ) => void;
  onChangeStation: (stationId: StationId) => void;
}

export const EvaluationScreen: React.FC<EvaluationScreenProps> = ({
  member,
  activeStationId,
  onBack,
  onSaveEvaluation,
  onChangeStation,
}) => {
  const currentStation =
    STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];
  const existingEval = member.evaluations[activeStationId];

  const [scouted, setScouted] = useState<boolean>(existingEval?.scouted ?? false);
  const [trafficLight, setTrafficLight] = useState<TrafficLightRating | undefined>(
    existingEval?.trafficLight
  );
  const [notes, setNotes] = useState<string>(existingEval?.notes ?? '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state when activeStationId or member changes
  useEffect(() => {
    const ev = member.evaluations[activeStationId];
    if (ev) {
      setScouted(ev.scouted);
      setTrafficLight(ev.trafficLight);
      setNotes(ev.notes);
    } else {
      setScouted(false);
      setTrafficLight(undefined);
      setNotes('');
    }
    setSavedFeedback(false);
  }, [activeStationId, member]);

  const handleSave = () => {
    const updatedEvaluation: StationEvaluation = {
      stationId: activeStationId,
      scouted,
      trafficLight,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSaveEvaluation(member.id, activeStationId, updatedEvaluation);

    if (scouted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#a5b4fc', '#34d399', '#fcd34d'],
        });
      } catch {
        // Safe fallback if blocked
      }
    }

    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onBack();
    }, 900);
  };

  // Other station remarks (excluding current active station)
  const otherStationRemarks = getEvaluationsList(member).filter(
    (ev) => ev.stationId !== activeStationId
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Top Bar: Navigation & Telemetry */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="btn-back-to-members"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Database</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#08080C] border border-slate-200 dark:border-white/10 px-3 py-1 rounded shadow-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-gray-400 uppercase tracking-widest">
              Live Station Sync
            </span>
          </div>
        </div>
      </div>

      {/* Station Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden mb-6 shadow-sm dark:shadow-xl">
        {STATIONS.map((station) => {
          const isSelected = station.id === activeStationId;
          const ev = member.evaluations[station.id];

          let dotClass = 'bg-slate-300 dark:bg-gray-700';
          if (ev) {
            if (ev.trafficLight === 'red') {
              dotClass = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
            } else if (ev.trafficLight === 'yellow') {
              dotClass = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
            } else if (ev.trafficLight === 'green') {
              dotClass = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
            } else if (ev.scouted) {
              dotClass = 'bg-indigo-400 shadow-[0_0_8px_#818cf8]';
            } else {
              dotClass = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
            }
          } else if (isSelected) {
            dotClass = 'bg-indigo-500 shadow-[0_0_8px_#6366f1]';
          }

          return (
            <button
              key={station.id}
              id={`eval-station-tab-${station.id}`}
              onClick={() => onChangeStation(station.id)}
              className={`p-3 sm:p-4 text-left relative transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#0F0F16] text-slate-900 dark:text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-[#0A0A0F] hover:bg-slate-100 dark:hover:bg-[#0E0E14] text-slate-600 dark:text-gray-400'
              }`}
            >
              <div className="flex justify-end items-center mb-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
              </div>
              <h3 className={`text-xs sm:text-sm font-bold tracking-tight uppercase ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300'}`}>
                {station.name}
              </h3>
              <p className="text-[9px] uppercase font-mono mt-0.5 truncate text-slate-500 dark:text-gray-400">
                {isSelected ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Active</span>
                ) : ev ? (
                  <span>Evaluated</span>
                ) : (
                  <span>Awaiting</span>
                )}
              </p>
              {isSelected && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 shadow-[0_0_10px_#4f46e5]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Person Header Card */}
      <div className="w-full bg-white dark:bg-[#08080C] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm dark:shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center font-bold text-indigo-600 dark:text-white text-lg shadow-[0_0_12px_rgba(79,70,229,0.3)]">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {member.name}
              </h2>
              <span className="bg-slate-100 dark:bg-[#12121A] text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                {member.cg}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">
              AGE: <span className="text-slate-900 dark:text-white font-semibold">{member.age}</span> // STATUS:{' '}
              <span
                className={
                  member.followUpStatus === 'finished'
                    ? 'text-green-600 dark:text-green-400 font-semibold'
                    : member.followUpStatus === 'not_started'
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-amber-600 dark:text-yellow-400 font-semibold'
                }
              >
                {member.followUpStatus === 'finished'
                  ? 'Finished Follow Up'
                  : member.followUpStatus === 'not_started'
                  ? 'Have Not Started'
                  : 'Going Through Follow Up'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-[#12121A] px-3 py-1.5 rounded border border-slate-200 dark:border-white/10">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{currentStation.name} Station</span>
        </div>
      </div>

      {/* Immersive 2-Column Evaluation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Live Remarks History */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-sm" />
              Live Remarks History
            </h2>
            <span className="text-[10px] text-slate-600 dark:text-gray-400 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
              {otherStationRemarks.length} {otherStationRemarks.length === 1 ? 'Station' : 'Stations'}
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[540px] pr-1">
            {otherStationRemarks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#08080C] border border-dashed border-slate-300 dark:border-white/10 text-center">
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                  No other station remarks logged yet.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                  When this musician visits other stations (Drums, Bass, Guitars, Keyboard, Sound),
                  their evaluations stream in here live.
                </p>
              </div>
            ) : (
              otherStationRemarks.map((rem) => {
                const s = STATIONS.find((x) => x.id === rem.stationId);

                return (
                  <div
                    key={rem.stationId}
                    className="p-4 bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-lg flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 dark:bg-white/5 text-indigo-600 dark:text-indigo-300">
                          <StationIcon stationId={rem.stationId} size={14} />
                        </div>
                        <span className="text-xs font-bold uppercase text-slate-800 dark:text-white tracking-wide">
                          {s?.name || rem.stationId}
                        </span>
                        {rem.trafficLight && (
                          <TrafficLightBadge rating={rem.trafficLight} size="sm" showLabel />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500">
                        {new Date(rem.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed italic">
                      "{rem.notes || 'No remarks added.'}"
                    </p>

                    {rem.scouted && (
                      <div className="mt-1 flex items-center pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded border border-indigo-200 dark:border-indigo-500/30">
                          SCOUTED
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Current Session Evaluation Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-sm" />
              {currentStation.name} Station
            </h2>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase font-semibold">
              ACTIVE
            </span>
          </div>

          <div className="bg-white dark:bg-[#0F0F16] rounded-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-5 shadow-sm dark:shadow-2xl relative overflow-hidden">
            {/* Scouted Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Scouted
                </span>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Mark candidate as scouted
                </p>
              </div>

              <button
                type="button"
                id="toggle-scouted"
                role="switch"
                aria-checked={scouted}
                onClick={() => setScouted(!scouted)}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 border ${
                  scouted
                    ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.5)]'
                    : 'bg-slate-200 dark:bg-[#12121A] border-slate-300 dark:border-white/10'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                    scouted
                      ? 'translate-x-6 bg-white text-indigo-950 font-bold'
                      : 'translate-x-0 bg-slate-400 dark:bg-gray-500 text-slate-800'
                  }`}
                >
                  {scouted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                </div>
              </button>
            </div>

            {/* Traffic Light: Red, Yellow, Green (colors only) */}
            <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-white/5">
              <label className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-widest">
                Traffic Light Rating
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="btn-traffic-red"
                  title="Red"
                  aria-label="Red"
                  onClick={() => setTrafficLight(trafficLight === 'red' ? undefined : 'red')}
                  className={`py-3.5 px-3 rounded-xl border flex items-center justify-center transition-all ${
                    trafficLight === 'red'
                      ? 'bg-red-100 dark:bg-red-950/80 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.35)] ring-2 ring-red-500/40'
                      : 'bg-slate-100 dark:bg-[#1A1A24] border-slate-200 dark:border-white/10 hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-950/20'
                  }`}
                >
                  <span
                    className={`rounded-full transition-transform bg-red-500 shadow-[0_0_8px_#ef4444] ${
                      trafficLight === 'red' ? 'w-4 h-4 scale-110' : 'w-3.5 h-3.5 opacity-70'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  id="btn-traffic-yellow"
                  title="Yellow"
                  aria-label="Yellow"
                  onClick={() => setTrafficLight(trafficLight === 'yellow' ? undefined : 'yellow')}
                  className={`py-3.5 px-3 rounded-xl border flex items-center justify-center transition-all ${
                    trafficLight === 'yellow'
                      ? 'bg-amber-100 dark:bg-yellow-950/80 border-yellow-500 shadow-[0_0_14px_rgba(234,179,8,0.35)] ring-2 ring-yellow-500/40'
                      : 'bg-slate-100 dark:bg-[#1A1A24] border-slate-200 dark:border-white/10 hover:border-yellow-500/40 hover:bg-amber-50 dark:hover:bg-yellow-950/20'
                  }`}
                >
                  <span
                    className={`rounded-full transition-transform bg-yellow-500 shadow-[0_0_8px_#eab308] ${
                      trafficLight === 'yellow' ? 'w-4 h-4 scale-110' : 'w-3.5 h-3.5 opacity-70'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  id="btn-traffic-green"
                  title="Green"
                  aria-label="Green"
                  onClick={() => setTrafficLight(trafficLight === 'green' ? undefined : 'green')}
                  className={`py-3.5 px-3 rounded-xl border flex items-center justify-center transition-all ${
                    trafficLight === 'green'
                      ? 'bg-green-100 dark:bg-green-950/80 border-green-500 shadow-[0_0_14px_rgba(34,197,94,0.35)] ring-2 ring-green-500/40'
                      : 'bg-slate-100 dark:bg-[#1A1A24] border-slate-200 dark:border-white/10 hover:border-green-500/40 hover:bg-green-50 dark:hover:bg-green-950/20'
                  }`}
                >
                  <span
                    className={`rounded-full transition-transform bg-green-500 shadow-[0_0_8px_#22c55e] ${
                      trafficLight === 'green' ? 'w-4 h-4 scale-110' : 'w-3.5 h-3.5 opacity-70'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold tracking-widest">
                Remarks & Feedback
              </label>
              <textarea
                id="textarea-internal-notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Input remarks regarding rhythm, tone, stage presence, readiness..."
                className="w-full bg-slate-50 dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Action Buttons: Discard & Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-discard-evaluation"
                type="button"
                onClick={onBack}
                className="w-1/3 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-white/10 transition-all active:scale-[0.98]"
              >
                Discard
              </button>

              <button
                id="btn-save-evaluation"
                type="button"
                onClick={handleSave}
                className="w-2/3 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {savedFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Remarks Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Remarks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
