import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Check,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Smartphone,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, StationId, STATIONS } from '../types';
import { StationIcon } from './StationIcons';

interface StudentRegistrationViewProps {
  onRegister: (member: Member) => void;
  pendingStationId?: StationId | null;
  onSwitchToInstructor?: () => void;
  existingMembers?: Member[];
  onSelectExisting?: (member: Member) => void;
}

export const StudentRegistrationView: React.FC<StudentRegistrationViewProps> = ({
  onRegister,
  pendingStationId,
  onSwitchToInstructor,
  existingMembers = [],
  onSelectExisting,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [cg, setCg] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [primaryStation, setPrimaryStation] = useState<StationId>(
    pendingStationId || 'keyboard'
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingStation = pendingStationId
    ? STATIONS.find((s) => s.id === pendingStationId)
    : null;

  const handlePrimaryStationChange = (stId: StationId) => {
    setPrimaryStation(stId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const parsedAge = parseInt(age, 10) || 19;
    const cleanCg = (cg.trim() || 'General').toUpperCase();
    const cleanTelegram = telegramHandle.trim()
      ? (telegramHandle.trim().startsWith('@') ? telegramHandle.trim() : `@${telegramHandle.trim()}`)
      : undefined;

    const newMemberId = `mem-${Date.now()}`;
    const initialCheckedIn = pendingStationId ? [pendingStationId] : [];

    const newMember: Member = {
      id: newMemberId,
      name: name.trim(),
      age: parsedAge,
      cg: cleanCg,
      telegramHandle: cleanTelegram,
      phone: cleanTelegram,
      followUpStatus: 'not_started',
      primaryStation,
      secondaryStations: [],
      notes: notes.trim() || undefined,
      checkedInStations: initialCheckedIn,
      currentStation: pendingStationId || undefined,
      registeredAt: new Date().toISOString(),
      evaluations: {},
      videos: [],
    };

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
      });
    } catch {}

    onRegister(newMember);
  };

  const filteredMembers = searchQuery.trim()
    ? existingMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.cg.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.telegramHandle && m.telegramHandle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.phone && m.phone.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : existingMembers.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070B] text-slate-900 dark:text-gray-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Music Tryouts
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLookupMode(!isLookupMode)}
              className="text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors"
            >
              {isLookupMode ? 'New Candidate?' : 'Already registered?'}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            Welcome to the tryouts!
          </p>

          {pendingStation && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-800 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                You scanned the <strong>{pendingStation.name} Station</strong> QR! Register now to automatically check in there.
              </span>
            </div>
          )}
        </div>

        {/* Lookup Existing Profile Mode */}
        {isLookupMode ? (
          <div className="bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Find My Registration
              </h2>
              <span className="text-xs text-slate-500 font-mono">Quick Pass Retrieval</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                Search by Name or CG
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Mark, Matthew, AZ1..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 mt-3">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectExisting && onSelectExisting(m)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/70 dark:bg-[#12121A] flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {m.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                      CG: {m.cg} • {m.age} yrs • Primary: {m.primaryStation || 'None'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Open Pass</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}

              {filteredMembers.length === 0 && (
                <p className="text-xs text-center text-slate-500 py-3">
                  No matching candidates found. Please fill out the registration form below.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLookupMode(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              Back to Registration Form
            </button>
          </div>
        ) : (
          /* Main Registration Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#0D0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-5"
          >
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="student-reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mark Davis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  id="student-reg-age"
                  type="number"
                  min={10}
                  max={99}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 19"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* CG & Telegram Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  CG <span className="text-red-500">*</span>
                </label>
                <input
                  id="student-reg-cg"
                  type="text"
                  required
                  value={cg}
                  onChange={(e) => setCg(e.target.value)}
                  placeholder="e.g. E104, V1, AZ1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Telegram Handle
                </label>
                <input
                  id="student-reg-telegram"
                  type="text"
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Primary Department / Station */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                What are you interested in? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATIONS.map((st) => {
                  const isSelected = primaryStation === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      id={`primary-station-${st.id}`}
                      onClick={() => handlePrimaryStationChange(st.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500 text-indigo-900 dark:text-white shadow-sm'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#12121A] text-slate-700 dark:text-gray-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: st.color }}
                        >
                          <StationIcon name={st.icon} className="w-3.5 h-3.5" />
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs uppercase tracking-tight">
                        {st.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Musical Background */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                Musical Background
              </label>
              <textarea
                id="student-reg-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your musical background..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#12121B] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                id="btn-complete-registration"
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide uppercase shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Complete Registration & Activate Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Footer info & Instructor switch */}
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500">
            <Smartphone className="w-3.5 h-3.5" />
            <span>After registering, scan any station QR at the venue</span>
          </div>

          {onSwitchToInstructor && (
            <button
              type="button"
              onClick={onSwitchToInstructor}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono py-1"
            >
              Are you an Evaluator / Instructor? Switch to Staff Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
