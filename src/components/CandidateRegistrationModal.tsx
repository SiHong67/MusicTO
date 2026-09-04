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
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('going_through');
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
    setFollowUpStatus('going_through');
    setSubmittedMember(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F0F16] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
                Add Person
              </h2>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                Profile & CG Information
              </p>
            </div>
          </div>
          <button
            id="btn-close-register-modal"
            onClick={handleReset}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-[#12121A] hover:bg-[#1A1A24] border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedMember ? (
          /* Confirmation State */
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Added!</h3>
              <p className="text-xs text-gray-400 mt-1">
                <strong className="text-white font-mono">{submittedMember.name}</strong> ({submittedMember.cg}) has been added.
              </p>
            </div>

            <div className="p-4 bg-[#12121A] rounded-xl border border-white/10 text-left text-xs font-mono space-y-1.5 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">AGE:</span>
                <span className="font-semibold text-white">{submittedMember.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">FOLLOW-UP:</span>
                <span className="font-semibold text-indigo-400 uppercase">
                  {submittedMember.followUpStatus === 'finished' ? 'Finished Follow Up' : 'Going Through Follow Up'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">STATION:</span>
                <span className="font-semibold text-white uppercase">{submittedMember.primaryStation}</span>
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
                className="w-full bg-[#12121A] hover:bg-[#1A1A24] text-gray-300 font-medium py-2.5 px-4 rounded-xl text-xs uppercase font-mono tracking-wider border border-white/10 transition-all"
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
              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="input-candidate-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luke Tan, Sarah Lim"
                className="w-full px-3.5 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
              />
            </div>

            {/* Age and CG */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                  Age <span className="text-red-400">*</span>
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
                  className="w-full px-3.5 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                  CG <span className="text-red-400">*</span>
                </label>
                <input
                  id="input-candidate-cg"
                  type="text"
                  required
                  value={cg}
                  onChange={(e) => setCg(e.target.value)}
                  placeholder="e.g. AZ1, V2, W4"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-white uppercase placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Follow-up Status (going through / finish follow up) */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-1.5">
                Follow-up Status <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#12121A] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  id="btn-status-going-through"
                  onClick={() => setFollowUpStatus('going_through')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all border ${
                    followUpStatus === 'going_through'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Going Through
                </button>
                <button
                  type="button"
                  id="btn-status-finished"
                  onClick={() => setFollowUpStatus('finished')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all border ${
                    followUpStatus === 'finished'
                      ? 'bg-green-500/20 text-green-300 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Finished Follow Up
                </button>
              </div>
            </div>

            {/* First Station Choice */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest mb-1.5">
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
                          : 'bg-[#12121A] border-white/10 text-gray-400 hover:text-white'
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
                <span>Add Person</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
