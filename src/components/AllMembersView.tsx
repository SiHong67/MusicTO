import React, { useState } from 'react';
import {
  Shield,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  QrCode,
  ClipboardEdit,
  Sparkles,
  Users,
} from 'lucide-react';
import { Member, StationId, STATIONS, getEvaluationsList } from '../types';
import { StationIcon, TrafficLightBadge } from './StationIcons';

interface AllMembersViewProps {
  members: Member[];
  onOpenRegister: () => void;
  onOpenScanner: (member?: Member) => void;
  onSelectMemberForEvaluation: (member: Member, stationId?: StationId) => void;
  onExportCSV: () => void;
}

export const AllMembersView: React.FC<AllMembersViewProps> = ({
  members,
  onOpenRegister,
  onOpenScanner,
  onSelectMemberForEvaluation,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterStation, setSelectedFilterStation] = useState<string>('all');
  const [expandedMemberIds, setExpandedMemberIds] = useState<Set<string>>(
    new Set(['mem-1']) // Default expand first member Matthew AZ1
  );

  const toggleExpand = (memberId: string) => {
    setExpandedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const evals = getEvaluationsList(member);
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.cg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evals.some((ev) =>
        ev.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (selectedFilterStation !== 'all') {
      if (selectedFilterStation === 'scouted_any') {
        const isScouted = evals.some((e) => e.scouted);
        if (!isScouted) return false;
      } else if (selectedFilterStation.startsWith('traffic_')) {
        const targetColor = selectedFilterStation.replace('traffic_', '');
        const hasColor = evals.some((e) => e.trafficLight === targetColor);
        if (!hasColor) return false;
      } else {
        const hasStation = member.evaluations[selectedFilterStation as StationId];
        if (!hasStation) return false;
      }
    }

    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
              Database
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            title="Export CSV Report"
            className="w-10 h-10 rounded-xl bg-[#12121A] hover:bg-[#1A1A24] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Member Button */}
          <button
            id="btn-open-register"
            onClick={onOpenRegister}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-400/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
        <input
          id="input-search-members"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, CG, station..."
          className="w-full pl-11 pr-4 py-3 bg-[#1A1A24] border border-white/10 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner font-sans"
        />
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedFilterStation('all')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all border shrink-0 ${
            selectedFilterStation === 'all'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)] font-bold'
              : 'bg-[#12121A] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          All ({members.length})
        </button>

        <button
          onClick={() =>
            setSelectedFilterStation(
              selectedFilterStation === 'scouted_any' ? 'all' : 'scouted_any'
            )
          }
          className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border shrink-0 ${
            selectedFilterStation === 'scouted_any'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)] font-bold'
              : 'bg-[#12121A] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-indigo-300" />
          <span>Scouted</span>
        </button>

        {/* Traffic Light Quick Filters: Green, Yellow, Red (colors only) */}
        <button
          type="button"
          title="Green"
          aria-label="Filter Green"
          onClick={() =>
            setSelectedFilterStation(
              selectedFilterStation === 'traffic_green' ? 'all' : 'traffic_green'
            )
          }
          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center border shrink-0 ${
            selectedFilterStation === 'traffic_green'
              ? 'bg-green-950/90 text-green-300 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
              : 'bg-[#12121A] text-gray-400 border-white/10 hover:border-green-500/40 hover:bg-green-950/20'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
        </button>

        <button
          type="button"
          title="Yellow"
          aria-label="Filter Yellow"
          onClick={() =>
            setSelectedFilterStation(
              selectedFilterStation === 'traffic_yellow' ? 'all' : 'traffic_yellow'
            )
          }
          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center border shrink-0 ${
            selectedFilterStation === 'traffic_yellow'
              ? 'bg-yellow-950/90 text-yellow-300 border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
              : 'bg-[#12121A] text-gray-400 border-white/10 hover:border-yellow-500/40 hover:bg-yellow-950/20'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_#eab308]" />
        </button>

        <button
          type="button"
          title="Red"
          aria-label="Filter Red"
          onClick={() =>
            setSelectedFilterStation(
              selectedFilterStation === 'traffic_red' ? 'all' : 'traffic_red'
            )
          }
          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center border shrink-0 ${
            selectedFilterStation === 'traffic_red'
              ? 'bg-red-950/90 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'bg-[#12121A] text-gray-400 border-white/10 hover:border-red-500/40 hover:bg-red-950/20'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
        </button>

        {STATIONS.map((st) => {
          const isSelected = selectedFilterStation === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSelectedFilterStation(isSelected ? 'all' : st.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all border shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.4)] font-bold'
                  : 'bg-[#12121A] text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              {st.name}
            </button>
          );
        })}
      </div>

      {/* Member Cards List */}
      <div className="space-y-3.5">
        {filteredMembers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0F0F16] border border-dashed border-white/10 text-center">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">No people match the filter</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting search terms or add a new person.
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isExpanded = expandedMemberIds.has(member.id);
            const allEvals = getEvaluationsList(member);
            const scoutedEvals = allEvals.filter((ev) => ev.scouted);

            return (
              <div
                key={member.id}
                id={`member-card-${member.id}`}
                className="w-full bg-[#0F0F16] border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20"
              >
                {/* Main Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {/* Name + CG Badge + Follow-up status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {member.name}
                      </h2>
                      <span className="bg-[#12121A] text-indigo-300 border border-white/10 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        {member.cg}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          member.followUpStatus === 'finished'
                            ? 'bg-green-950/40 text-green-400 border-green-500/40'
                            : 'bg-yellow-950/40 text-yellow-400 border-yellow-500/40'
                        }`}
                      >
                        {member.followUpStatus === 'finished'
                          ? 'Finished Follow Up'
                          : 'Going Through Follow Up'}
                      </span>
                    </div>

                    {/* SCOUTED BY row with station icons */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase">
                        SCOUTED BY:
                      </span>

                      {scoutedEvals.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {scoutedEvals.map((ev) => (
                            <span
                              key={ev.stationId}
                              title={`${ev.stationId} (Scouted)`}
                              className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 text-xs font-mono"
                            >
                              <StationIcon stationId={ev.stationId} size={12} />
                              <span className="capitalize">{ev.stationId}</span>
                              {ev.trafficLight && (
                                <TrafficLightBadge rating={ev.trafficLight} size="sm" />
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic font-mono">None yet</span>
                      )}
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    id={`btn-expand-member-${member.id}`}
                    onClick={() => toggleExpand(member.id)}
                    className="w-8 h-8 rounded-lg bg-[#12121A] hover:bg-[#1A1A24] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-transform shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* EXPANDED CONTENT */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fadeIn">
                    {/* Station Evaluations List */}
                    {allEvals.length === 0 ? (
                      <div className="py-2 text-center text-xs text-gray-500 italic font-mono">
                        No station evaluations recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {allEvals.map((ev) => {
                          const station = STATIONS.find((s) => s.id === ev.stationId);

                          return (
                            <div
                              key={ev.stationId}
                              className="p-3.5 bg-[#12121A] border border-white/10 rounded-xl shadow flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs uppercase text-white tracking-wide">
                                    {station?.name || ev.stationId}
                                  </span>

                                  {/* Traffic Light Badge */}
                                  {ev.trafficLight && (
                                    <TrafficLightBadge rating={ev.trafficLight} size="sm" showLabel />
                                  )}

                                  {/* Scouted Badge */}
                                  {ev.scouted && (
                                    <span className="bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      SCOUTED
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Internal Note */}
                              {ev.notes && (
                                <p className="text-xs text-gray-300 italic pt-0.5">
                                  "{ev.notes}"
                                </p>
                              )}

                              <div className="flex justify-end items-center text-[10px] font-mono text-gray-500 pt-1 border-t border-white/5">
                                <span>{new Date(ev.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Member Action Buttons */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        id={`btn-evaluate-member-${member.id}`}
                        onClick={() => onSelectMemberForEvaluation(member)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(79,70,229,0.3)] transition-all"
                      >
                        <ClipboardEdit className="w-3.5 h-3.5" />
                        <span>Evaluate at Station</span>
                      </button>

                      <button
                        id={`btn-scan-station-for-${member.id}`}
                        onClick={() => onOpenScanner(member)}
                        className="py-2.5 px-3 rounded-xl bg-[#1A1A24] hover:bg-[#222230] text-gray-200 text-xs font-mono font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Scan Station QR</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
