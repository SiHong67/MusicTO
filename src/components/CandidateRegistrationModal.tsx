import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Member, FollowUpStatus, StationId, STATIONS } from '../types';
import { StationIcon } from './StationIcons';

interface CandidateRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: Member) => void;
  onStartStationScan: (member: Member) => void;
}

export const CandidateRegistrationModal: React.FC<CandidateRegistrationModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  onStartStationScan,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [cg, setCg] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('not_started');
  const [primaryStation, setPrimaryStation] = useState<StationId>('drums');
  const [submittedMember, setSubmittedMember] = useState<Member | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAge = parseInt(age, 10) || 20;
    const member: Member = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      age: parsedAge,
      cg: (cg.trim() || 'General').toUpperCase(),
      followUpStatus,
      primaryStation,
      checkedInStations: [],
      currentStation: primaryStation,
      registeredAt: new Date().toISOString(),
      evaluations: {},
    };

    onAddMember(member);
    setSubmittedMember(member);
  };

  const handleReset = () => {
    setName('');
    setAge('');
    setCg('');
    setFollowUpStatus('not_started');
    setSubmittedMember(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0F0F16] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                Add Candidate
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-widest uppercase">
                Profile & CG Information
              </p>
            </div>
          </div>
          <button
            id="btn-close-register-modal"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] border border-slate-200 dark:border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedMember ? (
          /* Confirmation State */
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-300 dark:border-green-500/40 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.25)]">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Candidate Added!</h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                <strong className="text-slate-900 dark:text-white font-mono">{submittedMember.name}</strong> ({submittedMember.cg}) has been added.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#12121A] rounded-xl border border-slate-200 dark:border-white/10 text-left text-xs font-mono space-y-1.5 text-slate-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-gray-500">AGE:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{submittedMember.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-gray-500">FOLLOW-UP:</span>
                <span
                  className={`font-semibold uppercase ${
                    submittedMember.followUpStatus === 'finished'
                      ? 'text-green-600 dark:text-green-400'
                      : submittedMember.followUpStatus === 'not_started'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-yellow-400'
                  }`}
                >
                  {submittedMember.followUpStatus === 'finished'
                    ? 'Finished Follow Up'
                    : submittedMember.followUpStatus === 'not_started'
                    ? 'Have Not Started'
                    : 'Going Through Follow Up'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-gray-500">STATION:</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">{submittedMember.primaryStation}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                id="btn-scan-station-now"
                onClick={() => {
                  onStartStationScan(submittedMember);
                  handleReset();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] uppercase text-xs tracking-widest transition-all"
              >
                <span>Scan Station QR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-done-register"
                onClick={handleReset}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] text-slate-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-xl text-xs uppercase font-mono tracking-wider border border-slate-200 dark:border-white/10 transition-all"
              >
                Return to Database
              </button>
            </div>
          </div>
        ) : (
          /* Form Inputs */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="input-candidate-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luke Tan, Sarah Lim"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
              />
            </div>

            {/* Age and CG */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-candidate-age"
                  type="number"
                  min="10"
                  max="80"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 21"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                  CG <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-candidate-cg"
                  type="text"
                  required
                  value={cg}
                  onChange={(e) => setCg(e.target.value)}
                  placeholder="e.g. AZ1, V2, W4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white uppercase placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Follow-up Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                Follow-up Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#12121A] p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  id="btn-status-not-started"
                  onClick={() => setFollowUpStatus('not_started')}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    followUpStatus === 'not_started'
                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/50 shadow-xs'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="truncate">Have not started</span>
                </button>
                <button
                  type="button"
                  id="btn-status-going-through"
                  onClick={() => setFollowUpStatus('going_through')}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    followUpStatus === 'going_through'
                      ? 'bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/50 shadow-xs'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Going Through</span>
                </button>
                <button
                  type="button"
                  id="btn-status-finished"
                  onClick={() => setFollowUpStatus('finished')}
                  className={`py-2 px-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    followUpStatus === 'finished'
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-500/50 shadow-xs'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="truncate">Finished</span>
                </button>
              </div>
            </div>

            {/* First Station Choice */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                First Station
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATIONS.map((st) => {
                  const isSelected = primaryStation === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      id={`register-station-${st.id}`}
                      onClick={() => setPrimaryStation(st.id)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-mono uppercase border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)] font-bold'
                          : 'bg-slate-50 dark:bg-[#12121A] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <StationIcon stationId={st.id} size={13} />
                      <span>{st.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="btn-submit-registration"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] uppercase text-xs tracking-widest transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Add Candidate</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
