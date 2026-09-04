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
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Member, StationId, STATIONS, FollowUpStatus, TrafficLightRating, getEvaluationsList } from '../types';
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
  const [filterStation, setFilterStation] = useState<StationId | 'all'>('all');
  const [filterFollowUp, setFilterFollowUp] = useState<FollowUpStatus | 'all'>('all');
  const [filterRating, setFilterRating] = useState<TrafficLightRating | 'scouted' | 'all'>('all');

  const [expandedMemberIds, setExpandedMemberIds] = useState<Set<string>>(
    new Set(['mem-1']) // Default expand first member
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

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterStation !== 'all' ||
    filterFollowUp !== 'all' ||
    filterRating !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStation('all');
    setFilterFollowUp('all');
    setFilterRating('all');
  };

  // Filter members according to combined criteria
  const filteredMembers = members.filter((member) => {
    const evals = getEvaluationsList(member);

    // Search query: name, CG, station or remark
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = member.name.toLowerCase().includes(q);
      const matchesCg = member.cg.toLowerCase().includes(q);
      const matchesNotes = evals.some((ev) => ev.notes.toLowerCase().includes(q));
      const matchesStation = evals.some((ev) => ev.stationId.toLowerCase().includes(q));
      if (!matchesName && !matchesCg && !matchesNotes && !matchesStation) {
        return false;
      }
    }

    // Follow-up status filter
    if (filterFollowUp !== 'all') {
      if (member.followUpStatus !== filterFollowUp) {
        return false;
      }
    }

    // Station filter
    if (filterStation !== 'all') {
      const hasEvaluation = member.evaluations[filterStation] !== undefined;
      const isPrimary = member.primaryStation === filterStation;
      const isCheckedIn = member.checkedInStations?.includes(filterStation);
      if (!hasEvaluation && !isPrimary && !isCheckedIn) {
        return false;
      }
    }

    // Rating / Scouted filter
    if (filterRating !== 'all') {
      if (filterRating === 'scouted') {
        const isScouted = evals.some((e) => e.scouted);
        if (!isScouted) return false;
      } else {
        // Traffic light rating (green, yellow, red)
        const hasColor = evals.some((e) => e.trafficLight === filterRating);
        if (!hasColor) return false;
      }
    }

    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Candidate Database
            </h1>
            <p className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
              {filteredMembers.length} of {members.length} candidates shown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            title="Export CSV Report"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#12121A] hover:bg-slate-100 dark:hover:bg-[#1A1A24] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Member Button */}
          <button
            id="btn-open-register"
            onClick={onOpenRegister}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-400/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Clean Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 dark:text-gray-500" />
        <input
          id="input-search-members"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search candidates by name, CG, station or remark..."
          className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm font-sans"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 p-0.5 rounded"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clean Structured Filter System */}
      <div className="bg-white dark:bg-[#0F0F16] border border-slate-200 dark:border-white/10 rounded-xl p-3 mb-4 shadow-sm space-y-2.5">
        {/* Row 1: Follow-Up Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-gray-500 w-16 shrink-0">
            Follow Up Status:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-status-all"
              type="button"
              onClick={() => setFilterFollowUp('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                filterFollowUp === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              id="filter-status-not-started"
              type="button"
              onClick={() => setFilterFollowUp(filterFollowUp === 'not_started' ? 'all' : 'not_started')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterFollowUp === 'not_started'
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>Have Not Started</span>
            </button>
            <button
              id="filter-status-going-through"
              type="button"
              onClick={() => setFilterFollowUp(filterFollowUp === 'going_through' ? 'all' : 'going_through')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterFollowUp === 'going_through'
                  ? 'bg-amber-100 dark:bg-yellow-950/80 text-amber-700 dark:text-yellow-300 border-yellow-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-amber-300 dark:hover:border-yellow-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Going Through</span>
            </button>
            <button
              id="filter-status-finished"
              type="button"
              onClick={() => setFilterFollowUp(filterFollowUp === 'finished' ? 'all' : 'finished')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterFollowUp === 'finished'
                  ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border-green-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-green-300 dark:hover:border-green-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span>Finished</span>
            </button>
          </div>
        </div>

        {/* Row 2: Stations */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-gray-500 w-16 shrink-0">
            Station:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-station-all"
              type="button"
              onClick={() => setFilterStation('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                filterStation === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {STATIONS.map((st) => {
              const isSelected = filterStation === st.id;
              return (
                <button
                  key={st.id}
                  id={`filter-station-${st.id}`}
                  type="button"
                  onClick={() => setFilterStation(isSelected ? 'all' : st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <StationIcon stationId={st.id} size={11} />
                  <span>{st.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Ratings & Scouting */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-gray-500 w-16 shrink-0">
            Rating:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-rating-all"
              type="button"
              onClick={() => setFilterRating('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                filterRating === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>

            <button
              id="filter-rating-scouted"
              type="button"
              onClick={() => setFilterRating(filterRating === 'scouted' ? 'all' : 'scouted')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterRating === 'scouted'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400 dark:text-indigo-300" />
              <span>Scouted</span>
            </button>

            <button
              id="filter-rating-green"
              type="button"
              onClick={() => setFilterRating(filterRating === 'green' ? 'all' : 'green')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterRating === 'green'
                  ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border-green-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-green-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
              <span>Green</span>
            </button>

            <button
              id="filter-rating-yellow"
              type="button"
              onClick={() => setFilterRating(filterRating === 'yellow' ? 'all' : 'yellow')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterRating === 'yellow'
                  ? 'bg-amber-100 dark:bg-yellow-950/80 text-amber-700 dark:text-yellow-300 border-yellow-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]" />
              <span>Yellow</span>
            </button>

            <button
              id="filter-rating-red"
              type="button"
              onClick={() => setFilterRating(filterRating === 'red' ? 'all' : 'red')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                filterRating === 'red'
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-500 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-[#161622] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-red-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
              <span>Red</span>
            </button>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-gray-500">
                Active:
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-mono text-[11px] flex items-center gap-1">
                  "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {filterFollowUp !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 font-mono text-[11px] flex items-center gap-1 capitalize">
                  Status: {filterFollowUp.replace('_', ' ')}
                  <button type="button" onClick={() => setFilterFollowUp('all')}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {filterStation !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 font-mono text-[11px] flex items-center gap-1 capitalize">
                  Station: {filterStation}
                  <button type="button" onClick={() => setFilterStation('all')}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {filterRating !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 font-mono text-[11px] flex items-center gap-1 capitalize">
                  Rating: {filterRating}
                  <button type="button" onClick={() => setFilterRating('all')}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] font-mono uppercase text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Member Cards List */}
      <div className="space-y-3.5">
        {filteredMembers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F0F16] border border-dashed border-slate-300 dark:border-white/10 text-center">
            <Users className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              No candidates match the filter
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
              Try adjusting search terms or click Reset to view all candidates.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-mono font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Reset All Filters
              </button>
            )}
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
                className="w-full bg-white dark:bg-[#0F0F16] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all hover:border-slate-300 dark:hover:border-white/20"
              >
                {/* Main Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {/* Name + CG Badge + Follow-up status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {member.name}
                      </h2>
                      <span className="bg-slate-100 dark:bg-[#12121A] text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-white/10 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        {member.cg}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          member.followUpStatus === 'finished'
                            ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/40'
                            : member.followUpStatus === 'not_started'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40'
                            : 'bg-amber-50 dark:bg-yellow-950/40 text-amber-700 dark:text-yellow-400 border-amber-300 dark:border-yellow-500/40'
                        }`}
                      >
                        {member.followUpStatus === 'finished'
                          ? 'Finished Follow Up'
                          : member.followUpStatus === 'not_started'
                          ? 'Have Not Started'
                          : 'Going Through Follow Up'}
                      </span>
                    </div>

                    {/* SCOUTED BY row with station icons */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 font-mono tracking-widest uppercase">
                        SCOUTED BY:
                      </span>

                      {scoutedEvals.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {scoutedEvals.map((ev) => (
                            <span
                              key={ev.stationId}
                              title={`${ev.stationId} (Scouted)`}
                              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 text-xs font-mono"
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
                        <span className="text-xs text-slate-400 dark:text-gray-500 italic font-mono">None yet</span>
                      )}
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    id={`btn-expand-member-${member.id}`}
                    onClick={() => toggleExpand(member.id)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#12121A] dark:hover:bg-[#1A1A24] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-transform shrink-0 cursor-pointer"
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
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-4 animate-fadeIn">
                    {/* Station Evaluations List */}
                    {allEvals.length === 0 ? (
                      <div className="py-2 text-center text-xs text-slate-400 dark:text-gray-500 italic font-mono">
                        No station evaluations recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {allEvals.map((ev) => {
                          const station = STATIONS.find((s) => s.id === ev.stationId);

                          return (
                            <div
                              key={ev.stationId}
                              className="p-3.5 bg-slate-50 dark:bg-[#12121A] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs uppercase text-slate-800 dark:text-white tracking-wide">
                                    {station?.name || ev.stationId}
                                  </span>

                                  {/* Traffic Light Badge */}
                                  {ev.trafficLight && (
                                    <TrafficLightBadge rating={ev.trafficLight} size="sm" showLabel />
                                  )}

                                  {/* Scouted Badge */}
                                  {ev.scouted && (
                                    <span className="bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                      SCOUTED
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Internal Note */}
                              {ev.notes && (
                                <p className="text-xs text-slate-600 dark:text-gray-300 italic pt-0.5">
                                  "{ev.notes}"
                                </p>
                              )}

                              <div className="flex justify-end items-center text-[10px] font-mono text-slate-400 dark:text-gray-500 pt-1 border-t border-slate-200/60 dark:border-white/5">
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
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
                      >
                        <ClipboardEdit className="w-3.5 h-3.5" />
                        <span>Evaluate at Station</span>
                      </button>

                      <button
                        id={`btn-scan-station-for-${member.id}`}
                        onClick={() => onOpenScanner(member)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A24] dark:hover:bg-[#222230] text-slate-700 dark:text-gray-200 text-xs font-mono font-semibold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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
