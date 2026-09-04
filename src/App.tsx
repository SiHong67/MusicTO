import React, { useState, useEffect } from 'react';
import {
  Member,
  StationId,
  StationEvaluation,
  STATIONS,
} from './types';
import {
  getStoredMembers,
  saveStoredMembers,
  subscribeToMemberUpdates,
  exportMembersToCSV,
} from './utils/storage';
import { INITIAL_MEMBERS } from './data/mockMembers';
import { HeaderNavigation, MainView } from './components/HeaderNavigation';
import { AllMembersView } from './components/AllMembersView';
import { StationModeView } from './components/StationModeView';
import { StationQRCard } from './components/StationQRCard';
import { EvaluationScreen } from './components/EvaluationScreen';
import { StationQRScannerModal } from './components/StationQRScannerModal';
import { CandidateRegistrationModal } from './components/CandidateRegistrationModal';
import { Bell, Radio, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => getStoredMembers());
  const [currentView, setCurrentView] = useState<MainView>('members');
  const [activeStationId, setActiveStationId] = useState<StationId>('drums');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>('mem-1');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [scannerTargetMember, setScannerTargetMember] = useState<Member | null>(null);

  // Live notification banner when remarks are saved across stations
  const [liveNotification, setLiveNotification] = useState<{
    message: string;
    stationId: StationId;
  } | null>(null);

  // Cross-tab and storage synchronization
  useEffect(() => {
    const unsubscribe = subscribeToMemberUpdates((updatedMembers) => {
      setMembers(updatedMembers);
    });
    return () => unsubscribe();
  }, []);

  // Save changes to storage whenever members array updates
  const updateMembersState = (newMembers: Member[]) => {
    setMembers(newMembers);
    saveStoredMembers(newMembers);
  };

  // Add new candidate from form
  const handleAddMember = (newMember: Member) => {
    const updated = [newMember, ...members];
    updateMembersState(updated);
  };

  // When candidate or evaluator scans a station QR
  const handleStationScanned = (stationId: StationId, memberId?: string) => {
    setActiveStationId(stationId);

    const targetId = memberId || selectedMemberId || members[0]?.id;
    if (targetId) {
      const targetMember = members.find((m) => m.id === targetId);
      if (targetMember) {
        const checkedInStations = targetMember.checkedInStations.includes(stationId)
          ? targetMember.checkedInStations
          : [...targetMember.checkedInStations, stationId];

        const updated = members.map((m) =>
          m.id === targetId
            ? {
                ...m,
                currentStation: stationId,
                checkedInStations,
              }
            : m
        );
        updateMembersState(updated);
        setSelectedMemberId(targetId);
        setCurrentView('evaluation');

        setLiveNotification({
          message: `${targetMember.name} checked in at ${
            STATIONS.find((s) => s.id === stationId)?.name
          } station!`,
          stationId,
        });
        setTimeout(() => setLiveNotification(null), 4000);
      }
    } else {
      setCurrentView('station');
    }
  };

  // Save evaluation (with traffic light coding, stars, notes, scouted flag)
  const handleSaveEvaluation = (
    memberId: string,
    stationId: StationId,
    evaluation: StationEvaluation
  ) => {
    const person = members.find((m) => m.id === memberId);
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          evaluations: {
            ...m.evaluations,
            [stationId]: evaluation,
          },
        };
      }
      return m;
    });

    updateMembersState(updated);

    const stationName = STATIONS.find((s) => s.id === stationId)?.name || stationId;
    setLiveNotification({
      message: `Remarks updated for ${person?.name || 'person'} at ${stationName}!`,
      stationId,
    });
    setTimeout(() => setLiveNotification(null), 4500);
  };

  const handleOpenScannerForMember = (member?: Member) => {
    setScannerTargetMember(member || null);
    setIsScannerOpen(true);
  };

  const handleSelectMemberForEvaluation = (member: Member, stationId?: StationId) => {
    setSelectedMemberId(member.id);
    if (stationId) {
      setActiveStationId(stationId);
    }
    setCurrentView('evaluation');
  };

  const handleResetData = () => {
    if (window.confirm('Reset back to sample demonstration data?')) {
      updateMembersState(INITIAL_MEMBERS);
      setSelectedMemberId(INITIAL_MEMBERS[0].id);
    }
  };

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Global Navigation Bar */}
      <HeaderNavigation
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenScanner={() => handleOpenScannerForMember()}
        activeStationId={activeStationId}
        onResetData={handleResetData}
      />

      {/* Live Remarks Broadcast Notification Toast */}
      {liveNotification && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div className="bg-[#0F0F16] border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.35)] rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
              <Radio className="w-4 h-4 animate-pulse shadow-[0_0_5px_#22c55e]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider truncate">
                {liveNotification.message}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                Live sync broadcast to all audition stations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'members' && (
          <AllMembersView
            members={members}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenScanner={handleOpenScannerForMember}
            onSelectMemberForEvaluation={handleSelectMemberForEvaluation}
            onExportCSV={() => exportMembersToCSV(members)}
          />
        )}

        {currentView === 'station' && (
          <StationModeView
            currentStationId={activeStationId}
            onSelectStation={setActiveStationId}
            members={members}
            onEvaluateCandidate={(m) => {
              setSelectedMemberId(m.id);
              setCurrentView('evaluation');
            }}
            onOpenStationQR={(sid) => {
              setActiveStationId(sid);
              setCurrentView('qrcards');
            }}
            onOpenScanner={() => handleOpenScannerForMember()}
          />
        )}

        {currentView === 'qrcards' && (
          <div className="py-4">
            <div className="max-w-md mx-auto px-4 mb-2 flex items-center justify-between">
              <button
                onClick={() => setCurrentView('members')}
                className="text-xs font-mono uppercase tracking-wider font-semibold text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Overview
              </button>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Station Signs
              </span>
            </div>
            <StationQRCard initialStationId={activeStationId} />
          </div>
        )}

        {currentView === 'evaluation' && selectedMember && (
          <EvaluationScreen
            member={selectedMember}
            activeStationId={activeStationId}
            onBack={() => setCurrentView('members')}
            onSaveEvaluation={handleSaveEvaluation}
            onChangeStation={setActiveStationId}
          />
        )}
      </main>

      {/* QR Scanner Modal (Matching Image 2) */}
      <StationQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        members={members}
        activeMember={scannerTargetMember}
        onStationScanned={handleStationScanned}
      />

      {/* Candidate Registration Form Modal */}
      <CandidateRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAddMember={handleAddMember}
        onStartStationScan={(newMem) => {
          handleOpenScannerForMember(newMem);
        }}
      />
    </div>
  );
}
